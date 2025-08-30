/**
 * Comprehensive API service for the Inventory Management System
 * Integrates with backend at https://inventory-backend-pfr3.onrender.com/
 */

import { API_CONFIG, ENDPOINTS, HTTP_STATUS, DEFAULT_HEADERS, ERROR_MESSAGES } from '../config/api';

const BASE_URL = API_CONFIG.BASE_URL;

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    TOKEN: `${BASE_URL}/api/auth/token/`,
    TOKEN_REFRESH: `${BASE_URL}/api/auth/token/refresh/`,
    TOKEN_VERIFY: `${BASE_URL}/api/auth/token/verify/`,
  },
  
  // Accounts
  ACCOUNTS: {
    REGISTER: `${BASE_URL}/api/accounts/register/`,
    LOGIN: `${BASE_URL}/api/accounts/login/`, // Use custom login endpoint
    PROFILE: `${BASE_URL}/api/accounts/profile/`,
    CHANGE_PASSWORD: `${BASE_URL}/api/accounts/change-password/`,
    VERIFY_EMAIL: (token: string) => `${BASE_URL}/api/accounts/verify-email/${token}/`,
    RESEND_VERIFICATION: `${BASE_URL}/api/accounts/resend-verification/`,
    PASSWORD_RESET: `${BASE_URL}/api/accounts/password-reset/`,
    PASSWORD_RESET_CONFIRM: `${BASE_URL}/api/accounts/password-reset-confirm/`,
    SESSIONS: `${BASE_URL}/api/accounts/sessions/`,
    LOGOUT_SESSION: (sessionId: number) => `${BASE_URL}/api/accounts/logout-session/${sessionId}/`,
    LOGOUT_ALL: `${BASE_URL}/api/accounts/logout-all/`,
  },
  
  // Inventory
  INVENTORY: {
    // Categories
    CATEGORIES: `${BASE_URL}/api/inventory/categories/`,
    CATEGORY_DETAIL: (id: number) => `${BASE_URL}/api/inventory/categories/${id}/`,
    
    // Suppliers
    SUPPLIERS: `${BASE_URL}/api/inventory/suppliers/`,
    SUPPLIER_DETAIL: (id: number) => `${BASE_URL}/api/inventory/suppliers/${id}/`,
    
    // Products
    PRODUCTS: `${BASE_URL}/api/inventory/products/`,
    PRODUCT_DETAIL: (id: string) => `${BASE_URL}/api/inventory/products/${id}/`,
    PRODUCT_STOCK_UPDATE: (id: string) => `${BASE_URL}/api/inventory/products/${id}/stock/`,
    BULK_PRODUCT_UPDATE: `${BASE_URL}/api/inventory/products/bulk-update/`,
    PRODUCT_STATS: `${BASE_URL}/api/inventory/products/stats/`,
    SEARCH_BY_BARCODE: (barcode: string) => `${BASE_URL}/api/inventory/products/barcode/${barcode}/`,
    
    // Stock Movements
    STOCK_MOVEMENTS: `${BASE_URL}/api/inventory/stock-movements/`,
    
    // Alerts
    ALERTS: `${BASE_URL}/api/inventory/alerts/`,
    MARK_ALERT_READ: (alertId: number) => `${BASE_URL}/api/inventory/alerts/${alertId}/read/`,
    RESOLVE_ALERT: (alertId: number) => `${BASE_URL}/api/inventory/alerts/${alertId}/resolve/`,
    
    // Reviews
    REVIEWS: `${BASE_URL}/api/inventory/reviews/`,
    
    // Barcode and Ticket Generation
    PRODUCT_BARCODE: (productId: string) => `${BASE_URL}/api/inventory/products/${productId}/barcode/`,
    PRODUCT_TICKET: (productId: string) => `${BASE_URL}/api/inventory/products/${productId}/ticket/`,
    GENERATE_BARCODE: (productId: string) => `${BASE_URL}/api/inventory/products/${productId}/generate-barcode/`,
    BULK_TICKETS: `${BASE_URL}/api/inventory/products/bulk-tickets/`,
    BULK_BARCODES: `${BASE_URL}/api/inventory/products/bulk-barcodes/`,
  },
  
  // Supermarkets
  SUPERMARKETS: {
    LIST_CREATE: `${BASE_URL}/api/supermarkets/`,
    DETAIL: (id: string) => `${BASE_URL}/api/supermarkets/${id}/`,
    STATS: `${BASE_URL}/api/supermarkets/stats/`,
    STAFF: (supermarketId: string) => `${BASE_URL}/api/supermarkets/${supermarketId}/staff/`,
    SETTINGS: (supermarketId: string) => `${BASE_URL}/api/supermarkets/${supermarketId}/settings/`,
  },
  
  // Notifications
  NOTIFICATIONS: `${BASE_URL}/api/notifications/`,

  // Purchasing (Suppliers, Supplier-Product mapping, Purchase Orders)
  PURCHASING: {
    // Supplier-Product relations and pricing
    SUPPLIER_PRODUCTS: `${BASE_URL}/api/purchasing/supplier-products/`,
    SUPPLIER_PRODUCT_DETAIL: (id: number) => `${BASE_URL}/api/purchasing/supplier-products/${id}/`,
    BEST_SUPPLIER: (productId: string, quantity: number) => `${BASE_URL}/api/purchasing/best-supplier/?product=${productId}&qty=${quantity}`,

    // Purchase Orders
    PURCHASE_ORDERS: `${BASE_URL}/api/purchasing/purchase-orders/`,
    PURCHASE_ORDER_DETAIL: (id: number) => `${BASE_URL}/api/purchasing/purchase-orders/${id}/`,
    PURCHASE_ORDER_RECEIVE: (id: number) => `${BASE_URL}/api/purchasing/purchase-orders/${id}/receive/`,
    PURCHASE_ORDER_PDF: (id: number) => `${BASE_URL}/api/purchasing/purchase-orders/${id}/pdf/`,
    PURCHASE_ORDER_EMAIL: (id: number) => `${BASE_URL}/api/purchasing/purchase-orders/${id}/email/`,
    PURCHASE_ORDER_STATS: `${BASE_URL}/api/purchasing/purchase-orders/stats/`,
  },
};

