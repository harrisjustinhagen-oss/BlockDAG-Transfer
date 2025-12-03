import React from 'react';

interface IconProps {
  className?: string;
}

export const WaterIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8s1-1 2-1 2 1 2 1 1-1 2-1 2 1 2 1 1-1 2-1 2 1 2 1M4 12s1-1 2-1 2 1 2 1 1-1 2-1 2 1 2 1 1-1 2-1 2 1 2 1M4 16s1-1 2-1 2 1 2 1 1-1 2-1 2 1 2 1 1-1 2-1 2 1 2 1" />
  </svg>
);