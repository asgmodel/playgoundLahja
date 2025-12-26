
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import emailjs from '@emailjs/browser';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'login' | 'register' | 'verify';

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [sentCode, setSentCode] = useState(''); // الكود الذي تم إرساله فعلياً
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // تهيئة تسجيل دخول جوجل الحقيقي
  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      setIsLoading(true);
      const payload = decodeJWT(response.credential);
      if (payload) {
        const user: User = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          avatar: payload.picture
        };
        setTimeout(() => {
          onLogin(user);
          setIsLoading(false);
        }, 1200);
      }
    };

    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: "686000000000-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com", // استبدله بـ ID الحقيقي
        callback: handleCredentialResponse,
        auto_select: false
      });

      if (googleBtnRef.current) {
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          shape: "pill",
          logo_alignment: "left"
        });
      }
    }
  }, [onLogin, step]);

  useEffect(() => {
    let interval: any;
    if (step === 'verify' && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const generateAndSendCode = async (targetEmail: string) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setSentCode(code);
    
    // إرسال عبر EmailJS
    // ملاحظة: يجب إعداد قالب في EmailJS يحتوي على متغير {{verification_code}} و {{user_email}}
    try {
      // @ts-ignore
//       await emailjs.send(
//         "service_q9wajhd", // استبدله بـ Service ID من EmailJS
//         "template_7qwe123", // استبدله بـ Template ID من EmailJS
//         {
// passcode: code,
// email: targetEmail,
// }

        // {
        //   verification_code: code,
        //   user_email: targetEmail,
        //   to_name: name || "مستخدم لهجة"
        // }
      // );

      emailjs.send("service_q9wajhd","template_0hfdwfj",{
passcode: code,
email: targetEmail,
},'MUqmuFfz_Uq8LXN7H');
      console.log("Email sent successfully with code:", code);
      return true;
    } catch (err) {
      console.error("Failed to send email:", err);
      // في حالة فشل الخدمة (مثل عدم وجود مفاتيح)، سنقوم بإظهار الكود في الكونسول للتجربة
      alert(`تنبيه للمطور: لم يتم إعداد مفاتيح EmailJS. الكود هو: ${code}`);
      return true; 
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (step === 'login') {
        // محاكاة تسجيل دخول
        onLogin({ id: '1', name: 'مستخدم لهجة', email });
      } else {
        // إنشاء كود وإرساله للبريد الحقيقي
        await generateAndSendCode(email);
        setStep('verify');
        setTimer(60);
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const enteredCode = verificationCode.join('');
    
    setTimeout(() => {
      if (enteredCode === sentCode) {
        onLogin({ id: Date.now().toString(), name: name || 'مستخدم جديد', email });
      } else {
        setError("رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى");
        setVerificationCode(['', '', '', '']);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white dark:bg-[#08080a] overflow-hidden font-['Noto_Sans_Arabic']">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/5 rounded-full blur-[120px]"></div>

      <div className="relative w-full h-full md:h-auto md:max-w-[440px] md:bg-white/80 dark:md:bg-[#111115]/90 md:backdrop-blur-3xl md:rounded-[40px] md:shadow-2xl md:border md:border-white/10 p-8 lg:p-12 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-[28px] items-center justify-center text-white text-3xl shadow-2xl shadow-emerald-500/20 mb-6 mx-auto">
            <i className="fas fa-comment-dots"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">مساعد لهجة</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">الذكاء الاصطناعي بروح سعودية</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-shake">
            {error}
          </div>
        )}

        {step === 'verify' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">تحقق من بريدك</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                أرسلنا كود التأكيد المكون من ٤ أرقام إلى بريدك الحقيقي: <br/>
                <span className="text-emerald-500 text-sm font-black">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-8">
              <div className="flex justify-center gap-4" dir="ltr">
                {verificationCode.map((val, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    type="number"
                    value={val}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    className="w-14 h-16 text-center text-2xl font-black bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all dark:text-white"
                    required
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={isLoading || verificationCode.some(c => !c)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[22px] shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'تأكيد الرمز'}
                </button>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-[10px] text-slate-400 font-bold">يمكنك إعادة الإرسال خلال {timer} ثانية</p>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => { generateAndSendCode(email); setTimer(60); }}
                      className="text-[11px] text-emerald-500 font-black uppercase tracking-widest hover:underline"
                    >
                      إرسال الكود مجدداً
                    </button>
                  )}
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setStep('register')}
                className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-bold"
              >
                تغيير البريد الإلكتروني
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl mb-8 border border-slate-200 dark:border-white/5">
              <button 
                onClick={() => setStep('login')}
                className={`flex-1 py-3 text-xs font-black rounded-[14px] transition-all ${step === 'login' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-md' : 'text-slate-500'}`}
              >
                دخول
              </button>
              <button 
                onClick={() => setStep('register')}
                className={`flex-1 py-3 text-xs font-black rounded-[14px] transition-all ${step === 'register' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-md' : 'text-slate-500'}`}
              >
                حساب جديد
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              {step === 'register' && (
                <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                  <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-[0.2em]">الاسم</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ادخل اسمك"
                    className="w-full bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-white outline-none transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-[0.2em]">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@email.com"
                  className="w-full bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-white outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">كلمة المرور</label>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-white outline-none transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-70 mt-2 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin text-lg"></i>
                ) : (
                  <>
                    <span>{step === 'login' ? 'دخول للمنصة' : 'إرسال كود التحقق'}</span>
                    <i className="fas fa-arrow-left text-sm"></i>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">أو بواسطة</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
              </div>

              <div className="space-y-3">
                <div ref={googleBtnRef} className="w-full flex justify-center"></div>
                {!isLoading && !googleBtnRef.current && (
                  <p className="text-center text-[9px] text-slate-400 italic">جاري تحميل خدمات جوجل للمصادقة...</p>
                )}
              </div>
            </div>
          </>
        )}

        <p className="mt-10 text-center text-[10px] text-slate-400 dark:text-slate-600 font-bold">
          جميع الحقوق محفوظة لشركة <span className="text-slate-800 dark:text-white uppercase tracking-tighter">أسس الذكاء الرقمي</span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
