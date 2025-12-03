import React from 'react';

interface IconProps {
  className?: string;
}

export const ForestIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22V10" />
    <path d="M5 15l7-5 7 5" />
    <path d="M5 10l7-5 7 5" />
  </svg>
);