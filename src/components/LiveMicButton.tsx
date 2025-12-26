
import React from 'react';

interface LiveMicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const LiveMicButton: React.FC<LiveMicButtonProps> = ({ isRecording, onClick, disabled }) => {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative group">
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full scale-[1.8] bg-emerald-500/10 animate-[ping_2s_infinite]"></div>
            <div className="absolute inset-0 rounded-full scale-[2.5] bg-emerald-500/5 animate-[ping_3s_infinite]"></div>
          </>
        )}
        <button
          onClick={onClick}
          disabled={disabled}
          className={`
            relative z-10 w-24 h-24 lg:w-28 lg:h-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-500
            ${isRecording 
              ? 'bg-red-500 text-white shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-110' 
              : 'bg-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95'}
            ${disabled ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : ''}
          `}
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <i className={`fas ${isRecording ? 'fa-square text-2xl animate-pulse' : 'fa-microphone text-4xl'}`}></i>
          
        </button>
      </div>
      <span className={`mt-8 text-xs font-black tracking-[0.3em] uppercase transition-all duration-500 ${isRecording ? 'text-red-500 scale-110' : 'text-slate-400 dark:text-slate-600'}`}>
        {isRecording ? 'Listening' : 'Tap to Speak'}
      </span>
    </div>
  );
};

export default LiveMicButton;
