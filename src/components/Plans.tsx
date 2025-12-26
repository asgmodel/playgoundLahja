
import React, { useState } from 'react';

interface PlansProps {
  isOpen: boolean;
  onClose: () => void;
  onActivationSuccess?: () => void;
}

const PLANS = [
  {
    id: 'free',
    name: 'الباقة المجانية',
    price: '٠',
    period: 'للأبد',
    features: ['٣٠ رسالة يومياً', 'الوصول للهجات الأساسية', 'دعم فني عبر البريد', 'سرعة استجابة عادية'],
    buttonText: 'خطتك الحالية',
    highlight: false,
    icon: '🌱'
  },
  {
    id: 'pro',
    name: 'باقة المحترفين',
    price: '٤٩',
    period: 'شهرياً',
    features: ['رسائل غير محدودة', 'جميع اللهجات السعودية', 'دعم صوتي فائق الجودة', 'أولوية في معالجة البيانات', 'بدون إعلانات'],
    buttonText: 'اشترك الآن',
    highlight: true,
    icon: '⚡'
  },
  {
    id: 'enterprise',
    name: 'باقة الشركات',
    price: 'تواصل معنا',
    period: '',
    features: ['تدريب مخصص على لهجة المنشأة', 'وصول عبر API', 'دعم فني ٢٤/٧', 'لوحة تحكم إدارية', 'اتفاقية مستوى الخدمة (SLA)'],
    buttonText: 'تواصل مع المبيعات',
    highlight: false,
    icon: '🏢'
  }
];

const Plans: React.FC<PlansProps> = ({ isOpen, onClose, onActivationSuccess }) => {
  const [promoCode, setPromoCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationStatus, setActivationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleActivateCode = () => {
    if (!promoCode.trim()) return;
    
    setIsActivating(true);
    // Simulate API call
    setTimeout(() => {
      setIsActivating(false);
      if (promoCode.toUpperCase() === 'LAHJA2025') {
        setActivationStatus('success');
        if (onActivationSuccess) onActivationSuccess();
      } else {
        setActivationStatus('error');
      }
      setTimeout(() => setActivationStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 text-center bg-gradient-to-b from-emerald-50 dark:from-emerald-950/20 to-transparent flex-shrink-0">
          <button onClick={onClose} className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">اختر خطتك المناسبة</h2>
          <p className="text-slate-500 dark:text-slate-400">ابدأ رحلتك مع مساعد "لهجة" الذكي ووسع آفاق محادثاتك</p>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {PLANS.map((plan) => (
              <div 
                key={plan.id}
                className={`
                  relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-300
                  ${plan.highlight 
                    ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-xl shadow-emerald-500/10 md:scale-105 z-10' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}
                `}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    الأكثر شيوعاً
                  </div>
                )}

                <div className="text-4xl mb-4">{plan.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 mr-1 text-sm">ريال / {plan.period}</span>}
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <i className="fas fa-check-circle text-emerald-500 text-base"></i>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`
                  w-full py-4 rounded-2xl font-bold transition-all active:scale-95
                  ${plan.id === 'free' 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-default' 
                    : plan.highlight
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-50'}
                `}>
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* Promo/Activation Code Section */}
          <div className="max-w-xl mx-auto bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
            <h4 className="text-sm font-black text-slate-700 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-ticket-alt text-emerald-500"></i>
              هل لديك رمز تفعيل؟
            </h4>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="أدخل الرمز هنا..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-slate-700 dark:text-white"
              />
              <button 
                onClick={handleActivateCode}
                disabled={isActivating || !promoCode}
                className="px-6 py-3 bg-slate-800 dark:bg-emerald-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 active:scale-95"
              >
                {isActivating ? <i className="fas fa-spinner fa-spin"></i> : 'تفعيل'}
              </button>
            </div>
            
            {activationStatus === 'success' && (
              <p className="mt-3 text-xs text-emerald-600 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <i className="fas fa-check-circle"></i> تم تفعيل الرمز بنجاح! استمتع بمميزاتك الجديدة.
              </p>
            )}
            {activationStatus === 'error' && (
              <p className="mt-3 text-xs text-red-500 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <i className="fas fa-times-circle"></i> عذراً، الرمز المدخل غير صحيح.
              </p>
            )}
          </div>
        </div>

        <div className="p-6 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex-shrink-0">
          <p className="text-xs text-slate-400">
            تطبق الشروط والأحكام. الأسعار تشمل ضريبة القيمة المضافة. 🇸🇦
          </p>
        </div>
      </div>
    </div>
  );
};

export default Plans;
