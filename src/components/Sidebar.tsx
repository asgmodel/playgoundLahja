
import React from 'react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
  onOpenPlans: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentId,
  onSelect,
  onNewChat,
  onDelete,
  onOpenSettings,
  onOpenPlans,
  theme,
  toggleTheme,
  isOpen,
  onClose,
  userName,
  onLogout
}) => {
  return (
    <>
      <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      <aside className={`
        fixed inset-y-0 right-0 z-[70] w-72 bg-white dark:bg-[#0a0a0c] border-l border-slate-100 dark:border-white/5 
        flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 lg:static
        ${isOpen ? 'translate-x-0 shadow-[-20px_0_50px_rgba(0,0,0,0.2)]' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[14px] font-black border border-emerald-500/10 shadow-xl shadow-emerald-500/20">
                {userName?.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[12px] font-black text-slate-800 dark:text-white truncate">{userName}</p>
                <p className="text-[9px] text-emerald-500 font-black tracking-widest uppercase">خطة بريميوم</p>
             </div>
             <button 
               onClick={() => onLogout?.()} 
               title="تسجيل الخروج" 
               className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
             >
               <i className="fas fa-right-from-bracket text-[13px]"></i>
             </button>
          </div>
          
          <button 
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-4 rounded-[20px] text-[11.5px] transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <i className="fas fa-plus text-[11px]"></i>
            محادثة جديدة
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="flex items-center justify-between px-3 mb-4">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">السجل الزمني</h4>
            <i className="fas fa-clock-rotate-left text-[11px] text-slate-300"></i>
          </div>
          
          {conversations.length === 0 ? (
            <div className="px-3 py-10 text-center space-y-3">
              <i className="fas fa-folder-open text-slate-100 dark:text-white/5 text-4xl"></i>
              <p className="text-[11px] text-slate-400 italic">السجل فارغ</p>
            </div>
          ) : conversations.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => { onSelect(conv.id); onClose(); }}
              className={`
                group relative p-3.5 rounded-[18px] transition-all cursor-pointer flex items-center gap-4
                ${conv.id === currentId 
                  ? 'bg-emerald-500/5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/10 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'}
              `}
            >
              <i className={`fas fa-comment-dots text-[12px] ${conv.id === currentId ? 'opacity-100' : 'opacity-20'}`}></i>
              <span className="text-[11.5px] font-bold truncate flex-1">{conv.title}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1"
                title="حذف"
              >
                <i className="fas fa-trash-can text-[11px]"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="p-5 bg-slate-50 dark:bg-white/[0.01] border-t border-slate-50 dark:border-white/5 space-y-4">
          <button 
            onClick={() => { onOpenPlans(); onClose(); }} 
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white text-[11px] font-black rounded-[20px] shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <i className="fas fa-crown text-[13px]"></i>
            الاشتراكات المميزة
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={toggleTheme} 
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10.5px] font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            >
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-[12px]`}></i>
              {theme === 'light' ? 'ليلي' : 'نهاري'}
            </button>
            <button 
              onClick={() => { onOpenSettings(); onClose(); }} 
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10.5px] font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
            >
              <i className="fas fa-gear text-[12px]"></i>
              إعدادات
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
