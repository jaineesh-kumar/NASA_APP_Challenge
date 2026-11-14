// Authored icon set: one 24px grid, 2px round stroke, currentColor. Replaces emoji glyphs.

import React from 'react';

export type IconName =
  | 'rocket'
  | 'check'
  | 'warning'
  | 'antenna'
  | 'book'
  | 'archive'
  | 'sun'
  | 'retry'
  | 'close'
  | 'back'
  | 'next'
  | 'bulb'
  | 'cross'
  | 'up'
  | 'down'
  | 'play'
  | 'pause'
  | 'minus'
  | 'plus'
  | 'menu'
  | 'star'
  | 'shield'
  | 'bolt'
  | 'flag'
  | 'lock'
  | 'plant';

const PATHS: Record<IconName, React.ReactNode> = {
  rocket: (
    <>
      <path d="M12 2.5c3.6 2.2 5.2 6 5 10.5l-2.5 3h-5L7 13c-.2-4.5 1.4-8.3 5-10.5Z" />
      <circle cx="12" cy="9" r="1.8" />
      <path d="M9.5 16 7 19.5l3.2-.8M14.5 16l2.5 3.5-3.2-.8M12 18v3.5" />
    </>
  ),
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  warning: (
    <>
      <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" />
      <path d="M12 10v4.2M12 17.2v.1" />
    </>
  ),
  antenna: (
    <>
      <path d="M12 12v9M8.5 21h7" />
      <circle cx="12" cy="10" r="2" />
      <path d="M7.8 5.8a6 6 0 0 0 0 8.4M16.2 5.8a6 6 0 0 1 0 8.4M5 3a10 10 0 0 0 0 14M19 3a10 10 0 0 1 0 14" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5h6a2 2 0 0 1 2 2V20a1.5 1.5 0 0 0-1.5-1.5H4V4.5ZM20 4.5h-6a2 2 0 0 0-2 2V20a1.5 1.5 0 0 1 1.5-1.5H20V4.5Z" />
    </>
  ),
  archive: (
    <>
      <rect x="3" y="4" width="18" height="5" rx="1.5" />
      <path d="M5 9v9.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </>
  ),
  retry: (
    <>
      <path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L19.5 9" />
      <path d="M19.5 4v5h-5M19.5 12a7.5 7.5 0 0 1-13 5.1L4.5 15" />
      <path d="M4.5 20v-5h5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  cross: <path d="M7 7l10 10M17 7 7 17" />,
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  next: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  up: <path d="M5.5 14.5 12 8l6.5 6.5" />,
  play: <path d="M8 5.5v13l10-6.5-10-6.5Z" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  minus: <path d="M5.5 12h13" />,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  down: <path d="M5.5 9.5 12 16l6.5-6.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  star: (
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
  ),
  shield: <path d="M12 3 5 5.8v5.4c0 4.4 3 8.2 7 9.8 4-1.6 7-5.4 7-9.8V5.8L12 3Z" />,
  bolt: <path d="M13 2.5 5.5 13.5H12l-1 8 7.5-11H12l1-8Z" />,
  flag: (
    <>
      <path d="M5.5 21V4" />
      <path d="M5.5 4.5h11l-2.5 4 2.5 4h-11" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
    </>
  ),
  plant: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 2.5-6.5 7-6.5 0 4.5-2.5 6.5-7 6.5ZM12 15c0-3-2-5-6-5 0 3.5 2 5 6 5Z" />
      <path d="M7.5 21h9" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 17.5h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2v1.5h5V16c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z" />
    </>
  ),
};

interface Props {
  name: IconName;
  size?: number;
  /** When set, the icon is announced; otherwise it is decorative. */
  label?: string;
}

export const Icon: React.FC<Props> = ({ name, size = 20, label }) => (
  <svg
    className="icon"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    focusable="false"
  >
    {PATHS[name]}
  </svg>
);
