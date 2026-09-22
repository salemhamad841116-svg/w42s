import React, { useState } from 'react';
import { Shield, Key, Lock, Fingerprint, Clock, Smartphone, Globe, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityTab() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [pinLockEnabled, setPinLockEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState('5'); // minutes

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">إعدادات الأمان</h3>
      </div>

      {/* PIN Lock Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-slate-800 dark:text-white">قفل التطبيق</h4>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300">الرمز السري (PIN)</span>
              <span className="text-xs text-slate-500">استخدم رمزاً مكوناً من 4-6 أرقام لحماية ملاحظاتك</span>
            </div>
            <div className="flex items-center gap-4">
              {pinLockEnabled && (
                <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors">
                  تغيير الرمز
                </button>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pinLockEnabled} onChange={() => setPinLockEnabled(!pinLockEnabled)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className={`transition-all duration-300 ${!pinLockEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-300">البصمة / الوجه</span>
                <span className="text-xs text-slate-500">فتح التطبيق باستخدام المقاييس الحيوية</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={biometricEnabled} onChange={() => setBiometricEnabled(!biometricEnabled)} disabled={!pinLockEnabled} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-300">القفل التلقائي</span>
                <span className="text-xs text-slate-500">قفل التطبيق بعد فترة من عدم النشاط</span>
              </div>
              <select 
                value={autoLockTimeout}
                onChange={(e) => setAutoLockTimeout(e.target.value)}
                disabled={!pinLockEnabled}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-800 dark:text-white"
              >
                <option value="0">أبداً</option>
                <option value="1">1 دقيقة</option>
                <option value="5">5 دقائق</option>
                <option value="15">15 دقيقة</option>
                <option value="30">30 دقيقة</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-emerald-500" />
          <h4 className="font-bold text-slate-800 dark:text-white">المصادقة الثنائية (2FA)</h4>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              أضف طبقة حماية إضافية لحسابك. عند تسجيل الدخول من جهاز جديد، سيطلب منك إدخال رمز التحقق المؤقت من تطبيق المصادقة (مثل Google Authenticator).
            </p>
            <button 
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${
                twoFactorEnabled 
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {twoFactorEnabled ? 'تعطيل المصادقة الثنائية' : 'إعداد المصادقة الثنائية'}
            </button>
          </div>
          
          {!twoFactorEnabled && (
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400">
              <Key className="w-8 h-8 opacity-50" />
            </div>
          )}
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
          <h4 className="font-bold text-slate-800 dark:text-white">سجل نشاط الأمان</h4>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">الحدث</th>
                <th className="px-4 py-3 font-medium">الوقت</th>
                <th className="px-4 py-3 font-medium">الجهاز</th>
                <th className="px-4 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <td className="px-4 py-3 text-slate-800 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-500" /> تسجيل دخول ناجح
                </td>
                <td className="px-4 py-3 text-slate-500">اليوم، 10:30 ص</td>
                <td className="px-4 py-3 text-slate-500">MacBook Pro - Chrome</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">192.168.1.1</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <td className="px-4 py-3 text-slate-800 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-500" /> تغيير كلمة المرور
                </td>
                <td className="px-4 py-3 text-slate-500">أمس، 14:15 م</td>
                <td className="px-4 py-3 text-slate-500">iPhone 13 - Safari</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">10.0.0.15</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <td className="px-4 py-3 text-slate-800 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" /> محاولة دخول فاشلة
                </td>
                <td className="px-4 py-3 text-slate-500">2023-10-20</td>
                <td className="px-4 py-3 text-slate-500">Windows 11 - Edge</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">8.8.8.8</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
