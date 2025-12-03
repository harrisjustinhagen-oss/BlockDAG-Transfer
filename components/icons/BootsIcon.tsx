import React from 'react';

interface IconProps {
  className?: string;
}

export const BootsIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V11a2 2 0 012-2h10a2 2 0 012 2v10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 15h10" />
  </svg>
);
