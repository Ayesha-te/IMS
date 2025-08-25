import React, { useMemo, useState } from 'react';
import { Store, Building2, ArrowRight, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import type { Supermarket } from '../types/Product';
import { SupermarketService } from '../services/apiService';

interface MyStoresProps {
  stores: Supermarket[];
  onNavigateToStore: (storeId: string) => void;
  onStoreCreated?: (store: any) => void; // optional callback to refresh list
}

const MyStores: React.FC<MyStoresProps> = ({ stores, onNavigateToStore, onStoreCreated }) => {
  const mainStores = useMemo(() => stores.filter(s => !s.isSubStore), [stores]);
  const subStores = useMemo(() => stores.filter(s => s.isSubStore), [stores]);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    parentId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ name: '', address: '', phone: '', email: '', description: '', parentId: '' });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.address.trim()) {
      setError('Name and address are required.');
      return;
    }
    if (!form.parentId) {
      setError('Please select a parent store for the sub-store.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
        description: form.description,
        is_sub_store: true,
        parent: form.parentId,
      };
      const created = await SupermarketService.createSupermarket(payload);
      setShowAdd(false);
      resetForm();
      onStoreCreated?.(created);
    } catch (err: any) {
      setError(err?.message || 'Failed to create sub-store.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StoreCard: React.FC<{ store: Supermarket }> = ({ store }) => {
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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-rose-100 p-3 rounded-xl mr-4">
              <Store className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Stores</h1>
              <p className="text-gray-600">
                You have {stores.length} store{stores.length !== 1 ? 's' : ''} associated with your account.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium flex items-center transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Sub-Store
          </button>
        </div>
      </div>

      {/* Main Stores */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Main Stores</h2>
        {mainStores.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {mainStores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You have no main stores.</p>
        )}
      </div>

      {/* Sub Stores */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Sub-Stores</h2>
        {subStores.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {subStores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You have no sub-stores.</p>
        )}
      </div>

      {/* Add Sub-Store Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Add Sub-Store</h3>
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={form.address} onChange={e => setForm(s => ({ ...s, address: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={form.phone} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input className="w-full px-3 py-2 border rounded-lg" value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Store *</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={form.parentId} onChange={e => setForm(s => ({ ...s, parentId: e.target.value }))} required>
                  <option value="">Select parent store</option>
                  {mainStores.map(ms => <option key={ms.id} value={ms.id}>{ms.name}</option>)}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" className="px-4 py-2 border rounded-lg" onClick={() => { setShowAdd(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-rose-500 text-white rounded-lg disabled:opacity-60">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStores;