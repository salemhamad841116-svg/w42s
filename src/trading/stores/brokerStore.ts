import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type BrokerType = 'DEMO_SANDBOX' | 'MT5_DEMO' | 'MT5_LIVE' | 'BINANCE_TESTNET' | 'BINANCE_LIVE';

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface MT5Credentials {
  login: string;
  server: string;
  password?: string;
  metaApiToken?: string;
  accountId?: string;
  isLive?: boolean;
  environment?: 'live' | 'demo';
}

export interface MT5AccountInfo {
  login: string;
  server: string;
  balance: number;
  equity: number;
  freeMargin: number;
  margin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
  name: string;
  status: ConnectionStatus;
  isLive?: boolean;
  lastSyncTime?: number;
  error?: string;
}

export interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
  network: 'spot' | 'futures';
  isLive?: boolean;
  environment?: 'live' | 'testnet';
}

export interface BinanceAccountInfo {
  network: 'spot' | 'futures';
  balanceUSDT: number;
  availableUSDT: number;
  totalWalletBalance: number;
  status: ConnectionStatus;
  isLive?: boolean;
  lastSyncTime?: number;
  error?: string;
}

export interface BrokerExecutionLog {
  id: string;
  timestamp: number;
  broker: BrokerType;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: string;
  volume: number;
  requestedPrice?: number;
  executedPrice?: number;
  status: 'SUCCESS' | 'REJECTED' | 'PENDING';
  ticketId?: string;
  latencyMs?: number;
  message?: string;
  rawResponse?: any;
}

interface BrokerState {
  activeBroker: BrokerType;
  mt5Credentials: MT5Credentials;
  mt5Account: MT5AccountInfo;
  binanceCredentials: BinanceCredentials;
  binanceAccount: BinanceAccountInfo;
  executionLogs: BrokerExecutionLog[];
  isModalOpen: boolean;

  setActiveBroker: (broker: BrokerType) => void;
  setMT5Credentials: (creds: Partial<MT5Credentials>) => void;
  setMT5Account: (info: Partial<MT5AccountInfo>) => void;
  setBinanceCredentials: (creds: Partial<BinanceCredentials>) => void;
  setBinanceAccount: (info: Partial<BinanceAccountInfo>) => void;
  addExecutionLog: (log: BrokerExecutionLog) => void;
  clearExecutionLogs: () => void;
  setIsModalOpen: (open: boolean) => void;
  fetchLiveAccountData: () => Promise<void>;
}

const STORAGE_KEY_MT5 = 'broker_mt5_credentials';
const STORAGE_KEY_BINANCE = 'broker_binance_credentials';
const STORAGE_KEY_ACTIVE = 'broker_active_type';

const loadSavedMT5 = (): MT5Credentials => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MT5);
    return raw ? JSON.parse(raw) : { login: '', server: '', isLive: true, environment: 'live' };
  } catch {
    return { login: '', server: '', isLive: true, environment: 'live' };
  }
};

const loadSavedBinance = (): BinanceCredentials => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BINANCE);
    return raw ? JSON.parse(raw) : { apiKey: '', apiSecret: '', network: 'futures', isLive: true, environment: 'live' };
  } catch {
    return { apiKey: '', apiSecret: '', network: 'futures', isLive: true, environment: 'live' };
  }
};

const loadSavedActive = (): BrokerType => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
    return (raw as BrokerType) || 'MT5_LIVE';
  } catch {
    return 'MT5_LIVE';
  }
};

