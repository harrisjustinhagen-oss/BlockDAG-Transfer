
import React from 'react';

interface IconProps {
  className?: string;
}

export const SmartWatchIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <rect x="6" y="7" width="12" height="10" rx="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4M15 3v4M9 17v4M15 17v4M12 10v4" />
  </svg>
);
