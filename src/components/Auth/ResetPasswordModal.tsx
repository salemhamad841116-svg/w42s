import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Mail, ArrowRight, Lock } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('123456');
  const [newPassword, setNewPassword] = useState('');
  
  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoCode(Math.floor(100000 + Math.random() * 900000).toString());
    setStep(2);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === demoCode) {
      setStep(3);
    } else {
      alert('الرمز غير صحيح');
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert('تم إعادة تعيين كلمة المرور بنجاح!');
    onClose();
    setTimeout(() => {
      setStep(1);
      setEmail('');
      setCode('');
      setNewPassword('');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm rtl" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md p-8 shadow-2xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative flex items-center justify-center w-16 h-16 bg-slate-800 border border-slate-700 rounded-full text-blue-400">
                      <KeyRound className="w-8 h-8" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">نسيت كلمة المرور؟</h2>
                  <p className="text-slate-400 text-center text-sm">
                    أدخل بريدك الإلكتروني وسنرسل لك رمزاً لإعادة تعيين كلمة المرور
                  </p>
                </div>

                <form onSubmit={handleSendLink}>
                  <div className="space-y-4 mb-6">
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="البريد الإلكتروني"
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    إرسال رمز إعادة التعيين
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative flex items-center justify-center w-16 h-16 bg-slate-800 border border-slate-700 rounded-full text-indigo-400">
                      <Mail className="w-8 h-8" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">أدخل الرمز</h2>
                  <p className="text-slate-400 text-center text-sm">
                    لقد أرسلنا رمزاً إلى <span className="text-white">{email}</span>
                  </p>
                </div>

                <div className="mb-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                  <p className="text-indigo-300 text-xs mb-1">رمز إعادة التعيين التجريبي:</p>
                  <p className="text-indigo-400 font-mono font-bold tracking-widest text-lg">{demoCode}</p>
                </div>

                <form onSubmit={handleVerifyCode}>
                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="أدخل الرمز هنا"
                      className="w-full text-center tracking-widest font-mono text-lg bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    التحقق من الرمز
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative flex items-center justify-center w-16 h-16 bg-slate-800 border border-slate-700 rounded-full text-emerald-400">
                      <Lock className="w-8 h-8" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">كلمة مرور جديدة</h2>
                  <p className="text-slate-400 text-center text-sm">
                    أدخل كلمة مرور قوية وجديدة لحسابك
                  </p>
                </div>

                <form onSubmit={handleReset}>
                  <div className="space-y-4 mb-6">
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="كلمة المرور الجديدة"
                        className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    حفظ وتسجيل الدخول
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};