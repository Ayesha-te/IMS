import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Store, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Copy,
  Move,
  Eye,
  BarChart3,
  Download,
  Upload,
  Grid,
  List
} from 'lucide-react';
import type { Product, Supermarket, User } from '../types/Product';
import { analyzeStoreContext, getStoreOptions, filterProductsByUserStores } from '../utils/storeUtils';

interface AdaptiveProductCatalogProps {
  products: Product[];
  stores: Supermarket[];
  currentUser: User | null;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onCopyProduct?: (productId: string, targetStoreId: string) => void;
  onMoveProduct?: (productId: string, targetStoreId: string) => void;
  onBulkAction?: (action: string, productIds: string[], targetStoreId?: string) => void;
}

interface FilterState {
  search: string;
  store: string;
  category: string;
  status: 'all' | 'low_stock' | 'expiring' | 'expired';
  halal: 'all' | 'certified' | 'not_certified';
}

const AdaptiveProductCatalog: React.FC<AdaptiveProductCatalogProps> = ({
  products,
  stores,
  currentUser,
  onEditProduct,
  onDeleteProduct,
  onCopyProduct,
  onMoveProduct,
  onBulkAction
}) => {
  const storeContext = analyzeStoreContext(stores, currentUser);
  const storeOptions = getStoreOptions(storeContext);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    store: storeContext.isMultiStore ? 'all' : (storeContext.mainStore?.id || ''),
    category: 'all',
    status: 'all',
    halal: 'all'
  });
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity' | 'expiry'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter products to only show user's products
  const userProducts = useMemo(() => {
    return filterProductsByUserStores(products, storeContext);
  }, [products, storeContext]);

  // Get unique categories from user's products
  const categories = useMemo(() => {
    const cats = [...new Set(userProducts.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [userProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = userProducts.filter(product => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!product.name.toLowerCase().includes(searchLower) &&
            !product.barcode?.toLowerCase().includes(searchLower) &&
            !product.category?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Store filter (only for multi-store users)
      if (storeContext.isMultiStore && filters.store !== 'all') {
        if (product.supermarketId !== filters.store) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const today = new Date();
        const expiryDate = new Date(product.expiryDate);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.status) {
          case 'low_stock':
            if (product.quantity > 5) return false;
            break;
          case 'expiring':
            if (diffDays > 7 || diffDays <= 0) return false;
            break;
          case 'expired':
            if (diffDays > 0) return false;
            break;
        }
      }

      // Halal filter
      if (filters.halal !== 'all') {
        if (filters.halal === 'certified' && !product.halalCertified) return false;
        if (filters.halal === 'not_certified' && product.halalCertified) return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'expiry':
          aValue = new Date(a.expiryDate);
          bValue = new Date(b.expiryDate);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [userProducts, filters, sortBy, sortOrder, storeContext.isMultiStore]);

  // Get store name by ID
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };

  // Get product status
  const getProductStatus = (product: Product) => {
    const today = new Date();
    const expiryDate = new Date(product.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { status: 'expired', color: 'red', text: 'Expired' };
    if (diffDays <= 7) return { status: 'expiring', color: 'orange', text: 'Expiring Soon' };
    if (product.quantity <= 5) return { status: 'low_stock', color: 'yellow', text: 'Low Stock' };
    return { status: 'good', color: 'green', text: 'Good' };
  };

  // Handle product selection (only for multi-store)
  const handleProductSelect = (productId: string) => {
    if (!storeContext.isMultiStore) return;
    
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle select all (only for multi-store)
  const handleSelectAll = () => {
    if (!storeContext.isMultiStore) return;
    
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Handle bulk actions (only for multi-store)
  const handleBulkAction = (action: string, targetStoreId?: string) => {
    if (!storeContext.isMultiStore || !onBulkAction) return;
    
    onBulkAction(action, selectedProducts, targetStoreId);
    setSelectedProducts([]);
    setShowBulkActions(false);
  };

  // Statistics
  const stats = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStockCount = filteredProducts.filter(p => p.quantity <= 5).length;
    const expiringCount = filteredProducts.filter(p => {
      const today = new Date();
      const expiryDate = new Date(p.expiryDate);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    }).length;
    const expiredCount = filteredProducts.filter(p => {
      const today = new Date();
      const expiryDate = new Date(p.expiryDate);
      return expiryDate < today;
    }).length;

    return { totalProducts, totalValue, lowStockCount, expiringCount, expiredCount };
  }, [filteredProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-xl mr-4">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {storeContext.isMultiStore ? 'Multi-Store Product Catalog' : 'Product Catalog'}
              </h2>
              <p className="text-gray-600">
                {storeContext.isMultiStore 
                  ? `Manage products across your ${storeContext.totalStores} stores`
                  : `Manage products in ${storeContext.mainStore?.name || 'your store'}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
              {viewMode === 'grid' ? 'Table View' : 'Grid View'}
            </button>
            {storeContext.isMultiStore && selectedProducts.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
              >
                Bulk Actions ({selectedProducts.length})
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center">
              <Package className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-blue-800">{stats.totalProducts}</p>
                <p className="text-blue-600 text-sm">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-green-800">${stats.totalValue.toFixed(0)}</p>
                <p className="text-green-600 text-sm">Total Value</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-yellow-800">{stats.lowStockCount}</p>
                <p className="text-yellow-600 text-sm">Low Stock</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-orange-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-orange-800">{stats.expiringCount}</p>
                <p className="text-orange-600 text-sm">Expiring Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-red-800">{stats.expiredCount}</p>
                <p className="text-red-600 text-sm">Expired</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`grid gap-4 ${storeContext.isMultiStore ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Store filter - only show for multi-store users */}
          {storeContext.isMultiStore && (
            <select
              value={filters.store}
              onChange={(e) => setFilters({...filters, store: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {storeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}

          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value as any})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="low_stock">Low Stock</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filters.halal}
            onChange={(e) => setFilters({...filters, halal: e.target.value as any})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Products</option>
            <option value="certified">Halal Certified</option>
            <option value="not_certified">Not Certified</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
            <option value="quantity-asc">Stock Low-High</option>
            <option value="quantity-desc">Stock High-Low</option>
            <option value="expiry-asc">Expiry Soon-Late</option>
            <option value="expiry-desc">Expiry Late-Soon</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Panel - only for multi-store */}
      {storeContext.isMultiStore && showBulkActions && selectedProducts.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-blue-800">
                {selectedProducts.length} products selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                >
                  Delete Selected
                </button>
                {storeContext.userStores.length > 1 && (
                  <>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkAction('copy', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      defaultValue=""
                    >
                      <option value="">Copy to Store...</option>
                      {storeContext.userStores.map(store => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkAction('move', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      defaultValue=""
                    >
                      <option value="">Move to Store...</option>
                      {storeContext.userStores.map(store => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setShowBulkActions(false);
                setSelectedProducts([]);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">
            {userProducts.length === 0 
              ? "You haven't added any products yet. Start by adding your first product!"
              : "No products match your current filters. Try adjusting your search criteria."
            }
          </p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const status = getProductStatus(product);
                return (
                  <div key={product.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Multi-store selection checkbox */}
                    {storeContext.isMultiStore && (
                      <div className="p-3 border-b border-gray-100">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleProductSelect(product.id)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Select</span>
                        </label>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          {storeContext.isMultiStore && (
                            <p className="text-xs text-blue-600 mt-1">
                              <Store className="w-3 h-3 inline mr-1" />
                              {getStoreName(product.supermarketId)}
                            </p>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status.color === 'red' ? 'bg-red-100 text-red-800' :
                          status.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {status.text}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Stock:</span>
                          <span className="font-medium">{product.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Expires:</span>
                          <span className="font-medium">{new Date(product.expiryDate).toLocaleDateString()}</span>
                        </div>
                        {product.halalCertified && (
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Halal Certified
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {storeContext.isMultiStore && onCopyProduct && (
                          <button
                            onClick={() => {
                              // Show store selection for copy
                              const targetStoreId = prompt('Enter target store ID:');
                              if (targetStoreId) onCopyProduct(product.id, targetStoreId);
                            }}
                            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {storeContext.isMultiStore && (
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Category</th>
                    {storeContext.isMultiStore && (
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Store</th>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Expiry</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const status = getProductStatus(product);
                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        {storeContext.isMultiStore && (
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleProductSelect(product.id)}
                            />
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-800">{product.name}</div>
                            {product.halalCertified && (
                              <div className="flex items-center text-sm text-green-600 mt-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Halal Certified
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{product.category}</td>
                        {storeContext.isMultiStore && (
                          <td className="py-3 px-4 text-gray-600">{getStoreName(product.supermarketId)}</td>
                        )}
                        <td className="py-3 px-4 font-medium">${product.price.toFixed(2)}</td>
                        <td className="py-3 px-4">{product.quantity}</td>
                        <td className="py-3 px-4">{new Date(product.expiryDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status.color === 'red' ? 'bg-red-100 text-red-800' :
                            status.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onEditProduct(product)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(product.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {storeContext.isMultiStore && onCopyProduct && (
                              <button
                                onClick={() => {
                                  const targetStoreId = prompt('Enter target store ID:');
                                  if (targetStoreId) onCopyProduct(product.id, targetStoreId);
                                }}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Copy to Store"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdaptiveProductCatalog;