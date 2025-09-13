// Utility functions to persist and retrieve user-defined currency options
// Uses centralized storage key from STORAGE_KEYS

import { STORAGE_KEYS } from '../constants/storageKeys';

const sanitize = (value: string): string => {
  // Trim and collapse spaces, uppercase common ISO-like codes
  const v = (value || '').trim();
  if (!v) return '';
  // If user enters like "usd" or "pkr", normalize to upper-case
  if (/^[a-z]{2,5}$/i.test(v)) return v.toUpperCase();
  return v; // keep as typed for complex currencies like "RM" or "Rs."
};

export const getSavedCurrencies = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENCY_OPTIONS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return Array.from(new Set(list.map(sanitize))).filter(Boolean);
  } catch {
    return [];
  }
};

export const saveCurrency = (code: string): void => {
  const clean = sanitize(code);
  if (!clean) return;
  const list = getSavedCurrencies();
  if (!list.includes(clean)) {
    const updated = [...list, clean];
    localStorage.setItem(STORAGE_KEYS.CURRENCY_OPTIONS, JSON.stringify(updated));
  }
};

// No default currency. If none saved, return empty string so UI prompts user to create/select.
export const getDefaultCurrency = (storeCurrency?: string): string => {
  const list = getSavedCurrencies();
  if (storeCurrency && sanitize(storeCurrency)) return sanitize(storeCurrency);
  if (list.length > 0) return list[list.length - 1]; // last used
  return '';
};