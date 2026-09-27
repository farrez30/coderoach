import * as React from 'react';

/**
 * Icon library — outlined SVG primitives.
 * currentColor stroke at 1.75px. Used in Services, Process, Studio tenets, the OpsScore scale, and
 * the landing's narrative sections.
 */

export type IconName =
  | 'build'
  | 'automate'
  | 'intelligence'
  | 'augment'
  | 'discover'
  | 'design'
  | 'layers'
  | 'handoff'
  | 'users'
  | 'voice'
  | 'shield'
  // OpsScore scale: where the data lives
  | 'head'
  | 'chat'
  | 'sheet'
  | 'app'
  | 'system'
  // OpsScore gate
  | 'lock'
  // Narrative sections
  | 'fileSheet'
  | 'calculator'
  | 'cart'
  | 'syncOff'
  | 'message'
  | 'repeat'
  | 'key'
  | 'minus'
  | 'check'
  | 'checkCircle'
  | 'x'
  | 'pause'
  | 'trendDown'
  | 'arrowRight'
  | 'cornerRight';

const PATHS: Record<IconName, React.ReactNode> = {
  build: (
    <>
      <polyline points="9 8 5 12 9 16" />
      <polyline points="15 8 19 12 15 16" />
      <line x1="14" y1="6" x2="10" y2="18" />
    </>
  ),
  automate: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <polyline points="21 4 21 10 15 10" />
    </>
  ),
  intelligence: (
    <>
      <line x1="3" y1="20" x2="3" y2="10" />
      <line x1="9" y1="20" x2="9" y2="4" />
      <line x1="15" y1="20" x2="15" y2="14" />
      <line x1="21" y1="20" x2="21" y2="8" />
    </>
  ),
  augment: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  discover: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16" y2="16" />
    </>
  ),
  design: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  handoff: (
    <>
      <rect x="2" y="3" width="20" height="5" />
      <path d="M21 8v13H3V8" />
      <line x1="10" y1="13" x2="14" y2="13" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  voice: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </>
  ),
  head: (
    <>
      <path d="M9 21v-3.2C6.6 16.6 5 14.2 5 11.3 5 7.3 8.2 4 12.3 4c3.7 0 6.7 2.9 6.7 6.5l1.8 3.2c.2.4 0 .8-.5.8H19V17a2 2 0 0 1-2 2h-2v2" />
      <path d="M11 9.5a2 2 0 1 1 2 2v1" />
    </>
  ),
  chat: (
    <>
      <path d="M21 14a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="11.5" x2="13" y2="11.5" />
    </>
  ),
  sheet: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="3" y1="14.5" x2="21" y2="14.5" />
      <line x1="9" y1="4" x2="9" y2="20" />
    </>
  ),
  app: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  system: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  fileSheet: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M8 13h2" />
      <path d="M14 13h2" />
      <path d="M8 17h2" />
      <path d="M14 17h2" />
    </>
  ),
  calculator: (
    <>
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </>
  ),
  cart: (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  syncOff: (
    <>
      <path d="M21 8L18.74 5.74A9.75 9.75 0 0 0 12 3C11 3 10.03 3.16 9.13 3.47" />
      <path d="M8 16H3v5" />
      <path d="M3 12C3 9.51 4 7.26 5.64 5.64" />
      <path d="m3 16 2.26 2.26A9.75 9.75 0 0 0 12 21c2.49 0 4.74-1 6.36-2.64" />
      <path d="M21 12c0 1-.16 1.97-.47 2.87" />
      <path d="M21 3v5h-5" />
      <path d="M22 22 2 2" />
    </>
  ),
  message: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  repeat: (
    <>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </>
  ),
  key: (
    <>
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  check: <path d="M20 6 9 17l-5-5" />,
  checkCircle: (
    <>
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </>
  ),
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  pause: (
    <>
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </>
  ),
  trendDown: (
    <>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  cornerRight: (
    <>
      <polyline points="15 10 20 15 15 20" />
      <path d="M4 4v7a4 4 0 0 0 4 4h12" />
    </>
  ),
};

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 22, className = '' }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
