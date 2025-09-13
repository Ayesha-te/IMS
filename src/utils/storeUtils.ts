/**
 * Utility functions for multi-store management
 * Handles logic for single vs multi-store users
 */

import type { Supermarket, User } from '../types/Product';

export interface StoreContext {
  isMultiStore: boolean;
  userStores: Supermarket[];
  mainStore: Supermarket | null;
  subStores: Supermarket[];
  totalStores: number;
}

/**
 * Analyze user's store context to determine single vs multi-store setup
 */
export const analyzeStoreContext = (
  stores: Supermarket[], 
  currentUser: User | null
): StoreContext => {
  if (!currentUser) {
    return {
      isMultiStore: false,
      userStores: [],
      mainStore: null,
      subStores: [],
      totalStores: 0
    };
  }

  // Backend already filters stores by authenticated user, so we can use all stores
  const userStores = stores;
  
  // Find main store (not a sub-store)
  const mainStore = userStores.find(store => !store.isSubStore) || null;
  
  // Find sub-stores
  const subStores = userStores.filter(store => store.isSubStore);
  
  const totalStores = userStores.length;
  const isMultiStore = totalStores > 1;

  return {
    isMultiStore,
    userStores,
    mainStore,
    subStores,
    totalStores
  };
};

/**
 * Get store display name with context
 */
export const getStoreDisplayName = (store: Supermarket): string => {
  const suffix = store.isSubStore ? ' (Sub-Store)' : ' (Main Store)';
  return `${store.name}${suffix}`;
};

/**
 * Get navigation items based on store context
 */
export const getNavigationItems = (storeContext: StoreContext, isAuthenticated: boolean) => {
  if (!isAuthenticated) {
    return [
      { id: 'login', label: 'Login', icon: '🔑' },
      { id: 'signup', label: 'Sign Up', icon: '📝' }
    ];
  }

  const baseItems = [
    { 
      id: 'dashboard', 
      label: storeContext.isMultiStore ? 'Multi-Store Dashboard' : 'Dashboard', 
      icon: '📊' 
    }
  ];

  // Add store-specific navigation
  if (storeContext.isMultiStore) {
    baseItems.push(
      { id: 'supermarket-overview', label: 'Store Overview', icon: '🏬' },
      { id: 'catalog', label: 'Multi-Store Catalog', icon: '📦' },
      { id: 'add-product', label: 'Add Products', icon: '➕' },
      { id: 'stores', label: 'Store Management', icon: '🏪' }
    );
  } else {
    baseItems.push(
      { id: 'catalog', label: 'Product Catalog', icon: '📦' },
      { id: 'add-product', label: 'Add Product', icon: '➕' },
      { id: 'stores', label: 'Store Settings', icon: '🏪' }
    );
  }

  // Common items for both single and multi-store
  baseItems.push(
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'clearance', label: 'Clearance', icon: '🏷️' },
    { id: 'barcode-demo', label: 'Barcodes & Tickets', icon: '🏷️' },
    { id: 'scanner', label: 'Scanner', icon: '📱' },
    { id: 'pos-sync', label: 'POS Sync', icon: '🔄' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'suppliers', label: 'Suppliers', icon: '🤝' },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: '🧾' },
    { id: 'purchasing-reports', label: 'Purchasing Reports', icon: '📑' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  );

  return baseItems;
};

/**
 * Filter products by user's stores
 */
export const filterProductsByUserStores = (
  products: any[], 
  storeContext: StoreContext
) => {
  if (!storeContext.userStores.length) return [];
  
  const userStoreIds = storeContext.userStores.map(store => store.id);
  return products.filter(product => userStoreIds.includes(product.supermarketId));
};

/**
 * Get store options for dropdowns
 */
export const getStoreOptions = (storeContext: StoreContext) => {
  const options = [];
  
  if (storeContext.isMultiStore) {
    options.push({ value: 'all', label: 'All My Stores' });
    
    // Add main store first
    if (storeContext.mainStore) {
      options.push({
        value: storeContext.mainStore.id,
        label: getStoreDisplayName(storeContext.mainStore)
      });
    }
    
    // Add sub-stores
    storeContext.subStores.forEach(store => {
      options.push({
        value: store.id,
        label: getStoreDisplayName(store)
      });
    });
  } else if (storeContext.mainStore) {
    // Single store - just show the store name without dropdown
    options.push({
      value: storeContext.mainStore.id,
      label: storeContext.mainStore.name
    });
  }
  
  return options;
};

/**
 * Check if user can access a specific store
 */
export const canAccessStore = (
  storeId: string, 
  storeContext: StoreContext
): boolean => {
  return storeContext.userStores.some(store => store.id === storeId);
};

/**
 * Get default store for new products
 */
export const getDefaultStoreForProduct = (storeContext: StoreContext): string => {
  if (storeContext.mainStore) {
    return storeContext.mainStore.id;
  }
  if (storeContext.userStores.length > 0) {
    return storeContext.userStores[0].id;
  }
  return '';
};

/**
 * Validate store selection for product operations
 */
export const validateStoreSelection = (
  selectedStoreIds: string[], 
  storeContext: StoreContext
): { isValid: boolean; error?: string } => {
  if (selectedStoreIds.length === 0) {
    return { isValid: false, error: 'At least one store must be selected' };
  }
  
  const invalidStores = selectedStoreIds.filter(
    storeId => !canAccessStore(storeId, storeContext)
  );
  
  if (invalidStores.length > 0) {
    return { 
      isValid: false, 
      error: `You don't have access to stores: ${invalidStores.join(', ')}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Resolve store display name from ID or name
 */
export const resolveStoreName = (stores: Supermarket[], ref: string, fallback = 'Unknown Store') => {
  if (!ref) return fallback;
  const byId = stores.find(s => String(s.id) === String(ref));
  if (byId) return byId.name;
  const byName = stores.find(
    s => String(s.name).trim().toLowerCase() === String(ref).trim().toLowerCase()
  );
  return byName ? byName.name : ref || fallback;
};