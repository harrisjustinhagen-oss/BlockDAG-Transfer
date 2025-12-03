import React from 'react';

interface IconProps {
  className?: string;
}

export const GenesisSteedIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 13.5C2 9.358 5.358 6 9.5 6s7.5 3.358 7.5 7.5V20H2v-6.5z"/>
    <path d="M17 13.5L18 10l4 1"/>
    <path d="M9.5 6V2"/>
    <path d="M8.5 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
  </svg>
);
