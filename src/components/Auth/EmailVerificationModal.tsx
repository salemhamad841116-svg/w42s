import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, RefreshCcw } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onVerified: () => void;
  onClose: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  onVerified,
  onClose,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState('123456');
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDemoCode(Math.floor(100000 + Math.random() * 900000).toString());
      setCode(['', '', '', '', '', '']);
      setTimer(60);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    const enteredCode = code.join('');
    if (enteredCode === demoCode) {
      onVerified();
    } else {
      setError('الرمز غير صحيح. حاول مرة أخرى.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm rtl" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md p-8 shadow-2xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl"
        >
          <button
            onClick={onClose}
            className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative flex items-center justify-center w-16 h-16 bg-slate-800 border border-slate-700 rounded-full text-blue-400">
                <Mail className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">التحقق من البريد</h2>
            <p className="text-slate-400 text-center text-sm">
              أدخل الرمز المكون من 6 أرقام المرسل إلى <br />
              <span className="inline-block mt-1 px-3 py-1 bg-slate-800/80 rounded-full text-slate-200 font-medium">
                {email}
              </span>
            </p>
          </div>

          <div className="mb-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
            <p className="text-indigo-300 text-xs mb-1">رمز التفعيل التجريبي للنسخة الحالية:</p>
            <p className="text-indigo-400 font-mono font-bold tracking-widest text-lg">{demoCode}</p>
          </div>

          <div className="flex justify-between mb-6" dir="ltr">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold text-white bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center mb-6"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={handleVerify}
            disabled={code.some((d) => !d)}
            className="w-full py-3 mb-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            تأكيد البريد الإلكتروني
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                if (timer === 0) {
                  setDemoCode(Math.floor(100000 + Math.random() * 900000).toString());
                  setTimer(60);
                }
              }}
              disabled={timer > 0}
              className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full"
            >
              <RefreshCcw className={`w-4 h-4 ${timer === 0 ? '' : 'opacity-50'}`} />
              {timer > 0 ? `إعادة إرسال الرمز خلال (${timer}) ثانية` : 'إعادة إرسال الرمز'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};