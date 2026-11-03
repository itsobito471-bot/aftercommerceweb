import React from 'react';

// ── SVG Isometric 3D Cube Component (Pixel-perfect vector geometry) ──
export function IsometricCube({
  topColor = '#10B981',
  leftColor = '#1E3A8A',
  rightColor = '#FF6B35',
  hasFlag = false,
  size = 110,
  glow = false
}: {
  topColor?: string;
  leftColor?: string;
  rightColor?: string;
  hasFlag?: boolean;
  size?: number;
  glow?: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-xl pointer-events-none opacity-40"
          style={{ background: `radial-gradient(circle, ${topColor} 0%, transparent 70%)` }}
        />
      )}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Face */}
        <path
          d="M 100,52 L 142,76 L 100,100 L 58,76 Z"
          fill={topColor}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Left Face */}
        <path
          d="M 58,76 L 100,100 L 100,148 L 58,124 Z"
          fill={leftColor}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Right Face */}
        <path
          d="M 100,100 L 142,76 L 142,124 L 100,148 Z"
          fill={rightColor}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Vertex Circular Nodes */}
        <circle cx="100" cy="52" r="4.5" fill="#FFFFFF" stroke={topColor} strokeWidth="1.5" />
        <circle cx="142" cy="76" r="4.5" fill="#FFFFFF" stroke={topColor} strokeWidth="1.5" />
        <circle cx="142" cy="124" r="4.5" fill="#FFFFFF" stroke={rightColor} strokeWidth="1.5" />
        <circle cx="100" cy="148" r="4.5" fill="#FFFFFF" stroke={leftColor} strokeWidth="1.5" />
        <circle cx="58" cy="124" r="4.5" fill="#FFFFFF" stroke={leftColor} strokeWidth="1.5" />
        <circle cx="58" cy="76" r="4.5" fill="#FFFFFF" stroke={leftColor} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="4.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />

        {/* Optional Expedition Flag on Top Vertex */}
        {hasFlag && (
          <g>
            <line x1="100" y1="52" x2="100" y2="24" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 100,24 L 124,32 L 100,40 Z" fill="#FBBF24" />
            <circle cx="100" cy="24" r="2.5" fill="#FFFFFF" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ── SVG Isometric Faceted Polyhedron ──
export function IsometricPolyhedron({ size = 110 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="100,162 144,142 152,108 100,126 48,108 56,142"
          fill="#0F1C4D"
          stroke="#38BDF8"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <polygon
          points="100,38 148,82 100,126 52,82"
          fill="#1E3A8A"
          stroke="#38BDF8"
          strokeWidth="1.5"
          opacity="0.9"
        />
        <polygon
          points="100,38 100,126 148,82"
          fill="#2563EB"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <polygon
          points="100,38 52,82 100,126"
          fill="#1D4ED8"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <polygon
          points="100,52 128,78 100,104 72,78"
          fill="#FF6B35"
          stroke="#FED7AA"
          strokeWidth="1.5"
        />
        <circle cx="100" cy="38" r="3.5" fill="#FFFFFF" />
        <circle cx="148" cy="82" r="3.5" fill="#FFFFFF" />
        <circle cx="100" cy="126" r="3.5" fill="#FFFFFF" />
        <circle cx="52" cy="82" r="3.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
