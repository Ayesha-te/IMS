import React, { useEffect, useMemo, useState } from 'react';
import { SupplierService, ProductService, SupplierProductService, PurchaseOrderService, MappingService, SupermarketService } from '../services/apiService';

interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ProductOption { id: string; name: string; category?: string }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [poSummary, setPoSummary] = useState<any[]>([]);
  const [supermarkets, setSupermarkets] = useState<{ id: string; name: string }[]>([]);

  // Create/Edit supplier form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; address: string; credit_days: string }>({
    name: '', email: '', phone: '', address: '', credit_days: '0'
  });

  // Supplier-Product mapping form
  const [mapForm, setMapForm] = useState<{ supplierId: string; productId: string; supplierPrice: string; availableQty: string }>({
    supplierId: '', productId: '', supplierPrice: '', availableQty: ''
  });

  // Best supplier check form (multi-select products)
  const [bestForm, setBestForm] = useState<{ qty: string }>({ qty: '1' });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState<boolean>(false);
  const [bestResults, setBestResults] = useState<Record<string, any>>({});

  // For product -> suppliers view
  const [productSupplierQuery, setProductSupplierQuery] = useState<string>('');
  const [productSuppliers, setProductSuppliers] = useState<any[]>([]);

  // PO form (manual) + Excel import
  const [poForm, setPoForm] = useState<{ supplierId: string; supermarketName: string; poNumber: string; expectedDate: string; paymentTerms: string; buyerName: string; notes: string }>(
    { supplierId: '', supermarketName: '', poNumber: '', expectedDate: '', paymentTerms: 'Net 30', buyerName: '', notes: '' }
  );
  const [poItem, setPoItem] = useState<{ productName: string; quantity: string; unitPrice: string }>({ productName: '', quantity: '1', unitPrice: '0' });

  const supplierOptions = useMemo(() => suppliers.map(s => ({ value: String(s.id), label: s.name })), [suppliers]);
  const productOptions = useMemo(() => products.map(p => ({ value: String(p.id), label: p.name })), [products]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [supplierRes, productRes, poRes, smRes] = await Promise.all([
          SupplierService.getSuppliers(),
          ProductService.getProducts(),
          PurchaseOrderService.list().catch(() => ([])),
          SupermarketService.getSupermarkets().catch(() => ([])),
        ]);
        const supplierList: Supplier[] = Array.isArray(supplierRes) ? supplierRes : supplierRes.results || [];
        const productList = (Array.isArray(productRes) ? productRes : productRes.results || []).map((p: any) => ({ id: String(p.id ?? p.uuid ?? ''), name: String(p.name ?? ''), category: String(p.category_name ?? p.category ?? 'General') }));
        const poList = Array.isArray(poRes) ? poRes : poRes.results || [];
        const smList = (Array.isArray(smRes) ? smRes : smRes.results || []).map((s: any) => ({ id: String(s.id ?? s.uuid ?? ''), name: String(s.name ?? '') }));
        console.log('Fetched PO list:', poList);
        setSuppliers(supplierList);
        setProducts(productList);
        setPoSummary(poList);
        setSupermarkets(smList);
      } catch (e: any) {
        setError(e?.message || 'Failed to load suppliers/products/stores');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => { setEditingId(null); setForm({ name: '', email: '', phone: '', address: '', credit_days: '0' }); };

  const submitSupplier = async () => {
    if (!form.name.trim()) { setError('Supplier name is required'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        credit_days: Number(form.credit_days || '0'),
      };
      if (editingId) {
        const updated = await SupplierService.updateSupplier(editingId, payload);
        setSuppliers(prev => prev.map(s => s.id === editingId ? { ...s, ...updated } : s));
      } else {
        const created = await SupplierService.createSupplier(payload);
        setSuppliers(prev => [...prev, created]);
      }
      resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to save supplier');
    } finally { setLoading(false); }
  };

  const startEdit = (s: Supplier) => {
    setEditingId(s.id);
    setForm({ name: s.name || '', email: s.email || '', phone: s.phone || '', address: s.address || '', credit_days: String((s as any).credit_days ?? '0') });
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
    if (!selectedProductIds.length || !bestForm.qty) { setError('Select at least one product and a quantity'); return; }
    setLoading(true); setError(''); setBestResults({});
    try {
      const qty = Number(bestForm.qty);
      const entries: Record<string, any> = {};
      for (const pid of selectedProductIds) {
        try {
          const res = await SupplierProductService.bestSupplier(pid, qty);
          entries[pid] = res;
        } catch (err) {
          entries[pid] = { error: (err as any)?.message || 'Failed' };
        }
      }
      setBestResults(entries);
    } catch (e: any) {
      setError(e?.message || 'Failed to get best supplier');
    } finally { setLoading(false); }
  };

  const submitPO = async () => {
    if (!poForm.supplierId) { setError('Select supplier for PO'); return; }
    if (!poItem.productName.trim()) { setError('Enter product name'); return; }
    setLoading(true); setError('');
    try {
      const supermarketName = (poForm.supermarketName || '').trim();
      if (!supermarketName) {
        setError('Enter an existing supermarket name');
        setLoading(false);
        return;
      }
      // Resolve supermarket name to ID (auto-create if missing)
      const supermarketId = await MappingService.getSupermarketId(supermarketName);

      const payload: any = {
        supplier: Number(poForm.supplierId),
        supermarket: supermarketId, // always send ID
        po_number: poForm.poNumber || undefined,
        expected_delivery_date: poForm.expectedDate || undefined,
        payment_terms: poForm.paymentTerms || undefined,
        buyer_name: poForm.buyerName || undefined,
        notes: poForm.notes || undefined,
        items: [{ product_text: poItem.productName, quantity: Number(poItem.quantity), unit_price: Number(poItem.unitPrice) }],
      };
      console.log('PO creation payload:', payload);
      await PurchaseOrderService.create(payload);
      setPoForm({ supplierId: '', supermarketName: '', poNumber: '', expectedDate: '', paymentTerms: 'Net 30', buyerName: '', notes: '' });
      setPoItem({ productName: '', quantity: '1', unitPrice: '0' });
      const res = await PurchaseOrderService.list();
      console.log('PO list after creation:', res);
      setPoSummary(Array.isArray(res) ? res : res.results || []);
      alert('PO created');
    } catch (e: any) {
      setError(e?.message || 'Failed to create PO');
    } finally { setLoading(false); }
  };

  const downloadPOExcelTemplate = () => {
    const tip = 'expected_delivery_date must be YYYY-MM-DD';
    const rows = [
      ['po_number','supplier_name','supermarket_name','buyer_name','expected_delivery_date','payment_terms','notes','product_name','category_name','quantity','unit_price','_note'],
      ['PO-2025-01','Tech Supplier Ltd','Main Store','Your Business','2025-09-10','Net 30','Optional note','Dell Laptop','Electronics','10','800', tip]
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'po_template.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const handlePOCsvUpload = async (file: File) => {
    setLoading(true); setError('');
    try {
      const text = await file.text();
      const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
      const cols = header.split(',').map(s => s.replace(/^\"|\"$/g,'').trim());
      const idx = (name: string) => cols.findIndex(c => c.replace(/\"/g,'').toLowerCase() === name);
      const poGroups: Record<string, any> = {};

      // Build a quick lookup for supermarkets by name (case-insensitive)
      const smByName = new Map<string, string>();
      supermarkets.forEach(s => smByName.set(s.name.trim().toLowerCase(), s.id));

      // Helper: normalize date -> YYYY-MM-DD if possible
      const normalizeDate = (val: string) => {
        const v = (val || '').trim();
        if (!v) return '';
        // Allow already-correct format
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        // Try to parse flexible formats like 10/09/2025, 10-09-2025, 10 Sep 2025 etc.
        const d = new Date(v);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return v; // fallback, backend will validate
      };

      for (const line of lines) {
        const cells = line.match(/\"([^\"]|\"\")*\"|[^,]+/g) || [];
        const val = (i: number) => (cells[i] || '').replace(/^\"|\"$/g,'');
        const poNumber = val(idx('po_number'));
        const supplierName = val(idx('supplier_name'));
        const supermarketName = val(idx('supermarket_name'));
        const buyerName = val(idx('buyer_name'));
        const expectedDate = normalizeDate(val(idx('expected_delivery_date')));
        const paymentTerms = val(idx('payment_terms'));
        const notes = val(idx('notes'));
        const productName = val(idx('product_name'));
        const categoryName = val(idx('category_name'));
        const quantity = Number(val(idx('quantity')) || '0');
        const unitPrice = Number(val(idx('unit_price')) || '0');

        if (!poGroups[poNumber]) poGroups[poNumber] = { po_number: poNumber, supplier_name: supplierName, supermarket_name: supermarketName, buyer_name: buyerName, expected_delivery_date: expectedDate, payment_terms: paymentTerms, notes, items: [] };
        poGroups[poNumber].items.push({ product_name: productName, category_name: categoryName, quantity, unit_price: unitPrice });
      }

      for (const key of Object.keys(poGroups)) {
        const group = poGroups[key];
        const smName = (group.supermarket_name || poForm.supermarketName || '').trim();
        if (!smName) { console.warn('Skipping PO due to missing supermarket name:', group); continue; }

        // Map supermarket name -> id if available
        const smId = smByName.get(smName.toLowerCase());

        // Map supplier name to supplier ID
        const supplierObj = suppliers.find(s => s.name.trim().toLowerCase() === group.supplier_name.trim().toLowerCase());
        const supplierId = supplierObj ? supplierObj.id : null;
        if (!supplierId) {
          setError(`Supplier "${group.supplier_name}" not found. Please add the supplier first.`);
          console.warn('Skipping PO due to missing supplier:', group);
          continue;
        }

        const items = group.items.map((it: any) => ({ product_text: it.product_name, quantity: Number(it.quantity||0), unit_price: Number(it.unit_price||0) }));
        const payload: any = {
          supplier: supplierId,
          po_number: group.po_number || undefined,
          expected_delivery_date: group.expected_delivery_date || undefined,
          payment_terms: group.payment_terms || undefined,
          buyer_name: group.buyer_name || undefined,
          notes: group.notes || undefined,
          items,
        };

        // Always resolve supermarket name to ID (auto-create if missing)
        let supermarketId = smId;
        if (!supermarketId) {
          try {
            supermarketId = await MappingService.getSupermarketId(smName);
          } catch (e) {
            const msg = (e as any)?.message || 'Could not resolve supermarket';
            console.warn('Skipping PO due to supermarket resolution failure:', { smName, msg, group });
            setError(`PO ${group.po_number || '(no number)'}: ${msg}`);
            continue; // skip this PO entry
          }
        }
        payload.supermarket = supermarketId;

        console.log('Uploading PO payload:', payload);
        try {
          const resp = await PurchaseOrderService.create(payload);
          console.log('PO upload response:', resp);
        } catch (err: any) {
          const msg = err?.message || 'Upload failed';
          console.error('PO upload error:', err);
          setError(`PO ${group.po_number || '(no number)'}: ${msg}`);
        }
      }
      const res = await PurchaseOrderService.list();
      setPoSummary(Array.isArray(res) ? res : res.results || []);
      alert('POs created from CSV');
    } catch (e: any) {
      setError(e?.message || 'Failed to import PO CSV');
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
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Credit Days</label>
            <input className="px-3 py-2 border rounded-lg" placeholder="Credit Days" type="number" min={0} value={form.credit_days} onChange={e => setForm({ ...form, credit_days: e.target.value })} />
          </div>
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Suppliers</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const rows = [
                ['Name','Email','Phone','Address','Credit Days','PO Count'],
                ...suppliers.map((s: any) => {
                  const poCount = poSummary.filter((po: any) => po.supplier === s.id || po.supplier_name === s.name).length;
                  return [s.name, s.email||'', s.phone||'', s.address||'', String(s.credit_days ?? ''), String(poCount)];
                })
              ];
              const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'suppliers_with_po_counts.csv'; a.click(); URL.revokeObjectURL(url);
            }} className="px-3 py-1 border rounded-lg text-sm">Download Suppliers+POs CSV</button>
            <button onClick={() => {
              const rows = [
                ['PO#','Supplier','Store','Status','Total','Created'],
                ...poSummary.map((po: any) => [po.po_number || po.id, po.supplier_name || po.supplier, po.supermarket_name || po.supermarket, po.status, po.total_amount ?? '-', po.created_at?.slice(0,10)])
              ];
              const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'purchase_orders.csv'; a.click(); URL.revokeObjectURL(url);
            }} className="px-3 py-1 border rounded-lg text-sm">Download All POs CSV</button>
          </div>
        </div>
        <div className="overflow-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Address</th>
                <th className="text-left p-2">Credit Days</th>
                <th className="text-left p-2">POs Created</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s: any) => {
                const poCount = poSummary.filter((po: any) => po.supplier === s.id || po.supplier_name === s.name).length;
                return (
                  <tr key={s.id} className="border-t">
                    <td className="p-2 font-medium">{s.name}</td>
                    <td className="p-2">{s.email || '-'}</td>
                    <td className="p-2">{s.phone || '-'}</td>
                    <td className="p-2">{s.address || '-'}</td>
                    <td className="p-2">{s.credit_days ?? '-'}</td>
                    <td className="p-2">{poCount}</td>
                    <td className="p-2 space-x-2">
                      <button onClick={() => startEdit(s)} className="px-3 py-1 text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => removeSupplier(s.id)} className="px-3 py-1 text-rose-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Product Supplier Selection */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Supplier Selection</h3>
        {/* Controls: multi-select dropdown with checkboxes + qty + recommend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-4">
          <div className="md:col-span-1 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select products</label>
            <button
              type="button"
              className="w-full px-3 py-2 border rounded-lg text-left bg-white"
              onClick={() => setIsProductDropdownOpen(v => !v)}
            >
              {selectedProductIds.length ? `${selectedProductIds.length} selected` : 'Choose products'}
            </button>
            {isProductDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow">
                <div className="p-2 sticky top-0 bg-white border-b">
                  <input
                    placeholder="Filter products..."
                    className="w-full px-2 py-1 border rounded"
                    onChange={e => {
                      const q = e.target.value.toLowerCase();
                      (window as any).__PR_FILTER__ = q;
                      setProducts(p => [...p]);
                    }}
                  />
                </div>
                <ul className="max-h-48 overflow-auto">
                  {products
                    .filter(p => !((window as any).__PR_FILTER__) || p.name.toLowerCase().includes((window as any).__PR_FILTER__))
                    .map(p => {
                      const checked = selectedProductIds.includes(p.id);
                      return (
                        <li key={p.id} className="px-3 py-2 flex items-center gap-2 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              setSelectedProductIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id));
                            }}
                          />
                          <span className="text-sm">{p.name}</span>
                        </li>
                      );
                    })}
                </ul>
                <div className="p-2 border-t bg-gray-50 flex justify-between">
                  <button className="text-xs px-2 py-1" onClick={() => setSelectedProductIds(products.map(p => p.id))}>Select all</button>
                  <button className="text-xs px-2 py-1" onClick={() => setSelectedProductIds([])}>Clear</button>
                  <button className="text-xs px-2 py-1" onClick={() => setIsProductDropdownOpen(false)}>Done</button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (per product)</label>
            <input className="w-full px-3 py-2 border rounded-lg" type="number" min={1} value={bestForm.qty} onChange={e => setBestForm({ ...bestForm, qty: e.target.value })} />
          </div>
          <div className="flex items-end">
            <button onClick={findBestSupplier} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Recommend Best</button>
          </div>
        </div>

        {/* Results */}
        {!!Object.keys(bestResults).length && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm">
            <div className="font-semibold mb-1">Best Recommendations</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {selectedProductIds.map(pid => {
                const res = bestResults[pid];
                const name = products.find(p => p.id === pid)?.name || pid;
                return (
                  <div key={pid} className="p-2 bg-white rounded border">
                    <div className="font-medium">{name}</div>
                    {res?.error ? (
                      <div className="text-rose-700">{res.error}</div>
                    ) : (
                      <div>
                        <div><strong>Supplier:</strong> {res?.supplier_name || res?.supplier || 'N/A'}</div>
                        <div><strong>Price:</strong> {res?.supplier_price ?? res?.price ?? 'N/A'}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Suppliers table for a single selected product (optional view) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-3">
            <div className="overflow-auto border rounded-xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Supplier</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Available Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {productSuppliers.map((ps: any) => (
                    <tr key={ps.id} className="border-t">
                      <td className="p-2">{ps.supplier_name || ps.supplier}</td>
                      <td className="p-2">{ps.supplier_price}</td>
                      <td className="p-2">{ps.available_quantity ?? '-'}</td>
                    </tr>
                  ))}
                  {!productSuppliers.length && (
                    <tr><td className="p-2 text-gray-500" colSpan={3}>No suppliers yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Orders on Suppliers page */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Purchase Orders</h3>
          <div className="flex gap-2">
            <button onClick={async () => { downloadPOExcelTemplate(); }} className="px-3 py-1 border rounded-lg text-sm">Download CSV Template</button>
            <label className="px-3 py-1 border rounded-lg text-sm cursor-pointer">
              Upload CSV
              <input type="file" accept=".csv" className="hidden" onChange={e => e.target.files && handlePOCsvUpload(e.target.files[0])} />
            </label>
          </div>
        </div>



        {/* Manual PO Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select className="w-full px-3 py-2 border rounded-lg" value={poForm.supplierId} onChange={e => setPoForm({ ...poForm, supplierId: e.target.value })}>
              <option value="">Select supplier</option>
              {supplierOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store (supermarket name)</label>
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Main Store" value={poForm.supermarketName} onChange={e => setPoForm({ ...poForm, supermarketName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="PO-2025-01" value={poForm.poNumber} onChange={e => setPoForm({ ...poForm, poNumber: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
            <input type="date" className="w-full px-3 py-2 border rounded-lg" value={poForm.expectedDate} onChange={e => setPoForm({ ...poForm, expectedDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Net 30" value={poForm.paymentTerms} onChange={e => setPoForm({ ...poForm, paymentTerms: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Your Business" value={poForm.buyerName} onChange={e => setPoForm({ ...poForm, buyerName: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full px-3 py-2 border rounded-lg" value={poForm.notes} onChange={e => setPoForm({ ...poForm, notes: e.target.value })} />
          </div>
        </div>
        <div className="mb-3">
          <div className="font-medium mb-2">Item</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Dell Laptop" value={poItem.productName}
                onChange={e => setPoItem({ ...poItem, productName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
              <input type="number" min={1} className="w-full px-3 py-2 border rounded-lg" value={poItem.quantity}
                onChange={e => setPoItem({ ...poItem, quantity: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
              <input type="number" min={0} step={0.01} className="w-full px-3 py-2 border rounded-lg" value={poItem.unitPrice}
                onChange={e => setPoItem({ ...poItem, unitPrice: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={submitPO} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Create PO</button>
        </div>
      </section>

      {/* PO Summary (quick view) */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">PO Summary</h3>
          <div className="flex gap-2">
            <button onClick={async () => {
              setLoading(true); setError('');
              try { const res = await PurchaseOrderService.list(); const arr = Array.isArray(res) ? res : res.results || []; setPoSummary(arr); }
              catch (e: any) { setError(e?.message || 'Failed to refresh POs'); }
              finally { setLoading(false); }
            }} className="px-3 py-1 border rounded-lg text-sm">Refresh</button>
          </div>
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
              {poSummary.map((po: any) => (
                <tr key={po.id} className="border-t">
                  <td className="p-2">{po.po_number || po.id}</td>
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