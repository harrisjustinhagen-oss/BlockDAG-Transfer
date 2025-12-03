
import React, { useState, useEffect, useCallback, useRef } from 'react';

type Color = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
type Value = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'draw4';

interface Card {
  id: string;
  color: Color;
  value: Value;
}

interface Player {
  id: number;
  name: string;
  hand: Card[];
  isBot: boolean;
}

const COLORS: Color[] = ['red', 'blue', 'green', 'yellow'];
const VALUES: Value[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];

const UnoCard = ({ card, onClick, isPlayable, size = 'normal', hidden = false }: { card: Card, onClick?: () => void, isPlayable?: boolean, size?: 'small' | 'normal' | 'large', hidden?: boolean }) => {
    if (hidden) {
        return (
             <div 
                className={`
                    rounded-lg border-2 border-white shadow-md bg-slate-800
                    flex items-center justify-center
                    ${size === 'small' ? 'w-8 h-12' : size === 'large' ? 'w-24 h-36' : 'w-16 h-24'}
                `}
            >
                <div className="w-full h-full bg-slate-900 rounded-md m-1 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-red-500 rotate-45 transform"></div>
                </div>
            </div>
        );
    }

    const getColorClass = (c: Color) => {
        switch(c) {
            case 'red': return 'bg-red-500';
            case 'blue': return 'bg-blue-500';
            case 'green': return 'bg-green-500';
            case 'yellow': return 'bg-yellow-400';
            case 'wild': return 'bg-slate-900 bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-red-500 via-blue-500 via-green-500 to-yellow-400';
            default: return 'bg-slate-500';
        }
    };

    const getSymbol = (v: Value) => {
        switch(v) {
            case 'skip': return '⊘';
            case 'reverse': return '⇄';
            case 'draw2': return '+2';
            case 'wild': return 'W';
            case 'draw4': return '+4';
            default: return v;
        }
    };

    return (
        <div 
            onClick={isPlayable ? onClick : undefined}
            className={`
                relative rounded-lg border-2 border-white shadow-md select-none transition-transform
                ${getColorClass(card.color)}
                ${size === 'small' ? 'w-8 h-12 text-xs' : size === 'large' ? 'w-32 h-48 text-4xl' : 'w-20 h-32 text-2xl'}
                ${isPlayable ? 'cursor-pointer hover:-translate-y-4 hover:shadow-xl ring-2 ring-yellow-300 z-10' : ''}
            `}
        >
            {/* Center Oval */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[80%] h-[60%] bg-white rounded-[50%] flex items-center justify-center transform -rotate-12 shadow-inner border border-black/10">
                     <span className={`font-bold font-mono drop-shadow-sm ${card.color === 'yellow' ? 'text-yellow-600' : `text-${card.color}-600`} ${card.color === 'wild' ? 'text-black' : ''}`}>
                        {getSymbol(card.value)}
                     </span>
                </div>
            </div>
            
            {/* Corners */}
            <div className="absolute top-1 left-1 text-white font-bold text-[0.6em] leading-none drop-shadow-md">{getSymbol(card.value)}</div>
            <div className="absolute bottom-1 right-1 text-white font-bold text-[0.6em] leading-none drop-shadow-md rotate-180">{getSymbol(card.value)}</div>
        </div>
    );
};

export const UnoGame = ({ onExit }: { onExit: () => void }) => {
    const [deck, setDeck] = useState<Card[]>([]);
    const [discardPile, setDiscardPile] = useState<Card[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1); // 1 = clockwise, -1 = counter-clockwise
    const [currentColor, setCurrentColor] = useState<Color>('red'); // Active color for play
    const [gameStatus, setGameStatus] = useState<'playing' | 'choosing_color' | 'game_over'>('playing');
    const [winner, setWinner] = useState<string | null>(null);
    const [message, setMessage] = useState("Game Started!");
    const [drawStack, setDrawStack] = useState(0); // For stacking draw cards logic (simplified)

    // Init Game
    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const newDeck: Card[] = [];
        let idCounter = 0;

        // Create standard cards
        COLORS.forEach(color => {
            VALUES.forEach(value => {
                newDeck.push({ id: `c-${idCounter++}`, color, value });
                if (value !== '0') {
                    newDeck.push({ id: `c-${idCounter++}`, color, value });
                }
            });
        });

        // Create Wilds
        for(let i=0; i<4; i++) {
            newDeck.push({ id: `w-${idCounter++}`, color: 'wild', value: 'wild' });
            newDeck.push({ id: `w4-${idCounter++}`, color: 'wild', value: 'draw4' });
        }

        const shuffled = newDeck.sort(() => Math.random() - 0.5);
        
        // Deal
        const newPlayers: Player[] = [
            { id: 0, name: 'You', hand: [], isBot: false },
            { id: 1, name: 'West', hand: [], isBot: true },
            { id: 2, name: 'North', hand: [], isBot: true },
            { id: 3, name: 'East', hand: [], isBot: true },
        ];

        for(let i=0; i<7; i++) {
            newPlayers.forEach(p => p.hand.push(shuffled.pop()!));
        }

        // Start pile
        let startCard = shuffled.pop()!;
        while(startCard.color === 'wild') { // Don't start with wild
             shuffled.unshift(startCard);
             startCard = shuffled.pop()!;
        }

        setDeck(shuffled);
        setDiscardPile([startCard]);
        setPlayers(newPlayers);
        setCurrentColor(startCard.color);
        setCurrentPlayerIndex(0);
        setGameStatus('playing');
        setWinner(null);
        setDirection(1);
    };

    // --- Core Logic ---

    const getNextPlayerIndex = (steps: number = 1) => {
        let next = (currentPlayerIndex + (steps * direction)) % players.length;
        if (next < 0) next += players.length;
        return next;
    };

    const drawCard = (playerIndex: number, count: number = 1) => {
        const drawnCards: Card[] = [];
        let currentDeck = [...deck];
        let currentDiscard = [...discardPile];

        for(let i=0; i<count; i++) {
            if (currentDeck.length === 0) {
                if (currentDiscard.length <= 1) break; // No cards left
                // Reshuffle discard into deck
                const topCard = currentDiscard.pop()!;
                currentDeck = currentDiscard.sort(() => Math.random() - 0.5);
                currentDiscard = [topCard];
            }
            drawnCards.push(currentDeck.pop()!);
        }

        setDeck(currentDeck);
        setDiscardPile(currentDiscard); // In case we reshuffled

        setPlayers(prev => prev.map(p => {
            if (p.id === playerIndex) {
                return { ...p, hand: [...p.hand, ...drawnCards] };
            }
            return p;
        }));
        
        return drawnCards;
    };

    const handlePlayCard = (card: Card) => {
        const player = players[currentPlayerIndex];
        
        // Remove card from hand
        setPlayers(prev => prev.map(p => {
            if (p.id === player.id) {
                return { ...p, hand: p.hand.filter(c => c.id !== card.id) };
            }
            return p;
        }));

        setDiscardPile(prev => [...prev, card]);

        // Check Win
        if (player.hand.length === 1) { // Was 1 before playing this one
            setWinner(player.name);
            setGameStatus('game_over');
            return;
        }

        // Special Effects
        let nextStep = 1;
        let nextIsSkip = false;

        if (card.value === 'reverse') {
            setDirection(prev => (prev * -1) as 1 | -1);
            if (players.length === 2) nextStep = 2; // In 2 player, reverse acts as skip
        } else if (card.value === 'skip') {
            nextStep = 2;
        } else if (card.value === 'draw2') {
            const victimIndex = getNextPlayerIndex(1);
            drawCard(victimIndex, 2);
            nextStep = 2; // Skip the victim
            setMessage(`${players[victimIndex].name} draws 2!`);
        } else if (card.value === 'draw4') {
            const victimIndex = getNextPlayerIndex(1);
            drawCard(victimIndex, 4);
            nextStep = 2; // Skip the victim
            setMessage(`${players[victimIndex].name} draws 4!`);
        }

        if (card.color === 'wild') {
            if (player.isBot) {
                // Bot chooses random color (or most prominent)
                const colors: Color[] = ['red', 'blue', 'green', 'yellow'];
                const chosen = colors[Math.floor(Math.random() * colors.length)];
                setCurrentColor(chosen);
                setMessage(`${player.name} chose ${chosen.toUpperCase()}`);
                advanceTurn(nextStep);
            } else {
                setGameStatus('choosing_color');
                // We pause turn advancement until color is picked
            }
        } else {
            setCurrentColor(card.color);
            advanceTurn(nextStep);
        }
    };

    const advanceTurn = (steps: number = 1) => {
        setCurrentPlayerIndex(prev => {
            let next = (prev + (steps * direction)) % players.length;
            if (next < 0) next += players.length;
            return next;
        });
    };

    const isPlayable = (card: Card) => {
        if (card.color === 'wild') return true;
        const topCard = discardPile[discardPile.length - 1];
        // If top card is wild, we match the `currentColor` state, not the card's intrinsic color (which is wild)
        if (card.color === currentColor) return true;
        if (card.value === topCard.value) return true;
        return false;
    };

    // --- Interactions ---

    const onHumanPlay = (card: Card) => {
        if (currentPlayerIndex !== 0 || gameStatus !== 'playing') return;
        if (isPlayable(card)) {
            handlePlayCard(card);
        } else {
            setMessage("Cannot play that card!");
        }
    };

    const onHumanDraw = () => {
        if (currentPlayerIndex !== 0 || gameStatus !== 'playing') return;
        drawCard(0, 1);
        advanceTurn();
    };

    const onColorChoice = (color: Color) => {
        setCurrentColor(color);
        setGameStatus('playing');
        advanceTurn(discardPile[discardPile.length - 1].value === 'draw4' ? 2 : 1);
    };

    // --- Bot Logic ---
    useEffect(() => {
        if (gameStatus !== 'playing' || currentPlayerIndex === 0 || !!winner) return;

        const botTurn = setTimeout(() => {
            const bot = players[currentPlayerIndex];
            const playableCards = bot.hand.filter(c => isPlayable(c));

            if (playableCards.length > 0) {
                // Simple AI: Play first valid card, prioritize non-wilds to save them
                const cardToPlay = playableCards.find(c => c.color !== 'wild') || playableCards[0];
                handlePlayCard(cardToPlay);
            } else {
                // Draw
                drawCard(bot.id, 1);
                setMessage(`${bot.name} drew a card.`);
                advanceTurn();
            }
        }, 1000 + Math.random() * 1000); // 1-2s delay

        return () => clearTimeout(botTurn);
    }, [currentPlayerIndex, gameStatus, players, currentColor, discardPile]);

    // --- Render Helpers ---

    const getPlayerPositionClass = (id: number) => {
        // Assuming 0 is bottom (human)
        // 1: Left, 2: Top, 3: Right
        switch(id) {
            case 1: return 'left-4 top-1/2 -translate-y-1/2 flex-col items-start';
            case 2: return 'top-4 left-1/2 -translate-x-1/2 flex-row items-start';
            case 3: return 'right-4 top-1/2 -translate-y-1/2 flex-col items-end';
            default: return 'bottom-4 left-1/2 -translate-x-1/2';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-green-800 flex flex-col items-center justify-center overflow-hidden font-sans">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
                <div className="bg-black/40 p-2 rounded-lg text-white pointer-events-auto">
                    <h1 className="text-xl font-bold text-yellow-400">Uno Online</h1>
                    <p className="text-sm">{message}</p>
                </div>
                <button onClick={onExit} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded pointer-events-auto shadow-lg">
                    Exit
                </button>
            </div>

            {/* Center Area: Discard & Deck */}
            <div className="relative flex items-center gap-8 z-0">
                {/* Draw Pile */}
                <div 
                    onClick={currentPlayerIndex === 0 ? onHumanDraw : undefined}
                    className={`relative w-24 h-36 bg-slate-800 rounded-lg border-4 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform ${currentPlayerIndex === 0 ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
                >
                    <div className="w-20 h-32 bg-slate-900 rounded border border-slate-700 flex items-center justify-center">
                        <div className="w-12 h-12 bg-red-500 rounded-full rotate-45"></div>
                    </div>
                    <span className="absolute -bottom-8 text-white font-bold text-shadow">Draw</span>
                </div>

                {/* Discard Pile */}
                <div className="relative w-24 h-36">
                    {discardPile.slice(-3).map((card, idx) => (
                        <div key={card.id} className="absolute inset-0" style={{ transform: `rotate(${idx * 5 - 10}deg)` }}>
                            <UnoCard card={card} size="large" />
                        </div>
                    ))}
                </div>

                {/* Direction Indicator */}
                <div className={`absolute -inset-16 border-4 border-dashed border-white/20 rounded-full pointer-events-none animate-spin-slow ${direction === -1 ? 'animate-reverse-spin' : ''}`} style={{ animationDuration: '10s' }}></div>
                
                {/* Current Color Indicator (useful for Wilds) */}
                <div className={`absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white font-bold text-sm shadow-lg border border-white/50 uppercase tracking-widest bg-${currentColor === 'yellow' ? 'yellow-400' : currentColor === 'blue' ? 'blue-500' : currentColor === 'green' ? 'green-500' : 'red-500'}`}>
                    Color: {currentColor}
                </div>
            </div>

            {/* Players */}
            {players.map((player) => {
                if (player.id === 0) return null; // Render human separately
                const isCurrent = currentPlayerIndex === player.id;
                
                return (
                    <div key={player.id} className={`absolute ${getPlayerPositionClass(player.id)} flex gap-2 p-3 rounded-xl transition-all ${isCurrent ? 'bg-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.4)] scale-105' : 'bg-black/30'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md ${isCurrent ? 'bg-yellow-500' : 'bg-slate-700'}`}>
                            {player.name[0]}
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-white font-bold text-shadow">{player.name}</span>
                            <div className="flex -space-x-8 mt-1">
                                {player.hand.map((_, i) => (
                                    <div key={i} style={{ transform: `translateX(${i * 2}px)` }}>
                                        <UnoCard card={{ id: 'hidden', color: 'red', value: '0' }} size="small" hidden />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Human Hand */}
            <div className="absolute bottom-0 left-0 right-0 h-48 flex items-end justify-center pb-4 z-20 bg-gradient-to-t from-black/80 to-transparent">
                <div className="relative flex items-end justify-center h-full min-w-[300px]">
                     {/* Player Info Badge */}
                     <div className={`absolute -top-12 left-0 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 transition-all ${currentPlayerIndex === 0 ? 'ring-2 ring-yellow-400 bg-yellow-900/60' : ''}`}>
                         <div className="w-10 h-10 rounded-full bg-cyan-600 border-2 border-white flex items-center justify-center text-white font-bold">Y</div>
                         <div className="text-white font-bold">You</div>
                     </div>

                    {players[0]?.hand.map((card, index) => {
                         const playable = isPlayable(card) && currentPlayerIndex === 0;
                         // Fan effect
                         const total = players[0].hand.length;
                         const rotation = (index - (total - 1) / 2) * 5;
                         const translateY = Math.abs(index - (total - 1) / 2) * 5;

                         return (
                            <div 
                                key={card.id} 
                                className="transition-all duration-300 -ml-8 first:ml-0 hover:z-30 hover:-translate-y-8 origin-bottom"
                                style={{ 
                                    transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                                    zIndex: index 
                                }}
                            >
                                <UnoCard 
                                    card={card} 
                                    isPlayable={playable} 
                                    onClick={() => onHumanPlay(card)}
                                />
                            </div>
                         );
                    })}
                </div>
            </div>

            {/* Color Picker Modal */}
            {gameStatus === 'choosing_color' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
                    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-600 text-center">
                        <h2 className="text-2xl font-bold text-white mb-6">Choose a Color</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => onColorChoice(color)}
                                    className={`w-24 h-24 rounded-xl shadow-lg transform hover:scale-105 transition-transform bg-${color === 'yellow' ? 'yellow-400' : color === 'blue' ? 'blue-500' : color === 'green' ? 'green-500' : 'red-500'}`}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over Modal */}
            {gameStatus === 'game_over' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn">
                    <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl border-2 border-yellow-500 text-center max-w-md w-full">
                        <h2 className="text-5xl font-bold text-yellow-400 mb-4">{winner === 'You' ? 'You Won!' : 'Game Over'}</h2>
                        <p className="text-2xl text-white mb-8">
                            {winner === 'You' ? 'Congratulations! 🎉' : `${winner} wins this round.`}
                        </p>
                        <div className="flex flex-col gap-4">
                            <button onClick={initializeGame} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded-xl shadow-lg transition-colors">
                                Play Again
                            </button>
                            <button onClick={onExit} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl rounded-xl shadow-lg transition-colors">
                                Exit to Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
