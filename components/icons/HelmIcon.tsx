import React from 'react';

interface IconProps {
  className?: string;
}

export const HelmIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.477 2 2 6.477 2 12c0 1.99.584 3.843 1.625 5.375" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 12c0-5.523-4.477-10-10-10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V14" />
  </svg>
);
