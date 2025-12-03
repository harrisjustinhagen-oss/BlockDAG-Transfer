
import React from 'react';

interface IconProps {
  className?: string;
}

export const GamesIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h.01M12 12h.01M18 12h.01M7 15h10M6 9h12a3 3 0 013 3v1.5a3 3 0 01-3 3H6a3 3 0 01-3-3V12a3 3 0 013-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75l1.5-3 1.5 3M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);
