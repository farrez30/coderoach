import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { assetUrls, CACHES, cacheFor, cssUrls } from './rules';

describe('cacheFor', () => {
  test('caches the presentation, built assets, and media files', () => {
    assert.equal(cacheFor('/work/presentasi'), CACHES.pages);
    assert.equal(cacheFor('/work/presentasi/laporta'), CACHES.pages);
    assert.equal(cacheFor('/_next/static/chunks/main-app.js'), CACHES.static);
    assert.equal(cacheFor('/api/media/file/laporta-tur.v1.mp4'), CACHES.media);
  });

  test('never the admin, other API routes, or the rest of the site', () => {
    for (const path of ['/admin', '/admin/collections/users', '/api/users/me', '/api/media', '/api/link-checks', '/work', '/work/laporta', '/work/presentasiku', '/', '/_next/image']) {
      assert.equal(cacheFor(path), null, path);
    }
  });
});

describe('assetUrls', () => {
  const origin = 'https://coderoach.id';

  test('reads tags, srcset, posters, and chunk paths in the RSC payload', () => {
    const html = [
      '<link rel="stylesheet" href="/_next/static/css/a1.css">',
      '<script src="/_next/static/chunks/app/(presentasi)/work/presentasi/page-9f.js" async></script>',
      '<img src="/api/media/file/x-1080x675.webp" srcset="/api/media/file/x-720x450.webp 720w, /api/media/file/x.webp 1440w">',
      '<video poster="/api/media/file/t.poster.webp"><source src="/api/media/file/t.v1.mp4" type="video/mp4"></video>',
      'self.__next_f.push([1,"2:I[\\"/_next/static/chunks/774-ab.js\\"]"])',
    ].join('\n');
    assert.deepEqual(assetUrls(html, origin).sort(), [
      'https://coderoach.id/_next/static/chunks/774-ab.js',
      'https://coderoach.id/_next/static/chunks/app/(presentasi)/work/presentasi/page-9f.js',
      'https://coderoach.id/_next/static/css/a1.css',
      'https://coderoach.id/api/media/file/t.poster.webp',
      'https://coderoach.id/api/media/file/t.v1.mp4',
      'https://coderoach.id/api/media/file/x-1080x675.webp',
      'https://coderoach.id/api/media/file/x-720x450.webp',
      'https://coderoach.id/api/media/file/x.webp',
    ]);
  });

  test('ignores other origins and other paths', () => {
    const html = '<script src="https://evil.example/_next/static/x.js"></script><a href="/api/users/me">x</a><img src="/_next/image?url=x">';
    assert.deepEqual(assetUrls(html, origin), []);
  });
});

describe('cssUrls', () => {
  test('resolves fonts against the stylesheet and skips data URLs and other origins', () => {
    const css = '@font-face{src:url(../media/satoshi.woff2) format("woff2")}a{background:url("data:image/png;base64,AA")}b{background:url(https://fonts.example/x.woff2)}';
    assert.deepEqual(cssUrls(css, 'https://coderoach.id/_next/static/css/a1.css'), ['https://coderoach.id/_next/static/media/satoshi.woff2']);
  });
});
