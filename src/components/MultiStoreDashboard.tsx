import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Plus, 
  ArrowRightLeft,
  BarChart3,
  Settings,
  Eye,
  Copy,
  Move,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import type { Product, Supermarket, User } from '../types/Product';

interface MultiStoreDashboardProps {
  user?: User;
  stores: Supermarket[];
  products: Product[];
  onCreateSubStore?: (storeData: any) => Promise<void>;
  onTransferProducts?: (fromStoreId: string, toStoreId: string, productIds: string[], type: 'copy' | 'move') => Promise<void>;
  onViewStore?: (storeId: string) => void;
  onManageStore?: (storeId: string) => void;
  // Alternative interface for compatibility with App.tsx
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onCopyProduct?: (productId: string, targetStoreId: string) => void;
  onMoveProduct?: (productId: string, targetStoreId: string) => void;
}

interface StoreStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  expiringCount: number;
}

interface ChainOverview {
  mainStore: Supermarket;
  subStores: Supermarket[];
  totalStores: number;
  totalProducts: number;
  totalValue: number;
}

const MultiStoreDashboard: React.FC<MultiStoreDashboardProps> = ({
  user,
  stores,
  products,
  onCreateSubStore,
  onTransferProducts,
  onViewStore,
  onManageStore,
  onEditProduct,
  onDeleteProduct,
  onCopyProduct,
  onMoveProduct
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'stores' | 'transfers'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [transferFromStore, setTransferFromStore] = useState<string>('');
  const [transferToStore, setTransferToStore] = useState<string>('');
  const [transferType, setTransferType] = useState<'copy' | 'move'>('copy');

  // Separate main stores and sub-stores
  const mainStores = stores.filter(store => !store.isSubStore);
  const subStores = stores.filter(store => store.isSubStore);

  // Calculate store statistics
  const getStoreStats = (storeId: string): StoreStats => {
    const storeProducts = products.filter(p => p.supermarketId === storeId);
    const totalValue = storeProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStockCount = storeProducts.filter(p => p.quantity <= 5).length;
    const expiringCount = storeProducts.filter(p => {
      const expiryDate = new Date(p.expiryDate);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    }).length;

    return {
      totalProducts: storeProducts.length,
      totalValue,
      lowStockCount,
      expiringCount
    };
  };

  // Create chain overview data
  const chainOverviews: ChainOverview[] = mainStores.map(mainStore => {
    const relatedSubStores = subStores.filter(sub => sub.parentId === mainStore.id);
    const allStoreIds = [mainStore.id, ...relatedSubStores.map(s => s.id)];
    const chainProducts = products.filter(p => allStoreIds.includes(p.supermarketId));
    
    return {
      mainStore,
      subStores: relatedSubStores,
      totalStores: 1 + relatedSubStores.length,
      totalProducts: chainProducts.length,
      totalValue: chainProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)
    };
  });

  // Overall statistics
  const overallStats = {
    totalStores: stores.length,
    totalMainStores: mainStores.length,
    totalSubStores: subStores.length,
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    totalLowStock: products.filter(p => p.quantity <= 5).length,
    totalExpiring: products.filter(p => {
      const expiryDate = new Date(p.expiryDate);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    }).length
  };

  const handleCreateSubStore = async (formData: any) => {
    try {
      await onCreateSubStore(formData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create sub-store:', error);
    }
  };

  const handleTransferProducts = async () => {
    if (!transferFromStore || !transferToStore || selectedProducts.length === 0) return;
    
    try {
      await onTransferProducts(transferFromStore, transferToStore, selectedProducts, transferType);
      setShowTransferModal(false);
      setSelectedProducts([]);
      setTransferFromStore('');
      setTransferToStore('');
    } catch (error) {
      console.error('Failed to transfer products:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-xl mr-4">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Multi-Store Dashboard</h2>
              <p className="text-gray-600">Manage all your stores from one central location</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {user.account_type === 'MULTI_STORE' ? 'Multi-Store Account' : 'Single Store Account'}
            </span>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium flex items-center"
              disabled={stores.length >= (user as any).max_stores_allowed}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'stores', label: 'Store Management', icon: Store },
            { id: 'transfers', label: 'Product Transfers', icon: ArrowRightLeft }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                selectedView === tab.id
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Overall Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center">
                <Store className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-800">{overallStats.totalStores}</p>
                  <p className="text-blue-600 text-sm">Total Stores</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-800">{overallStats.totalProducts}</p>
                  <p className="text-green-600 text-sm">Total Products</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-purple-800">${overallStats.totalValue.toFixed(2)}</p>
                  <p className="text-purple-600 text-sm">Total Inventory Value</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-orange-800">{overallStats.totalLowStock}</p>
                  <p className="text-orange-600 text-sm">Low Stock Items</p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Chains Overview */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Store Chains</h3>
            {chainOverviews.map(chain => (
              <div key={chain.mainStore.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{chain.mainStore.name}</h4>
                      <p className="text-sm text-gray-600">Main Store</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{chain.totalStores} Stores</span>
                    <span>{chain.totalProducts} Products</span>
                    <span>${chain.totalValue.toFixed(2)} Value</span>
                  </div>
                </div>

                {chain.subStores.length > 0 && (
                  <div className="grid md:grid-cols-3 gap-3">
                    {chain.subStores.map(subStore => {
                      const stats = getStoreStats(subStore.id);
                      return (
                        <div key={subStore.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{subStore.name}</h5>
                            <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                              Sub-Store
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>Products: {stats.totalProducts}</div>
                            <div>Value: ${stats.totalValue.toFixed(0)}</div>
                            <div>Low Stock: {stats.lowStockCount}</div>
                            <div>Expiring: {stats.expiringCount}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store Management Tab */}
      {selectedView === 'stores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Store Management</h3>
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transfer Products
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {stores.map(store => {
              const stats = getStoreStats(store.id);
              return (
                <div key={store.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-3 ${store.isSubStore ? 'bg-purple-100' : 'bg-blue-100'}`}>
                        <Store className={`w-5 h-5 ${store.isSubStore ? 'text-purple-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          {store.name}
                          {store.isVerified && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                          )}
                          {store.isSubStore && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                              Sub-Store
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">{store.address}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewStore(store.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onManageStore(store.id)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-blue-800 font-medium">{stats.totalProducts}</span>
                      </div>
                      <p className="text-blue-600 text-xs">Products</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">${stats.totalValue.toFixed(0)}</span>
                      </div>
                      <p className="text-green-600 text-xs">Total Value</p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-orange-800 font-medium">{stats.lowStockCount}</span>
                      </div>
                      <p className="text-orange-600 text-xs">Low Stock</p>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-red-800 font-medium">{stats.expiringCount}</span>
                      </div>
                      <p className="text-red-600 text-xs">Expiring Soon</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transfers Tab */}
      {selectedView === 'transfers' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Product Transfer Management</h3>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-gray-600 mb-4">
              Transfer products between your stores to optimize inventory distribution.
            </p>
            
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center"
            >
              <ArrowRightLeft className="w-5 h-5 mr-2" />
              Start Product Transfer
            </button>
          </div>
        </div>
      )}

      {/* Create Sub-Store Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Create Sub-Store</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateSubStore({
                name: formData.get('name'),
                address: formData.get('address'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                description: formData.get('description'),
                parent_store_id: formData.get('parent_store_id')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Store *
                </label>
                <select
                  name="parent_store_id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="">Select Parent Store</option>
                  {mainStores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Products Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Transfer Products Between Stores</h3>
            
            <div className="space-y-6">
              {/* Transfer Configuration */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Store *
                  </label>
                  <select
                    value={transferFromStore}
                    onChange={(e) => setTransferFromStore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    required
                  >
                    <option value="">Select Source Store</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Store *
                  </label>
                  <select
                    value={transferToStore}
                    onChange={(e) => setTransferToStore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    required
                  >
                    <option value="">Select Target Store</option>
                    {stores.filter(s => s.id !== transferFromStore).map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transfer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="copy"
                      checked={transferType === 'copy'}
                      onChange={(e) => setTransferType(e.target.value as 'copy' | 'move')}
                      className="mr-2"
                    />
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Products
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="move"
                      checked={transferType === 'move'}
                      onChange={(e) => setTransferType(e.target.value as 'copy' | 'move')}
                      className="mr-2"
                    />
                    <Move className="w-4 h-4 mr-1" />
                    Move Products
                  </label>
                </div>
              </div>

              {/* Product Selection */}
              {transferFromStore && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Products to Transfer
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                    {products
                      .filter(p => p.supermarketId === transferFromStore)
                      .map(product => (
                        <label key={product.id} className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, product.id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                              }
                            }}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              Qty: {product.quantity} | Price: ${product.price}
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransferModal(false);
                    setSelectedProducts([]);
                    setTransferFromStore('');
                    setTransferToStore('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferProducts}
                  disabled={!transferFromStore || !transferToStore || selectedProducts.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Transfer {selectedProducts.length} Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStoreDashboard;