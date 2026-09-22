export type SignalType = 'BUY' | 'SELL';

export type SignalStatus = 
  | 'new'            // جديدة
  | 'active'         // فعالة
  | 'tp1_hit'        // حققت الهدف الأول
  | 'tp2_hit'        // حققت الهدف الثاني
  | 'all_tps_hit'    // حققت جميع الأهداف
  | 'sl_hit'         // أغلقت على وقف الخسارة
  | 'cancelled';     // ملغاة

export interface SignalUpdate {
  id: string;
  timestamp: string;
  messageEn: string;
  messageAr: string;
  type: 'info' | 'tp1' | 'tp2' | 'tp3' | 'sl' | 'entry' | 'alert';
}

export type SubscriptionTier = 'free' | 'silver' | 'gold' | 'vip';

export type SignalTrend = 'bullish' | 'bearish' | 'sideways';

// Market Data Provider Configuration
export type MarketDataProviderType = 'MT5_BRIDGE' | 'TRADINGVIEW_WEBHOOK' | 'BINANCE_API' | 'OANDA_API' | 'TWELVEDATA_API';

export interface MarketDataProviderConfig {
  id: MarketDataProviderType;
  nameAr: string;
  nameEn: string;
  providerType: 'BROKER_API' | 'WEBHOOK' | 'REST_WEBSOCKET';
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
  latencyMs: number;
  apiKey: string;
  apiSecret: string;
  serverUrl: string;
  accountNumber: string;
  symbolsCount: number;
  lastTickTime: string;
  isPrimary: boolean;
}

// Backtesting Engine Types
export interface BacktestConfig {
  strategyId: string;
  pair: string;
  timeframe: string;
  periodDays: number; // e.g. 30, 90, 365
  initialBalance: number; // e.g. 10000
  riskPerTradePercent: number; // e.g. 2%
}

export interface BacktestTrade {
  id: string;
  type: SignalType;
  entryPrice: number;
  exitPrice: number;
  tpPrice: number;
  slPrice: number;
  pips: number;
  profitUsd: number;
  outcome: 'WIN_TP1' | 'WIN_TP2' | 'WIN_TP3' | 'LOSS_SL';
  openTime: string;
  closeTime: string;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  strategyName: string;
  pair: string;
  timeframe: string;
  periodDays: number;
  winRate: number; // e.g. 82.4%
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfitLossPips: number;
  totalProfitLossUsd: number;
  profitFactor: number; // e.g. 2.15
  maxDrawdownPercent: number; // e.g. 5.2%
  averageWinPips: number;
  averageLossPips: number;
  tradesHistory: BacktestTrade[];
  equityCurve: { date: string; balance: number }[];
  executedAt: string;
}

// Paper Trading Account Types
export interface PaperAccount {
  enabled: boolean;
  autoForwardTestNewSignals: boolean;
  balance: number; // e.g. 100000
  equity: number;
  marginUsed: number;
  freeMargin: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
}

export interface PaperTrade {
  id: string;
  signalId: string;
  pair: string;
  type: SignalType;
  strategyName: string;
  entryPrice: number;
  currentPrice: number;
  tp1: number;
  tp2: number;
  tp3: number;
  stopLoss: number;
  pnlPips: number;
  pnlUsd: number;
  status: 'OPEN' | 'TP1_HIT' | 'TP2_HIT' | 'ALL_TPS_HIT' | 'SL_HIT' | 'CLOSED';
  openedAt: string;
  updatedAt: string;
  closedAt?: string;
}

// Market Sectors Control
export type MarketCategoryType = 'forex' | 'gold' | 'commodities' | 'indices' | 'crypto';

export interface MarketSectorConfig {
  id: MarketCategoryType;
  nameAr: string;
  nameEn: string;
  icon: string;
  enabled: boolean;
  supportedPairs: string[];
  signalsTodayCount: number;
}

