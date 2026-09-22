import React, { useState, useEffect } from 'react';
import {
  Flame,
  Globe,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Send,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { finnhubService, FinnhubNewsItem } from '../../trading/services/finnhubService';

export interface LocalBreakingNewsItem {
  id: string;
  title: string;
  time: string;
  urgent: boolean;
  author: string;
}

export const AdminBreakingNews: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'broadcast' | 'finnhubWire'>('finnhubWire');
  const [finnhubNews, setFinnhubNews] = useState<FinnhubNewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsCategory, setNewsCategory] = useState<'general' | 'forex' | 'crypto' | 'merger'>('general');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Broadcast news state
  const [newsTitle, setNewsTitle] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [broadcastList, setBroadcastList] = useState<LocalBreakingNewsItem[]>([
    {
      id: '1',
      title: '🚨 الفيدرالي الأمريكي يبقي أسعار الفائدة دون تغيير عند 5.25% مع إشارات تيسيرية',
      time: 'منذ 15 دقيقة',
      urgent: true,
      author: 'إدارة المخاطر',
    },
    {
      id: '2',
      title: '📈 الذهب يكسر أعلى مستوياته التاريخية مقترباً من حاجز 4450 دولار للأونصة',
      time: 'منذ ساعة',
      urgent: false,
      author: 'غرفة التداول',
    },
  ]);

  const loadFinnhubNews = async () => {
    setIsLoadingNews(true);
    try {
      const items = await finnhubService.getMarketNews(newsCategory);
      setFinnhubNews(items);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Error fetching Finnhub news:', e);
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    loadFinnhubNews();
    const interval = setInterval(loadFinnhubNews, 60000); // 1 minute auto-refresh
    return () => clearInterval(interval);
  }, [newsCategory]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim()) return;

    const newItem: LocalBreakingNewsItem = {
      id: Date.now().toString(),
      title: newsTitle.trim(),
      time: 'الآن',
      urgent: isUrgent,
      author: 'المشرف العام',
    };

    setBroadcastList([newItem, ...broadcastList]);
    setNewsTitle('');
    setIsUrgent(false);
  };

  const handleDeleteBroadcast = (id: string) => {
    setBroadcastList(broadcastList.filter((b) => b.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Flame className="text-rose-500" />
            مركز الأخبار العاجلة وتدفق Finnhub الحي
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            متابعة البث المباشر لأخبار وول ستريت والأسواق العالمية عبر Finnhub API، وبث التنبيهات اللحظية للمتداولين
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-[#11141c] p-1.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveSubTab('finnhubWire')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'finnhubWire' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe size={14} />
            <span>بث Finnhub الحي ({finnhubNews.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('broadcast')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'broadcast' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Send size={14} />
            <span>نشر التنبيهات العاجلة</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Finnhub Real-time Wire */}
      {activeSubTab === 'finnhubWire' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11141c] p-3 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Tag size={13} className="text-amber-400" />
                تصنيف الأخبار:
              </span>
              {(['general', 'forex', 'crypto', 'merger'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewsCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    newsCategory === cat ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat === 'general' ? 'العامة' : cat === 'forex' ? 'فوركس' : cat === 'crypto' ? 'كريبتو' : 'اندماجات'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                <Clock size={12} />
                آخر تحديث: {lastRefreshed.toLocaleTimeString('ar-SA')}
              </span>
              <button
                onClick={loadFinnhubNews}
                disabled={isLoadingNews}
                className="px-3 py-1.5 bg-[#181c26] hover:bg-[#202534] border border-zinc-700/60 rounded-xl text-xs text-white font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw size={12} className={isLoadingNews ? 'animate-spin text-amber-400' : 'text-zinc-400'} />
                <span>تحديث الآن</span>
              </button>
            </div>
          </div>

          {/* News Stream List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finnhubNews.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#11141c] border border-zinc-800 hover:border-zinc-700 rounded-2xl flex flex-col justify-between space-y-3 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                      {item.source || 'Finnhub Wire'}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(item.datetime * 1000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                    {item.headline}
                  </h3>

                  {item.summary && (
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                  <span className="text-[10px] text-zinc-500">
                    {new Date(item.datetime * 1000).toLocaleDateString('ar-SA')}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition-colors"
                  >
                    <span>المصدر الأصلي</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}

            {finnhubNews.length === 0 && !isLoadingNews && (
              <div className="col-span-2 p-12 text-center text-zinc-500 bg-[#11141c] border border-zinc-800 rounded-2xl">
                لا توجد أخبار متاحة حالياً للتصنيف المحدد.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: Manual Broadcast */}
      {activeSubTab === 'broadcast' && (
        <div className="space-y-6">
          <form onSubmit={handleBroadcast} className="bg-[#11141c] p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">عنوان الخبر العاجل</label>
              <textarea
                rows={2}
                placeholder="اكتب الخبر العاجل الذي سيظهر بشريط متحرك أعلى المنصة وفي إشعارات المتداولين..."
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                className="w-full bg-[#181c26] border border-zinc-700/60 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <AlertTriangle size={13} />
                  تمييز كخبر فائق الأهمية (Urgent Flash)
                </span>
              </label>

              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
              >
                <Flame size={14} />
                <span>بث الخبر العاجل فوراً</span>
              </button>
            </div>
          </form>

          {/* Active Broadcasts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400">التنبيهات النشطة حالياً</h3>
            {broadcastList.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#11141c] border border-zinc-800 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.urgent && (
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded">
                        عاجل جداً
                      </span>
                    )}
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-3">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>الناشر: {item.author}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteBroadcast(item.id)}
                  className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                  title="حذف التنبيه"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
