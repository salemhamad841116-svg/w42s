import React from 'react';
import { Info, ExternalLink, Star, FileText, Shield, Mail, Bug, MessageSquare } from 'lucide-react';

export default function AboutTab() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Info className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">حول التطبيق</h3>
      </div>

      {/* App Info */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-3xl mx-auto shadow-xl flex items-center justify-center mb-6 transform rotate-3">
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center transform -rotate-3">
            <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">IN</span>
          </div>
        </div>
        <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Infinite Notes</h4>
        <p className="text-slate-500 mb-4">نظام الملاحظات المتداخلة الذكي</p>
        <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-sm font-bold font-mono">
          إصدار 2.5.0
        </span>
      </div>

      {/* Changelog & Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
          <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            ما الجديد في هذا الإصدار؟
          </h4>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>دعم كامل للوضع الداكن المخصص.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>تحسين سرعة المزامنة السحابية.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>إضافة نظام التشفير من الطرفين.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>إصلاح مشكلة عرض الخطوط في الأجهزة اللوحية.</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
          <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-indigo-500" />
            روابط سريعة
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-right">
              <span className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm font-bold">
                <FileText className="w-4 h-4 text-slate-400" />
                شروط الاستخدام
              </span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-right">
              <span className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm font-bold">
                <Shield className="w-4 h-4 text-slate-400" />
                سياسة الخصوصية
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Support Contact */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-6">
        <h4 className="font-bold text-slate-800 dark:text-white mb-4">التواصل والدعم</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all text-slate-700 dark:text-slate-300">
            <Mail className="w-6 h-6 mb-2 text-blue-500" />
            <span className="text-sm font-bold">الدعم الفني</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all text-slate-700 dark:text-slate-300">
            <Bug className="w-6 h-6 mb-2 text-rose-500" />
            <span className="text-sm font-bold">الإبلاغ عن مشكلة</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all text-slate-700 dark:text-slate-300">
            <MessageSquare className="w-6 h-6 mb-2 text-emerald-500" />
            <span className="text-sm font-bold">إرسال اقتراح</span>
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-slate-500">
        <p>صُنع بـ ❤️ بواسطة فريق Infinite Notes</p>
        <p className="mt-1">جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