// Full Signal Audit Trail
export interface SignalAuditRecord {
  strategyId: string;
  strategyName: string;
  marketProvider: string;
  indicatorsUsed: Record<string, string | number>;
  confidenceScore: number;
  detectionTime: string;
  dispatchTime: string;
  closeTime?: string;
  finalOutcome?: string;
  chartSnapshotUrl: string;
  creationReasonAr: string;
  creationReasonEn: string;
}

export interface ForexSignal {
  id: string;
  pair: string;              // e.g. "EUR/USD", "XAU/USD"
  type: SignalType;          // "BUY" | "SELL"
  entryPrice: number;
  tp1: number;
  tp2: number;
  tp3: number;
  stopLoss: number;
  riskRatio?: string;        // e.g. "1:2" or "1%"
  analyst: string;           // Analyst name
  notesEn?: string;
  notesAr?: string;
  status: SignalStatus;
  trend?: SignalTrend;       // اتجاه الإشارة: صاعد / هابط / جانبي
  trendStrength?: number;    // قوة الاتجاه (e.g. 85%)
  trendTimeframe?: string;   // إطار اتجاه السعر (e.g. "4H")
  openTime: string;          // ISO string or formatted date
  closeTime?: string;        // Optional close time
  imageUrl?: string;         // Optional chart image URL
  updates: SignalUpdate[];
  createdAt: string;
  updatedAt: string;
  pipsResult?: number;       // e.g. +45 or -30 pips
  isArchived?: boolean;
  marketCategory?: MarketCategoryType;
  auditRecord?: SignalAuditRecord;
  preventDuplicateUntilClose?: boolean;
  requiredTier?: SubscriptionTier;
}

export interface PriceAlert {
  id: string;
  pair: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  note?: string;
  isTriggered: boolean;
  createdAt: string;
  triggeredAt?: string;
  enabled: boolean;
}

export interface PairConfig {
  symbol: string;            // e.g. "EUR/USD"
  baseCurrency: string;      // "EUR"
  quoteCurrency: string;     // "USD"
  flags: [string, string];   // ["🇪🇺", "🇺🇸"]
  decimals: number;          // 4 or 2 or 5
  category: 'forex' | 'commodities' | 'crypto' | 'indices';
  currentPrice: number;
  change24h: number;
}

export interface AppNotification {
  id: string;
  signalId: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  timestamp: string;
  read: boolean;
  type: 'new_signal' | 'update' | 'tp_hit' | 'sl_hit' | 'price_alert';
}

export type Language = 'ar' | 'en';

// Admin Roles & Permissions
export type AdminRole = 'super_admin' | 'admin' | 'analyst' | 'moderator';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  twoFactorEnabled: boolean;
  lastLogin: string;
  ipAddress: string;
  permissions: string[];
}

// User Device Info (حساب ومعلومات الجهاز)
export interface UserDevice {
  id: string;
  manufacturer: string;      // e.g. "Apple", "Samsung", "Xiaomi", "Google"
  model: string;             // e.g. "iPhone 16 Pro Max", "Galaxy S24 Ultra", "Pixel 9"
  osName: 'iOS' | 'Android' | 'Web' | 'macOS' | 'Windows';
  osVersion: string;         // e.g. "iOS 18.2", "Android 15"
  appVersion: string;        // e.g. "2.4.1"
  installationId: string;    // e.g. "inst_8f92a4b1"
  ipAddress: string;
  country: string;
  city?: string;
  language: string;
  timezone: string;
  firstLogin: string;
  lastActive: string;
  isCurrent: boolean;
  isBlocked: boolean;
  adminNotes?: string;
}

// Screenshot Event (إحصائيات لقطات الشاشة)
export interface ScreenshotEvent {
  id: string;
  signalId: string;
  pair: string;
  signalType: 'BUY' | 'SELL';
  timestamp: string;
  userId: string;
  userName: string;
  appVersion: string;
  osName: string;
  deviceModel: string;
}

