import React from 'react';

interface IconProps {
  className?: string;
}

export const ClothIcon: React.FC<IconProps> = ({ className }) => (
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
    <path d="M2 6s1.5-2 4-2 4 2 4 2 1.5-2 4-2 4 2 4 2" />
    <path d="M2 12s1.5-2 4-2 4 2 4 2 1.5-2 4-2 4 2 4 2" />
    <path d="M2 18s1.5-2 4-2 4 2 4 2 1.5-2 4-2 4 2 4 2" />
  </svg>
);