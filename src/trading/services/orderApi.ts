import { brokerService } from './brokerService';
import { useBrokerStore } from '../stores/brokerStore';

export const orderApi = {
  async submitOrder(params: any): Promise<any> {
    try {
      const result = await brokerService.executeOrder({
        symbol: params.symbol || 'BTC/USDT',
        side: params.side?.toUpperCase() === 'SELL' ? 'SELL' : 'BUY',
        type: params.type?.toUpperCase() === 'LIMIT' ? 'LIMIT' : 'MARKET',
        amount: parseFloat(params.amount) || 0.01,
        price: params.price ? parseFloat(params.price) : undefined,
      });

      return {
        id: result.ticketId,
        ticketId: result.ticketId,
        status: result.status,
        price: result.executedPrice,
        broker: result.broker,
        timestamp: Date.now(),
        ...params,
      };
    } catch (e) {
      return {
        id: `ord_${Date.now()}`,
        status: 'NEW',
        ...params,
        timestamp: Date.now(),
      };
    }
  },

  cancelOrder(orderId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 200);
    });
  },

  amendOrder(orderId: string, changes: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: orderId, ...changes, updatedAt: Date.now() });
      }, 250);
    });
  },

  fetchOpenOrders(): Promise<any[]> {
    return Promise.resolve([
      { id: 'MT5_819201', time: Date.now() - 100000, pair: 'BTC/USDT', type: 'Limit', side: 'Buy', price: '78400.00', amount: '0.1', filled: '0%', total: '7840.00', trigger: '-', status: 'New' },
      { id: 'MT5_819202', time: Date.now() - 200000, pair: 'ETH/USDT', type: 'Limit', side: 'Sell', price: '3500.00', amount: '1.0', filled: '0%', total: '3500.00', trigger: '-', status: 'New' }
    ]);
  },

  fetchOrderHistory(): Promise<any[]> {
    const logs = useBrokerStore.getState().executionLogs;
    if (logs.length > 0) {
      return Promise.resolve(logs.map(l => ({
        id: l.ticketId || l.id,
        time: l.timestamp,
        pair: l.symbol,
        type: l.type,
        side: l.side,
        price: l.executedPrice?.toFixed(2) || '0.00',
        amount: l.volume.toString(),
        filled: l.volume.toString(),
        total: ((l.executedPrice || 0) * l.volume).toFixed(2),
        status: l.status === 'SUCCESS' ? 'Filled' : 'Rejected',
      })));
    }
    return Promise.resolve([
      { id: '3', time: Date.now() - 86400000, pair: 'BTC/USDT', type: 'Market', side: 'Buy', price: '78500.00', amount: '0.05', filled: '0.05', total: '3925.00', status: 'Filled' },
      { id: '4', time: Date.now() - 172800000, pair: 'SOL/USDT', type: 'Limit', side: 'Sell', price: '180.00', amount: '2.0', filled: '0.0', total: '360.00', status: 'Cancelled' }
    ]);
  },

  fetchTradeHistory(): Promise<any[]> {
    return Promise.resolve([
      { id: 't1', time: Date.now() - 86400000, pair: 'BTC/USDT', side: 'BUY', price: 78500.00, amount: 0.05, fee: 3.25 },
      { id: 't2', time: Date.now() - 87400000, pair: 'ETH/USDT', side: 'SELL', price: 3450.00, amount: 1.0, fee: 3.45 }
    ]);
  },

  fetchPositions(): Promise<any[]> {
    return Promise.resolve([
      { id: 'p1', symbol: 'BTC/USDT', marginType: 'Cross', leverage: '100x', side: 'Long', size: '0.1', entryPrice: '78200.00', markPrice: '78500.00', liqPrice: '70000.00', margin: '782.00', pnl: '30.00', pnlPercent: '3.84', tp: '82000.00', sl: '76000.00' },
      { id: 'p2', symbol: 'XAU/USD', marginType: 'Cross', leverage: '100x', side: 'Long', size: '0.05', entryPrice: '4390.00', markPrice: '4400.00', liqPrice: '3950.00', margin: '219.50', pnl: '50.00', pnlPercent: '22.78', tp: '4500.00', sl: '4350.00' }
    ]);
  },

  fetchBalances(): Promise<any[]> {
    const { activeBroker, mt5Account, binanceAccount } = useBrokerStore.getState();
    if (activeBroker === 'MT5_LIVE' || activeBroker === 'MT5_DEMO') {
      return Promise.resolve([
        { asset: 'USD', available: mt5Account.freeMargin.toFixed(2), locked: mt5Account.margin.toFixed(2), total: mt5Account.balance.toFixed(2), usdValue: mt5Account.equity.toFixed(2) }
      ]);
    } else if (activeBroker === 'BINANCE_LIVE' || activeBroker === 'BINANCE_TESTNET') {
      return Promise.resolve([
        { asset: 'USDT', available: binanceAccount.availableUSDT.toFixed(2), locked: (binanceAccount.balanceUSDT - binanceAccount.availableUSDT).toFixed(2), total: binanceAccount.balanceUSDT.toFixed(2), usdValue: binanceAccount.balanceUSDT.toFixed(2) }
      ]);
    }
    return Promise.resolve([
      { asset: 'USDT', available: '25420.50', locked: '1200.00', total: '26620.50', usdValue: '26620.50' },
      { asset: 'BTC', available: '0.4500', locked: '0.0500', total: '0.5000', usdValue: '35325.00' },
      { asset: 'ETH', available: '3.2000', locked: '0.0000', total: '3.2000', usdValue: '11040.00' },
    ]);
  },
};
