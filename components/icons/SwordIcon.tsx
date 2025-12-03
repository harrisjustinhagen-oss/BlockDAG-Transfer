import React from 'react';

interface IconProps {
  className?: string;
}

export const SwordIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21l10-10-2-2-10 10-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 19l-2 2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 5l-2 2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3l4 4" />
  </svg>
);
