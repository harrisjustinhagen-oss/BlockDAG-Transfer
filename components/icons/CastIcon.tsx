import React from 'react';

interface IconProps {
  className?: string;
}

export const CastIcon: React.FC<IconProps> = ({ className }) => (
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
      d="M3 3h18v12H3z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9 21h6m-8-6a8 8 0 018-8m-4 4a4 4 0 014-4" 
    />
  </svg>
);