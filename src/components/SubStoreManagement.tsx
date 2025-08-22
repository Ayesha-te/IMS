import React, { useState } from 'react';
import { Store, Plus, Edit3, Trash2, MapPin, Phone, Mail, Users, Settings, CheckCircle } from 'lucide-react';
import type { Supermarket, Product } from '../types/Product';

interface SubStoreManagementProps {
  supermarkets: Supermarket[];
  products: Product[];
  currentUser: { id: string; name?: string };
  onAddSupermarket: (supermarket: Omit<Supermarket, 'id'>) => Promise<void>;
  onUpdateSupermarket: (supermarket: Supermarket) => void;
  onDeleteSupermarket: (id: string) => void;
  onBulkProductAction: (action: 'copy' | 'move', productIds: string[], targetStoreId: string) => void;
}

const SubStoreManagement: React.FC<SubStoreManagementProps> = ({
  supermarkets,
  products,
  currentUser,
  onAddSupermarket,
  onUpdateSupermarket,
  onDeleteSupermarket,
  onBulkProductAction
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Supermarket | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductManager, setShowProductManager] = useState(false);
  const [selectedSourceStore, setSelectedSourceStore] = useState<string>('');
  const [selectedTargetStore, setSelectedTargetStore] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  });

  // Get main stores (not sub-stores) owned by current user
  const mainStores = supermarkets.filter(s => !s.isSubStore && s.ownerId === currentUser.id);
  
  // Get sub-stores owned by current user
  const subStores = supermarkets.filter(s => s.isSubStore && s.ownerId === currentUser.id);
  
  // Get all stores owned by current user
  const userStores = supermarkets.filter(s => s.ownerId === currentUser.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supermarketData = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      description: formData.description,
      registrationDate: new Date().toISOString().split('T')[0],
      isVerified: false,
      ownerId: currentUser.id,
      isSubStore: true,
      parentId: mainStores[0]?.id // Link to first main store if exists
    };

    try {
      if (editingStore) {
        onUpdateSupermarket({
          ...editingStore,
          ...supermarketData,
          id: editingStore.id
        });
        setEditingStore(null);
      } else {
        await onAddSupermarket(supermarketData);
      }

      setFormData({ name: '', address: '', phone: '', email: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to save supermarket:', error);
      // Don't close the form if there's an error, let user try again
    }
  };

  const handleEdit = (store: Supermarket) => {
    setFormData({
      name: store.name,
      address: store.address,
      phone: store.phone,
      email: store.email,
      description: store.description || ''
    });
    setEditingStore(store);
    setShowAddForm(true);
  };

  const handleDelete = (storeId: string) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      onDeleteSupermarket(storeId);
    }
  };

  const getStoreProducts = (storeId: string) => {
    return products.filter(p => p.supermarketId === storeId);
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = (action: 'copy' | 'move') => {
    if (selectedProducts.length === 0 || !selectedTargetStore) return;
    
    onBulkProductAction(action, selectedProducts, selectedTargetStore);
    setSelectedProducts([]);
    setSelectedSourceStore('');
    setSelectedTargetStore('');
    setShowProductManager(false);
  };

  const sourceProducts = selectedSourceStore ? getStoreProducts(selectedSourceStore) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-xl mr-4">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Store Management</h2>
              <p className="text-gray-600">Manage your supermarkets and sub-stores</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowProductManager(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Products
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingStore(null);
                setFormData({ name: '', address: '', phone: '', email: '', description: '' });
              }}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sub-Store
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-800">{userStores.length}</p>
                <p className="text-blue-600 text-sm">Total Stores</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-800">
                  {userStores.filter(s => s.isVerified).length}
                </p>
                <p className="text-green-600 text-sm">Verified Stores</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-800">{products.length}</p>
                <p className="text-purple-600 text-sm">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-orange-800">
                  {userStores.filter(s => s.posSystem?.enabled).length}
                </p>
                <p className="text-orange-600 text-sm">POS Connected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Store List */}
        <div className="grid md:grid-cols-2 gap-4">
          {userStores.map(store => {
            const storeProducts = getStoreProducts(store.id);
            return (
              <div key={store.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${store.isSubStore ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      <Store className={`w-5 h-5 ${store.isSubStore ? 'text-purple-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        {store.name}
                        {store.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                        )}
                        {store.isSubStore && (
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                            Sub-Store
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {store.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(store)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {store.isSubStore && (
                      <button
                        onClick={() => handleDelete(store.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-2" />
                    {store.phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-2" />
                    {store.email}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {storeProducts.length} Products
                      </p>
                      <p className="text-xs text-gray-500">
                        Total value: ${storeProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
                      </p>
                    </div>
                    
                    {store.posSystem?.enabled && (
                      <div className="flex items-center text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        POS Connected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Store Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {editingStore ? 'Edit Store' : 'Add Sub-Store'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
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
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg"
                >
                  {editingStore ? 'Update' : 'Add'} Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Management Modal */}
      {showProductManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Manage Products Across Stores</h3>
              <button
                onClick={() => setShowProductManager(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Store
                </label>
                <select
                  value={selectedSourceStore}
                  onChange={(e) => setSelectedSourceStore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select source store</option>
                  {userStores.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name} ({getStoreProducts(store.id).length} products)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Store
                </label>
                <select
                  value={selectedTargetStore}
                  onChange={(e) => setSelectedTargetStore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select target store</option>
                  {userStores.filter(s => s.id !== selectedSourceStore).map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {sourceProducts.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                  Select Products from {userStores.find(s => s.id === selectedSourceStore)?.name}
                </h4>
                
                <div className="max-h-64 overflow-y-auto mb-6">
                  <div className="space-y-2">
                    {sourceProducts.map(product => (
                      <label key={product.id} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleProductSelection(product.id)}
                          className="mr-3 h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-800">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.category} • {product.quantity} units • ${product.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedProducts.length > 0 && selectedTargetStore && (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleBulkAction('copy')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      Copy {selectedProducts.length} Products
                    </button>
                    <button
                      onClick={() => handleBulkAction('move')}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                    >
                      Move {selectedProducts.length} Products
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubStoreManagement;