import React from 'react';
import Visualizer from './Visualizer';
import { BrainwaveData } from '../types';

interface WavePlayerProps {
  waveData: BrainwaveData | null;
  isPlaying: boolean;
  togglePlayPause: () => void;
  analyserNode: AnalyserNode | null;
}

const PlayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);

const PauseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
);


const WavePlayer: React.FC<WavePlayerProps> = ({ waveData, isPlaying, togglePlayPause, analyserNode }) => {
  const waveColor = waveData?.color || '#A78BFA'; // Default violet color

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-between backdrop-blur-sm border border-slate-700/50 h-full">
      <div className="w-full h-32 md:h-48 relative flex-shrink-0">
        <Visualizer analyserNode={analyserNode} waveColor={waveColor} isPlaying={isPlaying} />
        {!waveData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400">AI is waiting for your mood...</p>
          </div>
        )}
      </div>
      
      <div className="text-center w-full flex-1 flex flex-col justify-center items-center py-4">
        {waveData && (
          <>
            <h2 className="text-3xl font-bold" style={{ color: waveColor }}>
              {waveData.waveType} Wave
            </h2>
            <p className="text-slate-300 font-medium text-lg mt-1">{waveData.mood}</p>
            <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">{waveData.description}</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4 max-w-xs mx-auto w-full">
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Binaural Beat</p>
                <p className="text-xl font-bold text-white">{waveData.binauralBeat.toFixed(2)} Hz</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Base Frequency</p>
                <p className="text-xl font-bold text-white">{waveData.baseFrequency.toFixed(0)} Hz</p>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={togglePlayPause}
        disabled={!waveData}
        className="w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        style={{ 
            backgroundColor: isPlaying ? waveColor : '#334155', // slate-700
            boxShadow: isPlaying ? `0 0 20px ${waveColor}` : 'none',
            '--tw-ring-color': waveColor,
        } as React.CSSProperties}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <PauseIcon className="w-10 h-10" />
        ) : (
          <PlayIcon className="w-10 h-10 pl-1" />
        )}
      </button>
    </div>
  );
};

export default WavePlayer;
