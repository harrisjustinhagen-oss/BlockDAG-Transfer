
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BlockDAGIcon } from '../icons/BlockDAGIcon';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

interface ChatAssistantProps {
    onClose: () => void;
    currentUser: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onClose, currentUser }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'model', text: `Hello ${currentUser}! I am the BlockDAG AI. How can I assist you with your Web3 journey today?` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        inputRef.current?.focus();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputValue.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Construct history for context
            // Note: For simple stateless requests we can just send the prompt, 
            // but for chat we might want to use ai.chats.create if we want the SDK to manage history.
            // Here we will use a simple chat session.
            
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You are BlockDAG AI, a helpful and futuristic assistant for the BlockDAG x1 application. You are knowledgeable about cryptocurrency, DeFi, mining (specifically the X10 and X1 devices), and the features of this app (Games like Jousting and Hearts, Wallet management, Inventory). Keep your responses concise, professional, and helpful. Use markdown for formatting if needed.",
                }
            });

            // Replay history to the model (excluding the welcome message which is local)
            // Ideally we would maintain a persistent chat object, but for this UI component 
            // we'll just send the new message with the context of previous messages if we were fully implementing history playback.
            // For this implementation, we'll start a fresh turn or just send the user input. 
            // To make it smarter, let's pass the previous context manually or use the chat object properly.
            
            // Since `ai.chats.create` starts a new session, we'd normally add history here.
            // For simplicity in this UI demo, we will just send the current message, 
            // but in a real app, you'd maintain the `chat` instance outside the render loop.
            
            // Let's try streaming for a cool effect
            const resultStream = await chat.sendMessageStream({ message: userMessage.text });
            
            const modelMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

            let fullResponse = "";
            for await (const chunk of resultStream) {
                const chunkText = (chunk as GenerateContentResponse).text;
                if (chunkText) {
                    fullResponse += chunkText;
                    setMessages(prev => prev.map(msg => 
                        msg.id === modelMessageId ? { ...msg, text: fullResponse } : msg
                    ));
                }
            }

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "I'm encountering some interference in the network. Please try again later." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col h-[80vh] md:h-[600px]">
                {/* Header */}
                <div className="bg-slate-900/80 border-b border-slate-800 p-4 flex justify-between items-center backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                            <BlockDAGIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">BlockDAG AI</h3>
                            <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Online</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-md' 
                                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-md'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <div className="relative flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className="flex-grow bg-slate-950 border border-slate-700 rounded-full px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="bg-cyan-500 text-white p-3 rounded-full hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5 rotate-90" /> {/* Reusing Arrow icon as Send icon */}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
