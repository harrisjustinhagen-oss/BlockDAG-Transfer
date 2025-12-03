
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  category: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
    // Science
    { question: "What is the chemical symbol for water?", options: ["O2", "H2O", "CO2", "NaCl"], correctAnswerIndex: 1, category: "Science" },
    { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"], correctAnswerIndex: 1, category: "Science" },
    { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Chloroplast"], correctAnswerIndex: 2, category: "Science" },
    { question: "What force keeps us on the ground?", options: ["Magnetism", "Gravity", "Friction", "Tension"], correctAnswerIndex: 1, category: "Science" },
    { question: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correctAnswerIndex: 0, category: "Science" },
    // History
    { question: "Who was the first President of the United States?", options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"], correctAnswerIndex: 2, category: "History" },
    { question: "In which year did the Titanic sink?", options: ["1905", "1912", "1918", "1923"], correctAnswerIndex: 1, category: "History" },
    { question: "What ancient civilization built the pyramids?", options: ["Greeks", "Romans", "Egyptians", "Persians"], correctAnswerIndex: 2, category: "History" },
    { question: "Which war was fought between the North and South regions of the United States?", options: ["Revolutionary War", "World War I", "Civil War", "Cold War"], correctAnswerIndex: 2, category: "History" },
    { question: "Who discovered America in 1492?", options: ["Ferdinand Magellan", "Christopher Columbus", "Marco Polo", "Vasco da Gama"], correctAnswerIndex: 1, category: "History" },
    // Art
    { question: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], correctAnswerIndex: 2, category: "Art" },
    { question: "What is the famous sculpture by Michelangelo?", options: ["The Thinker", "David", "Venus de Milo", "Pieta"], correctAnswerIndex: 1, category: "Art" },
    { question: "Which artist is known for his 'drip' technique?", options: ["Andy Warhol", "Jackson Pollock", "Salvador Dalí", "Frida Kahlo"], correctAnswerIndex: 1, category: "Art" },
    { question: "What art movement is Salvador Dalí associated with?", options: ["Cubism", "Impressionism", "Surrealism", "Pop Art"], correctAnswerIndex: 2, category: "Art" },
    { question: "Who painted 'Starry Night'?", options: ["Vincent van Gogh", "Edvard Munch", "Paul Cézanne", "Rembrandt"], correctAnswerIndex: 0, category: "Art" },
    // Literature
    { question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctAnswerIndex: 1, category: "Literature" },
    { question: "What is the first book of the Harry Potter series?", options: ["The Chamber of Secrets", "The Prisoner of Azkaban", "The Sorcerer's Stone", "The Goblet of Fire"], correctAnswerIndex: 2, category: "Literature" },
    { question: "Which of these is a famous work by J.R.R. Tolkien?", options: ["The Chronicles of Narnia", "A Song of Ice and Fire", "The Lord of the Rings", "The Wheel of Time"], correctAnswerIndex: 2, category: "Literature" },
    { question: "Who is the author of 'To Kill a Mockingbird'?", options: ["Harper Lee", "F. Scott Fitzgerald", "Ernest Hemingway", "John Steinbeck"], correctAnswerIndex: 0, category: "Literature" },
    { question: "In 'The Great Gatsby', who is the mysterious millionaire?", options: ["Nick Carraway", "Tom Buchanan", "Jay Gatsby", "George Wilson"], correctAnswerIndex: 2, category: "Literature" },
    // Geography
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correctAnswerIndex: 2, category: "Geography" },
    { question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctAnswerIndex: 1, category: "Geography" },
    { question: "What is the largest desert in the world?", options: ["Sahara", "Gobi", "Arabian", "Antarctic Polar Desert"], correctAnswerIndex: 3, category: "Geography" },
    { question: "Which country is known as the Land of the Rising Sun?", options: ["China", "Japan", "South Korea", "Thailand"], correctAnswerIndex: 1, category: "Geography" },
    { question: "Mount Everest is located in which mountain range?", options: ["The Andes", "The Rockies", "The Alps", "The Himalayas"], correctAnswerIndex: 3, category: "Geography" },
     // Pop Culture
    { question: "Who is known as the 'King of Pop'?", options: ["Elvis Presley", "Michael Jackson", "James Brown", "Stevie Wonder"], correctAnswerIndex: 1, category: "Pop Culture" },
    { question: "Which band sang 'Bohemian Rhapsody'?", options: ["The Beatles", "Led Zeppelin", "Queen", "The Rolling Stones"], correctAnswerIndex: 2, category: "Pop Culture" },
    { question: "What is the highest-grossing film of all time (unadjusted for inflation)?", options: ["Titanic", "Avatar", "Avengers: Endgame", "Star Wars: The Force Awakens"], correctAnswerIndex: 1, category: "Pop Culture" },
    { question: "In the TV show 'Friends', what is the name of the coffee shop they frequent?", options: ["The Perk", "Central Perk", "The Coffee House", "Daily Grind"], correctAnswerIndex: 1, category: "Pop Culture" },
    { question: "What video game series features characters like Mario, Luigi, and Bowser?", options: ["The Legend of Zelda", "Sonic the Hedgehog", "Super Mario", "Donkey Kong"], correctAnswerIndex: 2, category: "Super Mario" },
];

