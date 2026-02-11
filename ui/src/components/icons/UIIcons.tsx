import type { SVGProps, ReactNode } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

/** Stroke-based SVG icon wrapper with lucide-compatible defaults (24×24, stroke=2, round caps) */
function SvgIcon({ size, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? 24}
      height={size ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

// ── Info (filled) ───────────────────────────────────────

export function InfoCircleFilled({ size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? 16}
      height={size ?? 16}
      viewBox="0 0 16 16"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Navigation ──────────────────────────────────────────

export function ArrowLeft(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </SvgIcon>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </SvgIcon>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </SvgIcon>
  );
}

export function ArrowUp(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </SvgIcon>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </SvgIcon>
  );
}

export function ChevronUp(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m18 15-6-6-6 6" />
    </SvgIcon>
  );
}

export function ExternalLink(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </SvgIcon>
  );
}

// ── Actions ─────────────────────────────────────────────

export function Check(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </SvgIcon>
  );
}

export function X(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </SvgIcon>
  );
}

// Thicker X for small sizes (input clear buttons)
export function XThick({ size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? 24}
      height={size ?? 24}
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={24}
      {...props}
    >
      <line x1="200" y1="56" x2="56" y2="200" />
      <line x1="200" y1="200" x2="56" y2="56" />
    </svg>
  );
}

export function Copy(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </SvgIcon>
  );
}

export function RotateCw(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M21 12a9 9 0 1 1-3-7.03" />
      <path d="M21 3v5h-5" />
    </SvgIcon>
  );
}

// ── Status ──────────────────────────────────────────────

export function Loader2(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </SvgIcon>
  );
}

export function AlertTriangle(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </SvgIcon>
  );
}

export function Info(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </SvgIcon>
  );
}

// ── Settings screen ─────────────────────────────────────

export function Sun(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </SvgIcon>
  );
}

export function Moon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </SvgIcon>
  );
}

export function Languages(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </SvgIcon>
  );
}

export function Minimize2(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 14h6v6" />
      <path d="M20 10h-6V4" />
      <path d="m14 10 7-7" />
      <path d="M3 21l7-7" />
    </SvgIcon>
  );
}

// ── Protection ─────────────────────────────────────────

export function Plus(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </SvgIcon>
  );
}

export function Lock(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </SvgIcon>
  );
}

export function Globe(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </SvgIcon>
  );
}

export function Trash2(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </SvgIcon>
  );
}

// ── Tools ───────────────────────────────────────────────

export function Activity(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </SvgIcon>
  );
}

export function Gauge(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </SvgIcon>
  );
}

export function Radar(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
      <path d="M4 6h.01" />
      <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
      <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
      <path d="M12 18h.01" />
      <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
      <circle cx="12" cy="12" r="2" />
      <path d="m13.41 10.59 5.66-5.66" />
    </SvgIcon>
  );
}

// ── Bottom nav ──────────────────────────────────────────

export function ShieldCheck(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </SvgIcon>
  );
}

export function Wrench(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </SvgIcon>
  );
}

export function Search(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </SvgIcon>
  );
}

export function Settings(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </SvgIcon>
  );
}
