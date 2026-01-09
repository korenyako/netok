export function CopiedChip() {
  return (
    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
      Copied
    </span>
  );
}

export function CopyIcon() {
  return (
    <svg
      className="w-4 h-4 text-foreground-tertiary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
