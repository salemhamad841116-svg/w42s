import React, { useState } from 'react';
import {
  Camera,
  Edit2,
  Shield,
  Smartphone,
  Globe,
  LogOut,
  AlertTriangle,
  Key,
  User,
  CheckCircle2,
} from 'lucide-react';
import {
  getCurrentUserAccount,
  logout,
  changePassword,
  deleteAccount,
} from '../../../services/userAuthStore';
import { purgeUserData } from '../../../services/accountBoundSync';
import { toast } from '../../PWA/ToastContainer';

interface ProfileTabProps {
  onOpenAuthModal?: () => void;
}

export default function ProfileTab({ onOpenAuthModal }: ProfileTabProps) {
  const user = getCurrentUserAccount();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailToConfirm, setEmailToConfirm] = useState('');

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح 👋');
    window.location.reload();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('كلمة المرور الجديدة غير مطابقة للتأكيد');
      return;
    }
    const res = changePassword(oldPassword, newPassword);
    if (res.success) {
      toast.success('تم تغيير كلمة المرور بنجاح 🔒');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.message || 'فشل تغيير كلمة المرور');
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    if (emailToConfirm.trim() !== user.email) {
      toast.error('البريد الإلكتروني المكتوب غير مطبق للحساب الحالي');
      return;
    }
    const res = deleteAccount(user.email);
    if (res.success) {
      purgeUserData(user.email);
      toast.success('تم حذف الحساب وجميع البيانات المرتبطة به بنجاح');
      window.location.reload();
    } else {
      toast.error('تعذر حذف الحساب');
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">الملف الشخصي</h3>
      </div>

      {!user ? (
        <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <User className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">أنت تستخدم التطبيق بصورة مستخدم زائر</h4>
          <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
            قم بتسجيل الدخول أو إنشاء حساب مجاني لربط جميع ملاحظاتك ببريدك الإلكتروني ومزامنتها سحابياً على كل أجهزتك.
          </p>
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all"
            >
              تسجيل الدخول / إنشاء حساب جديد
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Avatar & Basic Info */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden font-bold text-2xl text-emerald-500">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {user.name || 'مستخدم الملاحظات'}
                  </h4>
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> حساب موثق
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600 dark:text-slate-400">
                  <p className="font-mono text-sm">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  <span className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                    تاريخ التسجيل: {new Date(user.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                  </span>
                  <span className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                    الجلسة النشطة: متصل الان 🟢
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {/* Password Change */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-indigo-500" />
              <h4 className="font-bold text-slate-800 dark:text-white">تغيير كلمة المرور</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/40 outline-none transition-all text-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/40 outline-none transition-all text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/40 outline-none transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-2.5 font-bold transition-all cursor-pointer"
              >
                حفظ التغييرات
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-200/60 dark:border-rose-800/60 p-6">
            <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold">منطقة الخطر</h4>
            </div>
            <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mb-4">
              حذف الحساب سيؤدي إلى مسح جميع ملاحظاتك وبياناتك السحابية نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs text-rose-600 dark:text-rose-400 mb-1">
                  اكتب بريدك الإلكتروني ({user.email}) للتأكيد
                </label>
                <input
                  type="text"
                  value={emailToConfirm}
                  onChange={(e) => setEmailToConfirm(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 rounded-xl px-4 py-2 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/40"
                />
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={emailToConfirm.trim() !== user.email}
                className="w-full md:w-auto bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl px-6 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap cursor-pointer"
              >
                حذف الحساب نهائياً
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
