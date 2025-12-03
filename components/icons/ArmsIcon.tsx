import React from 'react';

interface IconProps {
  className?: string;
}

export const ArmsIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15V8a2 2 0 012-2h10a2 2 0 012 2v7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l-1 4h16l-1-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 15V6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 15V6" />
  </svg>
);
