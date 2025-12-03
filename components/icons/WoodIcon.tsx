import React from 'react';

interface IconProps {
  className?: string;
}

export const WoodIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M2.25 12.25v-3.75a.75.75 0 01.75-.75h10.5a.75.75 0 01.75.75v3.75m-12 0v3.75a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75v-3.75m-12 0h12M15 9.75v6.75a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75V9.75m4.5 0v6.75a.75.75 0 00.75.75h3a.75.75 0 00.75-.75V9.75m-4.5 0h4.5" 
    />
  </svg>
);