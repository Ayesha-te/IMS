// Centralized localStorage key definitions
// Update here once to reflect across the app

export const STORAGE_KEYS = {
  CURRENT_SUPERMARKET_ID: 'current_supermarket_id',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  CURRENCY_OPTIONS: 'currency_options', // persisted user-defined currency list
  CATEGORY_OPTIONS: 'category_options', // persisted user-defined category list
  SUPPLIER_OPTIONS: 'supplier_options', // persisted user-defined supplier list
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];