export const useBrokerStore = create<BrokerState>()(
  immer((set, get) => ({
    activeBroker: loadSavedActive(),
    isModalOpen: false,

    mt5Credentials: loadSavedMT5(),
    mt5Account: {
      login: '',
      server: '',
      balance: 0,
      equity: 0,
      freeMargin: 0,
      margin: 0,
      marginLevel: 0,
      currency: 'USD',
      leverage: 100,
      name: '',
      status: 'DISCONNECTED',
      isLive: true,
    },

    binanceCredentials: loadSavedBinance(),
    binanceAccount: {
      network: 'futures',
      balanceUSDT: 0,
      availableUSDT: 0,
      totalWalletBalance: 0,
      status: 'DISCONNECTED',
      isLive: true,
    },

    executionLogs: [],

    setActiveBroker: (broker) =>
      set((state) => {
        state.activeBroker = broker;
        try {
          localStorage.setItem(STORAGE_KEY_ACTIVE, broker);
        } catch {}
      }),

    setMT5Credentials: (creds) =>
      set((state) => {
        Object.assign(state.mt5Credentials, creds);
        try {
          localStorage.setItem(STORAGE_KEY_MT5, JSON.stringify(state.mt5Credentials));
        } catch {}
      }),

    setMT5Account: (info) =>
      set((state) => {
        Object.assign(state.mt5Account, info);
      }),

    setBinanceCredentials: (creds) =>
      set((state) => {
        Object.assign(state.binanceCredentials, creds);
        try {
          localStorage.setItem(STORAGE_KEY_BINANCE, JSON.stringify(state.binanceCredentials));
        } catch {}
      }),

    setBinanceAccount: (info) =>
      set((state) => {
        Object.assign(state.binanceAccount, info);
      }),

    addExecutionLog: (log) =>
      set((state) => {
        state.executionLogs.unshift(log);
        if (state.executionLogs.length > 50) {
          state.executionLogs.pop();
        }
      }),

    clearExecutionLogs: () =>
      set((state) => {
        state.executionLogs = [];
      }),

    setIsModalOpen: (open) =>
      set((state) => {
        state.isModalOpen = open;
      }),

    /**
     * Fetches live account data from the backend broker endpoint.
     * Populates MT5 and Binance account state with real balances.
     */
    fetchLiveAccountData: async () => {
      const store = get();

      // Set both to CONNECTING while fetching
      store.setMT5Account({ status: 'CONNECTING', error: undefined });
      store.setBinanceAccount({ status: 'CONNECTING', error: undefined });

      try {
        const res = await fetch('/api/broker/account?broker=all');
        if (!res.ok) {
          throw new Error(`Backend returned HTTP ${res.status}`);
        }
        const data = await res.json();

        // Populate MT5 account from live MetaApi data
        if (data.mt5 && (data.mt5.status === 'CONNECTED' || data.mt5.balance !== undefined)) {
          store.setMT5Account({
            login: data.mt5.login || '',
            server: data.mt5.server || '',
            balance: data.mt5.balance ?? 0,
            equity: data.mt5.equity ?? 0,
            freeMargin: data.mt5.freeMargin ?? 0,
            margin: data.mt5.margin ?? 0,
            currency: data.mt5.currency || 'USD',
            leverage: data.mt5.leverage || 100,
            name: data.mt5.name || 'Live MT5 Account',
            status: 'CONNECTED',
            isLive: true,
            lastSyncTime: Date.now(),
          });
        } else {
          store.setMT5Account({
            status: 'DISCONNECTED',
            error: data.mt5?.error || 'MT5 credentials not configured on server',
          });
        }

        // Populate Binance account from live data
        if (data.binance && (data.binance.status === 'CONNECTED' || data.binance.balanceUSDT !== undefined)) {
          store.setBinanceAccount({
            balanceUSDT: data.binance.balanceUSDT ?? 0,
            availableUSDT: data.binance.availableUSDT ?? 0,
            totalWalletBalance: data.binance.totalWalletBalance ?? 0,
            status: 'CONNECTED',
            isLive: true,
            lastSyncTime: Date.now(),
          });
        } else {
          store.setBinanceAccount({
            status: data.binance?.status === 'ERROR' ? 'ERROR' : 'DISCONNECTED',
            error: data.binance?.error || 'Binance credentials not configured on server',
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch live account data:', err);
        store.setMT5Account({
          status: 'ERROR',
          error: err.message || 'Network error fetching account data',
        });
        store.setBinanceAccount({
          status: 'ERROR',
          error: err.message || 'Network error fetching account data',
        });
      }
    },
  }))
);
