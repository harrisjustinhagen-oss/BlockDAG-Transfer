import React from 'react';

interface IconProps {
  className?: string;
}

export const IronIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 8l2-3h12l2 3v2l-2 3H6l-2-3V8z" />
  </svg>
);