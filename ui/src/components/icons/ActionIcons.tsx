export function CheckmarkIcon() {
  return (
    <svg className="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg className="w-4 h-4 text-foreground-tertiary" viewBox="0 0 16 16" fill="none">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M11 5V3.5C11 2.67 10.33 2 9.5 2H3.5C2.67 2 2 2.67 2 3.5V9.5C2 10.33 2.67 11 3.5 11H5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
