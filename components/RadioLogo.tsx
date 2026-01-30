
import React, { useState } from 'react';

interface RadioLogoProps {
  className?: string;
  src?: string;
}

export const RadioLogo: React.FC<RadioLogoProps> = ({ className = "w-40", src }) => {
  const [imgError, setImgError] = useState(false);

  // Use Custom Image if provided AND valid (not errored)
  if (src && src.trim() !== "" && !imgError) {
    return (
      <img 
        src={src} 
        alt="Rádio Logo" 
        className={`${className} object-contain`} 
        onError={() => setImgError(true)}
      />
    );
  }

  // Otherwise, render the High-Quality SVG Vector
  // This ensures the logo is identical in the header and hero section if no custom image is uploaded.
  return (
    <svg 
      viewBox="0 0 300 220" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0047BA" />
          <stop offset="100%" stopColor="#002a70" />
        </linearGradient>
      </defs>

      {/* Yellow Accent Background (Swoosh) */}
      <path 
        d="M180,40 Q250,20 280,80 Q300,150 240,160 L180,40 Z" 
        fill="#fbbf24" 
        filter="url(#dropShadow)"
        transform="translate(10, -10)"
      />

      {/* Main Blue Body (Organic Shape) */}
      <path 
        d="M20,60 Q30,20 150,30 Q270,40 280,100 Q285,160 150,170 Q10,180 20,60 Z" 
        fill="url(#blueGradient)" 
        stroke="white" 
        strokeWidth="3"
        filter="url(#dropShadow)"
      />

      {/* Text: RÁDIO */}
      <text 
        x="120" 
        y="70" 
        textAnchor="middle" 
        fill="white" 
        fontFamily="sans-serif" 
        fontWeight="bold" 
        fontSize="28" 
        letterSpacing="2"
        transform="rotate(-5, 120, 70)"
        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
      >
        RÁDIO
      </text>

      {/* Text: 13 DE MAIO */}
      <g transform="rotate(-3, 150, 120)">
        <text 
          x="150" 
          y="125" 
          textAnchor="middle" 
          fill="#fbbf24" 
          stroke="#000040" 
          strokeWidth="2.5" 
          fontFamily="Impact, Arial Black, sans-serif" 
          fontWeight="900" 
          fontSize="68" 
          style={{ textShadow: '3px 3px 0px #000040' }}
        >
          13 DE MAIO
        </text>
      </g>

      {/* Red Ribbon Background */}
      <path 
        d="M50,155 L250,155 L240,180 L250,205 L50,205 L60,180 L50,155 Z" 
        fill="#DC2626" 
        stroke="white" 
        strokeWidth="2"
        filter="url(#dropShadow)"
        transform="rotate(-2, 150, 180)"
      />

      {/* Text: SANTA CATARINA */}
      <text 
        x="150" 
        y="188" 
        textAnchor="middle" 
        fill="white" 
        fontFamily="sans-serif" 
        fontWeight="bold" 
        fontSize="20" 
        letterSpacing="1"
        transform="rotate(-2, 150, 188)"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
      >
        SANTA CATARINA
      </text>
    </svg>
  );
};
