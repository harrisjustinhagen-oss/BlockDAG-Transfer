import React from 'react';

interface IconProps {
  className?: string;
}

export const QrCodeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 014.5 3.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM3.75 15A.75.75 0 014.5 14.25h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM14.25 4.5a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15h.01M15 18h.01M18 15h.01M18 18h.01M21 15h.01M21 18h.01M6 6h.01M9 6h.01M6 9h.01M9 9h.01M6 16.5h.01M9 16.5h.01M16.5 6h.01M19.5 6h.01M16.5 9h.01M19.5 9h.01" />
  </svg>
);
