import React, { useEffect, useRef, useState } from 'react';

interface UE5PixelStreamProps {
    serverUrl: string;
    onClose: () => void;
}

export const UE5PixelStream: React.FC<UE5PixelStreamProps> = ({ serverUrl, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        // Initialize WebRTC connection to UE5 Pixel Streaming server
        const initializePixelStreaming = async () => {
            try {
                // Connect to signaling server
                const ws = new WebSocket(serverUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log('Connected to UE5 Pixel Streaming server');
                    setIsConnected(true);
                };

                ws.onmessage = async (event) => {
                    const msg = JSON.parse(event.data);
                    
                    if (msg.type === 'offer') {
                        // Create peer connection
                        const pc = new RTCPeerConnection({
                            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                        });
                        pcRef.current = pc;

                        // Handle incoming video stream
                        pc.ontrack = (event) => {
                            if (videoRef.current && event.streams[0]) {
                                videoRef.current.srcObject = event.streams[0];
                                setIsLoading(false);
                            }
                        };

                        // Set remote description and create answer
                        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        // Send answer back
                        ws.send(JSON.stringify({
                            type: 'answer',
                            sdp: answer
                        }));
                    } else if (msg.type === 'iceCandidate') {
                        await pcRef.current?.addIceCandidate(new RTCIceCandidate(msg.candidate));
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setIsLoading(false);
                };

            } catch (error) {
                console.error('Failed to initialize Pixel Streaming:', error);
                setIsLoading(false);
            }
        };

        initializePixelStreaming();

        return () => {
            // Cleanup
            pcRef.current?.close();
            wsRef.current?.close();
        };
    }, [serverUrl]);

    const handleMouseMove = (e: React.MouseEvent<HTMLVideoElement>) => {
        if (!wsRef.current || !isConnected) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Send mouse position to UE5
        wsRef.current.send(JSON.stringify({
            type: 'mouseMove',
            x, y
        }));
    };

    const handleClick = (e: React.MouseEvent<HTMLVideoElement>) => {
        if (!wsRef.current || !isConnected) return;

        wsRef.current.send(JSON.stringify({
            type: 'mouseClick',
            button: e.button
        }));
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">City Builder - UE5</h2>
                    {isConnected && (
                        <span className="flex items-center gap-2 text-green-400 text-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Connected
                        </span>
                    )}
                </div>
                <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                >
                    Exit
                </button>
            </div>

            {/* Video Stream Container */}
            <div className="flex-1 relative bg-black flex items-center justify-center">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white text-lg">Connecting to UE5 Server...</p>
                        <p className="text-slate-400 text-sm">Starting Unreal Engine instance</p>
                    </div>
                )}
                
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain cursor-pointer"
                    onMouseMove={handleMouseMove}
                    onClick={handleClick}
                    style={{ display: isLoading ? 'none' : 'block' }}
                />

                {!isLoading && !isConnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
                        <p className="text-red-400 text-xl">Connection Failed</p>
                        <p className="text-slate-400">Unable to connect to UE5 server</p>
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white transition-colors"
                        >
                            Back to Menu
                        </button>
                    </div>
                )}
            </div>

            {/* Controls Info */}
            {isConnected && !isLoading && (
                <div className="bg-slate-900/90 backdrop-blur-sm p-3 border-t border-slate-700">
                    <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                        <span>🖱️ Click to build</span>
                        <span>⌨️ WASD to move camera</span>
                        <span>🔍 Scroll to zoom</span>
                    </div>
                </div>
            )}
        </div>
    );
};
