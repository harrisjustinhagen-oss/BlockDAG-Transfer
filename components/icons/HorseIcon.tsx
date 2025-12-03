import React from 'react';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HorseIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 14l-1.5-1.5-2 3-2-2-3 4h15l-2.5-5-2-2-1.5 2z" />
    <path d="M11 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path d="M13 13.5c-2-2-2.5-5-1-6.5" />
    <path d="M18 13l-2-2" />
  </svg>
);