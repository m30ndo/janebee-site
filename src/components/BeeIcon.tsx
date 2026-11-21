/** The bee as a single-line drawing (honey stroke via currentColor), sized like the other line icons. */
export function BeeIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M10.2 6.2 7.6 3M13.8 6.2 16.4 3" />
      <circle cx="12" cy="7.6" r="1.9" />
      <path d="M10.4 10.6C8.8 8.3 4.6 7.6 3.3 9.8c-1.2 2 1 4.3 3.4 3.9 1.6-.3 3-1.4 3.7-3.1zM13.6 10.6c1.6-2.3 5.8-3 7.1-.8 1.2 2-1 4.3-3.4 3.9-1.6-.3-3-1.4-3.7-3.1z" />
      <path d="M12 9.6c2.6 0 3.9 1.6 3.9 4.3 0 3.4-2.1 6.6-3.9 7.9-1.8-1.3-3.9-4.5-3.9-7.9 0-2.7 1.3-4.3 3.9-4.3z" />
      <path d="M8.3 13.2h7.4M8.6 16h6.8M9.9 18.8h4.2" />
    </svg>
  );
}
