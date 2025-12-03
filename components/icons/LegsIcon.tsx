import React from 'react';

interface IconProps {
  className?: string;
}

export const LegsIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v11a2 2 0 002 2h6a2 2 0 002-2V3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16h10v3H7v-3z" />
  </svg>
);
