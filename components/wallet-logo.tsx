export function WalletLogo({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="walletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Wallet body */}
      <rect x="15" y="25" width="70" height="50" rx="8" fill="url(#walletGradient)" opacity="0.9" />

      {/* Wallet flap */}
      <path d="M 15 25 Q 15 15, 25 15 L 75 15 Q 85 15, 85 25" fill="url(#walletGradient)" opacity="0.7" />

      {/* Card slot */}
      <rect x="25" y="40" width="35" height="20" rx="3" fill="white" opacity="0.3" />

      {/* Wallet button/clasp */}
      <circle cx="72" cy="50" r="6" fill="white" opacity="0.4" />

      {/* Inner circle detail */}
      <circle cx="72" cy="50" r="3" fill="url(#walletGradient)" />
    </svg>
  )
}