// Comprehensive User Profile
export interface AppUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  registrationDate: string;
  lastLogin: string;
  lastActive: string;
  isOnline: boolean;
  subscriptionTier: SubscriptionTier;
  accountStatus: 'active' | 'banned' | 'suspended';
  country: string;
  countryFlag: string;
  city?: string;
  language: 'ar' | 'en';
  appVersion: string;
  totalSessionTimeMinutes: number;
  totalAppVisits: number;
  
  // Asset Interest Percentages (نسبة اهتمامه بكل أصل)
  interests: {
    pairOrAsset: string;
    percentage: number;
    category?: string;
  }[];

  // User Activity Stats
  activityStats: {
    signalsOpenedCount: number;
    signalsSavedCount: number;
    signalsSharedCount: number;
    signalsViewedCount: number;
    screenshotsCount: number;
  };

  // Saved / Favorite Signal IDs
  favoriteSignalIds: string[];
  openedSignalIds: string[];

  // Price Alerts set by this user
  priceAlerts: PriceAlert[];

  // Devices linked to this user
  devices: UserDevice[];

  // Screenshots taken by this user
  screenshots: ScreenshotEvent[];
}

// ==========================================
// AUTO SIGNAL ENGINE & STRATEGY PLUGIN TYPES
// ==========================================

export interface StrategyParamConfig {
  key: string;
  nameAr: string;
  nameEn: string;
  type: 'number' | 'select' | 'boolean';
  value: number | string | boolean;
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface StrategyPlugin {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  author: string;
  version: string;
  timeframe: string; // e.g. "15M", "1H", "4H"
  enabled: boolean;
  supportedPairs: string[];
  minConfidenceThreshold: number; // e.g. 80
  defaultRiskRatio: string; // e.g. "1:2.5"
  params: StrategyParamConfig[];
  performanceStats: {
    signalsGenerated: number;
    winRate: number; // percentage e.g. 88.5
    avgPipsGained: number;
    totalPips: number;
  };
}

export interface MarketTick {
  pair: string;
  price: number;
  timeframe: string;
  rsi14: number;
  ema20: number;
  ema50: number;
  macdHistogram: number;
  volumeSpikeRatio: number;
  trend: SignalTrend;
  timestamp: string;
}

export interface OpportunityCandidate {
  id: string;
  strategyId: string;
  strategyName: string;
  pair: string;
  timeframe: string;
  type: SignalType;
  proposedEntryPrice: number;
  proposedTp1: number;
  proposedTp2: number;
  proposedTp3: number;
  proposedStopLoss: number;
  calculatedRiskRatio: string;
  detectedAt: string;
  indicatorsBreakdown: Record<string, string | number>;
  rawConfidenceScore: number;
}

export interface QualityFilterConfig {
  minConfidenceScore: number; // e.g. 80
  requireMultiIndicatorConfirm: boolean;
  requireTrendAlignment: boolean;
  requireVolumeSpike: boolean;
  maxDailySignalsLimit: number;
  autoApproveAndDispatch: boolean; // if false, goes into admin queue
  blockedPairs: string[];
}

export interface QualityFilterEvaluation {
  passed: boolean;
  finalScore: number;
  breakdown: {
    indicatorConfirmScore: number; // max 35
    trendAlignmentScore: number;   // max 35
    volumeSpikeScore: number;      // max 15
    riskRewardScore: number;       // max 15
  };
  reasonAr: string;
  reasonEn: string;
}

export interface EngineAuditLog {
  id: string;
  opportunityId: string;
  strategyId: string;
  strategyName: string;
  pair: string;
  timeframe: string;
  type: SignalType;
  entryPrice: number;
  confidenceScore: number;
  passedQualityFilter: boolean;
  decisionStatus: 'DISPATCHED' | 'FILTERED_OUT' | 'PENDING_APPROVAL' | 'REJECTED_BY_ADMIN' | 'MANUAL_DISPATCH';
  detectedAt: string;
  decisionReasonAr: string;
  decisionReasonEn: string;
  indicatorsSummary: string;
  associatedSignalId?: string;
  resultOutcome?: 'ACTIVE' | 'TP1_HIT' | 'TP2_HIT' | 'ALL_TPS_HIT' | 'SL_HIT' | 'CANCELLED';
  pipsGained?: number;
}

export interface EngineSystemStatus {
  isRunning: boolean;
  statusMode: 'ONLINE_24_7' | 'PAUSED' | 'MAINTENANCE' | 'SIMULATION_ACTIVE';
  uptimeSeconds: number;
  ticksProcessedCount: number;
  lastMarketScanTime: string;
  nextScanInSeconds: number;
  activeStrategiesCount: number;
  totalGeneratedToday: number;
  totalDispatchedToday: number;
  totalFilteredToday: number;
  averageConfidenceToday: number;
  cpuUsagePercentage: number;
  memoryUsageMb: number;
}

// Signal Interactive Metrics (الإحصائيات المتقدمة لكل إشارة)
export interface SignalMetrics {
  signalId: string;
  viewsCount: number;
  opensCount: number;
  sharesCount: number;
  savesCount: number;
  favoritesCount: number;
  screenshotsCount: number;
  uniqueScreenshotUsersCount: number;
}

// Audit Log (سجل العمليات)
export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  action: 'CREATE_SIGNAL' | 'EDIT_SIGNAL' | 'DELETE_SIGNAL' | 'PAUSE_SIGNAL' | 'SCHEDULE_SIGNAL' | 'BLOCK_USER' | 'UNBLOCK_USER' | 'UPDATE_USER_ROLE' | 'LOGOUT_DEVICE' | 'SEND_NOTIF' | 'ADMIN_LOGIN' | 'ADMIN_LOGOUT' | 'CONFIG_CHANGE';
  target: string;
  details: string;
  timestamp: string;
  ip: string;
}

