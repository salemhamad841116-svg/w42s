import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  CrosshairMode,
  Time,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';

/* ─── Pair data for mock generation ─── */
const CHART_PAIRS = [
  { symbol: 'XAU/USD', label: 'XAU/USD (الذهب)', basePrice: 2432.50, decimals: 2, volatility: 8 },
  { symbol: 'EUR/USD', label: 'EUR/USD', basePrice: 1.0895, decimals: 4, volatility: 0.003 },
  { symbol: 'GBP/USD', label: 'GBP/USD', basePrice: 1.2840, decimals: 4, volatility: 0.004 },
  { symbol: 'USD/JPY', label: 'USD/JPY', basePrice: 154.20, decimals: 2, volatility: 0.5 },
  { symbol: 'AUD/USD', label: 'AUD/USD', basePrice: 0.6540, decimals: 4, volatility: 0.002 },
  { symbol: 'USD/CAD', label: 'USD/CAD', basePrice: 1.3820, decimals: 4, volatility: 0.003 },
  { symbol: 'BTC/USD', label: 'BTC/USD (البيتكوين)', basePrice: 64250.00, decimals: 2, volatility: 400 },
  { symbol: 'US30', label: 'US30 (داو جونز)', basePrice: 39800, decimals: 1, volatility: 80 },
];

const TIMEFRAMES = [
  { value: '1', label: '1D', seconds: 86400 },
  { value: '5', label: '5m', seconds: 300 },
  { value: '15', label: '15m', seconds: 900 },
  { value: '60', label: '1H', seconds: 3600 },
  { value: '240', label: '4H', seconds: 14400 },
];

/* ─── Mock candle generator ─── */
function generateMockCandles(
  basePrice: number,
  volatility: number,
  count: number,
  intervalSec: number
) {
  const data: { time: Time; open: number; high: number; low: number; close: number; volume: number }[] = [];
  let time = Math.floor(Date.now() / 1000) - count * intervalSec;
  let price = basePrice + (Math.random() - 0.5) * volatility * 4;

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.48) * volatility;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.6;
    const low = Math.min(open, close) - Math.random() * volatility * 0.6;
    const volume = Math.random() * 100 + 10;
    data.push({ time: time as Time, open, high, low, close, volume });
    price = close;
    time += intervalSec;
  }
  return data;
}

/* ─── Signal price lines config ─── */
interface SignalOverlay {
  entryPrice?: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  stopLoss?: number;
  type?: 'BUY' | 'SELL';
  pair?: string;
}

interface AdminMiniChartProps {
  /** Pre-select a symbol (overridden when signal is set) */
  initialSymbol?: string;
  /** Show Entry/TP/SL price lines for a signal */
  signal?: SignalOverlay | null;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
}

