
import React from 'react';

interface IconProps {
  className?: string;
}

export const WalletIcon: React.FC<IconProps> = ({ className }) => (
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
      d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2v-1m-4-6h.01M17 12h.01M17 15h.01M17 9h.01M12 9h.01M12 12h.01M12 15h.01M9 9h.01M9 12h.01M9 15h.01M6 9h.01M6 12h.01"
    />
  </svg>
);
