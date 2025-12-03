import React from 'react';

interface IconProps {
  className?: string;
}

export const DiamondIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 12l10 10 10-10L12 2z"/>
  </svg>
);
