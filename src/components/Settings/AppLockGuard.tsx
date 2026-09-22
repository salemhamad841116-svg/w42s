import React, { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLockGuardProps {
  onUnlock: () => void;
}

export default function AppLockGuard({ onUnlock }: AppLockGuardProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = '1234'; // In real app, this is checked against hash

  const handleDigit = (d: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + d);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  useEffect(() => {
    if (pin.length >= 4) {
      // Simulate validation
      if (pin === correctPin) {
        onUnlock();
      } else if (pin.length === 6 || (pin.length >= 4 && pin !== correctPin)) {
        // Here we just wait a bit and if it's 4 digits and wrong, we wait for more or error
        // Real logic depends on if length is strictly known. We'll just error after 4 if it's 1234.
        if (pin.length === 6 || (pin.length === 4 && pin !== correctPin)) {
          setTimeout(() => {
            setError(true);
            setTimeout(() => setPin(''), 500);
          }, 300);
        }
      }
    }
  }, [pin, onUnlock, correctPin]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-white" dir="rtl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-3xl mx-auto shadow-xl flex items-center justify-center mb-4 transform rotate-3">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center transform -rotate-3">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">أدخل رمز المرور</h2>
        <p className="text-slate-400 text-sm">التطبيق مقفل لحماية بياناتك</p>
      </div>

      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center gap-4 mb-10"
      >
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              pin.length > i 
                ? 'bg-blue-500 scale-125' 
                : error 
                  ? 'bg-rose-500/50' 
                  : 'bg-slate-700'
            }`}
          />
        ))}
      </motion.div>

      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-rose-500 text-sm font-bold mb-6 absolute top-[40%]"
        >
          رمز المرور غير صحيح
        </motion.p>
      )}

      <div className="grid grid-cols-3 gap-6 max-w-xs w-full px-8 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleDigit(num.toString())}
            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-2xl font-semibold flex items-center justify-center transition-colors mx-auto"
          >
            {num}
          </button>
        ))}
        
        <button
          onClick={handleClear}
          className="w-16 h-16 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold flex items-center justify-center transition-colors mx-auto"
        >
          مسح
        </button>
        
        <button
          onClick={() => handleDigit('0')}
          className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-2xl font-semibold flex items-center justify-center transition-colors mx-auto"
        >
          0
        </button>
        
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors mx-auto"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
