import Decimal from 'decimal.js';

export interface OrderValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateOrder(order: any): OrderValidationResult {
  const errors: string[] = [];

  if (!order.symbol) errors.push('Symbol is required');
  if (!order.side) errors.push('Side is required');
  if (!order.type) errors.push('Order type is required');

  if (order.type === 'LIMIT' && !validatePrice(order.price)) {
    errors.push('Valid price is required for LIMIT orders');
  }

  if (!validateAmount(order.amount)) {
    errors.push('Valid amount is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validatePrice(priceStr: string): boolean {
  try {
    if (!priceStr || priceStr.trim() === '') return false;
    const price = new Decimal(priceStr);
    return !price.isNaN() && price.isPositive() && !price.isZero();
  } catch {
    return false;
  }
}

export function validateAmount(amountStr: string, min?: number, max?: number): boolean {
  try {
    if (!amountStr || amountStr.trim() === '') return false;
    const amount = new Decimal(amountStr);
    if (amount.isNaN() || amount.isNegative() || amount.isZero()) return false;
    
    if (min !== undefined && amount.lessThan(min)) return false;
    if (max !== undefined && amount.greaterThan(max)) return false;

    return true;
  } catch {
    return false;
  }
}