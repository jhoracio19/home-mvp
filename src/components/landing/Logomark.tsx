export function Logomark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className}>
      <rect x="0" y="0" width="512" height="512" rx="112" fill="#F5F1EA" />
      <path d="M256 100 L376 200 L376 400 L136 400 L136 200 Z" fill="#7D5A44" />
    </svg>
  );
}
