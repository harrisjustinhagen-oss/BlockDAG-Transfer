
import React from 'react';

interface IconProps {
  className?: string;
}

export const GlovesIcon: React.FC<IconProps> = ({ className }) => (
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
      d="M19 7h-1V4a2 2 0 00-2-2h-2a2 2 0 00-2 2v3H9V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a6 6 0 006 6h6a6 6 0 006-6V9a2 2 0 00-2-2z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 16v-5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 16V4" />
  </svg>
);