// Notification Campaign Management
export interface NotificationCampaign {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  targetGroup: 'all' | 'vip' | 'free' | 'pair_followers' | 'country' | 'language';
  targetValue?: string; // e.g. "EUR/USD" or "SA" or "ar"
  sentCount: number;
  openCount: number;
  openRate: number; // e.g. 78%
  status: 'sent' | 'scheduled' | 'draft';
  scheduledAt?: string;
  sentAt?: string;
}

// 🚨 Breaking News Center Types (نظام الأخبار العاجلة)
export type BreakingNewsCategory = 'breaking' | 'announcement' | 'economic' | 'warning' | 'update';
export type BreakingNewsPriority = 'urgent' | 'important' | 'normal'; // 🔴 عاجل جدًا | 🟠 مهم | 🔵 عادي
export type BreakingNewsAudience = 'all' | 'free' | 'silver' | 'gold' | 'vip' | 'custom';
export type BreakingNewsStatus = 'published' | 'draft' | 'archived';

export interface BreakingNewsAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface BreakingNewsItem {
  id: string;
  title: string;
  content: string;
  category: BreakingNewsCategory;
  cardColor: string; // e.g. 'red' | 'amber' | 'blue' | 'yellow' | 'emerald' | 'purple'
  icon: string; // e.g. 'AlertTriangle' | 'Bell' | 'TrendingUp' | 'AlertCircle' | 'CheckCircle2' | 'Flame' | 'Megaphone' | 'Radio'
  imageUrl?: string;
  attachments?: BreakingNewsAttachment[];
  priority: BreakingNewsPriority;
  audience: BreakingNewsAudience;
  targetCountry?: string;
  publishedAt?: string;
  scheduledAt?: string;
  expiresAt?: string;
  status: BreakingNewsStatus;
  pinned: boolean;
  soundAlert: boolean;
  viewersCount: number;
  dismissalsCount: number;
  readMoreClicksCount: number;
  publishedBy?: {
    id?: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BreakingNewsAuditLog {
  id: string;
  newsId: string;
  newsTitle: string;
  action: 'create' | 'update' | 'publish' | 'unpublish' | 'republish' | 'delete' | 'archive';
  performedBy: string;
  role: string;
  timestamp: string;
  details?: string;
}

