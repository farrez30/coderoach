import dns, { type LookupAddress, type LookupAllOptions } from 'node:dns';
import net from 'node:net';

/**
 * The link check runs inside Railway's private network, next to the database. A link that points
 * at an internal host (postgres.railway.internal, 10.x, fd12::…, a DNS name that resolves there)
 * must never be fetched. These guards are the whole defence, so they fail closed.
 */
export class BlockedTarget extends Error {
  constructor(readonly reason: string) {
    super(`blocked: ${reason}`);
  }
}

const INTERNAL_SUFFIX = /(^|\.)(localhost|local|internal|home\.arpa|lan|intranet|corp|test|example|invalid|onion)$/;

/** Accepts only a public https URL on the default port, addressed by name. */
export function validateTarget(raw: string | URL): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new BlockedTarget('invalid-url');
  }
  if (url.protocol !== 'https:') throw new BlockedTarget('not-https');
  if (url.username || url.password) throw new BlockedTarget('userinfo');
  if (url.port && url.port !== '443') throw new BlockedTarget('port');
  // WHATWG parsing has already turned 0x7f.1 or 2130706433 into 127.0.0.1, so this sees the real form.
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host.startsWith('[') || net.isIP(host)) throw new BlockedTarget('ip-literal');
  if (!host.includes('.')) throw new BlockedTarget('single-label');
  if (INTERNAL_SUFFIX.test(host)) throw new BlockedTarget('internal-host');
  return url;
}

const blockedV4 = new net.BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  blockedV4.addSubnet(address, prefix, 'ipv4');
}

// IPv6: only global unicast (2000::/3) is public. That alone excludes ::1, ::ffff:0:0/96 (mapped
// IPv4), 64:ff9b::/96 (NAT64), fc00::/7 (Railway's private network is fd12::), fe80::/10, ff00::/8.
const globalV6 = new net.BlockList();
globalV6.addSubnet('2000::', 3, 'ipv6');
const blockedV6 = new net.BlockList();
blockedV6.addSubnet('2001::', 32, 'ipv6'); // Teredo
blockedV6.addSubnet('2001:db8::', 32, 'ipv6'); // documentation
blockedV6.addSubnet('2002::', 16, 'ipv6'); // 6to4, wraps an IPv4 address

export function isPublicAddress(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return !blockedV4.check(ip, 'ipv4');
  if (family === 6) return globalV6.check(ip, 'ipv6') && !blockedV6.check(ip, 'ipv6');
  return false;
}

type Resolver = (
  hostname: string,
  options: LookupAllOptions,
  callback: (err: NodeJS.ErrnoException | null, addresses: LookupAddress[]) => void,
) => void;

type LookupCallback = (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void;

/**
 * A `lookup` for http(s).request that refuses the connection unless every address the name resolves
 * to is public. Checking at connect time, rather than resolving first and fetching after, closes the
 * window where DNS answers differently the second time (rebinding).
 */
export function safeLookup(resolve: Resolver = dns.lookup as unknown as Resolver) {
  return (hostname: string, options: { all?: boolean } | number | undefined, callback: LookupCallback) => {
    const wantAll = typeof options === 'object' && options !== null && options.all === true;
    resolve(hostname, { all: true, order: 'verbatim' }, (err, addresses) => {
      if (err) return callback(err, '');
      const bad = addresses.find((a) => !isPublicAddress(a.address));
      if (addresses.length === 0 || bad) {
        const blocked: NodeJS.ErrnoException = new Error(`${hostname} resolves to a non-public address`);
        blocked.code = 'EBLOCKED';
        return callback(blocked, '');
      }
      if (wantAll) return callback(null, addresses);
      return callback(null, addresses[0].address, addresses[0].family);
    });
  };
}
