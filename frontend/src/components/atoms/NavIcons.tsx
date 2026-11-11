import type { ReactNode } from "react";

function Icon({ size = 22, strokeWidth = 2, children }: { size?: number; strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);
export const MegaphoneIcon = () => (
  <Icon>
    <path d="M4 11v2a1 1 0 0 0 1 1h2l5 4V6L7 10H5a1 1 0 0 0-1 1Z" />
    <path d="M16 9a4 4 0 0 1 0 6" />
  </Icon>
);
export const BellIcon = () => (
  <Icon>
    <path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4l2-2Z" />
    <path d="M10 21h4" />
  </Icon>
);
export const ProfileIcon = () => (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
export const ChevronLeftIcon = () => (
  <Icon size={20} strokeWidth={2.4}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);
