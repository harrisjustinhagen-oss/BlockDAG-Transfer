import React from 'react';

interface IconProps {
  className?: string;
}

export const PrismIcon: React.FC<IconProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        viewBox="0 0 100 90" // Adjusted viewBox for padding
    >
        <defs>
            {/* A single gradient to color the entire icon */}
            <linearGradient id="prism-full-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4141" />     {/* Red */}
                <stop offset="30%" stopColor="#ffda41" />    {/* Yellow */}
                <stop offset="70%" stopColor="#41ffea" />   {/* Cyan */}
                <stop offset="100%" stopColor="#9d41ff" />   {/* Purple */}
            </linearGradient>
            
            {/* A gradient just for the green/yellow inner part */}
            <linearGradient id="prism-inner-fill-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#ccff41" /> {/* Lime */}
                <stop offset="100%" stopColor="#41ff8d" /> {/* Green */}
            </linearGradient>

            {/* Filter for the neon glow effect */}
            <filter id="prism-neon-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        
        {/* Group to apply the glow filter */}
        <g filter="url(#prism-neon-glow-filter)">
            {/* Outer triangle (stroke) */}
            <path
                d="M50 5 L5 85 L95 85 Z" // Points for the outer triangle
                fill="none"
                stroke="url(#prism-full-gradient)"
                strokeWidth="7"
                strokeLinejoin="round"
            />

            {/* Inner inverted triangle (fill) */}
            <path
                // Eyeballed coordinates for the inner shape
                d="M30 45 L70 45 L50 80 Z" 
                fill="url(#prism-inner-fill-gradient)"
            />
        </g>
    </svg>
);