const QUESTIONS_PER_ROUND = 5;
const ROUNDS_PER_GAME = 3;
const TIME_PER_QUESTION = 20;
const TIME_BETWEEN_STAGES = 3000;

type GameState = 'lobby' | 'category-intro' | 'question' | 'answer-reveal' | 'game-over';

interface Player {
  name: string;
  score: number;
  isBot: boolean;
  hasAnswered: boolean;
  lastAnswerIndex: number | null;
}

interface TriviaGameProps {
  party: string[];
  onExit: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

export const TriviaGame: React.FC<TriviaGameProps> = ({ party, onExit }) => {
    const [gameState, setGameState] = useState<GameState>('lobby');
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [questionNumberInRound, setQuestionNumberInRound] = useState(0);
    const [shuffledCategories, setShuffledCategories] = useState<string[]>([]);
    const [currentCategoryQuestions, setCurrentCategoryQuestions] = useState<TriviaQuestion[]>([]);
    const [timer, setTimer] = useState(TIME_PER_QUESTION);

    // FIX: useRef requires an initial value for this generic type
    const timerRef = useRef<number | undefined>(undefined);
    const timeoutRef = useRef<number | undefined>(undefined);
    
    const currentQuestion = currentCategoryQuestions[questionNumberInRound];

    const nextCategory = useCallback(() => {
        if (currentRound + 1 > ROUNDS_PER_GAME) {
            setGameState('game-over');
        } else {
            setCurrentRound(prev => prev + 1);
            setQuestionNumberInRound(0);
            setGameState('category-intro');
        }
    }, [currentRound]);

    const nextQuestion = useCallback(() => {
        setQuestionNumberInRound(prev => prev + 1);
        setGameState('question');
    }, []);

    const revealAnswer = useCallback(() => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        if (timerRef.current) window.clearInterval(timerRef.current);
        setGameState('answer-reveal');

        setPlayers(prevPlayers => {
            return prevPlayers.map(player => {
                if (player.hasAnswered && player.lastAnswerIndex === currentQuestion.correctAnswerIndex) {
                    return { ...player, score: player.score + 10 + timer };
                }
                return player;
            });
        });

        timeoutRef.current = window.setTimeout(() => {
            if (questionNumberInRound + 1 >= QUESTIONS_PER_ROUND) {
                nextCategory();
            } else {
                nextQuestion();
            }
        }, TIME_BETWEEN_STAGES);

    }, [timer, currentQuestion, questionNumberInRound, nextCategory, nextQuestion]);