export const AdminMiniChart: React.FC<AdminMiniChartProps> = ({
  initialSymbol,
  signal,
  defaultCollapsed = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol || 'XAU/USD');
  const [selectedTf, setSelectedTf] = useState('15');
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);

  // Sync symbol when signal changes
  useEffect(() => {
    if (signal?.pair) {
      const match = CHART_PAIRS.find(
        (p) => p.symbol === signal.pair || signal.pair?.includes(p.symbol)
      );
      if (match) {
        setSelectedSymbol(match.symbol);
        if (isCollapsed) setIsCollapsed(false);
      }
    }
  }, [signal?.pair]);

  const pairConfig = CHART_PAIRS.find((p) => p.symbol === selectedSymbol) || CHART_PAIRS[0];
  const tfConfig = TIMEFRAMES.find((t) => t.value === selectedTf) || TIMEFRAMES[2];

  // Build / rebuild chart
  const buildChart = useCallback(() => {
    if (!containerRef.current || isCollapsed) return;

    // Cleanup previous
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: '#09090b' },
        textColor: '#71717a',
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: '#18181b' },
        horzLines: { color: '#18181b' },
      },
      rightPriceScale: {
        borderColor: '#27272a',
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      timeScale: {
        borderColor: '#27272a',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 6,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#3f3f46', style: 3, width: 1, labelVisible: true },
        horzLine: { color: '#3f3f46', style: 3, width: 1, labelVisible: true },
      },
    });
    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00C087',
      downColor: '#F23645',
      borderUpColor: '#00C087',
      borderDownColor: '#F23645',
      wickUpColor: '#00C087',
      wickDownColor: '#F23645',
    });
    candleSeriesRef.current = candleSeries;

    // Generate candle data
    const candles = generateMockCandles(pairConfig.basePrice, pairConfig.volatility, 200, tfConfig.seconds);
    candleSeries.setData(candles.map(({ volume, ...c }) => c));

    // Track last price
    const lastCandle = candles[candles.length - 1];
    const firstCandle = candles[0];
    if (lastCandle && firstCandle) {
      setLastPrice(lastCandle.close);
      setPriceChange(((lastCandle.close - firstCandle.open) / firstCandle.open) * 100);
    }

    // Draw signal price lines
    if (signal) {
      if (signal.entryPrice) {
        candleSeries.createPriceLine({
          price: signal.entryPrice,
          color: '#F7931A',
          lineStyle: 0,
          lineWidth: 2,
          title: `◆ Entry ${signal.entryPrice}`,
          axisLabelVisible: true,
        });
      }
      if (signal.tp1) {
        candleSeries.createPriceLine({
          price: signal.tp1,
          color: '#00C087',
          lineStyle: 2,
          lineWidth: 1,
          title: `TP1 ${signal.tp1}`,
          axisLabelVisible: true,
        });
      }
      if (signal.tp2) {
        candleSeries.createPriceLine({
          price: signal.tp2,
          color: '#00C087',
          lineStyle: 2,
          lineWidth: 1,
          title: `TP2 ${signal.tp2}`,
          axisLabelVisible: true,
        });
      }
      if (signal.tp3) {
        candleSeries.createPriceLine({
          price: signal.tp3,
          color: '#00E6A0',
          lineStyle: 3,
          lineWidth: 1,
          title: `TP3 ${signal.tp3}`,
          axisLabelVisible: true,
        });
      }
      if (signal.stopLoss) {
        candleSeries.createPriceLine({
          price: signal.stopLoss,
          color: '#F23645',
          lineStyle: 2,
          lineWidth: 2,
          title: `◆ SL ${signal.stopLoss}`,
          axisLabelVisible: true,
        });
      }
    }

    chart.timeScale().fitContent();

    // 10-second inactivity auto-reset
    let inactivityTimer: NodeJS.Timeout | null = null;
    const handleChartChange = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        chart.timeScale().applyOptions({ rightOffset: 5, barSpacing: 6 });
        chart.priceScale('right').applyOptions({ autoScale: true, scaleMargins: { top: 0.08, bottom: 0.08 } });
      }, 10000);
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      handleChartChange();
    });

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    });
    ro.observe(containerRef.current);

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      ro.disconnect();
      chart.remove();
    };
  }, [selectedSymbol, selectedTf, isCollapsed, signal, pairConfig, tfConfig]);

  useEffect(() => {
    const cleanup = buildChart();
    return () => {
      cleanup?.();
    };
  }, [buildChart]);

  const chartHeight = isExpanded ? 420 : 260;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl transition-all duration-200">
      {/* ─── Header Bar ─── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-white">الرسم البياني المباشر</span>
          <span className="text-[10px] text-zinc-500 font-mono">Live Chart Inspector</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Last price badge */}
          {!isCollapsed && lastPrice !== null && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-white">
                {lastPrice.toFixed(pairConfig.decimals)}
              </span>
              <span
                className={`text-[10px] font-bold flex items-center gap-0.5 ${
                  priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {priceChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {priceChange >= 0 ? '+' : ''}
                {priceChange.toFixed(2)}%
              </span>
            </div>
          )}

          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </div>

      {/* ─── Collapsible Body ─── */}
      {!isCollapsed && (
        <>
          {/* Controls bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60 bg-zinc-950/50">
            <div className="flex items-center gap-2">
              {/* Symbol selector */}
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {CHART_PAIRS.map((p) => (
                  <option key={p.symbol} value={p.symbol}>
                    {p.label}
                  </option>
                ))}
              </select>

              {/* Timeframe pills */}
              <div className="flex items-center gap-1 bg-zinc-950 rounded-lg border border-zinc-800 p-0.5">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setSelectedTf(tf.value)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                      selectedTf === tf.value
                        ? 'bg-amber-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expand / shrink */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              title={isExpanded ? 'تصغير' : 'تكبير'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Signal price lines indicator */}
          {signal && signal.entryPrice && (
            <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-950/80 border-b border-zinc-800/40 text-[10px]">
              <span className="text-zinc-500 font-semibold">خطوط الإشارة:</span>
              <span className="text-amber-400 font-mono font-bold">
                Entry {signal.entryPrice}
              </span>
              {signal.tp1 && (
                <span className="text-emerald-400 font-mono">TP1 {signal.tp1}</span>
              )}
              {signal.tp2 && (
                <span className="text-emerald-400 font-mono">TP2 {signal.tp2}</span>
              )}
              {signal.stopLoss && (
                <span className="text-red-400 font-mono font-bold">SL {signal.stopLoss}</span>
              )}
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  signal.type === 'BUY'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {signal.type}
              </span>
            </div>
          )}

          {/* Chart container */}
          <div
            ref={containerRef}
            style={{ height: chartHeight }}
            className="w-full transition-[height] duration-200"
          />
        </>
      )}
    </div>
  );
};
