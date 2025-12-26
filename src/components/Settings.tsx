
import React from 'react';
import { Dialect, AppConfig } from '../types';
import { DIALECTS, VOICES } from '../constants';

interface SettingsProps {
  config: AppConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (config: Partial<AppConfig>) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, isOpen, onClose, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <i className="fas fa-sliders-h text-emerald-500"></i>
            إعدادات المساعد
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Theme Selection */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fas fa-palette text-xs"></i>
              المظهر
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">الوضع الليلي</span>
                <span className="text-xs text-slate-500 dark:text-slate-500">تفعيل المظهر الداكن للتطبيق</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.theme === 'dark'}
                  onChange={(e) => onUpdate({ theme: e.target.checked ? 'dark' : 'light' })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </section>

          {/* Dialect Selection */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fas fa-language text-xs"></i>
              تخصيص اللهجة
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {DIALECTS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onUpdate({ dialect: d.id as Dialect })}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all active:scale-95
                    ${config.dialect === d.id 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-600 dark:text-emerald-400' 
                      : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500 hover:border-emerald-200'}
                  `}
                >
                  <span className="text-2xl">{d.icon}</span>
                  <span className="text-xs font-bold">{d.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Voice Settings */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fas fa-microphone-alt text-xs"></i>
              الإعدادات الصوتية
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">النطق التلقائي</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">تشغيل الرد فور وصوله</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.ttsEnabled}
                    onChange={(e) => onUpdate({ ttsEnabled: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 mr-1">صوت المساعد</label>
                <select 
                  value={config.voice}
                  onChange={(e) => onUpdate({ voice: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 dark:text-slate-200"
                >
                  {VOICES.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-2 px-1">
                  <label className="text-xs font-bold text-slate-500">سرعة النطق</label>
                  <span className="text-xs font-bold text-emerald-500">{config.speechSpeed}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={config.speechSpeed}
                  onChange={(e) => onUpdate({ speechSpeed: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
