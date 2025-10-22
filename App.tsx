
import React, { useState, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import WavePlayer from './components/WavePlayer';
import { useBrainwave } from './hooks/useBrainwave';
import { analyzeMoodForWave } from './services/geminiService';
import { BrainwaveData, ChatMessage } from './types';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'system', text: 'Hello! How are you feeling today? Describe your mood or what you want to achieve, and I will generate a custom sound wave for you.' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { isPlaying, playSound, stopSound, togglePlayPause, analyserNode, currentWave } = useBrainwave();

  const handleSendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);
    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: message }];
    setMessages(newMessages);
    
    // Stop any currently playing sound when a new request is made
    if (isPlaying) {
      stopSound();
    }

    try {
      const waveData: BrainwaveData = await analyzeMoodForWave(message);
      setMessages(prev => [...prev, { sender: 'ai', text: `I've generated a ${waveData.waveType} wave for ${waveData.mood.toLowerCase()}. ${waveData.description}` }]);
      playSound(waveData);
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      setError(errorMessage);
      setMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, playSound, isPlaying, stopSound]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div 
        className="fixed inset-0 -z-10 h-full w-full bg-slate-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10">
      </div>

      <main className="container mx-auto max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Mindwave Sonic AI
          </h1>
          <p className="text-slate-400 mt-2">Your personal AI-powered soundscape generator.</p>
        </header>

        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 text-center" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)] min-h-[600px]">
          <div className="h-full">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
          <div className="h-full">
            <WavePlayer
              waveData={currentWave}
              isPlaying={isPlaying}
              togglePlayPause={togglePlayPause}
              analyserNode={analyserNode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
