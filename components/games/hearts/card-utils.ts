export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: number;
  name: string;
  isHuman: boolean;
  hand: Card[];
  tricksTaken: Card[];
}

export type GameState = 'passing' | 'playing' | 'trick-end' | 'round-end' | 'game-over';
export type PassingDirection = 'left' | 'right' | 'across' | 'hold';

const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCards = (deck: Card[], playerNames: string[]): Player[] => {
  const shuffled = shuffleDeck(deck);
  const players: Player[] = playerNames.map((name, index) => ({
    id: index,
    name,
    isHuman: index === 0,
    hand: [],
    tricksTaken: [],
  }));

  for (let i = 0; i < shuffled.length; i++) {
    players[i % 4].hand.push(shuffled[i]);
  }
  
  players.forEach(p => p.hand = sortHand(p.hand));

  return players;
};

export const getCardValue = (rank: Rank): number => {
  return RANKS.indexOf(rank);
};

export const getCardPoints = (card: Card): number => {
    if (card.suit === 'H') return 1;
    if (card.suit === 'S' && card.rank === 'Q') return 13;
    return 0;
};

const suitOrder: Record<Suit, number> = { C: 0, D: 1, S: 2, H: 3 };

export const sortHand = (hand: Card[]): Card[] => {
    return [...hand].sort((a, b) => {
        if (a.suit !== b.suit) {
            return suitOrder[a.suit] - suitOrder[b.suit];
        }
        return getCardValue(a.rank) - getCardValue(b.rank);
    });
};

export const cardToString = (card: Card): string => `${card.rank}${card.suit}`;

export const stringToCard = (s: string): Card => {
    const suit = s.slice(-1) as Suit;
    const rank = s.slice(0, -1) as Rank;
    return { suit, rank };
};

export const POINT_CARDS: Card[] = [
    ...RANKS.map(rank => ({ suit: 'H' as Suit, rank })),
    { suit: 'S', rank: 'Q' }
];