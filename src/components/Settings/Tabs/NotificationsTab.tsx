import React, { useState } from 'react';
import { Bell, CheckSquare, Cloud, AlertTriangle, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationsTab() {
  const [masterToggle, setMasterToggle] = useState(true);
  const [settings, setSettings] = useState({
    reminders: true,
    taskDue: true,
    backupComplete: false,
    syncErrors: true,
    newDeviceLogin: true
  });

  const toggles = [
    { id: 'reminders', label: 'التذكيرات', desc: 'إشعارات تذكير الملاحظات', icon: Bell, color: 'text-blue-500' },
    { id: 'taskDue', label: 'المهام المستحقة', desc: 'إشعارات عند اقتراب موعد المهام', icon: CheckSquare, color: 'text-emerald-500' },
    { id: 'backupComplete', label: 'اكتمال النسخ الاحتياطي', desc: 'إشعار عند نجاح النسخ السحابي', icon: Cloud, color: 'text-indigo-500' },
    { id: 'syncErrors', label: 'أخطاء المزامنة', desc: 'تنبيهات عند فشل المزامنة', icon: AlertTriangle, color: 'text-rose-500' },
    { id: 'newDeviceLogin', label: 'تسجيل دخول من جهاز جديد', desc: 'تنبيه أمني عند تسجيل الدخول', icon: Smartphone, color: 'text-amber-500' },
  ];

  const handleToggle = (id: string) => {
    if (!masterToggle) return;
    setSettings(prev => ({ ...prev, [id]: !prev[id as keyof typeof settings] }));
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">إعدادات الإشعارات</h3>
        </div>
      </div>

      {/* Master Toggle */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-200/50 dark:border-blue-900/50 p-6 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-lg">تفعيل الإشعارات</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">تشغيل أو إيقاف جميع الإشعارات في التطبيق</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={masterToggle} onChange={() => setMasterToggle(!masterToggle)} />
          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Individual Toggles */}
      <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-opacity duration-300 ${!masterToggle ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {toggles.map(t => {
            const Icon = t.icon;
            const isChecked = settings[t.id as keyof typeof settings];
            
            return (
              <div key={t.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${t.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white">{t.label}</h5>
                    <p className="text-sm text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isChecked} 
                    onChange={() => handleToggle(t.id)} 
                    disabled={!masterToggle}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:-translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
