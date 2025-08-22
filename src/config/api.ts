/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Environment-based configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Base URLs
export const API_CONFIG = {
  // Production backend URL
  PRODUCTION_BASE_URL: 'https://inventory-backend-pfr3.onrender.com',
  
  // Development backend URL
  DEVELOPMENT_BASE_URL: 'http://127.0.0.1:8000',
  
  // Current base URL based on environment
  BASE_URL: isProduction 
    ? 'https://inventory-backend-pfr3.onrender.com'
    : 'https://inventory-backend-pfr3.onrender.com', // Always use production for now
  
  // API version
  VERSION: 'v1',
  
  // Request timeout (in milliseconds)
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/accounts/login/',
    REGISTER: '/api/accounts/register/',
    REFRESH: '/api/auth/token/refresh/',
    VERIFY: '/api/auth/token/verify/',
    PROFILE: '/api/accounts/profile/',
    CHANGE_PASSWORD: '/api/accounts/change-password/',
    LOGOUT: '/api/accounts/logout/',
  },
  
  // Inventory Management
  INVENTORY: {
    // Products
    PRODUCTS: '/api/inventory/products/',
    PRODUCT_DETAIL: (id: string) => `/api/inventory/products/${id}/`,
    PRODUCT_STATS: '/api/inventory/products/stats/',
    SEARCH_BY_BARCODE: (barcode: string) => `/api/inventory/products/barcode/${barcode}/`,
    BULK_UPDATE: '/api/inventory/products/bulk-update/',
    
    // Categories
    CATEGORIES: '/api/inventory/categories/',
    CATEGORY_DETAIL: (id: number) => `/api/inventory/categories/${id}/`,
    
    // Suppliers
    SUPPLIERS: '/api/inventory/suppliers/',
    SUPPLIER_DETAIL: (id: number) => `/api/inventory/suppliers/${id}/`,
    
    // Stock Management
    STOCK_MOVEMENTS: '/api/inventory/stock-movements/',
    STOCK_UPDATE: (productId: string) => `/api/inventory/products/${productId}/stock/`,
    
    // Alerts
    ALERTS: '/api/inventory/alerts/',
    MARK_ALERT_READ: (alertId: number) => `/api/inventory/alerts/${alertId}/read/`,
    RESOLVE_ALERT: (alertId: number) => `/api/inventory/alerts/${alertId}/resolve/`,
    
    // Reviews
    REVIEWS: '/api/inventory/reviews/',
  },
  
  // Barcode & Ticket System
  BARCODE: {
    GENERATE_BARCODE: (productId: string) => `/api/inventory/products/${productId}/barcode/`,
    PRODUCT_TICKET: (productId: string) => `/api/inventory/products/${productId}/ticket/`,
    REGENERATE_BARCODE: (productId: string) => `/api/inventory/products/${productId}/generate-barcode/`,
    BULK_TICKETS: '/api/inventory/products/bulk-tickets/',
    BULK_BARCODES: '/api/inventory/products/bulk-barcodes/',
  },
  
  // Supermarket Management
  SUPERMARKETS: {
    LIST_CREATE: '/api/supermarkets/',
    DETAIL: (id: string) => `/api/supermarkets/${id}/`,
    STATS: '/api/supermarkets/stats/',
    STAFF: (supermarketId: string) => `/api/supermarkets/${supermarketId}/staff/`,
    SETTINGS: (supermarketId: string) => `/api/supermarkets/${supermarketId}/settings/`,
  },
  
  // Notifications
  NOTIFICATIONS: '/api/notifications/',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Request Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN: 'An unknown error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Account created successfully!',
  PRODUCT_CREATED: 'Product created successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  BARCODE_GENERATED: 'Barcode generated successfully!',
  TICKET_DOWNLOADED: 'Ticket downloaded successfully!',
};

// Feature Flags
export const FEATURES = {
  ENABLE_BARCODE_GENERATION: true,
  ENABLE_BULK_OPERATIONS: true,
  ENABLE_QR_CODES: true,
  ENABLE_ANALYTICS: true,
  ENABLE_POS_SYNC: false, // Disabled for now
  ENABLE_FILE_UPLOAD: true,
  ENABLE_IMAGE_PROCESSING: true,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
};

export default {
  API_CONFIG,
  ENDPOINTS,
  HTTP_STATUS,
  DEFAULT_HEADERS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  PAGINATION,
  FILE_UPLOAD,
};