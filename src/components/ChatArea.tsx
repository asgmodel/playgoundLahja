
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Message as MessageType, Dialect, Attachment, AppMode } from '../types';
import Message from './Message';

interface ChatAreaProps {
  messages: MessageType[];
  isLoading: boolean;
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  dialect: Dialect;
  mode: AppMode;
  isLiveActive?: boolean;
  setIsLiveActive?: (active: boolean) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage, 
  mode, 
  isLiveActive, 
  setIsLiveActive 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (mode === 'chat') scrollToBottom();
  }, [messages, isLoading, scrollToBottom, mode]);

  // منطق الاستماع التلقائي في وضع البث المباشر - حلقة مستمرة
  useEffect(() => {
    if (mode === 'live' && isLiveActive && !isLoading && !isRecognitionActive) {
      // ننتظر قليلاً لضمان عدم تداخل صوت المساعد مع الميكروفون
      const timer = setTimeout(() => {
        startRecording();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [mode, isLiveActive, isLoading, isRecognitionActive]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecognitionActive(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) onSendMessage(transcript);
    };
    recognition.onerror = () => setIsRecognitionActive(false);
    recognition.onend = () => setIsRecognitionActive(false);
    
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setIsRecognitionActive(false);
    }
  };

  const toggleLiveMode = () => {
    if (isLiveActive) {
      setIsLiveActive?.(false);
      if (recognitionRef.current) recognitionRef.current.stop();
    } else {
      setIsLiveActive?.(true);
    }
  };

  const handleSend = () => {
    if ((inputValue.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(inputValue.trim(), attachments);
      setInputValue('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newAttachment: Attachment = {
          name: file.name,
          type: file.type,
          data: base64,
          url: URL.createObjectURL(file)
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
    // Clear input to allow re-uploading same file
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (mode === 'live') {
    const lastMsg = [...messages].reverse().find(m => m.role === 'assistant');
    const isCurrentlyListening = isRecognitionActive && !isLoading;

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white dark:bg-[#08080a] animate-in fade-in duration-700">
        
        {/* Background Visual Effect */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
          
          <div 
            onClick={toggleLiveMode}
            className={`
              relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500
              ${isCurrentlyListening ? 'animate-[rotatePulse_2s_infinite]' : (isLoading ? 'scale-105' : 'animate-[subtlePulse_4s_infinite]')}
            `}
          >
            <div className={`absolute inset-0 rounded-full bg-emerald-500/10 ${isCurrentlyListening ? 'scale-125 opacity-20' : 'scale-100 opacity-10'}`}></div>
            <div className={`absolute w-[80%] h-[80%] rounded-full bg-emerald-500/20 ${isCurrentlyListening || isLoading ? 'animate-[middlePulse_2s_infinite]' : ''}`}></div>
            <div className={`relative w-[60%] h-[60%] bg-white dark:bg-[#1a1a20] rounded-full flex items-center justify-center shadow-xl border border-emerald-500/5 ${isLoading ? 'animate-pulse' : 'animate-[innerGlow_5s_infinite_alternate]'}`}>
              <i className={`fas ${isLiveActive ? (isCurrentlyListening ? 'fa-microphone text-emerald-500 scale-125' : 'fa-stop text-red-500') : 'fa-microphone text-slate-300'} text-4xl transition-all duration-500`}></i>
            </div>
          </div>

          <div className="mt-12 text-center space-y-6 w-full">
            <div className="space-y-2">
              <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">الوضع المباشر</h2>
              <p className={`text-[12px] font-black transition-all ${isCurrentlyListening ? 'text-emerald-500' : 'text-slate-400'}`}>
                {isLiveActive ? (isCurrentlyListening ? 'أنا أسمعك الآن...' : (isLoading ? 'جاري الرد...' : 'انتظر...')) : 'انقر للدائرة للبدء'}
              </p>
            </div>

            {(isCurrentlyListening || isLoading) && (
              <div className="flex justify-center gap-1.5 h-6 items-end">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className="wave-span" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            )}

            <div className="min-h-[100px] px-6 flex items-center justify-center">
              {isLoading ? (
                <div className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em] animate-pulse flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                   جاري التفكير
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </div>
              ) : lastMsg ? (
                 <span className="text-[10px] text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em] font-black">جاهز للمحادثة</span>
        
              ) : (
                <span className="text-[10px] text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em] font-black">جاهز للمحادثة</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0f0f13] animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-6 custom-scrollbar group">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-80">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 text-3xl">
              <i className="fas fa-comment-dots"></i>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">أهلاً بك في لهجة</h3>
              <p className="text-[11px] text-slate-400 max-w-xs font-bold uppercase tracking-[0.2em]">مساعدك الذكي بلهجتك السعودية</p>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-white/5 px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-white/5">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التفكير</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-4 lg:p-6 bg-white/80 dark:bg-[#0f0f13]/80 backdrop-blur-xl border-t border-slate-50 dark:border-white/5">
        <div className="max-w-4xl mx-auto">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4 animate-in slide-in-from-bottom-2">
              {attachments.map((file, i) => (
                <div key={i} className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-lg">
                  {file.type.startsWith('image/') ? (
                    <img src={file.url} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center text-slate-400 gap-1">
                      <i className="fas fa-file-lines text-2xl"></i>
                      <span className="text-[8px] font-bold px-1 truncate w-full text-center">{file.name}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => removeAttachment(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-[11px] opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Stylish Floating Input Container */}
          <div className="flex items-end gap-3 bg-slate-100 dark:bg-white/[0.04] p-3 rounded-[28px] border border-slate-200/60 dark:border-white/[0.06] focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500/20 transition-all shadow-inner">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              multiple 
              accept="image/*,.pdf,.doc,.docx"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-all flex-shrink-0 active:scale-90"
              title="إرفاق ملف"
            >
              <i className="fas fa-paperclip text-lg"></i>
            </button>

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="تكلم معي بلهجتك، أنا أسمعك..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-[13.5px] font-medium text-slate-700 dark:text-white resize-none max-h-36 py-2.5 placeholder:text-slate-400/80 leading-relaxed"
              rows={1}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 144)}px`;
              }}
            />

            <button 
              onClick={handleSend}
              disabled={(!inputValue.trim() && attachments.length === 0) || isLoading}
              className={`
                w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 active:scale-95 shadow-lg
                ${(inputValue.trim() || attachments.length > 0) && !isLoading 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                  : 'bg-slate-200 dark:bg-white/5 text-slate-400 opacity-40'}
              `}
            >
              <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-arrow-up'} text-lg`}></i>
            </button>
          </div>
          <div className="mt-3 text-center">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] opacity-40 italic">
              أسس الذكاء الرقمي 🇸🇦
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
