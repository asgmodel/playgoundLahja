
import React, { useState } from 'react';
import { Message as MessageType } from '../types';
import { generateAudio } from '../services/geminiService';
import { audioService } from '../services/audioService';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSpeak = async () => {
    if (isSynthesizing) return;
    try {
      setIsSynthesizing(true);
      const base64Audio = await generateAudio(message.content);
      if (base64Audio) {
        await audioService.playPCM(base64Audio);
      }
    } catch (error) {
      console.error("TTS failed", error);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group mb-2`}>
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Compact Bubble */}
        <div className={`
          relative px-4 py-2.5 rounded-2xl text-[12.5px] font-medium leading-relaxed transition-all
          ${isUser 
            ? 'bg-emerald-600 text-white rounded-tr-none shadow-md' 
            : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-white/5'}
        `}>
          {message.content}
        </div>

        {/* Minimal Footer */}
        <div className={`flex items-center gap-3 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
            {new Date(message.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleSpeak} className="p-0.5 text-slate-400 hover:text-emerald-500">
                <i className={`fas ${isSynthesizing ? 'fa-spinner fa-spin' : 'fa-volume-up'} text-[10px]`}></i>
              </button>
              <button onClick={handleCopy} className="p-0.5 text-slate-400 hover:text-emerald-500">
                <i className={`fas ${copied ? 'fa-check text-emerald-500' : 'fa-copy'} text-[10px]`}></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