// HTTP methods helper
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Request configuration
interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  token?: string;
  useAuth?: boolean; // when false, do not attach any Authorization header
}

// Generic API request function
export const apiRequest = async (url: string, config: RequestConfig = {}) => {
  const {
    method = 'GET',
    headers = {},
    body,
    token,
    useAuth = true,
  } = config;

  // Prefer explicit token, otherwise fall back to stored token, unless useAuth is false
  const effectiveToken = useAuth ? (token || AuthService.getToken() || undefined) : undefined;

  const buildHeaders = (authToken?: string): Record<string, string> => {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (useAuth && authToken) {
      h['Authorization'] = `Bearer ${authToken}`;
    }
    return h;
  };

  const buildRequest = (authToken?: string): RequestInit => {
    const requestConfig: RequestInit = {
      method,
      headers: buildHeaders(authToken),
    };
    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }
    return requestConfig;
  };

  const parseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');

    // Helper to flatten DRF-style error objects into readable strings
    const formatError = (data: any): string => {
      if (!data) return `HTTP error! status: ${response.status}`;

      // String/array straight from server
      if (typeof data === 'string') return data;
      if (Array.isArray(data)) return data.join(', ');

      // Common fields first
      const primary = (data.message || data.detail || data.error);
      const nonField = Array.isArray(data?.non_field_errors)
        ? data.non_field_errors.join(', ')
        : data?.non_field_errors;

      // Field-specific validation errors (e.g., { password: ["Too short"] })
      const fieldLines: string[] = [];
      for (const key of Object.keys(data)) {
        if (['message', 'detail', 'error', 'non_field_errors'].includes(key)) continue;
        const val = (data as any)[key];
        if (val === null || val === undefined) continue;
        const values = Array.isArray(val) ? val : [val];
        const msg = values
          .map(v => typeof v === 'string' ? v : (typeof v === 'object' ? JSON.stringify(v) : String(v)))
          .join(', ');
        const label = key.replace(/_/g, ' ');
        if (msg) fieldLines.push(`${label}: ${msg}`);
      }

      const pieces = [primary, nonField, ...fieldLines].filter(Boolean) as string[];
      if (pieces.length) return pieces.join(' | ');

      // Fallback
      try { return JSON.stringify(data); } catch { return `HTTP error! status: ${response.status}`; }
    };

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        console.error('API Error Response:', data);
        throw new Error(formatError(data));
      }
      return data;
    } else if (contentType && (contentType.includes('application/pdf') || contentType.includes('image/'))) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }
      return text;
    }
  };

  try {
    const firstConfig = buildRequest(effectiveToken);
    console.log('Making API request:', { url, method, headers: firstConfig.headers, body: body ? JSON.stringify(body) : undefined });

    let response = await fetch(url, firstConfig);

    // If unauthorized, attempt one refresh + retry (only for authenticated requests)
    if (useAuth && response.status === 401) {
      console.warn('⚠️ Unauthorized (401). Attempting refresh token...');
      try {
        await AuthService.refreshToken();
        const refreshedToken = AuthService.getToken() || undefined;
        const retryConfig = buildRequest(refreshedToken);
        response = await fetch(url, retryConfig);
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
        throw new Error('Unauthorized');
      }
    }

    return await parseResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication service
import { STORAGE_KEYS } from '../constants/storageKeys';
export class AuthService {
  private static tokenKey = STORAGE_KEYS.ACCESS_TOKEN;
  private static refreshTokenKey = STORAGE_KEYS.REFRESH_TOKEN;

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  // Persist and access the current user profile for convenience
  static getCurrentUser<T = any>(): T | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    } catch {}
  }

  static clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  }

  static async login(email: string, password: string) {
    console.log('Login request:', { email, password: '***', endpoint: API_ENDPOINTS.ACCOUNTS.LOGIN });
    
    const response = await apiRequest(API_ENDPOINTS.ACCOUNTS.LOGIN, {
      method: 'POST',
      body: {
        email,
        password
      },
      useAuth: false, // ensure no Authorization header on public login
    });

    console.log('Login response received:', response);

    // Handle both custom { tokens: { access, refresh } } and standard { access, refresh }
    const accessToken = response.tokens?.access || response.access;
    const refreshToken = response.tokens?.refresh || response.refresh;

    if (accessToken) {
      console.log('Setting tokens:', { access: accessToken.substring(0, 20) + '...' });
      this.setToken(accessToken);
      if (refreshToken) this.setRefreshToken(refreshToken);
    } else {
      console.warn('No tokens found in login response:', response);
    }

    // Persist user profile if provided
    if (response.user) {
      this.setCurrentUser(response.user);
    }

    return response;
  }

  static async register(userData: any) {
    return apiRequest(API_ENDPOINTS.ACCOUNTS.REGISTER, {
      method: HTTP_METHODS.POST,
      body: userData,
      useAuth: false, // ensure no Authorization header on public register
    });
  }

  static async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiRequest(API_ENDPOINTS.AUTH.TOKEN_REFRESH, {
      method: HTTP_METHODS.POST,
      body: { refresh: refreshToken }
    });

    if (response.access) {
      this.setToken(response.access);
    }

    return response;
  }

  static async getProfile(token?: string) {
    return apiRequest(API_ENDPOINTS.ACCOUNTS.PROFILE, {
      token: token || this.getToken() || undefined
    });
  }

  static async logout() {
    this.clearTokens();
    this.clearCurrentUser();
  }
}

