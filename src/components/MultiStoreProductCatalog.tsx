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
  Upload
} from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';

interface MultiStoreProductCatalogProps {
  products: Product[];
  stores: Supermarket[];
  currentUser?: { id: string } | null;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onCopyProduct: (productId: string, targetStoreId: string) => void;
  onMoveProduct: (productId: string, targetStoreId: string) => void;
  onBulkAction: (action: string, productIds: string[], targetStoreId?: string) => void;
}

interface FilterState {
  search: string;
  store: string;
  category: string;
  status: 'all' | 'low_stock' | 'expiring' | 'expired';
  halal: 'all' | 'certified' | 'not_certified';
}

const MultiStoreProductCatalog: React.FC<MultiStoreProductCatalogProps> = ({
  products,
  stores,
  currentUser,
  onEditProduct,
  onDeleteProduct,
  onCopyProduct,
  onMoveProduct,
  onBulkAction
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    store: 'MINE',
    category: 'all',
    status: 'all',
    halal: 'all'
  });
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity' | 'expiry'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    console.log('Filtering products:', {
      totalProducts: products.length,
      filterStore: filters.store,
      currentUserId: currentUser?.id,
      userStores: stores.filter(store => store.ownerId === currentUser?.id),
      sampleProduct: products[0]
    });
    
    let filtered = products.filter(product => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!product.name.toLowerCase().includes(searchLower) &&
            !product.barcode.toLowerCase().includes(searchLower) &&
            !product.category?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Store filter
      if (filters.store !== 'all') {
        if (filters.store === 'MINE') {
          // Show products from user's stores only
          const userStoreIds = stores.filter(store => store.ownerId === currentUser?.id).map(store => store.id);
          console.log('MINE filter:', {
            userStoreIds,
            productSupermarketId: product.supermarketId,
            productName: product.name,
            matches: userStoreIds.includes(product.supermarketId)
          });
          if (!userStoreIds.includes(product.supermarketId)) {
            return false;
          }
        } else if (product.supermarketId !== filters.store) {
          console.log('Store filter mismatch:', {
            filterStore: filters.store,
            productSupermarketId: product.supermarketId,
            productName: product.name
          });
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
  }, [products, filters, sortBy, sortOrder]);

  // Get store name from ID or legacy name value
  const getStoreName = (storeRef: string) => {
    // Try by ID first, then by name, then fallback
    const byId = stores.find(s => String(s.id) === String(storeRef));
    if (byId) return byId.name;
    const byName = stores.find(
      s => String(s.name).trim().toLowerCase() === String(storeRef).trim().toLowerCase()
    );
    return byName ? byName.name : (storeRef || 'Unknown Store');
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

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string, targetStoreId?: string) => {
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
              <h2 className="text-2xl font-bold text-gray-800">Multi-Store Product Catalog</h2>
              <p className="text-gray-600">Manage products across all your stores</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium"
            >
              {viewMode === 'grid' ? 'Table View' : 'Grid View'}
            </button>
            {selectedProducts.length > 0 && (
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
        <div className="grid md:grid-cols-6 gap-4">
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

          <select
            value={filters.store}
            onChange={(e) => setFilters({...filters, store: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Stores</option>
            {currentUser && (
              <option value="MINE">MINE</option>
            )}
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>

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
            <option value="all">All Halal Status</option>
            <option value="certified">Halal Certified</option>
            <option value="not_certified">Not Certified</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
            <option value="quantity-asc">Quantity Low-High</option>
            <option value="quantity-desc">Quantity High-Low</option>
            <option value="expiry-asc">Expiry Soon-Late</option>
            <option value="expiry-desc">Expiry Late-Soon</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">
                {selectedProducts.length} products selected
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAction('copy', e.target.value);
                  }
                }}
                className="px-3 py-1 border border-blue-300 rounded-lg text-sm"
                defaultValue=""
              >
                <option value="">Copy to Store...</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAction('move', e.target.value);
                  }
                }}
                className="px-3 py-1 border border-blue-300 rounded-lg text-sm"
                defaultValue=""
              >
                <option value="">Move to Store...</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>

              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
              >
                Delete Selected
              </button>

              <button
                onClick={() => setSelectedProducts([])}
                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Display */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Products</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                Select All
              </label>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const status = getProductStatus(product);
                const storeName = getStoreName(product.supermarketId);
                
                return (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                        className="mt-1"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Store className="w-3 h-3 mr-1" />
                        {storeName}
                      </div>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium">${product.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className={`font-medium ${product.quantity <= 5 ? 'text-red-600' : 'text-gray-800'}`}>
                          {product.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expiry:</span>
                        <span className="text-gray-600">{new Date(product.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
                          {status.text}
                        </span>
                        {product.halalCertified && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Halal ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Store</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Expiry</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const status = getProductStatus(product);
                  const storeName = getStoreName(product.supermarketId);
                  
                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleProductSelect(product.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.barcode}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{storeName}</td>
                      <td className="py-3 px-4 text-gray-600">{product.category}</td>
                      <td className="py-3 px-4 font-medium">${product.price}</td>
                      <td className={`py-3 px-4 font-medium ${product.quantity <= 5 ? 'text-red-600' : 'text-gray-800'}`}>
                        {product.quantity}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(product.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
                            {status.text}
                          </span>
                          {product.halalCertified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Halal ✓
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or add some products to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiStoreProductCatalog;