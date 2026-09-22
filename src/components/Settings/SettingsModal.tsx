import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Cloud, RefreshCw, Settings as SettingsIcon, 
  Bell, Shield, HardDrive, Info, X
} from 'lucide-react';
import { SettingsTabId } from '../../types/settings';
import ProfileTab from './Tabs/ProfileTab';
import CloudBackupTab from './Tabs/CloudBackupTab';
import SyncTab from './Tabs/SyncTab';
import AppSettingsTab from './Tabs/AppSettingsTab';
import NotificationsTab from './Tabs/NotificationsTab';
import SecurityTab from './Tabs/SecurityTab';
import StorageTab from './Tabs/StorageTab';
import AboutTab from './Tabs/AboutTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: any[];
  onUpdateNotes: (notes: any[]) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const TABS = [
  { id: 'profile' as SettingsTabId, label: 'الملف الشخصي', icon: User },
  { id: 'backup' as SettingsTabId, label: 'النسخ الاحتياطي', icon: Cloud },
  { id: 'sync' as SettingsTabId, label: 'المزامنة', icon: RefreshCw },
  { id: 'app' as SettingsTabId, label: 'إعدادات التطبيق', icon: SettingsIcon },
  { id: 'notifications' as SettingsTabId, label: 'الإشعارات', icon: Bell },
  { id: 'security' as SettingsTabId, label: 'الأمان', icon: Shield },
  { id: 'storage' as SettingsTabId, label: 'التخزين', icon: HardDrive },
  { id: 'about' as SettingsTabId, label: 'حول التطبيق', icon: Info },
];

export default function SettingsModal({ isOpen, onClose, notes, onUpdateNotes, isDarkMode, onToggleDarkMode }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('profile');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl h-[85vh] bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors z-10"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto">
              <div className="p-4 md:p-6 hidden md:block">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">الإعدادات</h2>
              </div>
              
              <nav className="flex md:flex-col px-2 md:px-4 pb-2 md:pb-4 gap-1 min-w-max md:min-w-0">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative whitespace-nowrap md:whitespace-normal
                        ${isActive 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-bold' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-3xl mx-auto"
                >
                  {activeTab === 'profile' && <ProfileTab />}
                  {activeTab === 'backup' && <CloudBackupTab notes={notes} onUpdateNotes={onUpdateNotes} />}
                  {activeTab === 'sync' && <SyncTab />}
                  {activeTab === 'app' && <AppSettingsTab isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />}
                  {activeTab === 'notifications' && <NotificationsTab />}
                  {activeTab === 'security' && <SecurityTab />}
                  {activeTab === 'storage' && <StorageTab notes={notes} />}
                  {activeTab === 'about' && <AboutTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}