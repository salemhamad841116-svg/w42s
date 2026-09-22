import Decimal from 'decimal.js';
import { PriceLevel } from '../types';

export function calculateFee(orderValue: number, isMaker: boolean): { fee: number; rate: number } {
  const rate = isMaker ? 0.0002 : 0.001;
  const val = new Decimal(orderValue);
  const fee = val.times(rate).toNumber();
  
  return { fee, rate };
}

export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  side: 'BUY' | 'SELL',
  maintenanceRate: number = 0.005
): number {
  if (!entryPrice || !leverage) return 0;
  
  const entry = new Decimal(entryPrice);
  const lev = new Decimal(leverage);
  const mr = new Decimal(maintenanceRate);
  
  if (side === 'BUY') {
    return entry.times(new Decimal(1).minus(new Decimal(1).div(lev)).plus(mr)).toNumber();
  } else {
    return entry.times(new Decimal(1).plus(new Decimal(1).div(lev)).minus(mr)).toNumber();
  }
}

export function estimateSlippage(orderAmount: number, orderbookLevels: PriceLevel[]): number {
  if (!orderAmount || !orderbookLevels || orderbookLevels.length === 0) return 0;
  
  const targetAmount = new Decimal(orderAmount);
  let accumulatedAmount = new Decimal(0);
  let totalCost = new Decimal(0);
  const bestPrice = new Decimal(orderbookLevels[0].price);

  for (const level of orderbookLevels) {
    const levelAmount = new Decimal(level.amount);
    const levelPrice = new Decimal(level.price);
    
    const remaining = targetAmount.minus(accumulatedAmount);
    if (remaining.lessThanOrEqualTo(0)) break;
    
    const takeAmount = Decimal.min(remaining, levelAmount);
    accumulatedAmount = accumulatedAmount.plus(takeAmount);
    totalCost = totalCost.plus(takeAmount.times(levelPrice));
  }

  if (accumulatedAmount.isZero()) return 0;

  const avgPrice = totalCost.div(accumulatedAmount);
  const slippage = avgPrice.minus(bestPrice).abs().div(bestPrice).times(100).toNumber();
  return slippage;
}

export function estimateOrderValue(priceStr: string | number, amountStr: string | number): number {
  try {
    const price = new Decimal(priceStr);
    const amount = new Decimal(amountStr);
    if (price.isNaN() || amount.isNaN()) return 0;
    return price.times(amount).toNumber();
  } catch {
    return 0;
  }
}