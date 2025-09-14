export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="status"
      aria-label="loading"
    >
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4" 
        opacity="0.2" 
      />
      <path 
        d="M22 12a10 10 0 0 0-10-10" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
