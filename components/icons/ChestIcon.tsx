import React from 'react';

interface IconProps {
  className?: string;
}

export const ChestIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l-1 5h18l-1-5H4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 11h18v8H3v-8z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l-1-3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l1-3" />
  </svg>
);
