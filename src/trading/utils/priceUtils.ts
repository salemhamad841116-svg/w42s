import Decimal from 'decimal.js';

export function formatPrice(price: number, precision?: number): string {
  if (isNaN(price)) return '0.00';
  const dec = new Decimal(price);
  if (precision !== undefined) {
    return dec.toDP(precision, Decimal.ROUND_HALF_UP).toNumber().toLocaleString('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  }
  return price.toLocaleString('en-US');
}

export function formatVolume(volume: number): string {
  if (isNaN(volume)) return '0';
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toFixed(2);
}

export function formatPercentage(value: number): string {
  if (isNaN(value)) return '0.00%';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatCompactNumber(num: number): string {
  return Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(num);
}

export function getPricePrecision(symbol: string): number {
  if (symbol.includes('USDT')) return 2;
  if (symbol.includes('BTC')) return 8;
  return 4;
}

export function getTickSize(symbol: string): number {
  if (symbol.includes('USDT')) return 0.01;
  if (symbol.includes('BTC')) return 0.00000001;
  return 0.0001;
}