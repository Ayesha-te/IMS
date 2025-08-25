import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  Package, 
  ArrowRight, 
  Plus,
  Settings,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Building2
} from 'lucide-react';
import type { Supermarket, Product, User } from '../types/Product';

interface StoreManagementProps {
  stores: Supermarket[];
  products: Product[];
  currentUser: User | null;
  onAddStore: (store: Omit<Supermarket, 'id'>) => void;
  onNavigateToStore: (storeId: string) => void;
  onEditStore?: (store: Supermarket) => void;
}

const StoreManagement: React.FC<StoreManagementProps> = ({
  stores,
  products,
  currentUser,
  onAddStore,
  onNavigateToStore,
  onEditStore
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    isSubStore: false,
    parentId: ''
  });

  // Get user's stores - since API now filters by user, we can use all stores
  const userStores = stores;
  const mainStores = userStores.filter(store => !store.isSubStore);
  const subStores = userStores.filter(store => store.isSubStore);

  // Calculate store statistics
  const getStoreStats = (storeId: string) => {
    const storeProducts = products.filter(p => p.supermarketId === storeId);
    const totalProducts = storeProducts.length;
    const lowStock = storeProducts.filter(p => p.quantity < (p.minStockLevel || 5)).length;
    const expiringSoon = storeProducts.filter(p => {
      const expiryDate = new Date(p.expiryDate);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return expiryDate <= thirtyDaysFromNow;
    }).length;
    
    return { totalProducts, lowStock, expiringSoon };
  };

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStore.name.trim() || !newStore.address.trim()) {
      alert('Store name and address are required');
      return;
    }

    const storeData: Omit<Supermarket, 'id'> = {
      ...newStore,
      email: newStore.email || currentUser?.email || '',
      registrationDate: new Date().toISOString().split('T')[0],
      isVerified: false,
      ownerId: currentUser?.id || '',
      posSystem: {
        enabled: false,
        type: 'none',
        syncEnabled: false
      }
    };

    onAddStore(storeData);
    setNewStore({
      name: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      isSubStore: false,
      parentId: ''
    });
    setShowAddForm(false);
  };

  const StoreCard: React.FC<{ store: Supermarket }> = ({ store }) => {
    const stats = getStoreStats(store.id);
    const parentStore = store.parentId ? stores.find(s => s.id === store.parentId) : null;

    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-xl mr-4 ${store.isSubStore ? 'bg-blue-100' : 'bg-green-100'}`}>
              {store.isSubStore ? (
                <Building2 className={`w-6 h-6 ${store.isSubStore ? 'text-blue-600' : 'text-green-600'}`} />
              ) : (
                <Store className={`w-6 h-6 ${store.isSubStore ? 'text-blue-600' : 'text-green-600'}`} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{store.name}</h3>
              <div className="flex items-center text-sm text-gray-600">
                {store.isSubStore ? (
                  <>
                    <Building2 className="w-4 h-4 mr-1" />
                    Sub-Store
                    {parentStore && (
                      <span className="ml-2 text-blue-600">
                        (under {parentStore.name})
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 mr-1" />
                    Main Store
                  </>
                )}
                {store.isVerified ? (
                  <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 ml-2 text-amber-500" />
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onNavigateToStore(store.id)}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium flex items-center transition-colors duration-200"
          >
            Open Store
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Store Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {store.address}
            </div>
            {store.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {store.phone}
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {store.email}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Since {new Date(store.registrationDate).toLocaleDateString()}
            </div>
          </div>

          {/* Store Statistics */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <BarChart3 className="w-4 h-4 mr-1" />
              Store Stats
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Products:</span>
                <span className="font-medium">{stats.totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low Stock:</span>
                <span className={`font-medium ${stats.lowStock > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {stats.lowStock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiring Soon:</span>
                <span className={`font-medium ${stats.expiringSoon > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.expiringSoon}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Store Description */}
        {store.description && (
          <p className="text-sm text-gray-600 mb-4">{store.description}</p>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onNavigateToStore(store.id)}
            className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
          >
            <Package className="w-4 h-4 mr-1" />
            View Products
          </button>
          {onEditStore && (
            <button
              onClick={() => onEditStore(store)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-rose-100 p-3 rounded-xl mr-4">
              <Store className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Store Management</h1>
              <p className="text-gray-600">
                Manage your {userStores.length} store{userStores.length !== 1 ? 's' : ''} and view their details
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium flex items-center transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Store
          </button>
        </div>

        {/* Store Summary */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Store className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-green-800">{mainStores.length}</div>
                <div className="text-sm text-green-600">Main Stores</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Building2 className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-blue-800">{subStores.length}</div>
                <div className="text-sm text-blue-600">Sub-Stores</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-purple-800">{products.length}</div>
                <div className="text-sm text-purple-600">Total Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Store Form */}
      {showAddForm && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Store</h2>
          
          <form onSubmit={handleAddStore} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
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
                  value={newStore.address}
                  onChange={(e) => setNewStore(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newStore.phone}
                  onChange={(e) => setNewStore(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newStore.email}
                  onChange={(e) => setNewStore(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder={currentUser?.email}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newStore.description}
                onChange={(e) => setNewStore(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isSubStore"
                checked={newStore.isSubStore}
                onChange={(e) => setNewStore(prev => ({ ...prev, isSubStore: e.target.checked }))}
                className="mr-2 h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <label htmlFor="isSubStore" className="text-sm font-medium text-gray-700">
                This is a sub-store
              </label>
            </div>
            
            {newStore.isSubStore && mainStores.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Store
                </label>
                <select
                  value={newStore.parentId}
                  onChange={(e) => setNewStore(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select parent store</option>
                  {mainStores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium"
              >
                Add Store
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Stores */}
      {mainStores.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Store className="w-6 h-6 mr-2" />
            Main Stores ({mainStores.length})
          </h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {mainStores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </div>
      )}

      {/* Sub Stores */}
      {subStores.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Building2 className="w-6 h-6 mr-2" />
            Sub-Stores ({subStores.length})
          </h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {subStores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {userStores.length === 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Stores Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first store to manage your inventory.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium flex items-center mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Store
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;