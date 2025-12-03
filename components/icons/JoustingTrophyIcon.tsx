import React from 'react';

interface IconProps {
  className?: string;
}

export const JoustingTrophyIcon: React.FC<IconProps> = ({ className }) => (
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
    <path d="M12 2c-3.314 0-6 2.686-6 6 0 3.314 2.686 6 6 6s6-2.686 6-6c0-3.314-2.686-6-6-6z"/>
    <path d="M12 14v6"/>
    <path d="M8 20h8"/>
    <path d="M6 8H3"/>
    <path d="M18 8h3"/>
  </svg>
);