// Product service
export class ProductService {
  static async getProducts(token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.PRODUCTS, {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async createProduct(productData: any, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.PRODUCTS, {
      method: HTTP_METHODS.POST,
      body: productData,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async updateProduct(productId: string, productData: any, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.PRODUCT_DETAIL(productId), {
      method: HTTP_METHODS.PUT,
      body: productData,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async deleteProduct(productId: string, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.PRODUCT_DETAIL(productId), {
      method: HTTP_METHODS.DELETE,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async getProductStats(token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.PRODUCT_STATS, {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async searchByBarcode(barcode: string, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.SEARCH_BY_BARCODE(barcode), {
      token: token || AuthService.getToken() || undefined
    });
  }

  /**
   * Create a product with name-based references (converts names to IDs automatically)
   */
  static async createProductWithNames(productData: ProductWithNames, token?: string) {
    try {
      console.log('Creating product with names:', productData);
      
      // Convert names to IDs
      const convertedProduct = await MappingService.convertProductNamesToIds(productData, token);
      
      console.log('Converted product data:', convertedProduct);
      
      // Create the product with IDs
      return await this.createProduct(convertedProduct, token);
    } catch (error) {
      console.error('Failed to create product with names:', error);
      throw error;
    }
  }

  /**
   * Bulk create products with name-based references
   */
  static async bulkCreateProductsWithNames(products: ProductWithNames[], token?: string) {
    try {
      console.log(`Starting bulk creation of ${products.length} products with names...`);
      
      // Convert all products from names to IDs
      const convertedProducts = await MappingService.convertProductsNamesToIds(products, token);
      
      console.log(`Successfully converted ${convertedProducts.length} products to use IDs`);
      
      // Create products one by one (or use bulk endpoint if available)
      const results = [];
      const errors = [];
      
      for (let i = 0; i < convertedProducts.length; i++) {
        try {
          const result = await this.createProduct(convertedProducts[i], token);
          results.push({
            index: i,
            product: products[i],
            result,
            success: true,
          });
        } catch (error) {
          console.error(`Error creating product at index ${i}:`, { product: products[i], error });
          errors.push({
            index: i,
            product: products[i],
            error,
          });
        }
      }
      
      console.log('Bulk creation finished.');
      
      return {
        success: results,
        errors: errors,
      };
    } catch (error) {
      console.error('Failed to bulk create products with names:', error);
      throw error;
    }
  }
}

// Category service
export class CategoryService {
  static async getCategories(token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.CATEGORIES, {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async createCategory(categoryData: any, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.CATEGORIES, {
      method: HTTP_METHODS.POST,
      body: categoryData,
      token: token || AuthService.getToken() || undefined
    });
  }
}

// Supplier service
export class SupplierService {
  static async getSuppliers(token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.SUPPLIERS, {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async createSupplier(supplierData: any, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.SUPPLIERS, {
      method: HTTP_METHODS.POST,
      body: supplierData,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async getSupplier(id: number, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.SUPPLIER_DETAIL(id), {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async updateSupplier(id: number, supplierData: any, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.SUPPLIER_DETAIL(id), {
      method: HTTP_METHODS.PATCH,
      body: supplierData,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async deleteSupplier(id: number, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.SUPPLIER_DETAIL(id), {
      method: HTTP_METHODS.DELETE,
      token: token || AuthService.getToken() || undefined
    });
  }
}

// Supermarket service
export class SupermarketService {
  static async getSupermarkets(token?: string) {
    return apiRequest(API_ENDPOINTS.SUPERMARKETS.LIST_CREATE, {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async getSupermarketById(supermarketId: string, token?: string) {
    return apiRequest(API_ENDPOINTS.SUPERMARKETS.DETAIL(supermarketId), {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async createSupermarket(supermarketData: any, token?: string) {
    return apiRequest(API_ENDPOINTS.SUPERMARKETS.LIST_CREATE, {
      method: HTTP_METHODS.POST,
      body: supermarketData,
      token: token || AuthService.getToken() || undefined
    });
  }

  /**
   * Create a supermarket with default settings for new users.
   * This can be a simplified version of the full create method.
   */
  static async createSupermarketWithDefaults(supermarketData: { name: string; address: string; phone: string; email: string; description: string; }, token?: string) {
    
    const payload = {
      ...supermarketData,
      is_sub_store: false,
      is_verified: false, // Default to not verified
    };

    console.log("Creating supermarket with defaults, payload:", payload);

    return apiRequest(API_ENDPOINTS.SUPERMARKETS.LIST_CREATE, {
      method: HTTP_METHODS.POST,
      body: payload,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async updateSupermarket(supermarketId: string, supermarketData: any, token?: string) {
    return apiRequest(API_ENDPOINTS.SUPERMARKETS.DETAIL(supermarketId), {
      method: HTTP_METHODS.PUT,
      body: supermarketData,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async getSupermarketStats(token?: string) {
    return apiRequest(API_ENDPOINTS.SUPERMARKETS.STATS, {
      token: token || AuthService.getToken() || undefined
    });
  }
}

// Barcode and ticket service
export class BarcodeService {
  static async getProductBarcode(productId: string, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.PRODUCT_BARCODE(productId), {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async getProductTicket(productId: string, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.PRODUCT_TICKET(productId), {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async generateBarcode(productId: string, token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.GENERATE_BARCODE(productId), {
      method: HTTP_METHODS.POST,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async bulkGenerateTickets(productIds: string[], token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.BULK_TICKETS, {
      method: HTTP_METHODS.POST,
      body: { product_ids: productIds },
      token: token || AuthService.getToken() || undefined
    });
  }

  static async bulkGenerateBarcodes(productIds: string[], token?: string) {
    return apiRequest(API_ENDPOINTS.INVENTORY.BULK_BARCODES, {
      method: HTTP_METHODS.POST,
      body: { product_ids: productIds },
      token: token || AuthService.getToken() || undefined
    });
  }
}

// Purchasing services
export class SupplierProductService {
  static async list(params?: { supplier?: number|string; product?: string; }, token?: string) {
    const url = new URL(API_ENDPOINTS.PURCHASING.SUPPLIER_PRODUCTS);
    if (params?.supplier) url.searchParams.set('supplier', String(params.supplier));
    if (params?.product) url.searchParams.set('product', String(params.product));
    return apiRequest(url.toString(), { token: token || AuthService.getToken() || undefined });
  }

  static async create(data: { supplier: number; product: string; supplier_price: number; available_quantity?: number; }, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.SUPPLIER_PRODUCTS, {
      method: HTTP_METHODS.POST,
      body: data,
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async update(id: number, data: Partial<{ supplier: number; product: string; supplier_price: number; available_quantity: number; }>, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.SUPPLIER_PRODUCT_DETAIL(id), {
      method: HTTP_METHODS.PATCH,
      body: data,
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async remove(id: number, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.SUPPLIER_PRODUCT_DETAIL(id), {
      method: HTTP_METHODS.DELETE,
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async bestSupplier(productId: string, quantity: number, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.BEST_SUPPLIER(productId, quantity), {
      token: token || AuthService.getToken() || undefined,
    });
  }
}

export class PurchaseOrderService {
  static async list(token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.PURCHASE_ORDERS, {
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async create(data: {
    supplier: number;
    items: { product: string; quantity: number; unit_price: number }[];
    notes?: string;
  }, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.PURCHASE_ORDERS, {
      method: HTTP_METHODS.POST,
      body: data,
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async get(id: number, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.PURCHASE_ORDER_DETAIL(id), {
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async update(id: number, data: any, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.PURCHASE_ORDER_DETAIL(id), {
      method: HTTP_METHODS.PATCH,
      body: data,
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async markReceived(id: number, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.PURCHASE_ORDER_RECEIVE(id), {
      method: HTTP_METHODS.POST,
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async pdf(id: number, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.PURCHASE_ORDER_PDF(id), {
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async email(id: number, token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.PURCHASE_ORDER_EMAIL(id), {
      method: HTTP_METHODS.POST,
      token: token || AuthService.getToken() || undefined,
    });
  }

  static async stats(token?: string) {
    return apiRequest(API_ENDPOINTS.PURCHASING.PURCHASE_ORDER_STATS, {
      token: token || AuthService.getToken() || undefined,
    });
  }
}

// Mapping service for converting names to IDs
// This is a critical service for Excel import functionality
export class MappingService {
  private static categoryMap: Map<string, number> = new Map();
  private static supplierMap: Map<string, number> = new Map();
  private static supermarketMap: Map<string, string> = new Map();

  /**
   * Fetch all necessary mappings from the backend
   */
  static async fetchAllMappings(token?: string) {
    console.log('Fetching all mappings...');
    
    const effectiveToken = token || AuthService.getToken() || undefined;
    
    // Fetch categories
    const categories = await CategoryService.getCategories(effectiveToken);
    this.categoryMap.clear();
    categories.forEach((cat: any) => this.categoryMap.set(cat.name.toLowerCase(), cat.id));
    console.log(`Fetched ${this.categoryMap.size} categories.`);

    // Fetch suppliers
    const suppliers = await SupplierService.getSuppliers(effectiveToken);
    this.supplierMap.clear();
    suppliers.forEach((sup: any) => this.supplierMap.set(sup.name.toLowerCase(), sup.id));
    console.log(`Fetched ${this.supplierMap.size} suppliers.`);

    // Fetch supermarkets
    const supermarkets = await SupermarketService.getSupermarkets(effectiveToken);
    this.supermarketMap.clear();
    supermarkets.forEach((sup: any) => this.supermarketMap.set(sup.name.toLowerCase(), sup.id));
    console.log(`Fetched ${this.supermarketMap.size} supermarkets.`);
  }

  /**
   * Clear all cached mappings
   */
  static clearAllMappings() {
    this.categoryMap.clear();
    this.supplierMap.clear();
    this.supermarketMap.clear();
    console.log('Cleared all cached mappings.');
  }

  /**
   * Get category ID from name, fetching if not cached
   */
  static async getCategoryId(name: string, token?: string): Promise<number> {
    const lowerCaseName = name.toLowerCase();
    if (!this.categoryMap.has(lowerCaseName)) {
      await this.fetchAllMappings(token);
    }
    const id = this.categoryMap.get(lowerCaseName);
    if (!id) {
      throw new Error(`Category not found: ${name}`);
    }
    return id;
  }

  /**
   * Get supplier ID from name, fetching if not cached
   */
  static async getSupplierId(name: string, token?: string): Promise<number> {
    const lowerCaseName = name.toLowerCase();
    if (!this.supplierMap.has(lowerCaseName)) {
      await this.fetchAllMappings(token);
    }
    const id = this.supplierMap.get(lowerCaseName);
    if (!id) {
      throw new Error(`Supplier not found: ${name}`);
    }
    return id;
  }

  /**
   * Get supermarket ID from name, fetching if not cached.
   * If the supermarket doesn't exist, it attempts to create it.
   */
  static async getSupermarketId(name: string, token?: string): Promise<string> {
    const lowerCaseName = name.toLowerCase();
    if (!this.supermarketMap.has(lowerCaseName)) {
      await this.fetchAllMappings(token);
    }
    
    let id = this.supermarketMap.get(lowerCaseName);
    
    if (!id) {
      console.warn(`Supermarket "${name}" not found. Attempting to create it...`);
      try {
        const newSupermarket = await SupermarketService.createSupermarketWithDefaults({
          name: name,
          address: 'Default Address',
          phone: '000-000-0000',
          email: `${name.replace(/\s+/g, '').toLowerCase()}@default.com`,
          description: `Auto-created supermarket: ${name}`,
        }, token);
        
        // After creation, refetch mappings to get the new ID
        await this.fetchAllMappings(token);
        id = this.supermarketMap.get(lowerCaseName);
        
        if (!id) {
          throw new Error(`Failed to create or find supermarket: ${name}`);
        }
        
        console.log(`Successfully created and mapped new supermarket: ${name}`);
      } catch (error) {
        console.error(`Error auto-creating supermarket "${name}":`, error);
        throw new Error(`Could not find or create supermarket: ${name}`);
      }
    }
    
    return id;
  }

  /**
   * Convert a single product with name-based fields to ID-based fields
   */
  static async convertProductNamesToIds(product: ProductWithNames, token?: string): Promise<any> {
    const converted: any = { ...product };

    if (product.category_name) {
      converted.category = await this.getCategoryId(product.category_name, token);
      delete converted.category_name;
    }

    if (product.supplier_name) {
      converted.supplier = await this.getSupplierId(product.supplier_name, token);
      delete converted.supplier_name;
    }

    if (product.supermarket_name) {
      converted.supermarket = await this.getSupermarketId(product.supermarket_name, token);
      delete converted.supermarket_name;
    }

    return converted;
  }

  /**
   * Convert an array of products from names to IDs
   */
  static async convertProductsNamesToIds(products: ProductWithNames[], token?: string): Promise<any[]> {
    // Fetch all mappings once to optimize
    await this.fetchAllMappings(token);
    
    const convertedProducts = [];
    for (const product of products) {
      const converted = await this.convertProductNamesToIds(product, token);
      convertedProducts.push(converted);
    }
    
    return convertedProducts;
  }
}

// Type definition for product with name-based references
export interface ProductWithNames {
  name: string;
  price: number;
  quantity: number;
  category_name: string;
  supplier_name: string;
  supermarket_name: string;
  [key: string]: any; // Allow other fields
}