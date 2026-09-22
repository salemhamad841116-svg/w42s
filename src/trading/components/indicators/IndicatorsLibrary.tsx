import React, { useState, useEffect, useMemo } from 'react';
import { Search, Star, Plus, X } from 'lucide-react';
import { useScriptStore } from '../../stores/useScriptStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

interface IndicatorsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IndicatorsLibrary: React.FC<IndicatorsLibraryProps> = ({ isOpen, onClose }) => {
  const { scripts, favorites, toggleFavorite } = useScriptStore();
  const { activeWorkspaceId, addIndicatorToWorkspace } = useWorkspaceStore();
  
  const [activeCategory, setActiveCategory] = useState('tech');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categories = [
    {
      title: 'Personal',
      items: [
        { id: 'fav', label: 'المفضلة' },
        { id: 'my_scripts', label: 'نصوصي البرمجية' },
        { id: 'purchased', label: 'تم الشراء' },
      ]
    },
    {
      title: 'Built-in',
      items: [
        { id: 'tech', label: 'تحليلات فنية' },
        { id: 'fundamentals', label: 'الأساسيات' },
      ]
    },
    {
      title: 'Community',
      items: [
        { id: 'editors_pick', label: 'مختارات المحرر' },
        { id: 'top', label: 'الأفضل' },
        { id: 'trending', label: 'البارزة' },
      ]
    },
    {
      title: 'Marketplace',
      items: [
        { id: 'marketplace', label: 'المتجر' },
      ]
    }
  ];

  const filteredScripts = useMemo(() => {
    let result = scripts;

    if (debouncedSearch) {
      const lowerQuery = debouncedSearch.toLowerCase();
      return result.filter(
        s =>
          s.name.toLowerCase().includes(lowerQuery) ||
          s.category.toLowerCase().includes(lowerQuery) ||
          s.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }

    switch (activeCategory) {
      case 'fav':
        result = result.filter(s => favorites.includes(s.id));
        break;
      case 'my_scripts':
        result = result.filter(s => s.category === 'Personal');
        break;
      case 'tech':
        result = result.filter(s => s.category === 'Built-in');
        break;
      case 'marketplace':
        result = result.filter(s => s.category === 'Marketplace');
        break;
      case 'editors_pick':
      case 'top':
      case 'trending':
        result = result.filter(s => s.category === 'Community');
        break;
      case 'purchased':
      case 'fundamentals':
      default:
        result = [];
        break;
    }

    return result;
  }, [scripts, favorites, activeCategory, debouncedSearch]);

  const handleAddIndicator = (id: string) => {
    if (activeWorkspaceId) {
      addIndicatorToWorkspace(activeWorkspaceId, id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div className="flex w-[800px] h-[600px] bg-white/90 backdrop-blur-xl border border-black/10 rounded-2xl shadow-2xl overflow-hidden" dir="rtl">
        <div className="w-64 bg-black/5 border-l border-black/10 flex flex-col">
          <div className="p-4 border-b border-black/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">المؤشرات</h2>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <div className="space-y-1">
                  {cat.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveCategory(item.id)}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === item.id 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:bg-black/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-black/10">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث عن مؤشر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredScripts.length > 0 ? (
              filteredScripts.map(script => (
                <div key={script.id} className="flex items-center justify-between p-3 hover:bg-black/5 rounded-xl group transition-colors">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleFavorite(script.id)} className="p-1">
                      <Star className={`w-5 h-5 transition-colors ${favorites.includes(script.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400 group-hover:text-yellow-400'}`} />
                    </button>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{script.name}</h4>
                      <p className="text-xs text-gray-500">{script.category}</p>
                    </div>
                  </div>
                  <button onClick={() => handleAddIndicator(script.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-100">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-sm">لا توجد نتائج</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
