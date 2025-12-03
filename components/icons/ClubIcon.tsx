import React from 'react';

interface IconProps {
  className?: string;
}

export const ClubIcon: React.FC<IconProps> = ({ className }) => (
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
    <circle cx="12" cy="7.5" r="3.5"/>
    <circle cx="17.5" cy="12.5" r="3.5"/>
    <circle cx="6.5" cy="12.5" r="3.5"/>
    <path d="M12 22l-3-3h6l-3 3z"/>
  </svg>
);
