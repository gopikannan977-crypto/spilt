import { CurrencyCode } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
};

/**
 * Formats minor units (e.g., paise or cents) into a clean localized currency string.
 * Uses font-safe tabular styling.
 */
export function formatCurrency(
  amountMinor: number,
  currency: CurrencyCode = 'INR',
  includeSymbol: boolean = true
): string {
  const isNegative = amountMinor < 0;
  const absAmount = Math.abs(amountMinor) / 100;
  const formattedNumber = absAmount.toLocaleString('en-IN', {
    minimumFractionDigits: absAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  const symbol = includeSymbol ? (CURRENCY_SYMBOLS[currency] || '₹') : '';
  if (isNegative) {
    return `-${symbol}${formattedNumber}`;
  }
  return `${symbol}${formattedNumber}`;
}

/**
 * Formats a net balance with explicit '+' sign for positive figures.
 */
export function formatNetBalance(
  amountMinor: number,
  currency: CurrencyCode = 'INR'
): { text: string; isPositive: boolean; isZero: boolean } {
  if (Math.abs(amountMinor) < 1) {
    return { text: `${CURRENCY_SYMBOLS[currency]}0`, isPositive: true, isZero: true };
  }
  const isPositive = amountMinor > 0;
  const absFormatted = (Math.abs(amountMinor) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: (Math.abs(amountMinor) / 100) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const text = isPositive ? `+${symbol}${absFormatted}` : `-${symbol}${absFormatted}`;
  return { text, isPositive, isZero: false };
}

/**
 * Safely parses user input (e.g. "1200" or "1200.50") into integer minor units (e.g. 120000 or 120050).
 * Avoids IEEE 754 floating point arithmetic surprises.
 */
export function toMinorUnits(amount: number | string): number {
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return Math.round(num * 100);
  }
  return Math.round(amount * 100);
}

/**
 * Converts minor units back to standard decimal float for input fields.
 */
export function toMajorUnits(amountMinor: number): number {
  return amountMinor / 100;
}
