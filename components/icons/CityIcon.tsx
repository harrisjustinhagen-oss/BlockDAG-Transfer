import React from 'react';

interface IconProps {
  className?: string;
}

export const CityIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M3 21h18M5 21V10l4-4 4 4v11m-8-6h.01M16 21V12l-4-4-4 4v9" 
    />
  </svg>
);