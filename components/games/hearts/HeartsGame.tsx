import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card as CardType, Player, GameState, PassingDirection, createDeck, dealCards, getCardPoints, getCardValue, sortHand, cardToString, POINT_CARDS, Suit } from './card-utils';
import { Card } from './Card';

const PLAYER_NAMES = ["You", "West", "North", "East"];
const SCORE_LIMIT = 100;

export const HeartsGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>('passing');
  const [players, setPlayers] = useState<Player[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentTrick, setCurrentTrick] = useState<(CardType & { playerIndex: number })[]>([]);
  const [leadSuit, setLeadSuit] = useState<Suit | null>(null);
  const [heartsBroken, setHeartsBroken] = useState(false);
  const [cardsToPass, setCardsToPass] = useState<CardType[]>([]);
  const [gameMessage, setGameMessage] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({ You: 0, West: 0, North: 0, East: 0 });
  const [roundScores, setRoundScores] = useState<Record<string, number>>({ You: 0, West: 0, North: 0, East: 0 });
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [trickWinnerInfo, setTrickWinnerInfo] = useState<{ name: string; points: number; winnerIndex: number } | null>(null);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [isHandHovered, setIsHandHovered] = useState(false);
    
  const passingDirection: PassingDirection = (['left', 'right', 'across', 'hold'] as const)[(roundNumber - 1) % 4];

  const humanPlayerIndex = 0;

  const startNewRound = useCallback(() => {
    const deck = createDeck();
    const newPlayers = dealCards(deck, PLAYER_NAMES);
    setPlayers(newPlayers);
    setCurrentTrick([]);
    setLeadSuit(null);
    setHeartsBroken(false);
    setCardsToPass([]);
    setRoundScores({ You: 0, West: 0, North: 0, East: 0 });
    setTrickWinnerInfo(null);
    
    const twoOfClubsOwner = newPlayers.findIndex(p => p.hand.some(c => c.suit === 'C' && c.rank === '2'));
    setCurrentPlayerIndex(twoOfClubsOwner);

    if (passingDirection === 'hold') {
      setGameState('playing');
    } else {
      setGameState('passing');
    }
  }, [passingDirection]);

  useEffect(() => {
    startNewRound();
  }, [roundNumber, startNewRound]);
  
  const aiChooseCardsToPass = (hand: CardType[]): CardType[] => {
    const sortedHand = [...hand].sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank));

    let toPass: CardType[] = sortedHand.filter(c => 
        (c.suit === 'S' && ['Q', 'K', 'A'].includes(c.rank))
    );

    if (toPass.length < 3) {
        const suitCounts: Record<string, number> = { C: 0, D: 0, S: 0, H: 0 };
        hand.forEach(c => suitCounts[c.suit]++);

        const voidCandidates = (['C', 'D'] as const)
            .filter(suit => suitCounts[suit] > 0 && suitCounts[suit] <= 3 - toPass.length)
            .sort((a, b) => suitCounts[a] - suitCounts[b]);

        if (voidCandidates.length > 0) {
            const suitToVoid = voidCandidates[0];
            const cardsInSuit = sortedHand.filter(c => c.suit === suitToVoid && !toPass.some(pc => cardToString(pc) === cardToString(c)));
            toPass.push(...cardsInSuit);
        }
    }
    
    if (toPass.length < 3) {
        const remainingHand = sortedHand.filter(c => !toPass.some(pc => cardToString(pc) === cardToString(c)));
        const highCards = remainingHand.filter(c => !(c.suit === 'C' && getCardValue(c.rank) < 8)); 
        toPass.push(...highCards.slice(0, 3 - toPass.length));
    }

    if (toPass.length < 3) {
        const remainingHand = sortedHand.filter(c => !toPass.some(pc => cardToString(pc) === cardToString(c)));
        toPass.push(...remainingHand.slice(0, 3 - toPass.length));
    }

    return toPass.slice(0, 3);
  };

  const handleConfirmPass = () => {
    if (cardsToPass.length !== 3) {
      setGameMessage("Please select exactly 3 cards.");
      return;
    }

    const humanPassedCards = [...cardsToPass];
    const newPlayers = [...players];
    const aiPassedCards = players.map((p, i) => i === humanPlayerIndex ? [] : aiChooseCardsToPass(p.hand));

    newPlayers[humanPlayerIndex].hand = newPlayers[humanPlayerIndex].hand.filter(c => !humanPassedCards.some(pc => cardToString(pc) === cardToString(c)));
    aiPassedCards.forEach((cards, i) => {
      if (i !== humanPlayerIndex) {
        newPlayers[i].hand = newPlayers[i].hand.filter(c => !cards.some(pc => cardToString(pc) === cardToString(c)));
      }
    });

    for (let i = 0; i < 4; i++) {
        let cardsToReceive: CardType[];
        switch (passingDirection) {
            case 'left':
                const passFromRight = (i + 1) % 4;
                cardsToReceive = (passFromRight === humanPlayerIndex) ? humanPassedCards : aiPassedCards[passFromRight];
                break;
            case 'right':
                const passFromLeft = (i + 3) % 4;
                cardsToReceive = (passFromLeft === humanPlayerIndex) ? humanPassedCards : aiPassedCards[passFromLeft];
                break;
            case 'across':
                const passFromAcross = (i + 2) % 4;
                cardsToReceive = (passFromAcross === humanPlayerIndex) ? humanPassedCards : aiPassedCards[passFromAcross];
                break;
            default:
                cardsToReceive = [];
                break;
        }
        newPlayers[i].hand.push(...cardsToReceive);
        newPlayers[i].hand = sortHand(newPlayers[i].hand);
    }
    
    setPlayers(newPlayers);
    setGameState('playing');
    const twoOfClubsOwner = newPlayers.findIndex(p => p.hand.some(c => c.suit === 'C' && c.rank === '2'));
    setCurrentPlayerIndex(twoOfClubsOwner);
  };

  const handleSelectCardToPass = (card: CardType) => {
    setCardsToPass(prev => {
      const isSelected = prev.some(c => cardToString(c) === cardToString(card));
      if (isSelected) {
        return prev.filter(c => cardToString(c) !== cardToString(card));
      } else {
        if (prev.length < 3) {
          return [...prev, card];
        }
      }
      return prev;
    });
  };

  const getPlayableCards = useCallback((hand: CardType[]): CardType[] => {
    if (players.every(p => p.hand.length === 13) && currentTrick.length === 0) {
        return hand.filter(c => c.suit === 'C' && c.rank === '2');
    }

    if (currentTrick.length === 0) {
        const hasNonHearts = hand.some(c => c.suit !== 'H');
        if (heartsBroken || !hasNonHearts) {
            return hand;
        } else {
            return hand.filter(c => c.suit !== 'H');
        }
    }

    const cardsInSuit = hand.filter(c => c.suit === leadSuit);
    if (cardsInSuit.length > 0) {
        return cardsInSuit;
    }

    return hand;
  }, [currentTrick.length, heartsBroken, leadSuit, players]);

  const playableCards = useMemo(() => {
    if (gameState !== 'playing' || !players[humanPlayerIndex]) return [];
    return getPlayableCards(players[humanPlayerIndex].hand);
  }, [gameState, players, humanPlayerIndex, getPlayableCards]);

  const playCard = (card: CardType, playerIndex: number) => {
    if (!card) {
        console.error("Attempted to play an undefined card for player", playerIndex);
        return;
    }
    setPlayers(prev => {
        const newPlayers = [...prev];
        newPlayers[playerIndex].hand = newPlayers[playerIndex].hand.filter(c => cardToString(c) !== cardToString(card));
        return newPlayers;
    });

    if(currentTrick.length === 0) {
        setLeadSuit(card.suit);
    }

    if (card.suit === 'H' && !heartsBroken) {
        setHeartsBroken(true);
        setGameMessage("Hearts are broken!");
    }

    setCurrentTrick(prev => [...prev, { ...card, playerIndex }]);
  };

  const handleCardClick = (card: CardType) => {
    if (gameState === 'passing') {
        handleSelectCardToPass(card);
        return;
    }

    if (gameState !== 'playing' || currentPlayerIndex !== humanPlayerIndex) return;

    const isPlayable = playableCards.some(c => cardToString(c) === cardToString(card));
    if (!isPlayable) {
        setGameMessage("You can't play that card.");
        return;
    }

    playCard(card, humanPlayerIndex);
  };
  
  const aiPlayCard = useCallback(() => {
    const player = players[currentPlayerIndex];
    if (!player || player.isHuman || gameState !== 'playing') return;

    const playable = getPlayableCards(player.hand);
    if (playable.length === 0) {
        console.error("AI has no playable cards in hand:", player.hand);
        return;
    }

    let cardToPlay: CardType | undefined = undefined;

    if (currentTrick.length === 0) {
        const suitCounts = playable.reduce((acc, card) => {
            acc[card.suit] = (acc[card.suit] || 0) + 1;
            return acc;
        }, {} as Record<Suit, number>);
        
        let potentialSuitsToLead: Suit[] = (['C', 'D', 'S'] as const).filter(s => suitCounts[s] > 0);
        if (potentialSuitsToLead.length === 0 && heartsBroken) {
            potentialSuitsToLead.push('H');
        }

        if (potentialSuitsToLead.length > 0) {
            const longestSuit = potentialSuitsToLead.sort((a, b) => suitCounts[b] - suitCounts[a])[0];
            const cardsInSuit = playable.filter(c => c.suit === longestSuit);
            cardToPlay = cardsInSuit.sort((a, b) => getCardValue(a.rank) - getCardValue(b.rank))[0];
        }
    } 
    else if (leadSuit) {
        const canFollowSuit = playable.some(c => c.suit === leadSuit);
        if (canFollowSuit) {
            const followSuitCards = playable.filter(c => c.suit === leadSuit);
            const winningCardInTrick = currentTrick.filter(c => c.suit === leadSuit).sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank))[0];
            
            if (leadSuit === 'S') {
                const queenInHand = followSuitCards.find(c => c.rank === 'Q');
                const highSpadesInTrick = currentTrick.some(c => c.suit === 'S' && (c.rank === 'K' || c.rank === 'A'));
                if (queenInHand && highSpadesInTrick) {
                    cardToPlay = queenInHand;
                }
            }

            if (!cardToPlay) {
                const underCards = followSuitCards.filter(c => getCardValue(c.rank) < getCardValue(winningCardInTrick.rank));
                if (underCards.length > 0) {
                    cardToPlay = underCards.sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank))[0];
                } else {
                    cardToPlay = followSuitCards.sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank))[0];
                }
            }
        } 
        else {
            const queenOfSpades = playable.find(c => c.suit === 'S' && c.rank === 'Q');
            const highHearts = playable.filter(c => c.suit === 'H').sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank));
            const highSpades = playable.filter(c => c.suit === 'S' && (c.rank === 'A' || c.rank === 'K')).sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank));
            
            if (queenOfSpades) {
                cardToPlay = queenOfSpades;
            } else if (highHearts.length > 0) {
                cardToPlay = highHearts[0];
            } else if (highSpades.length > 0) {
                cardToPlay = highSpades[0];
            } else {
                const suitCounts = playable.reduce((acc, card) => {
                    acc[card.suit] = (acc[card.suit] || 0) + 1;
                    return acc;
                }, {} as Record<Suit, number>);
                const longestSuit = (Object.keys(suitCounts) as Suit[]).sort((a, b) => suitCounts[b] - suitCounts[a])[0];
                const cardsInLongestSuit = playable.filter(c => c.suit === longestSuit);
                cardToPlay = cardsInLongestSuit.sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank))[0];
            }
        }
    }
    
    if (!cardToPlay) {
        cardToPlay = playable.sort((a, b) => getCardValue(a.rank) - getCardValue(b.rank))[0];
    }
    
    setTimeout(() => playCard(cardToPlay!, currentPlayerIndex), 1000);
  }, [players, currentPlayerIndex, gameState, getPlayableCards, currentTrick, leadSuit, heartsBroken]);

  const isFirstPlayOfRound = useMemo(() => players[0]?.hand.length === 13 && currentTrick.length === 0, [players, currentTrick.length]);

  useEffect(() => {
    if (gameWinner) return;

    const isHumanTurn = currentPlayerIndex === humanPlayerIndex;
    const currentPlayerName = PLAYER_NAMES[currentPlayerIndex];

    switch (gameState) {
        case 'passing':
            if (passingDirection !== 'hold') {
                setGameMessage(`Select 3 cards to pass ${passingDirection}.`);
            } else {
                 setGameMessage("No passing this round.");
            }
            break;
        case 'playing':
            if (isHumanTurn) {
                if (isFirstPlayOfRound) {
                    setGameMessage("Your turn. You must play the 2 of Clubs.");
                } else if (currentTrick.length === 0) {
                    setGameMessage("It's your turn to lead.");
                } else {
                    setGameMessage("It's your turn to play.");
                }
            } else {
                if (isFirstPlayOfRound) {
                     setGameMessage(`${currentPlayerName} starts with the 2 of Clubs.`);
                } else {
                    setGameMessage(`${currentPlayerName} is thinking...`);
                }
            }
            break;
        case 'trick-end':
            if (trickWinnerInfo) {
                const { name, points } = trickWinnerInfo;
                let message = `${name} takes the trick`;
                if (points > 0) {
                    message += ` with ${points} point${points > 1 ? 's' : ''}.`;
                } else {
                    message += '.';
                }
                setGameMessage(message);
            }
            break;
        case 'round-end':
             setGameMessage("Round over! Calculating scores...");
             break;
        default:
            break;
    }
}, [gameState, currentPlayerIndex, trickWinnerInfo, gameWinner, passingDirection, humanPlayerIndex, isFirstPlayOfRound, currentTrick.length]);


  useEffect(() => {
    if (gameState === 'playing' && players[currentPlayerIndex] && !players[currentPlayerIndex].isHuman && currentTrick.length < 4) {
        aiPlayCard();
    }
  }, [currentPlayerIndex, players, gameState, currentTrick, aiPlayCard]);

  useEffect(() => {
      if (currentTrick.length === 4) {
          setGameState('trick-end');
          
          const winningCard = currentTrick.filter(c => c.suit === leadSuit).sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank))[0];
          const winnerIndex = winningCard.playerIndex;
          const trickPoints = currentTrick.reduce((sum, c) => sum + getCardPoints(c), 0);
          
          setTrickWinnerInfo({ name: PLAYER_NAMES[winnerIndex], points: trickPoints, winnerIndex });

          setTimeout(() => {
              setTrickWinnerInfo(null);
              setPlayers(prev => {
                  const newPlayers = [...prev];
                  newPlayers[winnerIndex].tricksTaken.push(...currentTrick);
                  return newPlayers;
              });

              if (trickPoints > 0) {
                  setRoundScores(prev => ({
                      ...prev,
                      [PLAYER_NAMES[winnerIndex]]: (prev[PLAYER_NAMES[winnerIndex]] ?? 0) + trickPoints,
                  }));
              }
              
              setCurrentTrick([]);
              setLeadSuit(null);
              setCurrentPlayerIndex(winnerIndex);
              
              if(players[0].hand.length === 0) {
                  setGameState('round-end');
              } else {
                  setGameState('playing');
              }

          }, 1500);
      } else if (currentTrick.length > 0 && currentTrick.length < 4) {
          const lastPlayerIndex = currentTrick[currentTrick.length - 1].playerIndex;
          setCurrentPlayerIndex((lastPlayerIndex + 1) % 4);
      }
  }, [currentTrick, leadSuit, players]);

  useEffect(() => {
      if(gameState === 'round-end') {
          const finalRoundScores: Record<string, number> = { ...roundScores };
          const shooterName = Object.keys(finalRoundScores).find(name => finalRoundScores[name] === 26);
          
          if (shooterName) {
              Object.keys(finalRoundScores).forEach(name => {
                  finalRoundScores[name] = name === shooterName ? 0 : 26;
              });
          }

          const newTotalScores: Record<string, number> = {};
          for (const name of PLAYER_NAMES) {
              newTotalScores[name] = (scores[name] ?? 0) + (finalRoundScores[name] ?? 0);
          }
          
          setScores(newTotalScores);

          if (Object.values(newTotalScores).some(score => score >= SCORE_LIMIT)) {
              const winner = Object.entries(newTotalScores).sort((a, b) => a[1] - b[1])[0][0];
              setGameWinner(winner);
              setGameState('game-over');
              setShowScoreboard(true);
          } else {
              setTimeout(() => {
                  setRoundNumber(prev => prev + 1);
              }, 3000);
          }
      }
  }, [gameState, roundScores, scores]);

  const handlePlayAgain = () => {
      setScores({ You: 0, West: 0, North: 0, East: 0 });
      setRoundNumber(1);
      setGameWinner(null);
      setShowScoreboard(false);
  };
  
  const humanPlayer = players[humanPlayerIndex];

  const getTrickCardPosition = (playerIndex: number) => {
    switch (playerIndex) {
      case 0: return 'bottom-4';
      case 1: return 'left-4';
      case 2: return 'top-4';
      case 3: return 'right-4';
      default: return '';
    }
  };

  return (
    <div className="relative w-full h-full bg-green-800/50 flex flex-col items-center justify-center font-sans overflow-hidden p-2">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900 to-slate-900"></div>
      
      {/* Players */}
      {players.map((player, index) => {
        if (index === humanPlayerIndex || !player) return null;
        const isCurrent = currentPlayerIndex === index;
        let positionClass = '';
        let handTransform = '';
        if (index === 1) { positionClass = 'left-2 top-1/2 -translate-y-1/2 flex-col'; handTransform = 'rotate(90deg)'; }
        if (index === 2) { positionClass = 'top-2 left-1/2 -translate-x-1/2'; }
        if (index === 3) { positionClass = 'right-2 top-1/2 -translate-y-1/2 flex-col'; handTransform = '-rotate(90deg)'; }

        return (
          <div key={player.id} className={`absolute flex items-center gap-2 ${positionClass}`}>
            <div className={`p-2 rounded-lg bg-black/30 text-white text-center ${isCurrent ? 'ring-2 ring-yellow-300' : ''}`}>
                <p className="font-bold">{player.name}</p>
                <p className="text-xs">Score: {scores[player.name]}</p>
                <p className="text-xs">Cards: {player.hand.length}</p>
            </div>
            <div className="flex" style={{ transform: handTransform }}>
                {player.hand.map((_, cardIndex) => (
                    <Card key={cardIndex} card={{ suit: 'S', rank: '2' }} isFaceUp={false} className="-ml-10" />
                ))}
            </div>
          </div>
        );
      })}

      {/* Center Trick Area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 flex items-center justify-center">
        {currentTrick.map((card, index) => (
          <div key={index} className={`absolute ${getTrickCardPosition(card.playerIndex)} ${trickWinnerInfo ? `animate-collect-${getTrickCardPosition(trickWinnerInfo.winnerIndex).split('-')[0]}` : ''}`}>
             <Card card={card} isFaceUp={true} />
          </div>
        ))}
      </div>

      {/* Player 1 (You) */}
      {humanPlayer && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full flex flex-col items-center">
          <div 
            className="relative flex justify-center items-end h-32"
            onMouseEnter={() => setIsHandHovered(true)}
            onMouseLeave={() => { setIsHandHovered(false); setHoveredCardIndex(null); }}
          >
            {humanPlayer.hand.map((card, index) => {
                const isSelected = gameState === 'passing' && cardsToPass.some(c => cardToString(c) === cardToString(card));
                const isPlayable = gameState === 'playing' && playableCards.some(c => cardToString(c) === cardToString(card));
                const cardCount = humanPlayer.hand.length;
                const angle = (index - (cardCount - 1) / 2) * (cardCount > 10 ? 4 : 6);
                const translateY = isHandHovered ? (hoveredCardIndex === index ? -30 : -10) : 0;

                return (
                    <div 
                        key={cardToString(card)} 
                        className="absolute bottom-0"
                        style={{
                            transform: `rotate(${angle}deg) translateY(${translateY}px)`,
                            transformOrigin: 'bottom center',
                            transition: 'transform 0.2s ease-out',
                            zIndex: hoveredCardIndex === index ? 20 : index,
                        }}
                        onMouseEnter={() => setHoveredCardIndex(index)}
                    >
                        <Card 
                            card={card} 
                            isFaceUp={true} 
                            isSelected={isSelected}
                            isPlayable={isPlayable || gameState === 'passing'}
                            onClick={handleCardClick}
                        />
                    </div>
                )
            })}
          </div>
           <div className={`p-2 mt-2 rounded-lg bg-black/50 text-white text-center min-w-[150px] ${currentPlayerIndex === humanPlayerIndex ? 'ring-2 ring-yellow-300' : ''}`}>
              <p className="font-bold">{humanPlayer.name}</p>
              <p className="text-sm">Score: {scores[humanPlayer.name]}</p>
          </div>
        </div>
      )}

      {/* Game Message & Controls */}
      <div className="absolute top-4 w-full px-4 flex justify-between items-start">
        <div className="bg-black/50 p-3 rounded-lg text-center text-white min-w-[250px] max-w-md">
            <p className="font-bold text-lg">{gameMessage}</p>
        </div>
        <div className="flex flex-col gap-2">
            <button onClick={() => setShowScoreboard(true)} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600">Scores</button>
            <button onClick={onExit} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700">Exit</button>
        </div>
      </div>

       {gameState === 'passing' && passingDirection !== 'hold' && (
        <div className="absolute bottom-1/3">
          <button 
            onClick={handleConfirmPass} 
            disabled={cardsToPass.length !== 3}
            className="px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Pass {cardsToPass.length}/3 Cards
          </button>
        </div>
      )}
      
      {/* Scoreboard Modal */}
      {showScoreboard && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 animate-fadeIn" onClick={() => setShowScoreboard(false)}>
            <div className="bg-[var(--bg-panel-solid)] p-6 rounded-lg shadow-2xl text-white w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-rose-300">Scoreboard</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-lg">
                    <div className="font-bold border-b-2 border-rose-400 pb-1">Player</div>
                    <div className="font-bold border-b-2 border-rose-400 pb-1 text-right">Score</div>
                    {PLAYER_NAMES.map(name => (
                        <React.Fragment key={name}>
                            <div>{name}</div>
                            <div className="font-mono text-right">{scores[name]}</div>
                        </React.Fragment>
                    ))}
                </div>
                <p className="text-sm text-slate-400 mt-4">First to {SCORE_LIMIT} points loses!</p>
                <button onClick={() => setShowScoreboard(false)} className="mt-6 w-full py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700">Close</button>
            </div>
        </div>
      )}

      {/* Game Over Modal */}
       {gameWinner && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40 animate-fadeIn">
            <div className="bg-[var(--bg-panel-solid)] p-8 rounded-lg shadow-2xl text-white text-center w-full max-w-md">
                <h2 className="text-4xl font-bold mb-4 text-yellow-400">Game Over!</h2>
                <p className="text-2xl mb-6">
                    <span className="font-bold text-green-400">{gameWinner}</span> wins the game!
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={handlePlayAgain} className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600">Play Again</button>
                    <button onClick={onExit} className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700">Exit to Menu</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
