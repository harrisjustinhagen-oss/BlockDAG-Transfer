import React from 'react';

interface IconProps {
  className?: string;
}

export const SpadeIcon: React.FC<IconProps> = ({ className }) => (
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
    <path d="M12 2c-2.5 3.5-6 6-6 9.5 0 2.5 2.5 3.5 6 3.5s6-1 6-3.5c0-3.5-3.5-6-6-9.5z M12 22l-3-3h6l-3 3z"/>
  </svg>
);
