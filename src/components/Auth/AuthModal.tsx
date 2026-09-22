import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, TreePine } from 'lucide-react';
import { EmailVerificationModal } from './EmailVerificationModal';
import { ResetPasswordModal } from './ResetPasswordModal';
// import { useUserAuthStore } from '../../store/userAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showVerification, setShowVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Mock login check
      // userAuthStore.login(email, password)
      if (email && password) {
        onLoginSuccess({ email, name: 'مستخدم تجريبي' });
      }
    } else {
      if (password !== confirmPassword) {
        alert('كلمات المرور غير متطابقة!');
        return;
      }
      // Mock register check
      // userAuthStore.register(...)
      setShowVerification(true);
    }
  };

  const handleVerified = () => {
    setShowVerification(false);
    onLoginSuccess({ email, name });
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm rtl" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md p-8 shadow-2xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl"
          >
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative flex items-center justify-center w-16 h-16 bg-slate-800 border border-slate-700 rounded-full text-emerald-400 shadow-inner">
                  <TreePine className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                مرحباً بك في الملاحظات المتداخلة
              </h2>
              <p className="text-slate-400 text-center text-sm px-4">
                سجل الدخول لإدارة ملاحظاتك ومزامنتها على جميع أجهزتك
              </p>
            </div>

            <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6 relative">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors z-10 ${
                  isLogin ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors z-10 ${
                  !isLogin ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                إنشاء حساب جديد
              </button>
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-700 rounded-lg shadow-sm"
                animate={{
                  right: isLogin ? '4px' : 'calc(50% + 4px)',
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative"
                  >
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                    />
                  </motion.div>
                )}

                <motion.div layout className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="البريد الإلكتروني"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                  />
                </motion.div>

                <motion.div layout className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                  />
                </motion.div>

                {!isLogin && (
                  <motion.div
                    key="confirm-password"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="relative"
                  >
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="تأكيد كلمة المرور"
                      className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                layout
                type="submit"
                className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
              >
                {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب وسجل الدخول'}
              </motion.button>
            </form>

            <AnimatePresence>
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 text-center"
                >
                  <button
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </AnimatePresence>

      <EmailVerificationModal
        isOpen={showVerification}
        email={email}
        onVerified={handleVerified}
        onClose={() => setShowVerification(false)}
      />

      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />
    </>
  );
};