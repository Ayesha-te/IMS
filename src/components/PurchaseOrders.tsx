import React, { useEffect, useMemo, useState } from 'react';
import { SupplierService, ProductService, SupplierProductService, PurchaseOrderService } from '../services/apiService';

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

  // Line items for PO
  const [items, setItems] = useState<Array<{ product: string; quantity: string; unit_price: string }>>([]);

  // POs list
  const [poList, setPoList] = useState<any[]>([]);

  // Import mode
  const [mode, setMode] = useState<'manual' | 'excel'>('manual');

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
      const payload = {
        supplier: Number(selectedSupplier),
        items: items.map(it => ({ product: it.product, quantity: Number(it.quantity || '0'), unit_price: Number(it.unit_price || '0') })),
      };
      const res = await PurchaseOrderService.create(payload);
      alert('PO created successfully');
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
              </tr>
            </thead>
            <tbody>
              {poList.map((po: any) => (
                <tr key={po.id} className="border-t">
                  <td className="p-2">{po.id}</td>
                  <td className="p-2">{po.supplier_name || po.supplier}</td>
                  <td className="p-2">{po.supermarket_name || po.supermarket}</td>
                  <td className="p-2">{po.status}</td>
                  <td className="p-2">{po.total_amount ?? '-'}</td>
                  <td className="p-2">{po.created_at?.slice(0,10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}