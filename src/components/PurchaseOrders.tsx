import React, { useEffect, useMemo, useState } from 'react';
import { SupplierService, ProductService } from '../services/apiService';

// Minimal inline service fallbacks if services not exported from apiService
const API_BASE = (window as any).__API_BASE__ || (import.meta as any).env?.VITE_API_BASE_URL || '';
const API = {
  supplierProducts: `${API_BASE}/api/purchasing/supplier-products/`,
  purchaseOrders: `${API_BASE}/api/purchasing/purchase-orders/`,
  poDetail: (id: number) => `${API_BASE}/api/purchasing/purchase-orders/${id}/`,
  poReceive: (id: number) => `${API_BASE}/api/purchasing/purchase-orders/${id}/receive/`,
  poPdf: (id: number) => `${API_BASE}/api/purchasing/purchase-orders/${id}/pdf/`,
  poEmail: (id: number) => `${API_BASE}/api/purchasing/purchase-orders/${id}/email/`,
};

const authHeaders = () => {
  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('ims_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch { return {}; }
};

const SupplierProductService = {
  async list(params: Record<string, any>) {
    const url = new URL(API.supplierProducts);
    Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const res = await fetch(url.toString(), { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
    if (!res.ok) throw new Error(`Failed to load supplier products (${res.status})`);
    return res.json();
  }
};

const PurchaseOrderService = {
  async list() {
    const res = await fetch(API.purchaseOrders, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
    if (!res.ok) throw new Error(`Failed to load POs (${res.status})`);
    return res.json();
  },
  async create(body: any) {
    const res = await fetch(API.purchaseOrders, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async get(id: number) {
    const res = await fetch(API.poDetail(id), { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
    if (!res.ok) throw new Error(`Failed to fetch PO (${res.status})`);
    return res.json();
  },
  async update(id: number, body: any) {
    const res = await fetch(API.poDetail(id), { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async pdf(id: number) {
    const res = await fetch(API.poPdf(id), { headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`Failed to get PDF (${res.status})`);
    return res.blob();
  },
  async email(id: number) {
    const res = await fetch(API.poEmail(id), { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() } });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

interface Supplier { id: number; name: string }
interface Product { id: string; name: string; category?: string }
interface SupplierProduct { id: number; supplier: number; supplier_name: string; product: string; product_name: string; supplier_price: number; available_quantity?: number }

export default function PurchaseOrders() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);

  // Line items for PO (Create)
  const [items, setItems] = useState<Array<{ product: string; quantity: string; unit_price: string }>>([]);

  // POs list
  const [poList, setPoList] = useState<any[]>([]);

  // Auto-email preference (one-time confirmation)
  const AUTO_EMAIL_KEY = 'po:autoEmailConfirmed';
  const [autoEmailPo, setAutoEmailPo] = useState<boolean>(false);
  useEffect(() => {
    setAutoEmailPo(localStorage.getItem(AUTO_EMAIL_KEY) === 'yes');
  }, []);

  // Import mode
  const [mode, setMode] = useState<'manual' | 'excel'>('manual');

  // Editing state
  const [editingPO, setEditingPO] = useState<any | null>(null);
  const [editItems, setEditItems] = useState<Array<{ product: string; quantity: string; unit_price: string }>>([]);
  const [editMeta, setEditMeta] = useState<{ expected_delivery_date: string; payment_terms: string; notes: string }>({ expected_delivery_date: '', payment_terms: '', notes: '' });

  const groupedProducts = useMemo(() => {
    // Group by category (department-wise)
    const map: Record<string, Product[]> = {};
    for (const p of products) {
      const key = (p.category || 'General').trim() || 'General';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return map;
  }, [products]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [sRes, pRes] = await Promise.all([
          SupplierService.getSuppliers(),
          ProductService.getProducts(),
        ]);
        const sList: Supplier[] = Array.isArray(sRes) ? sRes : sRes.results || [];
        const pListRaw = Array.isArray(pRes) ? pRes : pRes.results || [];
        const pList: Product[] = pListRaw.map((p: any) => ({ id: String(p.id ?? p.uuid ?? ''), name: String(p.name ?? ''), category: String(p.category_name ?? p.category ?? 'General') }));
        setSuppliers(sList);
        setProducts(pList);

        // Load initial POs
        try {
          const pos = await PurchaseOrderService.list();
          const arr = Array.isArray(pos) ? pos : pos.results || [];
          setPoList(arr);
        } catch {}
      } catch (e: any) {
        setError(e?.message || 'Failed to load suppliers/products');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const onSelectSupplier = async (supplierId: string) => {
    setSelectedSupplier(supplierId);
    setItems([]);
    if (!supplierId) { setSupplierProducts([]); return; }
    setLoading(true); setError('');
    try {
      const res = await SupplierProductService.list({ supplier: supplierId });
      const arr: SupplierProduct[] = Array.isArray(res) ? res : res.results || [];
      setSupplierProducts(arr);
    } catch (e: any) {
      setError(e?.message || 'Failed to load supplier products');
    } finally { setLoading(false); }
  };

  const addItem = (productId: string) => {
    const mapped = supplierProducts.find(sp => String(sp.product) === String(productId));
    const price = mapped?.supplier_price ?? 0;
    setItems(prev => [...prev, { product: productId, quantity: '1', unit_price: String(price) }]);
  };

  const updateItem = (idx: number, field: 'product' | 'quantity' | 'unit_price', value: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const submitPO = async () => {
    if (!selectedSupplier) { setError('Select supplier'); return; }
    if (!items.length) { setError('Add at least one item'); return; }
    setLoading(true); setError('');
    try {
      // Pre-generate PO number on frontend in format PO-YYYY-1 (no padding), incremented per year
      const year = new Date().getFullYear();
      const counterKey = `poCounter:${year}`;
      const current = Number(localStorage.getItem(counterKey) || '0');
      const next = current + 1;
      localStorage.setItem(counterKey, String(next));
      const poNumber = `PO-${year}-${next}`;

      const payload = {
        supplier: Number(selectedSupplier),
        po_number: poNumber,
        items: items.map(it => ({ product: it.product, quantity: Number(it.quantity || '0'), unit_price: Number(it.unit_price || '0') })),
      };
      const res = await PurchaseOrderService.create(payload);

      // Auto-email after creation if confirmed
      const createdId = Number((res && (res.id ?? res.po?.id)) ?? NaN);
      const pref = localStorage.getItem(AUTO_EMAIL_KEY);
      if (!Number.isNaN(createdId)) {
        if (autoEmailPo) {
          await sendPoEmail(createdId);
        } else if (pref === null) {
          const ok = await ensureAutoEmailPref();
          if (ok) await sendPoEmail(createdId);
        }
      }

      alert(`PO ${poNumber} created successfully`);
      // refresh list
      try {
        const pos = await PurchaseOrderService.list();
        const arr = Array.isArray(pos) ? pos : pos.results || [];
        setPoList(arr);
      } catch {}
      // reset
      setItems([]);
    } catch (e: any) {
      setError(e?.message || 'Failed to create PO');
    } finally { setLoading(false); }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    // Simple CSV parser: product,quantity,unit_price
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed = lines.slice(1).map(line => {
      const [product, quantity, unit_price] = line.split(',');
      return { product: product?.trim() || '', quantity: quantity?.trim() || '0', unit_price: unit_price?.trim() || '0' };
    }).filter(row => row.product);
    setItems(parsed);
  };

  // --- PDF download helper ---
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadPoPdf = async (po: any) => {
    try {
      setLoading(true); setError('');
      const blob = await PurchaseOrderService.pdf(po.id);
      const name = (po.po_number || `PO-${po.id}`).toString();
      downloadBlob(blob, `${name}.pdf`);
    } catch (e: any) {
      setError(e?.message || 'Failed to download PDF');
    } finally { setLoading(false); }
  };

  // --- Email PO helper ---
  const sendPoEmail = async (poId: number) => {
    try {
      setLoading(true); setError('');
      await PurchaseOrderService.email(poId);
      alert('PO emailed to supplier successfully');
    } catch (e: any) {
      setError(e?.message || 'Failed to email PO');
    } finally { setLoading(false); }
  };

  // Ask once whether to auto-email POs after creation
  const ensureAutoEmailPref = async (): Promise<boolean> => {
    const pref = localStorage.getItem(AUTO_EMAIL_KEY);
    if (pref === 'yes') { setAutoEmailPo(true); return true; }
    if (pref === 'no') { setAutoEmailPo(false); return false; }
    const ok = window.confirm('Do you want the system to automatically email a copy of each newly created PO to the supplier? You can change this later in your browser storage.');
    localStorage.setItem(AUTO_EMAIL_KEY, ok ? 'yes' : 'no');
    setAutoEmailPo(ok);
    return ok;
  };

  // --- Edit PO ---
  const openEdit = async (poId: number) => {
    setLoading(true); setError('');
    try {
      const data = await PurchaseOrderService.get(poId);
      setEditingPO(data);
      setEditItems((data.items || []).map((it: any) => ({
        product: String(it.product),
        quantity: String(it.quantity),
        unit_price: String(it.unit_price)
      })));
      setEditMeta({
        expected_delivery_date: (data.expected_delivery_date || '').slice(0, 10),
        payment_terms: data.payment_terms || '',
        notes: data.notes || ''
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load PO');
    } finally { setLoading(false); }
  };

  const updateEditItem = (idx: number, field: 'product' | 'quantity' | 'unit_price', value: string) => {
    setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };
  const addEditItem = (productId: string) => {
    const mapped = supplierProducts.find(sp => String(sp.product) === String(productId));
    const price = mapped?.supplier_price ?? 0;
    setEditItems(prev => [...prev, { product: productId, quantity: '1', unit_price: String(price) }]);
  };
  const removeEditItem = (idx: number) => setEditItems(prev => prev.filter((_, i) => i !== idx));

  const saveEdit = async () => {
    if (!editingPO) return;
    if (!editItems.length) { setError('Add at least one item'); return; }
    setLoading(true); setError('');
    try {
      const payload: any = {
        expected_delivery_date: editMeta.expected_delivery_date || null,
        payment_terms: editMeta.payment_terms || null,
        notes: editMeta.notes || null,
        items: editItems.map(it => ({ product: it.product, quantity: Number(it.quantity || '0'), unit_price: Number(it.unit_price || '0') })),
      };
      await PurchaseOrderService.update(Number(editingPO.id), payload);
      // refresh list
      try {
        const pos = await PurchaseOrderService.list();
        const arr = Array.isArray(pos) ? pos : pos.results || [];
        setPoList(arr);
      } catch {}
      setEditingPO(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update PO');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Purchase Orders</h2>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>
        {error && <div className="p-3 mt-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">{error}</div>}
      </div>

      {/* Create PO */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <button className={`px-3 py-1 rounded-lg ${mode==='manual'?'bg-rose-500 text-white':'border'}`} onClick={() => setMode('manual')}>Manual</button>
          <button className={`px-3 py-1 rounded-lg ${mode==='excel'?'bg-rose-500 text-white':'border'}`} onClick={() => setMode('excel')}>Excel</button>
        </div>

        {/* Supplier selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <select className="w-full px-3 py-2 border rounded-lg" value={selectedSupplier} onChange={e => onSelectSupplier(e.target.value)}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {mode === 'manual' && (
          <div className="space-y-4">
            {/* Department-wise picker */}
            {Object.entries(groupedProducts).map(([dept, list]) => (
              <div key={dept} className="border rounded-xl p-3">
                <div className="font-semibold mb-2">{dept}</div>
                <div className="flex flex-wrap gap-2">
                  {list.map(p => (
                    <button key={p.id} onClick={() => addItem(p.id)} className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50">
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Items table */}
            <div className="overflow-auto border rounded-xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Quantity</th>
                    <th className="text-left p-2">Unit Price</th>
                    <th className="text-left p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">
                        <select className="px-2 py-1 border rounded-lg" value={it.product} onChange={e => updateItem(idx, 'product', e.target.value)}>
                          <option value="">Select</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="p-2"><input className="px-2 py-1 border rounded-lg w-24" type="number" min={1} value={it.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /></td>
                      <td className="p-2"><input className="px-2 py-1 border rounded-lg w-28" type="number" step="0.01" min={0} value={it.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} /></td>
                      <td className="p-2"><button className="text-rose-600" onClick={() => removeItem(idx)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={submitPO} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Create PO</button>
          </div>
        )}

        {mode === 'excel' && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">Upload CSV with columns: product,quantity,unit_price</div>
            <input type="file" accept=".csv,text/csv" onChange={handleCSVUpload} />
            <button onClick={submitPO} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Create PO</button>
          </div>
        )}
      </section>

      {/* PO Summary */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">PO Summary</h3>
          <button onClick={async () => {
            setLoading(true); setError('');
            try {
              const pos = await PurchaseOrderService.list();
              const arr = Array.isArray(pos) ? pos : pos.results || [];
              setPoList(arr);
            } catch (e: any) { setError(e?.message || 'Failed to refresh POs'); }
            finally { setLoading(false); }
          }} className="px-3 py-1 border rounded-lg text-sm">Refresh</button>
        </div>
        <div className="overflow-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">PO#</th>
                <th className="text-left p-2">Supplier</th>
                <th className="text-left p-2">Store</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Total</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {poList.map((po: any) => (
                <tr key={po.id} className="border-t">
                  <td className="p-2">{po.po_number || po.id}</td>
                  <td className="p-2">{po.supplier_name || po.supplier}</td>
                  <td className="p-2">{po.supermarket_name || po.supermarket}</td>
                  <td className="p-2">{po.status}</td>
                  <td className="p-2">{po.total_amount ?? '-'}</td>
                  <td className="p-2">{po.created_at?.slice(0,10)}</td>
                  <td className="p-2 space-x-2">
                    <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => openEdit(po.id)}>Edit</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => downloadPoPdf(po)}>PDF</button>
                    <button className="px-2 py-1 border rounded text-emerald-700 hover:bg-emerald-50" onClick={async () => {
                      // One-time confirmation before first manual send
                      const pref = localStorage.getItem(AUTO_EMAIL_KEY);
                      if (pref === null) {
                        const ok = await ensureAutoEmailPref();
                        if (!ok) return;
                      }
                      await sendPoEmail(po.id);
                    }}>Email</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit PO Panel */}
      {editingPO && (
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Edit PO: {editingPO.po_number || editingPO.id}</h3>
            <div className="space-x-2">
              <button className="px-3 py-1 border rounded-lg" onClick={() => setEditingPO(null)}>Cancel</button>
              <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg" onClick={saveEdit}>Save</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Supplier</div>
              <div className="font-medium">{editingPO.supplier_name || editingPO.supplier}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Store</div>
              <div className="font-medium">{editingPO.supermarket_name || editingPO.supermarket}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
              <input type="date" className="w-full px-3 py-2 border rounded-lg" value={editMeta.expected_delivery_date} onChange={e => setEditMeta(v => ({ ...v, expected_delivery_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg" value={editMeta.payment_terms} onChange={e => setEditMeta(v => ({ ...v, payment_terms: e.target.value }))} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} value={editMeta.notes} onChange={e => setEditMeta(v => ({ ...v, notes: e.target.value }))} />
            </div>
          </div>

          {/* Add items for edit using product picker by department */}
          <div className="space-y-4">
            {Object.entries(groupedProducts).map(([dept, list]) => (
              <div key={dept} className="border rounded-xl p-3">
                <div className="font-semibold mb-2">{dept}</div>
                <div className="flex flex-wrap gap-2">
                  {list.map(p => (
                    <button key={p.id} onClick={() => addEditItem(p.id)} className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50">
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Items table (edit) */}
            <div className="overflow-auto border rounded-xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Quantity</th>
                    <th className="text-left p-2">Unit Price</th>
                    <th className="text-left p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {editItems.map((it, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">
                        <select className="px-2 py-1 border rounded-lg" value={it.product} onChange={e => updateEditItem(idx, 'product', e.target.value)}>
                          <option value="">Select</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="p-2"><input className="px-2 py-1 border rounded-lg w-24" type="number" min={1} value={it.quantity} onChange={e => updateEditItem(idx, 'quantity', e.target.value)} /></td>
                      <td className="p-2"><input className="px-2 py-1 border rounded-lg w-28" type="number" step="0.01" min={0} value={it.unit_price} onChange={e => updateEditItem(idx, 'unit_price', e.target.value)} /></td>
                      <td className="p-2"><button className="text-rose-600" onClick={() => removeEditItem(idx)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}