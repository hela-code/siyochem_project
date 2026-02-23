export function MolecularBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-5 dark:opacity-10"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="mol-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9500" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Water molecule at top right */}
        <circle cx="1050" cy="100" r="8" fill="url(#mol-gradient)" />
        <circle cx="1000" cy="150" r="6" fill="url(#mol-gradient)" />
        <circle cx="1100" cy="150" r="6" fill="url(#mol-gradient)" />
        <line x1="1050" y1="100" x2="1000" y2="150" stroke="url(#mol-gradient)" strokeWidth="2" />
        <line x1="1050" y1="100" x2="1100" y2="150" stroke="url(#mol-gradient)" strokeWidth="2" />

        {/* Benzene ring at bottom left */}
        <circle cx="100" cy="650" r="8" fill="url(#mol-gradient)" />
        <circle cx="160" cy="620" r="8" fill="url(#mol-gradient)" />
        <circle cx="180" cy="560" r="8" fill="url(#mol-gradient)" />
        <circle cx="140" cy="500" r="8" fill="url(#mol-gradient)" />
        <circle cx="60" cy="500" r="8" fill="url(#mol-gradient)" />
        <circle cx="40" cy="560" r="8" fill="url(#mol-gradient)" />
        <polygon
          points="100,650 160,620 180,560 140,500 60,500 40,560"
          fill="none"
          stroke="url(#mol-gradient)"
          strokeWidth="2"
        />
        <circle cx="100" cy="560" r="5" fill="url(#mol-gradient)" opacity="0.5" />
        <circle cx="100" cy="580" r="5" fill="url(#mol-gradient)" opacity="0.5" />

        {/* Methane at top center */}
        <circle cx="600" cy="150" r="10" fill="url(#mol-gradient)" />
        <circle cx="550" cy="100" r="6" fill="url(#mol-gradient)" />
        <circle cx="650" cy="100" r="6" fill="url(#mol-gradient)" />
        <circle cx="550" cy="200" r="6" fill="url(#mol-gradient)" />
        <circle cx="650" cy="200" r="6" fill="url(#mol-gradient)" />
        <line x1="600" y1="150" x2="550" y2="100" stroke="url(#mol-gradient)" strokeWidth="2" />
        <line x1="600" y1="150" x2="650" y2="100" stroke="url(#mol-gradient)" strokeWidth="2" />
        <line x1="600" y1="150" x2="550" y2="200" stroke="url(#mol-gradient)" strokeWidth="2" />
        <line x1="600" y1="150" x2="650" y2="200" stroke="url(#mol-gradient)" strokeWidth="2" />

        {/* Scattered atoms */}
        <circle cx="200" cy="100" r="5" fill="url(#mol-gradient)" opacity="0.6" />
        <circle cx="950" cy="400" r="5" fill="url(#mol-gradient)" opacity="0.6" />
        <circle cx="150" cy="750" r="5" fill="url(#mol-gradient)" opacity="0.6" />
        <circle cx="800" cy="700" r="5" fill="url(#mol-gradient)" opacity="0.6" />
      </svg>
    </div>
  );
}
