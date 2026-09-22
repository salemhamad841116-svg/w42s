import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, Smartphone, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AdminAuthGateProps {
  onAuthenticated: () => void;
  onCancel?: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ onAuthenticated, onCancel }) => {
  const [username, setUsername] = useState('admin@masruq.com');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور الخاصة بالإدارة');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Validated admin credentials demo
      if (password.length >= 4) {
        setStep('2FA');
      } else {
        setError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى');
      }
    }, 600);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (twoFactorCode.length < 6) {
      setError('يرجى إدخال رمز المصادقة الثنائية (2FA) المكون من 6 أرقام');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Success authentication
      onAuthenticated();
    }, 700);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 font-sans dir-rtl">
      {/* Background Glow Effect */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Header Icon & Title */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 rounded-2xl text-amber-400 shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              ADMIN PORTAL • MASRUQ SYSTEM
            </span>
            <h1 className="text-2xl font-black text-white mt-2">
              لوحة التحكم الإدارية المستقلة
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              مخصصة لمسؤولي النظام للنطاق <span className="text-amber-300 font-mono font-bold">admin.masruq.com</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2">