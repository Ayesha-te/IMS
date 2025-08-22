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
}

// Generic API request function
export const apiRequest = async (url: string, config: RequestConfig = {}) => {
  const {
    method = 'GET',
    headers = {},
    body,
    token
  } = config;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if token is provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestConfig.body = JSON.stringify(body);
  }

  try {
    console.log('Making API request:', { url, method, headers: requestHeaders, body: body ? JSON.stringify(body) : undefined });
    const response = await fetch(url, requestConfig);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error Response:', data);
        const errorMessage = data.message || data.detail || JSON.stringify(data) || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return data;
    } else if (contentType && (contentType.includes('application/pdf') || contentType.includes('image/'))) {
      // Handle binary data (PDFs, images)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    } else {
      // Handle text responses
      const text = await response.text();
      
      if (!response.ok) {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }
      
      return text;
    }
  
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication service
export class AuthService {
  private static tokenKey = 'auth_token';
  private static refreshTokenKey = 'refresh_token';

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

  static async login(email: string, password: string) {
    console.log('Login request:', { email, password: '***', endpoint: API_ENDPOINTS.ACCOUNTS.LOGIN });
    
    const response = await apiRequest(API_ENDPOINTS.ACCOUNTS.LOGIN, {
      method: 'POST',
      body: {
        email,
        password
      }
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

    return response;
  }

  static async register(userData: any) {
    return apiRequest(API_ENDPOINTS.ACCOUNTS.REGISTER, {
      method: HTTP_METHODS.POST,
      body: userData
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
            success: true
          });
          console.log(`Successfully created product ${i + 1}/${convertedProducts.length}: ${products[i].name}`);
        } catch (error) {
          const errorInfo = {
            index: i,
            product: products[i],
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false
          };
          errors.push(errorInfo);
          results.push(errorInfo);
          console.error(`Failed to create product ${i + 1}/${convertedProducts.length}: ${products[i].name}`, error);
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = errors.length;
      
      console.log(`Bulk creation completed: ${successCount} successful, ${errorCount} failed`);
      
      return {
        total: products.length,
        successful: successCount,
        failed: errorCount,
        results,
        errors
      };
    } catch (error) {
      console.error('Bulk product creation failed:', error);
      throw error;
    }
  }

  /**
   * Update a product with name-based references (converts names to IDs automatically)
   */
  static async updateProductWithNames(productId: string, productData: ProductWithNames, token?: string) {
    try {
      console.log('Updating product with names:', { productId, productData });
      
      // Convert names to IDs
      const convertedProduct = await MappingService.convertProductNamesToIds(productData, token);
      
      console.log('Converted product data for update:', convertedProduct);
      
      // Update the product with IDs
      return await this.updateProduct(productId, convertedProduct, token);
    } catch (error) {
      console.error('Failed to update product with names:', error);
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
}

// Supermarket service
export class SupermarketService {
  static async getSupermarkets(token?: string) {
    return apiRequest(API_ENDPOINTS.SUPERMARKETS.LIST_CREATE, {
      token: token || AuthService.getToken() || undefined
    });
  }

  static async createSupermarket(supermarketData: SupermarketCreateData, token?: string) {
    // Validate required fields
    if (!supermarketData.name || !supermarketData.address || !supermarketData.phone) {
      throw new Error('Supermarket creation requires name, address, and phone fields');
    }

    console.log('Creating supermarket with data:', supermarketData);

    // Prepare the request body with all provided fields
    const requestBody: any = {
      name: supermarketData.name.trim(),
      address: supermarketData.address.trim(),
      phone: supermarketData.phone.trim(),
      email: supermarketData.email || 'noemail@example.com', // Required field
    };

    // Add optional fields if provided
    if (supermarketData.description) requestBody.description = supermarketData.description;
    if (supermarketData.website) requestBody.website = supermarketData.website;
    if (supermarketData.business_license) requestBody.business_license = supermarketData.business_license;
    if (supermarketData.tax_id) requestBody.tax_id = supermarketData.tax_id;
    if (supermarketData.is_sub_store !== undefined) requestBody.is_sub_store = supermarketData.is_sub_store;
    if (supermarketData.timezone) requestBody.timezone = supermarketData.timezone;
    if (supermarketData.currency) requestBody.currency = supermarketData.currency;

    return apiRequest(API_ENDPOINTS.SUPERMARKETS.LIST_CREATE, {
      method: HTTP_METHODS.POST,
      body: requestBody,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async getSupermarketStats(token?: string) {
    return apiRequest(API_ENDPOINTS.SUPERMARKETS.STATS, {
      token: token || AuthService.getToken() || undefined
    });
  }

  /**
   * Debug method to test authentication and API connectivity
   */
  static async testConnection(token?: string) {
    const authToken = token || AuthService.getToken();
    console.log('Testing supermarket API connection...');
    console.log('Token available:', !!authToken);
    console.log('Token preview:', authToken ? authToken.substring(0, 20) + '...' : 'No token');
    
    try {
      const result = await apiRequest(API_ENDPOINTS.SUPERMARKETS.LIST_CREATE, {
        token: authToken || undefined
      });
      console.log('✅ Supermarket API connection successful:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Supermarket API connection failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateSupermarket(supermarketId: string, supermarketData: any, token?: string) {
    return apiRequest(API_ENDPOINTS.SUPERMARKETS.DETAIL(supermarketId), {
      method: HTTP_METHODS.PUT,
      body: supermarketData,
      token: token || AuthService.getToken() || undefined
    });
  }

  static async deleteSupermarket(supermarketId: string, token?: string) {
    return apiRequest(API_ENDPOINTS.SUPERMARKETS.DETAIL(supermarketId), {
      method: HTTP_METHODS.DELETE,
      token: token || AuthService.getToken() || undefined
    });
  }

  /**
   * Create a supermarket with default values if address/phone are missing
   */
  static async createSupermarketWithDefaults(
    supermarketData: { 
      name: string; 
      address?: string; 
      phone?: string; 
      email?: string;
      description?: string;
      website?: string;
      business_license?: string;
      tax_id?: string;
      is_sub_store?: boolean;
      parent?: string;
      timezone?: string;
      currency?: string;
      [key: string]: any;
    }, 
    token?: string
  ) {
    // Ensure all required fields have values
    const completeData = {
      name: supermarketData.name,
      email: supermarketData.email || 'noemail@example.com',
      address: supermarketData.address || 'Address not provided',
      phone: supermarketData.phone || '+1234567890',
      description: supermarketData.description || `${supermarketData.name} - Halal Inventory Management`,
      website: supermarketData.website || '',
      business_license: supermarketData.business_license || '',
      tax_id: supermarketData.tax_id || '',
      is_sub_store: supermarketData.is_sub_store || false,
      parent: supermarketData.parent || null,
      timezone: supermarketData.timezone || 'UTC',
      currency: supermarketData.currency || 'USD',
      pos_system_type: 'NONE',
      pos_system_enabled: false,
      pos_sync_enabled: false,
      is_active: true
    };

    console.log('Creating supermarket with complete data:', completeData);
    
    return this.createSupermarket(completeData, token);
  }
}

// Types for mapping service
export interface Category {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
}

export interface Supermarket {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface SupermarketCreateData {
  name: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  website?: string;
  business_license?: string;
  tax_id?: string;
  is_sub_store?: boolean;
  timezone?: string;
  currency?: string;
}

export interface ProductWithNames {
  name: string;
  category: string;
  supplier: string;
  supermarket: string;
  supermarketAddress?: string;
  supermarketPhone?: string;
  quantity: number;
  price: number;
  cost_price?: number;
  selling_price?: number;
  expiry_date?: string;
  [key: string]: any;
}

export interface ProductWithIds {
  name: string;
  category: number;
  supplier: number;
  supermarket: string;
  quantity: number;
  price: number;
  cost_price?: number;
  selling_price?: number;
  expiry_date?: string;
  [key: string]: any;
}

// Mapping service for converting names to IDs
export class MappingService {
  private static categoriesCache: Category[] | null = null;
  private static suppliersCache: Supplier[] | null = null;
  private static supermarketsCache: Supermarket[] | null = null;
  private static cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private static lastCacheUpdate: number = 0;

  /**
   * Clear all cached mappings
   */
  static clearCache(): void {
    this.categoriesCache = null;
    this.suppliersCache = null;
    this.supermarketsCache = null;
    this.lastCacheUpdate = 0;
  }

  /**
   * Check if cache is expired
   */
  private static isCacheExpired(): boolean {
    return Date.now() - this.lastCacheUpdate > this.cacheExpiry;
  }

  /**
   * Fetch and cache all mappings
   */
  static async fetchMappings(token?: string): Promise<{
    categories: Category[];
    suppliers: Supplier[];
    supermarkets: Supermarket[];
  }> {
    const authToken = token || AuthService.getToken() || undefined;

    // Return cached data if still valid
    if (!this.isCacheExpired() && this.categoriesCache && this.suppliersCache && this.supermarketsCache) {
      return {
        categories: this.categoriesCache,
        suppliers: this.suppliersCache,
        supermarkets: this.supermarketsCache,
      };
    }

    try {
      console.log('Fetching fresh mappings from API...');
      
      // Fetch all mappings in parallel
      const [categoriesResponse, suppliersResponse, supermarketsResponse] = await Promise.all([
        CategoryService.getCategories(authToken),
        SupplierService.getSuppliers(authToken),
        SupermarketService.getSupermarkets(authToken),
      ]);

      // Debug API responses
      console.log("DEBUG API categories response:", categoriesResponse);
      console.log("DEBUG API suppliers response:", suppliersResponse);
      console.log("DEBUG API supermarkets response:", supermarketsResponse);

      // Cache the results, ensuring they are arrays
      const categoriesData = categoriesResponse.results || categoriesResponse;
      const suppliersData = suppliersResponse.results || suppliersResponse;
      const supermarketsData = supermarketsResponse.results || supermarketsResponse;

      this.categoriesCache = Array.isArray(categoriesData) ? categoriesData : Object.values(categoriesData || {});
      this.suppliersCache = Array.isArray(suppliersData) ? suppliersData : Object.values(suppliersData || {});
      this.supermarketsCache = Array.isArray(supermarketsData) ? supermarketsData : Object.values(supermarketsData || {});
      this.lastCacheUpdate = Date.now();

      console.log('Mappings cached successfully:', {
        categories: this.categoriesCache?.length || 0,
        suppliers: this.suppliersCache?.length || 0,
        supermarkets: this.supermarketsCache?.length || 0,
      });

      return {
        categories: this.categoriesCache || [],
        suppliers: this.suppliersCache || [],
        supermarkets: this.supermarketsCache || [],
      };
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
      throw new Error('Failed to fetch required mappings from API');
    }
  }

  /**
   * Convert a single product from names to IDs
   */
  static async convertProductNamesToIds(
    product: ProductWithNames,
    token?: string
  ): Promise<ProductWithIds> {
    const { categories, suppliers, supermarkets } = await this.fetchMappings(token);

    // Debug logging to identify the issue
    console.log("DEBUG categories:", categories);
    console.log("DEBUG categories type:", typeof categories);
    console.log("DEBUG categories is array:", Array.isArray(categories));

    // Ensure categories is an array
    const categoriesArray = Array.isArray(categories) ? categories : Object.values(categories || {});
    
    // Find matching category
    const category = categoriesArray.find(c => 
      c.name.toLowerCase().trim() === product.category.toLowerCase().trim()
    );
    if (!category) {
      throw new Error(`Category not found: "${product.category}". Available categories: ${categoriesArray.map(c => c.name).join(', ')}`);
    }

    // Ensure suppliers is an array
    const suppliersArray = Array.isArray(suppliers) ? suppliers : Object.values(suppliers || {});
    
    // Find matching supplier
    const supplier = suppliersArray.find(s => 
      s.name.toLowerCase().trim() === product.supplier.toLowerCase().trim()
    );
    if (!supplier) {
      throw new Error(`Supplier not found: "${product.supplier}". Available suppliers: ${suppliersArray.map(s => s.name).join(', ')}`);
    }

    // Ensure supermarkets is an array
    const supermarketsArray = Array.isArray(supermarkets) ? supermarkets : Object.values(supermarkets || {});
    
    // Find matching supermarket
    let supermarket = supermarketsArray.find(s => 
      s.name.toLowerCase().trim() === product.supermarket.toLowerCase().trim()
    );
    
    // If supermarket doesn't exist, try to create it
    if (!supermarket) {
      console.log(`Supermarket "${product.supermarket}" not found. Attempting to create it...`);
      
      // We can now create supermarkets with default values, so no need to check for address/phone

      try {
        // Create the new supermarket (with defaults if address/phone missing)
        const newSupermarket = product.supermarketAddress && product.supermarketPhone
          ? await SupermarketService.createSupermarket({
              name: product.supermarket,
              address: product.supermarketAddress,
              phone: product.supermarketPhone
            }, token)
          : await SupermarketService.createSupermarketWithDefaults({
              name: product.supermarket,
              address: product.supermarketAddress,
              phone: product.supermarketPhone
            }, token);

        console.log(`Successfully created supermarket: ${product.supermarket}`);
        
        // Clear cache to force refresh on next fetch
        this.clearCache();
        
        // Use the newly created supermarket
        supermarket = {
          id: newSupermarket.id,
          name: newSupermarket.name,
          address: newSupermarket.address,
          phone: newSupermarket.phone
        };
      } catch (error) {
        console.error(`Failed to create supermarket "${product.supermarket}":`, error);
        throw new Error(
          `Supermarket not found: "${product.supermarket}" and failed to create it. ` +
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
          `Available supermarkets: ${supermarketsArray.map(s => s.name).join(', ')}`
        );
      }
    }

    // Return product with IDs
    return {
      ...product,
      category: category.id,
      supplier: supplier.id,
      supermarket: supermarket.id,
    };
  }

  /**
   * Convert multiple products from names to IDs
   */
  static async convertProductsNamesToIds(
    products: ProductWithNames[],
    token?: string
  ): Promise<ProductWithIds[]> {
    // Fetch mappings once for all products
    await this.fetchMappings(token);

    const convertedProducts: ProductWithIds[] = [];
    const errors: string[] = [];

    for (let i = 0; i < products.length; i++) {
      try {
        const convertedProduct = await this.convertProductNamesToIds(products[i], token);
        convertedProducts.push(convertedProduct);
      } catch (error) {
        const errorMessage = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Failed to convert ${errors.length} products:\n${errors.join('\n')}`);
    }

    return convertedProducts;
  }

  /**
   * Get available options for dropdowns/validation
   */
  static async getAvailableOptions(token?: string): Promise<{
    categories: string[];
    suppliers: string[];
    supermarkets: string[];
  }> {
    const { categories, suppliers, supermarkets } = await this.fetchMappings(token);

    // Ensure all data is in array format before mapping
    const categoriesArray = Array.isArray(categories) ? categories : Object.values(categories || {});
    const suppliersArray = Array.isArray(suppliers) ? suppliers : Object.values(suppliers || {});
    const supermarketsArray = Array.isArray(supermarkets) ? supermarkets : Object.values(supermarkets || {});

    return {
      categories: categoriesArray.map(c => c.name),
      suppliers: suppliersArray.map(s => s.name),
      supermarkets: supermarketsArray.map(s => s.name),
    };
  }
}



export default {
  AuthService,
  ProductService,
  CategoryService,
  SupplierService,
  SupermarketService,
  MappingService,
  apiRequest,
  API_ENDPOINTS,
  HTTP_METHODS
};