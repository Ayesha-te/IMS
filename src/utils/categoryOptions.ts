// Utility functions to persist and retrieve user-defined category options
// Mirrors currencyOptions behavior but for categories

import { STORAGE_KEYS } from '../constants/storageKeys';

const sanitize = (value: string): string => {
  const v = (value || '').trim();
  return v;
};

export const getSavedCategories = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORY_OPTIONS as string);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return Array.from(new Set(list.map(sanitize))).filter(Boolean);
  } catch {
    return [];
  }
};

export const saveCategory = (name: string): void => {
  const clean = sanitize(name);
  if (!clean) return;
  const list = getSavedCategories();
  if (!list.includes(clean)) {
    const updated = [...list, clean];
    localStorage.setItem(STORAGE_KEYS.CATEGORY_OPTIONS as string, JSON.stringify(updated));
  }
};