export function AuthLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 2L36 12V28L20 38L4 28V12L20 2Z"
          stroke="#d4a843"
          strokeWidth="2"
          fill="none"
        />
        <path d="M22 8L14 22H19L18 32L26 18H21L22 8Z" fill="#d4a843" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-white">
        AEGIS <span className="text-aegis-gold">AI</span>
      </span>
    </div>
  );
}
