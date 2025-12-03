
import React from 'react';
import { Card as CardType, Suit, Rank } from './card-utils';
import { HeartIcon } from '../../icons/HeartIcon';
import { SpadeIcon } from '../../icons/SpadeIcon';
import { DiamondIcon } from '../../icons/DiamondIcon';
import { ClubIcon } from '../../icons/ClubIcon';

interface CardProps {
  card: CardType;
  isFaceUp?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (card: CardType) => void;
}

// FIX: Explicitly type the React.ReactElement to include className prop for type safety with cloneElement.
const suitIcons: Record<Suit, React.ReactElement<{ className?: string }>> = {
  H: <HeartIcon />,
  S: <SpadeIcon />,
  D: <DiamondIcon />,
  C: <ClubIcon />,
};

const faceCardRanks: Rank[] = ['J', 'Q', 'K', 'A'];

export const Card: React.FC<CardProps> = ({
  card,
  isFaceUp = false,
  isSelected = false,
  isPlayable = true,
  className = '',
  style = {},
  onClick,
}) => {
  const isRed = card.suit === 'H' || card.suit === 'D';
  const suitColor = isRed ? 'text-red-600' : 'text-black';
  const isFaceCard = faceCardRanks.includes(card.rank);

  const handleClick = () => {
    if (onClick && isPlayable) {
      onClick(card);
    }
  };

  // --- Refactored Card Back ---
  if (!isFaceUp) {
    return (
      <div
        className={`relative w-16 h-24 rounded-lg bg-red-800 shadow-lg border border-black/20 p-1 ${className}`}
        style={style}
      >
        <div 
          className="w-full h-full rounded-md border border-red-400/40"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)
            `,
            backgroundSize: '4px 4px'
          }}
        ></div>
      </div>
    );
  }

  // --- Refactored Card Face ---
  return (
    <div
      className={`relative w-16 h-24 rounded-lg bg-white shadow-md border border-gray-300 transition-all duration-200 ease-in-out ${suitColor} ${
        isSelected ? 'ring-4 ring-yellow-400 z-10' : ''
      } ${
        onClick && isPlayable ? 'cursor-pointer hover:shadow-xl' : 'cursor-default'
      } ${
        !isPlayable ? 'opacity-60 saturate-[.8]' : 'hover:brightness-105'
      } ${className}`}
      style={style}
      onClick={handleClick}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      {/* Corner Rank & Suit */}
      <div className="absolute top-0.5 left-1 text-center leading-none">
          <p className="text-lg font-bold">{card.rank}</p>
          <div className="w-3.5 h-3.5 mx-auto">{React.cloneElement(suitIcons[card.suit], { className: 'w-full h-full' })}</div>
      </div>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isFaceCard ? (
          // Special styling for Face Cards
          <div className={`relative w-10 h-14 flex items-center justify-center rounded-md overflow-hidden`}>
             <div className={`absolute inset-0 opacity-10 ${isRed ? 'bg-red-500' : 'bg-black'}`}></div>
             <div className={`absolute inset-0 border ${isRed ? 'border-red-200' : 'border-gray-300'} rounded-md`}></div>
            <span className="text-4xl font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
              {card.rank}
            </span>
          </div>
        ) : (
          // Standard styling for number cards
          <div className="w-8 h-8 opacity-80">
            {React.cloneElement(suitIcons[card.suit], { className: 'w-full h-full' })}
          </div>
        )}
      </div>

      {/* Rotated Corner Rank & Suit */}
      <div className="absolute bottom-0.5 right-1 text-center leading-none transform rotate-180">
          <p className="text-lg font-bold">{card.rank}</p>
          <div className="w-3.5 h-3.5 mx-auto">{React.cloneElement(suitIcons[card.suit], { className: 'w-full h-full' })}</div>
      </div>
    </div>
  );
};