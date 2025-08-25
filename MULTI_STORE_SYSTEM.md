# Multi-Store Inventory Management System

## Overview

This enhanced IMS now supports both single-store and multi-store users with an adaptive interface that changes based on the user's store configuration. The system maintains privacy by ensuring users can only access their own stores and provides a seamless experience for both scenarios.

## Key Features

### 🏪 Adaptive Store Management
- **Single Store Users**: Simplified interface focused on their one store
- **Multi-Store Users**: Advanced interface with store selection and management
- **Privacy Protection**: Users can only access stores they own
- **Sub-Store Support**: Main stores can have multiple sub-stores

### 📦 Smart Product Management
- **Single Store**: Direct product addition to the user's store
- **Multi-Store**: Option to add products to multiple stores simultaneously
- **Store-Specific Catalogs**: Filter products by store ownership
- **Bulk Operations**: Copy/move products between stores (multi-store only)

### 📊 Context-Aware Navigation
- Navigation items adapt based on single vs multi-store setup
- Different dashboard layouts for different user types
- Store-specific analytics and reporting

## System Architecture

### Core Components

#### 1. Store Context Analysis (`storeUtils.ts`)
```typescript
interface StoreContext {
  isMultiStore: boolean;
  userStores: Supermarket[];
  mainStore: Supermarket | null;
  subStores: Supermarket[];
  totalStores: number;
}
```

#### 2. Adaptive Components
- **AdaptiveProductCatalog**: Shows appropriate filters and actions
- **AdaptiveProductForm**: Handles single/multi-store product creation
- **AdaptiveExcelUpload**: Excel import with store selection

#### 3. Privacy & Security
- Store ownership validation
- User-specific data filtering
- Access control for store operations

## User Experience Flows

### Single Store User Journey

1. **Registration**: Creates account with one main store
2. **Dashboard**: Simple dashboard showing their store's metrics
3. **Product Management**: Direct add/edit without store selection
4. **Catalog**: Shows only their products
5. **Settings**: Store configuration and preferences

### Multi-Store User Journey

1. **Registration**: Creates account with main store
2. **Store Setup**: Can add sub-stores through Store Management
3. **Dashboard**: Multi-store overview with aggregated metrics
4. **Product Management**: 
   - Choose specific stores for new products
   - Option to add to multiple stores at once
   - Bulk operations (copy/move between stores)
5. **Catalog**: 
   - Filter by store or view all
   - Store-specific actions
   - Bulk selection and operations
6. **Store Management**: Add/edit/manage multiple stores

## Technical Implementation

### Store Detection Logic

```typescript
const analyzeStoreContext = (stores: Supermarket[], currentUser: User | null): StoreContext => {
  // Filter stores owned by current user
  const userStores = stores.filter(store => store.ownerId === currentUser.id);
  
  // Determine if multi-store setup
  const isMultiStore = userStores.length > 1;
  
  // Separate main stores from sub-stores
  const mainStore = userStores.find(store => !store.isSubStore) || null;
  const subStores = userStores.filter(store => store.isSubStore);
  
  return { isMultiStore, userStores, mainStore, subStores, totalStores: userStores.length };
};
```

### Adaptive Navigation

```typescript
const getNavigationItems = (storeContext: StoreContext, isAuthenticated: boolean) => {
  if (storeContext.isMultiStore) {
    return [
      { id: 'dashboard', label: 'Multi-Store Dashboard', icon: '📊' },
      { id: 'catalog', label: 'Multi-Store Catalog', icon: '📦' },
      { id: 'stores', label: 'Store Management', icon: '🏪' },
      // ... more multi-store specific items
    ];
  } else {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'catalog', label: 'Product Catalog', icon: '📦' },
      { id: 'stores', label: 'Store Settings', icon: '🏪' },
      // ... single store items
    ];
  }
};
```

### Product Operations

#### Single Store
```typescript
// Direct product addition
const addProduct = (product: Omit<Product, 'id'>) => {
  const newProduct = {
    ...product,
    supermarketId: mainStore.id, // Automatically assigned
    id: generateId()
  };
  // Save product
};
```

#### Multi-Store
```typescript
// Multi-store product addition
const addProductToMultipleStores = (product: Omit<Product, 'id'>, storeIds: string[]) => {
  storeIds.forEach(storeId => {
    const newProduct = {
      ...product,
      supermarketId: storeId,
      id: generateId()
    };
    // Save product for each store
  });
};
```

## Data Privacy & Security

### Store Access Control
- Users can only see stores they own (`store.ownerId === user.id`)
- API calls filtered by user ownership
- No cross-user data leakage

### Product Filtering
```typescript
const filterProductsByUserStores = (products: Product[], storeContext: StoreContext) => {
  const userStoreIds = storeContext.userStores.map(store => store.id);
  return products.filter(product => userStoreIds.includes(product.supermarketId));
};
```

## UI/UX Adaptations

### Single Store Interface
- **Simplified Navigation**: Fewer menu items
- **No Store Dropdowns**: Direct operations
- **Store Name Display**: Shows store name without selection
- **Streamlined Forms**: No store selection fields

### Multi-Store Interface
- **Store Selection Dropdowns**: In catalogs and forms
- **Bulk Operations**: Select multiple products for store operations
- **Store Overview**: Dashboard showing all stores
- **Advanced Filters**: Filter by store, view all stores option

## Excel Import System

### Single Store Import
- Direct import to user's store
- No store selection required
- Simplified interface

### Multi-Store Import
- Store selection before import
- Option to import to multiple stores
- Preview shows target stores
- Validation for store access

## Benefits

### For Single Store Users
- **Simplicity**: Clean, focused interface
- **Speed**: Faster operations without store selection
- **Clarity**: No confusion about which store

### For Multi-Store Users
- **Flexibility**: Manage multiple locations
- **Efficiency**: Bulk operations across stores
- **Control**: Fine-grained store management
- **Scalability**: Easy to add more stores

### For System Administrators
- **Privacy**: Built-in access control
- **Scalability**: Handles both user types
- **Maintainability**: Single codebase for both scenarios
- **Security**: User isolation and data protection

## Future Enhancements

1. **Store Hierarchies**: Support for complex store relationships
2. **Role-Based Access**: Different permissions within stores
3. **Store Templates**: Quick setup for new stores
4. **Cross-Store Analytics**: Compare performance across stores
5. **Store-Specific Pricing**: Different prices per store
6. **Inventory Transfers**: Move stock between stores

## Migration Guide

### Existing Single Store Users
- No changes required
- Interface remains the same
- All existing functionality preserved

### Upgrading to Multi-Store
1. Add additional stores through Store Management
2. Interface automatically adapts
3. Existing products remain in original store
4. New multi-store features become available

## Configuration

### Environment Variables
```env
# Multi-store features
ENABLE_MULTI_STORE=true
MAX_STORES_PER_USER=10
ENABLE_SUB_STORES=true
```

### Feature Flags
```typescript
const features = {
  multiStore: true,
  subStores: true,
  bulkOperations: true,
  storeTransfers: false // Future feature
};
```

This multi-store system provides a seamless, user-friendly experience that adapts to the user's needs while maintaining privacy and security across all operations.