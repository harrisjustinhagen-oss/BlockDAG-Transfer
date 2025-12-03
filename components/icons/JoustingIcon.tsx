import React from 'react';

interface IconProps {
  className?: string;
}

export const JoustingIcon: React.FC<IconProps> = ({ className }) => (
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
    <path d="M12 14l-1.5-1.5-2 3-2 2-3 4h15l-2.5-5-2-2-1.5 2z" />
    <path d="M9 10a1 1 0 100-2 1 1 0 000 2z" />
    <path d="M9 12v-2h2" />
    <path d="M22 10H8" />
  </svg>
);