    useEffect(() => {
        if (gameState === 'question') {
            if (timer > 0) {
                timerRef.current = window.setInterval(() => {
                    setTimer(t => t - 1);
                }, 1000);
            } else {
                revealAnswer();
            }
        }
        return () => {
          if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [gameState, timer, revealAnswer]);

    useEffect(() => {
        if (gameState === 'category-intro') {
            const category = shuffledCategories[currentRound - 1];
            const questions = shuffleArray(TRIVIA_QUESTIONS.filter(q => q.category === category)).slice(0, QUESTIONS_PER_ROUND);
            setCurrentCategoryQuestions(questions);
            timeoutRef.current = window.setTimeout(() => setGameState('question'), TIME_BETWEEN_STAGES);
        } else if (gameState === 'question') {
            setTimer(TIME_PER_QUESTION);
            setPlayers(prev => prev.map(p => ({ ...p, hasAnswered: false, lastAnswerIndex: null })));
        }

        return () => {
          if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        };
    }, [gameState, currentRound, shuffledCategories]);

    const handleAnswer = useCallback((playerName: string, answerIndex: number) => {
        setPlayers(prev => {
            let allAnswered = true;
            const updatedPlayers = prev.map(p => {
                const isCurrentPlayer = p.name === playerName;
                if (!isCurrentPlayer && !p.hasAnswered) allAnswered = false;
                return isCurrentPlayer ? { ...p, hasAnswered: true, lastAnswerIndex: answerIndex } : p;
            });
            if (allAnswered) {
                window.setTimeout(() => revealAnswer(), 500);
            }
            return updatedPlayers;
        });
    }, [revealAnswer]);

    useEffect(() => {
        const botTimeouts: number[] = [];
        if (gameState === 'question') {
            players.forEach(player => {
                if (player.isBot && !player.hasAnswered) {
                    const botAnswerDelay = Math.random() * (TIME_PER_QUESTION * 400) + 1000;
                    // FIX: Ensure timer functions are consistently called on `window` to avoid type conflicts.
                    const timeoutId = window.setTimeout(() => {
                        const botAnswerIndex = Math.floor(Math.random() * 4);
                        handleAnswer(player.name, botAnswerIndex);
                    }, botAnswerDelay);
                    botTimeouts.push(timeoutId);
                }
            });
        }
        return () => {
            botTimeouts.forEach(id => window.clearTimeout(id));
        }
    }, [gameState, players, handleAnswer]);

    const startGame = () => {
        const initialPlayers = party.map(pName => ({
            name: pName,
            score: 0,
            isBot: !party.includes('You') || pName !== 'You',
            hasAnswered: false,
            lastAnswerIndex: null
        }));
        setPlayers(initialPlayers);
        
        const uniqueCategories = [...new Set(TRIVIA_QUESTIONS.map(q => q.category))];
        setShuffledCategories(shuffleArray(uniqueCategories).slice(0, ROUNDS_PER_GAME));
        
        setCurrentRound(1);
        setQuestionNumberInRound(0);
        setGameState('category-intro');
    };

    const humanPlayer = players.find(p => !p.isBot);
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    const PlayerList = () => (
        <div className="w-full md:w-64 bg-[var(--bg-main-translucent)] p-4 rounded-lg border border-[var(--border-color)]">
            <h3 className="text-lg font-bold text-teal-300 mb-3 text-center">Scores</h3>
            <ul className="space-y-2">
                {sortedPlayers.map((player) => (
                    <li key={player.name} className="flex justify-between items-center bg-[var(--bg-panel)] p-2 rounded-md">
                        <span className="font-semibold text-white truncate pr-2">{player.name}</span>
                        <div className="flex items-center gap-2">
                             {gameState === 'question' && (
                                <div className={`w-4 h-4 rounded-full border-2 ${player.hasAnswered ? 'bg-green-500 border-green-400' : 'bg-transparent border-slate-500'}`} title={player.hasAnswered ? 'Answered' : 'Thinking...'}></div>
                            )}
                            <span className="font-mono text-teal-400">{player.score}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    const renderLobby = () => (
        <div className="text-center animate-fadeIn">
            <h2 className="text-4xl font-bold text-teal-300 mb-4">Trivia Challenge</h2>
            <p className="text-lg text-slate-300 mb-8">Get ready to test your knowledge!</p>
            <div className="bg-[var(--bg-panel)] p-6 rounded-lg max-w-sm mx-auto mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Players</h3>
                <ul className="space-y-2">
                    {party.map(p => <li key={p} className="font-semibold text-lg text-slate-300">{p}</li>)}
                </ul>
            </div>
            <button
                onClick={startGame}
                className="px-8 py-4 bg-teal-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-teal-600 transition-colors"
            >
                Start Game
            </button>
        </div>
    );

    const renderCategoryIntro = () => (
        <div className="text-center animate-fadeIn">
            <p className="text-2xl text-slate-400">Round {currentRound} of {ROUNDS_PER_GAME}</p>
            <h2 className="text-5xl font-bold text-teal-300 my-4">{shuffledCategories[currentRound - 1]}</h2>
            <p className="text-xl text-slate-300">Get ready for the first question...</p>
        </div>
    );
    
    const renderQuestion = () => (
        <div className="w-full flex flex-col md:flex-row gap-6 animate-fadeIn">
            <PlayerList />
            <div className="flex-grow bg-[var(--bg-panel-solid)] p-6 rounded-lg border border-[var(--border-color)]">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-400">Question {questionNumberInRound + 1} / {QUESTIONS_PER_ROUND}</span>
                     <span className="text-sm font-bold text-teal-300">{currentQuestion.category}</span>
                </div>
                <div className="relative h-2.5 w-full bg-[var(--bg-main-translucent)] rounded-full mb-4 overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full transition-all duration-1000 linear" style={{ width: `${(timer / TIME_PER_QUESTION) * 100}%` }}></div>
                </div>
                <p className="text-xl md:text-2xl font-semibold text-white mb-6 min-h-[6rem] flex items-center">{currentQuestion.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => humanPlayer && !humanPlayer.hasAnswered && handleAnswer(humanPlayer.name, index)}
                            disabled={humanPlayer && humanPlayer.hasAnswered}
                            className="p-4 text-left font-semibold text-white bg-[var(--bg-interactive)] rounded-lg hover:bg-[var(--bg-interactive-hover)] transition-colors disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-[var(--bg-interactive)]"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderAnswerReveal = () => (
        <div className="w-full flex flex-col md:flex-row gap-6 animate-fadeIn">
            <PlayerList />
            <div className="flex-grow bg-[var(--bg-panel-solid)] p-6 rounded-lg border border-[var(--border-color)]">
                <p className="text-xl md:text-2xl font-semibold text-white mb-6 min-h-[6rem] flex items-center">{currentQuestion.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => {
                         const isCorrect = index === currentQuestion.correctAnswerIndex;
                         let buttonClass = 'bg-[var(--bg-interactive)]';
                         if(isCorrect) {
                             buttonClass = 'bg-green-500 ring-2 ring-white';
                         }
                         return (
                            <div key={index} className={`relative p-4 text-left font-semibold text-white rounded-lg transition-colors ${buttonClass}`}>
                                {option}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {players.map(p => {
                                        if(p.lastAnswerIndex === index) {
                                            const isPlayerCorrect = p.lastAnswerIndex === currentQuestion.correctAnswerIndex;
                                            return <div key={p.name} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPlayerCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`} title={p.name}>{p.name.charAt(0)}</div>
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                         )
                    })}
                </div>
            </div>
        </div>
    );

    const renderGameOver = () => {
        const winner = sortedPlayers[0];
        return (
            <div className="text-center animate-fadeIn">
                <h2 className="text-5xl font-bold text-yellow-300 mb-4">Game Over!</h2>
                <p className="text-2xl text-white mb-8">
                    <span className="font-bold text-green-400">{winner.name}</span> is the winner!
                </p>
                <div className="bg-[var(--bg-panel)] p-6 rounded-lg max-w-md mx-auto mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Final Scores</h3>
                    <ul className="space-y-2 text-left">
                        {sortedPlayers.map((player, index) => (
                             <li key={player.name} className={`flex justify-between items-center text-lg p-2 rounded ${index === 0 ? 'bg-yellow-500/20' : ''}`}>
                                <span className="font-semibold">{index + 1}. {player.name}</span>
                                <span className="font-mono">{player.score}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <button
                    onClick={onExit}
                    className="px-8 py-4 bg-teal-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-teal-600 transition-colors"
                >
                    Back to Games
                </button>
            </div>
        );
    };

    const renderContent = () => {
        switch (gameState) {
            case 'lobby': return renderLobby();
            case 'category-intro': return renderCategoryIntro();
            case 'question': return renderQuestion();
            case 'answer-reveal': return renderAnswerReveal();
            case 'game-over': return renderGameOver();
            default: return <div>Loading...</div>;
        }
    };

    return (
        <div className="w-full h-full bg-[var(--bg-panel-solid)] flex flex-col items-center justify-center p-4 sm:p-6">
            {renderContent()}
        </div>
    );
};
