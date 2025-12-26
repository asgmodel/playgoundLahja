
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Settings from './components/Settings';
import Plans from './components/Plans';
import Auth from './components/Auth';
import { Conversation, Message, AppConfig, Attachment, AppMode, User } from './types';
import { generateResponse, generateAudio } from './services/geminiService';
import { audioService } from './services/audioService';

const MESSAGE_LIMIT = 15;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('lahja_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('lahja_conversations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [currentId, setCurrentId] = useState<string | null>(() => {
    return localStorage.getItem('lahja_current_id');
  });

  const [usageCount, setUsageCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('lahja_usage_count');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('lahja_config');
      return saved ? JSON.parse(saved) : {
        dialect: 'najdi',
        ttsEnabled: true,
        voice: 'Kore',
        speechSpeed: 1,
        theme: 'dark',
        mode: 'chat'
      };
    } catch (e) {
      return { dialect: 'najdi', ttsEnabled: true, voice: 'Kore', speechSpeed: 1, theme: 'dark', mode: 'chat' };
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isLiveActive, setIsLiveActive] = useState(false);
  const isLiveActiveRef = useRef(false);

  useEffect(() => {
    isLiveActiveRef.current = isLiveActive;
  }, [isLiveActive]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lahja_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lahja_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lahja_conversations', JSON.stringify(conversations));
    if (currentId) localStorage.setItem('lahja_current_id', currentId);
    else localStorage.removeItem('lahja_current_id');
  }, [conversations, currentId]);

  useEffect(() => {
    localStorage.setItem('lahja_usage_count', usageCount.toString());
  }, [usageCount]);

  useEffect(() => {
    localStorage.setItem('lahja_config', JSON.stringify(config));
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config]);

  const toggleTheme = useCallback(() => {
    setConfig(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  }, []);

  const setAppMode = useCallback((mode: AppMode) => {
    setConfig(prev => ({ ...prev, mode }));
    if (mode === 'chat') {
      setIsLiveActive(false);
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = useCallback(() => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      setUser(null);
      localStorage.removeItem('lahja_user');
      localStorage.removeItem('lahja_conversations');
      localStorage.removeItem('lahja_current_id');
      localStorage.removeItem('lahja_usage_count');
      setConversations([]);
      setCurrentId(null);
      setUsageCount(0);
    }
  }, []);

  const currentConversation = conversations.find(c => c.id === currentId);

  const startNewChat = useCallback(() => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'محادثة جديدة',
      messages: [],
      updatedAt: Date.now(),
      dialect: config.dialect
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentId(newConv.id);
    setAppMode('chat');
  }, [config.dialect, setAppMode]);

  const handleDelete = (id: string) => {
    if (window.confirm('هل تريد حذف هذه المحادثة نهائياً؟')) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentId === id) setCurrentId(null);
    }
  };

  const handleSendMessage = async (content: string, attachments?: Attachment[]) => {
    if (usageCount >= MESSAGE_LIMIT) {
      setIsPlansOpen(true);
      setError("لقد استنفدت رسائلك المجانية. يرجى الاشتراك للمتابعة.");
      setIsLiveActive(false);
      return;
    }

    setError(null);
    let activeId = currentId;

    if (!activeId) {
      const newId = Date.now().toString();
      const newConv: Conversation = {
        id: newId,
        title: content ? content.substring(0, 30) : 'محادثة جديدة',
        messages: [],
        updatedAt: Date.now(),
        dialect: config.dialect
      };
      
      // Fix: Removed broken setConversations call that used undefined 'c' variable and redundant logic.
      setConversations(prev => [newConv, ...prev]);
      setCurrentId(newId);
      activeId = newId;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        return {
          ...c,
          messages: [...c.messages, userMsg],
          updatedAt: Date.now(),
          title: c.messages.length === 0 ? (content ? content.substring(0, 30) : 'محادثة جديدة') : c.title
        };
      }
      return c;
    }));

    setIsLoading(true);
    setUsageCount(prev => prev + 1);

    try {
      const currentConv = conversations.find(c => c.id === activeId);
      const history = (currentConv?.messages || []).map(m => ({ role: m.role, content: m.content }));
      
      const response = await generateResponse(content, config.dialect, history, attachments)?? '';
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setConversations(prev => prev.map(c => {
        if (c.id === activeId) {
          return { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() };
        }
        return c;
      }));

      if (config.ttsEnabled && response) {
        const base64 = await generateAudio(response, config.voice);
        if (base64) {
          await audioService.playBlob(base64);
        }
      }

    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
      setIsLiveActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${config.theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-[#08080a] transition-colors duration-500 font-['Noto_Sans_Arabic']`}>
      <Sidebar 
        conversations={conversations}
        currentId={currentId}
        onSelect={setCurrentId}
        onNewChat={startNewChat}
        onDelete={handleDelete}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPlans={() => setIsPlansOpen(true)}
        theme={config.theme}
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userName={user.name}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0f0f13] shadow-2xl relative transition-all duration-500 overflow-hidden">
        {error && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 w-full max-w-md px-4">
            <div className="bg-red-500/95 backdrop-blur-lg text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4 border border-red-400/20">
              <div className="flex items-center gap-3 font-bold">
                <i className="fas fa-circle-exclamation text-xl"></i>
                <span className="text-sm leading-tight">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="hover:rotate-90 transition-transform">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        <header className="h-20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-4 lg:px-12 bg-white/80 dark:bg-[#0f0f13]/80 backdrop-blur-2xl z-20 transition-all shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
            >
              <i className="fas fa-bars-staggered text-xl"></i>
            </button>
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-11 h-11 from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-lg shadow-xl shadow-emerald-500/20 group-hover:rotate-6 transition-all duration-300">
                <img src="logo.png" style={{ width: '50px', height: '50px' }} alt="Logo" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[15px] font-black text-slate-800 dark:text-white tracking-tight">مساعد لهجة</h1>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">متصل الآن</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-inner">
            <button 
              onClick={() => setAppMode('chat')}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 ${config.mode === 'chat' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5'}`}
            >
              <i className="fas fa-message"></i>
              <span>دردشة</span>
            </button>
            <button 
              onClick={() => setAppMode('live')}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 ${config.mode === 'live' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5'}`}
            >
              <i className="fas fa-microphone-lines"></i>
              <span>مباشر</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 mr-2">
               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                 {usageCount} / {MESSAGE_LIMIT}
               </span>
            </div>
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
              title={config.theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
            >
              <i className={`fas ${config.theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg`}></i>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
              title="الإعدادات"
            >
              <i className="fas fa-gear text-lg"></i>
            </button>
          </div>
        </header>

        <ChatArea 
          messages={currentConversation?.messages || []}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          dialect={config.dialect}
          mode={config.mode}
          isLiveActive={isLiveActive}
          setIsLiveActive={setIsLiveActive}
        />
      </main>

      <Settings 
        config={config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdate={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
      />

      <Plans 
        isOpen={isPlansOpen}
        onClose={() => setIsPlansOpen(false)}
        onActivationSuccess={() => { setUsageCount(0); setIsPlansOpen(false); }}
      />
    </div>
  );
};

export default App;
