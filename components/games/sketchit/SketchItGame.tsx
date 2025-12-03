
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowDownTrayIcon } from '../../icons/ArrowDownTrayIcon';

interface SketchItGameProps {
  onExit: () => void;
}

type GamePhase = 'choosing' | 'drawing' | 'round_end' | 'game_over';

interface Player {
  name: string;
  score: number;
  isDrawer: boolean;
  hasGuessed: boolean;
  avatarColor: string;
}

interface ChatMessage {
  id: string;
  player: string;
  text: string;
  isCorrect: boolean;
}

const WORDS = ['Tree', 'Car', 'Sun', 'House', 'Apple', 'Computer', 'Phone', 'Pizza', 'Dog', 'Cat', 'Robot', 'Rocket'];
const BOT_NAMES = ['Alice', 'Bob', 'Charlie', 'Dave'];
const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#78716c'
];
const WRONG_GUESSES = ['Is it a plane?', 'Maybe a cloud?', 'I have no idea', 'Looks like a blob', 'Is it food?', 'A circle?', 'A square?'];

export const SketchItGame: React.FC<SketchItGameProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  
  const [phase, setPhase] = useState<GamePhase>('choosing');
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(3);
  
  const [players, setPlayers] = useState<Player[]>([
    { name: 'You', score: 0, isDrawer: true, hasGuessed: false, avatarColor: 'bg-cyan-500' },
    { name: 'Alice', score: 0, isDrawer: false, hasGuessed: false, avatarColor: 'bg-purple-500' },
    { name: 'Bob', score: 0, isDrawer: false, hasGuessed: false, avatarColor: 'bg-green-500' },
    { name: 'Charlie', score: 0, isDrawer: false, hasGuessed: false, avatarColor: 'bg-yellow-500' },
  ]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        setContext(ctx);
        
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [phase]); // Re-init on phase change ensures proper sizing if layout shifts

  // Update drawing settings
  useEffect(() => {
    if (context) {
      context.strokeStyle = color;
      context.lineWidth = brushSize;
    }
  }, [color, brushSize, context]);

  // Game Loop
  useEffect(() => {
    let timerId: any;
    if (phase === 'drawing' && timeLeft > 0) {
      timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      
      // Bot Logic
      if (Math.random() > 0.7) {
        const randomBot = players.filter(p => p.name !== 'You' && !p.hasGuessed)[Math.floor(Math.random() * 3)];
        if (randomBot) {
          // Chance to guess correctly increases as time decreases
          const chance = (60 - timeLeft) / 100; 
          if (Math.random() < chance) {
             handleGuess(randomBot.name, currentWord);
          } else {
             handleGuess(randomBot.name, WRONG_GUESSES[Math.floor(Math.random() * WRONG_GUESSES.length)]);
          }
        }
      }
    } else if (phase === 'drawing' && timeLeft === 0) {
      handleRoundEnd();
    }
    return () => clearTimeout(timerId);
  }, [phase, timeLeft, players, currentWord]);

  // Start Phase Logic
  useEffect(() => {
    if (phase === 'choosing') {
      const shuffled = [...WORDS].sort(() => 0.5 - Math.random());
      setWordOptions(shuffled.slice(0, 3));
    }
  }, [phase]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'drawing') return;
    const { offsetX, offsetY } = getCoordinates(e);
    context?.beginPath();
    context?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || phase !== 'drawing') return;
    const { offsetX, offsetY } = getCoordinates(e);
    context?.lineTo(offsetX, offsetY);
    context?.stroke();
  };

  const stopDrawing = () => {
    context?.closePath();
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { offsetX: 0, offsetY: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleWordSelect = (word: string) => {
    setCurrentWord(word);
    setPhase('drawing');
    setTimeLeft(60);
    setMessages([{ id: Date.now().toString(), player: 'System', text: `You are drawing: ${word}!`, isCorrect: false }]);
    clearCanvas();
  };

  const handleGuess = (player: string, text: string) => {
    const isCorrect = text.toLowerCase() === currentWord.toLowerCase();
    
    if (isCorrect) {
      setMessages(prev => [...prev, { id: Date.now().toString(), player: 'System', text: `${player} guessed the word!`, isCorrect: true }]);
      setPlayers(prev => prev.map(p => {
        if (p.name === player) {
          // Points based on time left
          const points = timeLeft * 10;
          return { ...p, score: p.score + points, hasGuessed: true };
        }
        if (p.name === 'You' && p.isDrawer) {
          // Drawer gets points for each correct guess
          return { ...p, score: p.score + 50 };
        }
        return p;
      }));
      
      // If everyone guessed, end round
      const updatedPlayers = players; // Note: using state directly here for check due to closure
      const activeGuessers = updatedPlayers.filter(p => !p.isDrawer).length;
      const correctGuessers = updatedPlayers.filter(p => !p.isDrawer && p.hasGuessed).length + (player !== 'You' ? 1 : 0); // +1 because state update is async
      
      if (correctGuessers >= activeGuessers) {
        handleRoundEnd();
      }

    } else {
      setMessages(prev => [...prev, { id: Date.now().toString(), player, text, isCorrect: false }]);
    }
  };

  const handleRoundEnd = () => {
    setPhase('round_end');
    setTimeout(() => {
      if (round < maxRounds) {
        setRound(r => r + 1);
        setPhase('choosing');
        setPlayers(prev => prev.map(p => ({ ...p, hasGuessed: false }))); // Reset guess status
      } else {
        setPhase('game_over');
      }
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-yellow-400">Sketch It!</h2>
            <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <span className="text-slate-400 text-sm">Round {round}/{maxRounds}</span>
            </div>
            {phase === 'drawing' && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-mono font-bold text-white">
                  {timeLeft}
                </div>
                <div className="text-xl font-bold text-white">
                  Word: <span className="text-cyan-400">{currentWord}</span>
                </div>
              </div>
            )}
          </div>
          <button onClick={onExit} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
            Exit Game
          </button>
        </div>

        <div className="flex-grow flex overflow-hidden">
          {/* Left Sidebar: Players */}
          <div className="w-64 bg-slate-900/50 border-r border-slate-700 p-4 flex flex-col gap-2">
            {players.sort((a,b) => b.score - a.score).map((player) => (
              <div key={player.name} className={`flex items-center justify-between p-3 rounded-xl ${player.hasGuessed ? 'bg-green-500/20 border border-green-500/50' : 'bg-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${player.avatarColor} flex items-center justify-center text-white font-bold`}>
                    {player.name[0]}
                  </div>
                  <div>
                    <p className={`font-bold ${player.name === 'You' ? 'text-cyan-300' : 'text-slate-200'}`}>{player.name}</p>
                    <p className="text-xs text-slate-400">{player.isDrawer ? 'Drawer' : 'Guesser'}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-white">{player.score}</span>
              </div>
            ))}
          </div>

          {/* Center: Canvas Area */}
          <div className="flex-grow bg-slate-700 p-4 relative flex flex-col items-center justify-center">
            {phase === 'choosing' && (
              <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-600 text-center">
                  <h3 className="text-2xl font-bold text-white mb-6">Choose a word to draw!</h3>
                  <div className="flex gap-4">
                    {wordOptions.map(word => (
                      <button 
                        key={word}
                        onClick={() => handleWordSelect(word)}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all transform hover:scale-105"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {phase === 'round_end' && (
               <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-600 text-center animate-fadeIn">
                  <h3 className="text-3xl font-bold text-white mb-2">Round Over!</h3>
                  <p className="text-slate-400">The word was <span className="text-green-400 font-bold">{currentWord}</span></p>
                </div>
              </div>
            )}
            
            {phase === 'game_over' && (
               <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-slate-800 p-8 rounded-2xl border border-yellow-500/50 text-center animate-fadeIn shadow-2xl">
                  <h3 className="text-4xl font-bold text-yellow-400 mb-6">Game Over!</h3>
                  <div className="space-y-3 mb-8">
                     {players.sort((a,b) => b.score - a.score).map((p, idx) => (
                       <div key={p.name} className={`flex justify-between items-center w-64 p-3 rounded-lg ${idx === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-slate-700'}`}>
                         <span className="text-white font-bold flex items-center gap-2">
                           {idx === 0 && '👑'} {p.name}
                         </span>
                         <span className="font-mono text-white">{p.score}</span>
                       </div>
                     ))}
                  </div>
                  <button onClick={onExit} className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors">
                    Back to Menu
                  </button>
                </div>
              </div>
            )}

            <canvas 
              ref={canvasRef}
              className="bg-white rounded-lg shadow-lg cursor-crosshair touch-none"
              style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '600px' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* Right Sidebar: Chat */}
          <div className="w-72 bg-slate-900 border-l border-slate-700 flex flex-col">
            <div className="p-3 border-b border-slate-800 font-bold text-slate-400 uppercase text-xs tracking-wider">
              Chat & Guesses
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`text-sm ${msg.isCorrect ? 'bg-green-500/20 border border-green-500/30 p-2 rounded-lg' : ''}`}>
                  <span className={`font-bold ${msg.player === 'System' ? 'text-yellow-400' : 'text-slate-300'}`}>{msg.player}: </span>
                  <span className={`${msg.isCorrect ? 'text-green-300 font-bold' : 'text-slate-400'}`}>{msg.text}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-800 border-t border-slate-700">
               <input 
                 type="text" 
                 disabled={players[0].isDrawer} // Disable input if you are drawing
                 placeholder={players[0].isDrawer ? "You are drawing..." : "Type your guess here..."}
                 className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
               />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Tools */}
        {phase === 'drawing' && players[0].isDrawer && (
          <div className="bg-slate-900 p-4 border-t border-slate-700 flex justify-center items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            
            <div className="h-8 w-px bg-slate-700 mx-2"></div>

            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl">
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-24 accent-cyan-500"
              />
              <div 
                className="bg-white rounded-full" 
                style={{ width: brushSize, height: brushSize, backgroundColor: color }}
              ></div>
            </div>

            <div className="h-8 w-px bg-slate-700 mx-2"></div>

            <button 
              onClick={clearCanvas}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
