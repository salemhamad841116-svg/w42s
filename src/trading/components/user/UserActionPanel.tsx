import React, { useState, useEffect, useRef } from 'react';
import { User, LogIn, LogOut, Trash2, Download, CheckCircle, AlertTriangle, X, Shield, Lock, Mail, Wallet, Settings, ChevronLeft } from 'lucide-react';
import { getCurrentUser, login, logout, deleteAccount, createAccount, isLoggedIn } from '../../../services/authService';
import type { UserProfile } from '../../../types/settings';
import { useBrokerStore } from '../../stores/brokerStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const UserActionPanel: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileFlyoutOpen, setIsProfileFlyoutOpen] = useState(false);

  const { activeBroker, mt5Account, binanceAccount, setIsModalOpen } = useBrokerStore();
  const profileFlyoutRef = useRef<HTMLDivElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Account Deletion State
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState('');

  // Sync user on mount and localStorage changes
  const refreshUser = () => {
    if (isLoggedIn()) {
      setCurrentUser(getCurrentUser());
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    refreshUser();

    // Check if running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    // Capture PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      setInstallSuccessMessage('تم تثبيت التطبيق بنجاح!');
      setTimeout(() => setInstallSuccessMessage(''), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Close profile flyout on click outside or Escape key
  useEffect(() => {
    if (!isProfileFlyoutOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileFlyoutOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileFlyoutRef.current &&
        !profileFlyoutRef.current.contains(e.target as Node) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(e.target as Node)
      ) {
        setIsProfileFlyoutOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileFlyoutOpen]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      const user = login(authEmail, authPassword);
      if (user) {
        setCurrentUser(user);
        setIsAuthModalOpen(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        setAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } else {
      if (!authName || !authEmail || !authPassword) {
        setAuthError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }
      const newUser = createAccount(authName, authEmail, authPassword);
      setCurrentUser(newUser);
      setIsAuthModalOpen(false);
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIsProfileFlyoutOpen(false);
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    if (!currentUser) return;
    if (deleteEmailConfirm.trim().toLowerCase() !== currentUser.email.toLowerCase()) {
      setDeleteError('البريد الإلكتروني المدخل لا يطابق بريد الحساب الحالي');
      return;
    }

    const success = deleteAccount(currentUser.email);
    if (success) {
      setCurrentUser(null);
      setIsDeleteModalOpen(false);
      setIsProfileFlyoutOpen(false);
      setDeleteEmailConfirm('');
      alert('تم حذف الحساب وجميع البيانات المرتبطة به بنجاح');
    } else {
      setDeleteError('حدث خطأ أثناء محاولة حذف الحساب');
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isAppInstalled) {
      alert('التطبيق مثبت بالفعل على هذا الجهاز في الوضع المستقل (PWA).');
    } else {
      alert('لتثبيت التطبيق على جهازك:\n- على Chrome/Edge: اضغط على أيقونة التثبيت في شريط العنوان أو القائمة (Install App).\n- على Safari (iOS/macOS): اضغط على مشاركة (Share) ثم "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).');
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-2 px-1 border-t border-[#262B3D] bg-[#12151F] gap-1.5 relative">
      {/* Install App Button */}
      <button
        onClick={handleInstallClick}
        className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
          isAppInstalled
            ? 'text-emerald-400 hover:bg-[#1C2233] hover:text-emerald-300'
            : deferredPrompt
            ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 animate-pulse'
            : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white'
        }`}
        title={isAppInstalled ? 'التطبيق مثبت كـ PWA' : 'تثبيت المنصة على الجهاز (Install App)'}
      >
        {isAppInstalled ? <CheckCircle size={18} /> : <Download size={18} />}
      </button>

      {/* User Profile Avatar / Trigger */}
      <button
        ref={profileBtnRef}
        onClick={() => setIsProfileFlyoutOpen(!isProfileFlyoutOpen)}
        className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
          isProfileFlyoutOpen
            ? 'bg-[#2962FF] text-white shadow-md'
            : currentUser
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30'
            : 'text-[#8F9CAE] hover:bg-[#1E222D] hover:text-white'
        }`}
        title={currentUser ? `ملف المستخدم (${currentUser.name}) وحسابات الوسطاء` : 'ملف المستخدم وحسابات الوسطاء التجريبية'}
      >
        <User size={18} />
        {/* Status dot for Active Broker connection */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ring-2 ring-[#12151F] ${
            activeBroker === 'MT5_DEMO'
              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
              : activeBroker === 'BINANCE_TESTNET'
              ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
              : 'bg-cyan-400'
          }`}
        />
      </button>

      {/* User Profile Flyout Menu */}
      {isProfileFlyoutOpen && (
        <div
          ref={profileFlyoutRef}
          className="absolute bottom-2 left-12 w-72 bg-[#181C28] border border-[#2D3345] rounded-xl shadow-2xl p-3 z-50 text-right animate-in fade-in zoom-in-95 duration-150 notranslate select-none"
          dir="rtl"
          translate="no"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#262B3D] mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <div className="overflow-hidden">
                <div className="text-white text-xs font-bold truncate">
                  {currentUser ? currentUser.name : 'مستخدم زائر (تجريبي)'}
                </div>
                <div className="text-[#8F9CAE] text-[10px] font-mono truncate">
                  {currentUser ? currentUser.email : 'حساب محلي غير مقترن'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsProfileFlyoutOpen(false)}
              className="text-[#8F9CAE] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X size={14} />
            </button>
          </div>

          {/* Broker Demo Accounts Section (حسابات الوسطاء التجريبية) */}
          <div className="mb-2.5 bg-[#12151F] border border-[#262B3D] rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Wallet size={13} className="text-[#2962FF]" />
                حسابات الوسطاء التجريبية
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                {activeBroker === 'MT5_LIVE'
                  ? 'MT5 Live ⚡'
                  : activeBroker === 'BINANCE_LIVE'
                  ? 'Binance Live 🟡'
                  : activeBroker === 'MT5_DEMO'
                  ? 'MT5 Demo'
                  : activeBroker === 'BINANCE_TESTNET'
                  ? 'Binance Testnet'
                  : 'Sandbox'}
              </span>
            </div>

            {/* Current Active Account Card */}
            <div className="p-2 rounded bg-[#1A1F2C] border border-[#2A3144] mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeBroker === 'MT5_LIVE' || activeBroker === 'MT5_DEMO'
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                      : activeBroker === 'BINANCE_LIVE' || activeBroker === 'BINANCE_TESTNET'
                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                      : 'bg-cyan-400'
                  }`}
                />
                <div>
                  <div className="text-white font-medium text-[11px]">
                    {activeBroker === 'MT5_LIVE'
                      ? 'MetaTrader 5 (Live MetaApi)'
                      : activeBroker === 'BINANCE_LIVE'
                      ? 'Binance (Live Mainnet)'
                      : activeBroker === 'MT5_DEMO'
                      ? 'MetaTrader 5 Demo'
                      : activeBroker === 'BINANCE_TESTNET'
                      ? 'Binance Testnet'
                      : 'محاكاة محلية'}
                  </div>
                  <div className="text-[#8F9CAE] text-[10px]">
                    {activeBroker === 'MT5_LIVE'
                      ? 'Live Cloud Gateway'
                      : activeBroker === 'BINANCE_LIVE'
                      ? 'api.binance.com'
                      : activeBroker === 'MT5_DEMO'
                      ? mt5Account.server
                      : activeBroker === 'BINANCE_TESTNET'
                      ? 'testnet.binance'
                      : 'Sandbox'}
                  </div>
                </div>
              </div>
              <div className="text-left font-mono">
                <div className="text-emerald-400 font-bold text-xs">
                  {activeBroker === 'MT5_LIVE' || activeBroker === 'MT5_DEMO'
                    ? `$${mt5Account.balance.toLocaleString()}`
                    : activeBroker === 'BINANCE_LIVE' || activeBroker === 'BINANCE_TESTNET'
                    ? `${binanceAccount.balanceUSDT.toLocaleString()} USDT`
                    : '$10,000'}
                </div>
                <div className="text-[9px] text-[#8F9CAE]">رصيد الحساب</div>
              </div>
            </div>

            {/* Connect / Manage Broker Accounts Button */}
            <button
              onClick={() => {
                setIsProfileFlyoutOpen(false);
                setIsModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Settings size={13} />
              <span>إدارة وربط حسابات الوسطاء (ربط وسيط ⚙️)</span>
            </button>
          </div>

          {/* User Auth or Sign-in actions */}
          <div className="flex flex-col gap-1 text-xs pt-1.5 border-t border-[#262B3D]">
            {!currentUser ? (
              <button
                onClick={() => {
                  setIsProfileFlyoutOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors text-right font-medium cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <LogIn size={14} />
                  <span>تسجيل الدخول / إنشاء حساب</span>
                </span>
                <ChevronLeft size={14} />
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#8F9CAE] hover:text-white hover:bg-[#22283A] transition-colors text-right cursor-pointer"
                >
                  <LogOut size={14} className="text-amber-400" />
                  <span>تسجيل الخروج</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileFlyoutOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-right cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>حذف الحساب نهائياً</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal (Login / Register) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" dir="rtl">
          <div className="relative w-full max-w-sm p-6 bg-[#161A26] border border-[#2B3144] rounded-2xl shadow-2xl text-right">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 left-4 text-[#8F9CAE] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-white text-base font-bold">
                  {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </h3>
                <p className="text-[#8F9CAE] text-xs">منصة التداول وتحليل الأسواق الذكية</p>
              </div>
            </div>

            {authError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs text-[#8F9CAE] mb-1">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="محمد أحمد"
                      className="w-full bg-[#1F2536] border border-[#2F364D] rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-[#8F9CAE] mb-1">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="trader@example.com"
                    className="w-full bg-[#1F2536] border border-[#2F364D] rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8F9CAE] mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1F2536] border border-[#2F364D] rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/20"
              >
                {authMode === 'login' ? 'دخول' : 'تسجيل حساب جديد'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-[#262B3D] text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                {authMode === 'login' ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && currentUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" dir="rtl">
          <div className="relative w-full max-w-sm p-6 bg-[#161A26] border border-rose-500/30 rounded-2xl shadow-2xl text-right">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteError('');
                setDeleteEmailConfirm('');
              }}
              className="absolute top-4 left-4 text-[#8F9CAE] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-white text-base font-bold">حذف الحساب نهائياً</h3>
                <p className="text-rose-400 text-xs">تحذير: هذا الإجراء لا يمكن التراجع عنه</p>
              </div>
            </div>

            <p className="text-zinc-300 text-xs leading-relaxed mb-4">
              سيتم حذف جميع إعداداتك ومساحات العمل وسجلات التداول المرتبطة بهذا الحساب بشكل نهائي من هذا الجهاز.
            </p>

            {deleteError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <div>
                <label className="block text-xs text-[#8F9CAE] mb-1">
                  لتأكيد الحذف، اكتب بريدك الإلكتروني ({currentUser.email}):
                </label>
                <input
                  type="email"
                  required
                  value={deleteEmailConfirm}
                  onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                  placeholder={currentUser.email}
                  className="w-full bg-[#1F2536] border border-[#2F364D] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  تأكيد حذف الحساب
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteError('');
                    setDeleteEmailConfirm('');
                  }}
                  className="px-4 py-2.5 bg-[#22283A] hover:bg-[#2C344C] text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
