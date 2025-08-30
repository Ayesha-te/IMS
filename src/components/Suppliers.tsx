import React, { useEffect, useMemo, useState } from 'react';
import { SupplierService, ProductService, SupplierProductService } from '../services/apiService';

interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ProductOption { id: string; name: string }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Create/Edit supplier form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; address: string }>({
    name: '', email: '', phone: '', address: ''
  });

  // Supplier-Product mapping form
  const [mapForm, setMapForm] = useState<{ supplierId: string; productId: string; supplierPrice: string; availableQty: string }>({
    supplierId: '', productId: '', supplierPrice: '', availableQty: ''
  });

  // Best supplier check form
  const [bestForm, setBestForm] = useState<{ productId: string; qty: string }>({ productId: '', qty: '1' });
  const [bestResult, setBestResult] = useState<any>(null);

  const supplierOptions = useMemo(() => suppliers.map(s => ({ value: String(s.id), label: s.name })), [suppliers]);
  const productOptions = useMemo(() => products.map(p => ({ value: String(p.id), label: p.name })), [products]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [supplierRes, productRes] = await Promise.all([
          SupplierService.getSuppliers(),
          ProductService.getProducts(),
        ]);
        const supplierList: Supplier[] = Array.isArray(supplierRes) ? supplierRes : supplierRes.results || [];
        const productList = (Array.isArray(productRes) ? productRes : productRes.results || []).map((p: any) => ({ id: String(p.id ?? p.uuid ?? ''), name: String(p.name ?? '') }));
        setSuppliers(supplierList);
        setProducts(productList);
      } catch (e: any) {
        setError(e?.message || 'Failed to load suppliers or products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => { setEditingId(null); setForm({ name: '', email: '', phone: '', address: '' }); };

  const submitSupplier = async () => {
    if (!form.name.trim()) { setError('Supplier name is required'); return; }
    setLoading(true); setError('');
    try {
      if (editingId) {
        const updated = await SupplierService.updateSupplier(editingId, form);
        setSuppliers(prev => prev.map(s => s.id === editingId ? { ...s, ...updated } : s));
      } else {
        const created = await SupplierService.createSupplier(form);
        setSuppliers(prev => [...prev, created]);
      }
      resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to save supplier');
    } finally { setLoading(false); }
  };

  const startEdit = (s: Supplier) => {
    setEditingId(s.id);
    setForm({ name: s.name || '', email: s.email || '', phone: s.phone || '', address: s.address || '' });
  };

  const removeSupplier = async (id: number) => {
    if (!confirm('Delete this supplier?')) return;
    setLoading(true); setError('');
    try {
      await SupplierService.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      if (editingId === id) resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete supplier');
    } finally { setLoading(false); }
  };

  const mapSupplierProduct = async () => {
    if (!mapForm.supplierId || !mapForm.productId || !mapForm.supplierPrice) {
      setError('Supplier, Product and Price are required');
      return;
    }
    setLoading(true); setError('');
    try {
      await SupplierProductService.create({
        supplier: Number(mapForm.supplierId),
        product: mapForm.productId,
        supplier_price: Number(mapForm.supplierPrice),
        available_quantity: mapForm.availableQty ? Number(mapForm.availableQty) : undefined,
      });
      setMapForm({ supplierId: '', productId: '', supplierPrice: '', availableQty: '' });
      alert('Supplier mapped to product successfully');
    } catch (e: any) {
      setError(e?.message || 'Failed to map supplier to product');
    } finally { setLoading(false); }
  };

  const findBestSupplier = async () => {
    if (!bestForm.productId || !bestForm.qty) { setError('Select product and quantity'); return; }
    setLoading(true); setError(''); setBestResult(null);
    try {
      const res = await SupplierProductService.bestSupplier(bestForm.productId, Number(bestForm.qty));
      setBestResult(res);
    } catch (e: any) {
      setError(e?.message || 'Failed to get best supplier');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Supplier Management</h2>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>
        {error && (
          <div className="p-3 mt-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">{error}</div>
        )}
      </div>

      {/* Create/Edit Supplier */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{editingId ? 'Edit Supplier' : 'Create Supplier'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="px-3 py-2 border rounded-lg" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={submitSupplier} className="px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600">{editingId ? 'Update' : 'Save Supplier'}</button>
          {editingId && (
            <button onClick={resetForm} className="px-4 py-2 border rounded-xl">Cancel</button>
          )}
        </div>
      </section>

      {/* Supplier List */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Suppliers</h3>
        <div className="overflow-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Address</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 font-medium">{s.name}</td>
                  <td className="p-2">{s.email || '-'}</td>
                  <td className="p-2">{s.phone || '-'}</td>
                  <td className="p-2">{s.address || '-'}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => startEdit(s)} className="px-3 py-1 text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => removeSupplier(s.id)} className="px-3 py-1 text-rose-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Map Supplier to Product */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Map Supplier to Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select className="px-3 py-2 border rounded-lg" value={mapForm.supplierId} onChange={e => setMapForm({ ...mapForm, supplierId: e.target.value })}>
            <option value="">Select Supplier</option>
            {supplierOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select className="px-3 py-2 border rounded-lg" value={mapForm.productId} onChange={e => setMapForm({ ...mapForm, productId: e.target.value })}>
            <option value="">Select Product</option>
            {productOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input className="px-3 py-2 border rounded-lg" placeholder="Supplier Price" type="number" step="0.01" value={mapForm.supplierPrice} onChange={e => setMapForm({ ...mapForm, supplierPrice: e.target.value })} />
          <input className="px-3 py-2 border rounded-lg" placeholder="Available Qty (optional)" type="number" value={mapForm.availableQty} onChange={e => setMapForm({ ...mapForm, availableQty: e.target.value })} />
          <button onClick={mapSupplierProduct} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Map</button>
        </div>
      </section>

      {/* Best Supplier Selection */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Best Supplier Selection</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <select className="px-3 py-2 border rounded-lg" value={bestForm.productId} onChange={e => setBestForm({ ...bestForm, productId: e.target.value })}>
            <option value="">Select Product</option>
            {productOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input className="px-3 py-2 border rounded-lg" placeholder="Required Qty" type="number" min={1} value={bestForm.qty} onChange={e => setBestForm({ ...bestForm, qty: e.target.value })} />
          <button onClick={findBestSupplier} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Recommend</button>
        </div>
        {bestResult && (
          <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm">
            <div className="font-semibold mb-1">Recommendation</div>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(bestResult, null, 2)}</pre>
          </div>
        )}
      </section>
    </div>
  );
}