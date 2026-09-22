/**
 * OTC Data Provider
 * مزود بيانات OTC
 */

/**
 * Interface representing a single OHLCV candle.
 * واجهة تمثل شمعة يابانية واحدة
 */
export interface OHLCVCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Interface representing the result of fetching OTC data.
 * واجهة تمثل نتيجة جلب بيانات OTC
 */
export interface OTCDataResult {
  pair: string;
  timeframe: string;
  candles: OHLCVCandle[];
  timestamp: string;
  source: 'simulated' | 'iqoption_live';
}

// List of supported OTC pairs with their base prices (realistic values)
// قائمة أزواج OTC المدعومة بأسعارها الأساسية
const SUPPORTED_PAIRS = [
  { id: 'EURUSD-OTC', name: 'EUR/USD OTC', basePrice: 1.0850 },
  { id: 'GBPUSD-OTC', name: 'GBP/USD OTC', basePrice: 1.2650 },
  { id: 'USDJPY-OTC', name: 'USD/JPY OTC', basePrice: 150.20 },
  { id: 'AUDUSD-OTC', name: 'AUD/USD OTC', basePrice: 0.6540 },
  { id: 'EURGBP-OTC', name: 'EUR/GBP OTC', basePrice: 0.8570 },
  { id: 'USDCHF-OTC', name: 'USD/CHF OTC', basePrice: 0.8820 },
];

/**
 * Retrieves the list of supported OTC pairs.
 * استرجاع قائمة أزواج OTC المدعومة
 * 
 * @returns Array of supported pairs / مصفوفة من الأزواج المدعومة
 */
export function getSupportedPairs(): { id: string; name: string; basePrice: number }[] {
  return SUPPORTED_PAIRS;
}

/**
 * Generates realistic simulated OHLCV candles for a given pair.
 * يولد شموع يابانية واقعية محاكاة لزوج معين
 * 
 * @param pair The trading pair ID / معرف زوج التداول
 * @param count The number of candles to generate / عدد الشموع المراد توليدها
 * @returns OTCDataResult containing generated candles / نتيجة تحتوي على الشموع المولدة
 */
export function fetchOTCCandles(pair: string, count: number = 5): OTCDataResult {
  const pairInfo = SUPPORTED_PAIRS.find(p => p.id === pair);
  const basePrice = pairInfo ? pairInfo.basePrice : 1.0000;
  
  const candles: OHLCVCandle[] = [];
  const now = Date.now();
  // 1-minute interval (60,000 ms)
  const interval = 60000;
  
  let currentPrice = basePrice;
  
  // Generate candles backwards / توليد الشموع بشكل عكسي
  for (let i = count - 1; i >= 0; i--) {
    // Random fluctuation between -0.0010 and +0.0010
    const change = (Math.random() - 0.5) * 0.0020;
    const open = currentPrice;
    const close = open + change;
    
    // Determine high and low / تحديد أعلى وأدنى سعر
    const volatility = Math.abs(change) + (Math.random() * 0.0005);
    const high = Math.max(open, close) + volatility / 2;
    const low = Math.min(open, close) - volatility / 2;
    
    // Random volume between 100 and 500 / حجم تداول عشوائي
    const volume = Math.floor(Math.random() * 401) + 100;
    
    candles.unshift({
      time: now - (i * interval),
      open,
      high,
      low,
      close,
      volume
    });
    
    // Advance current price for the next (older) iteration setup if we were going forward,
    // but since we go backwards, this just ensures a chain.
    currentPrice = close;
  }
  
  return {
    pair,
    timeframe: '1m',
    candles,
    timestamp: new Date().toISOString(),
    source: 'simulated'
  };
}
