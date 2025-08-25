// Centralized localStorage key definitions
// Update here once to reflect across the app

export const STORAGE_KEYS = {
  CURRENT_SUPERMARKET_ID: 'current_supermarket_id',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];