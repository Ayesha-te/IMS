import React, { useEffect, useMemo, useState } from 'react';
import JsonView from '@microlink/react-json-view';
import { OrdersService, SupermarketService, WarehouseService, ProductsApi } from '../services/apiService';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Error boundary to prevent editor crashes from breaking the page (e.g., on Vercel)
class EditorErrorBoundary extends React.Component<{ fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_error: any) {}
  render() { return this.state.hasError ? this.props.fallback : (this.props.children as any); }
}

// Safe editor wrapper: dynamically loads Monaco on the client and falls back to a textarea otherwise
interface SafeEditorProps {
  height: string;
  defaultLanguage: string;
  value: string;
  onChange: (val: string | undefined) => void;
  options?: any;
}
const SafeEditor: React.FC<SafeEditorProps> = ({ height, defaultLanguage, value, onChange, options }) => {
  // 1) Always declare hooks in same order
  const [isClient, setIsClient] = React.useState(false);
  const [MonacoComponent, setMonacoComponent] = React.useState<React.ComponentType<any> | null>(null);

  // 2) Mark client after mount
  React.useEffect(() => { setIsClient(true); }, []);

  // 3) Dynamically import monaco after mount; if it fails, keep null (fallback used)
  React.useEffect(() => {
    let mounted = true;
    import('@monaco-editor/react')
      .then(mod => { if (mounted) setMonacoComponent(() => (mod.default as any)); })
      .catch(() => { if (mounted) setMonacoComponent(null); });
    return () => { mounted = false; };
  }, []);

  // 4) Fallback textarea (works in SSR/Vercel)
  const fallback = (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ height }}
      className="w-full px-3 py-2 border rounded font-mono text-xs"
      placeholder={`${defaultLanguage} editor`}
    />
  );

  // 5) If not client or Monaco failed to load -> fallback
  if (!isClient || !MonacoComponent) return fallback;

  // 6) Render Monaco wrapped with error boundary
  const MonacoEditor = MonacoComponent;
  return (
    <EditorErrorBoundary fallback={fallback}>
      <MonacoEditor
        height={height}
        defaultLanguage={defaultLanguage}
        value={value}
        onChange={(val: string | undefined) => onChange(val || '')}
        options={options}
      />
    </EditorErrorBoundary>
  );
};

interface OrderItem { id: string; product: string; product_name?: string; quantity: number; unit_price: number; total_price: number }
interface Order {
  id: string;
  supermarket: string;
  supermarket_name?: string;
  channel?: 'SHOPIFY'|'AMAZON'|'DARAZ'|'POS'|'MANUAL'|'WEBSITE';
  external_order_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  status: 'PENDING'|'CONFIRMED'|'PROCESSING'|'SHIPPED'|'DELIVERED'|'RETURNED'|'CANCELLED';
  payment_method?: 'COD'|'PREPAID';
  payment_status?: 'PENDING'|'PAID'|'REFUNDED'|'FAILED';
  courier?: 'DPD'|'YODEL'|'CITYSPRINT'|'COLLECTPLUS'|'TUFFNELLS';
  shipping_status?: 'PENDING'|'LABEL_CREATED'|'IN_TRANSIT'|'DELIVERED'|'FAILED';
  courier_awb?: string;
  tracking_id?: string;
  assigned_warehouse?: string;
  total_amount: number;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
}

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const channelOptions = [
  { value: '', label: 'All Channels' },
  { value: 'SHOPIFY', label: 'Shopify' },
  { value: 'AMAZON', label: 'Amazon' },
  { value: 'DARAZ', label: 'Daraz' },
  { value: 'POS', label: 'POS' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'WEBSITE', label: 'Website' },
];

const courierOptions = [
  { value: '', label: 'All Couriers' },
  { value: 'DPD', label: 'DPD UK' },
  { value: 'YODEL', label: 'Yodel' },
  { value: 'CITYSPRINT', label: 'CitySprint' },
  { value: 'COLLECTPLUS', label: 'CollectPlus' },
  { value: 'TUFFNELLS', label: 'Tuffnells' },
];

const paymentStatusOptions = [
  { value: '', label: 'Any Payment' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'FAILED', label: 'Failed' },
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [courier, setCourier] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [supermarkets, setSupermarkets] = useState<{ id: string; name: string }[]>([]);
  const [supermarketId, setSupermarketId] = useState('');

  // Manual order form state
  const [manChannel, setManChannel] = useState<string>('MANUAL');
  const [manCustomer, setManCustomer] = useState<string>('');
  const [manExternalId, setManExternalId] = useState<string>('');
  const [manItemsText, setManItemsText] = useState<string>(`[
  { "product": "T-Shirt", "quantity": 1, "unit_price": 500 }
]`);
  const [manRawPayloadText, setManRawPayloadText] = useState<string>('');
  const [manItemsError, setManItemsError] = useState<string>('');
  const [manItemsValid, setManItemsValid] = useState<boolean>(true);
  const [useSimpleForm, setUseSimpleForm] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<string>('');
  const [newQty, setNewQty] = useState<number>(1);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [productOptions, setProductOptions] = useState<{ id: string; name: string }[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Bulk import state
  const [impChannel, setImpChannel] = useState<string>('POS');
  const [impOrdersText, setImpOrdersText] = useState<string>(`[
  {
    "external_order_id": "INV-1001",
    "customer_name": "John Doe",
    "items": [ { "product": "T-Shirt", "quantity": 1, "unit_price": 500 } ]
  }
]`);
  const [impOrdersError, setImpOrdersError] = useState<string>('');
  const [impOrdersValid, setImpOrdersValid] = useState<boolean>(true);

  const supermarketOptions = useMemo(() => [{ value: '', label: 'All Stores' }, ...supermarkets.map(s => ({ value: s.id, label: s.name }))], [supermarkets]);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [res, smRes] = await Promise.all([
        OrdersService.list({ status: status || undefined, supermarket: supermarketId || undefined, channel: channel || undefined, courier: courier || undefined, payment_status: paymentStatus || undefined }),
        SupermarketService.getSupermarkets().catch(() => ([])),
      ]);
      const list = Array.isArray(res) ? res : res.results || [];
      const smList = (Array.isArray(smRes) ? smRes : smRes.results || []) as any[];
      setOrders(list);
      setSupermarkets(smList.map(s => ({ id: String(s.id ?? s.uuid ?? ''), name: String(s.name ?? '') })));
    } catch (e: any) {
      setError(e?.message || 'Failed to load orders');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Load products for dropdown when supermarket changes or search changes
  useEffect(() => {
    const run = async () => {
      try {
        if (!supermarketId) { setProductOptions([]); return; }
        const res: any = await ProductsApi.list({ supermarket: supermarketId, search: productSearch, limit: 50 });
        const arr = Array.isArray(res) ? res : res.results || [];
        setProductOptions(arr.map((p: any) => ({ id: String(p.id ?? p.uuid ?? ''), name: String(p.name ?? '') })));
      } catch {}
    };
    run();
  }, [supermarketId, productSearch]);

  const onFilter = async () => { await load(); };

  const onAssignWarehouse = async (orderId: string) => {
    try {
      const supermarket = supermarketId || supermarkets[0]?.id;
      if (!supermarket) return;
      const whRes = await WarehouseService.list({ supermarket });
      const warehouses = Array.isArray(whRes) ? whRes : whRes.results || [];
      const firstWh = warehouses[0];
      if (!firstWh) { alert('No warehouse found. Create one first.'); return; }
      await OrdersService.assignWarehouse(orderId, String(firstWh.id));
      await load();
    } catch (e: any) { alert(e?.message || 'Failed to assign warehouse'); }
  };

  const onGenerateLabel = async (orderId: string, c: string) => {
    try {
      await OrdersService.generateLabel(orderId, c as any);
      await load();
    } catch (e: any) { alert(e?.message || 'Failed to generate label'); }
  };

  const onManualCreate = async () => {
    try {
      setManItemsError('');
      if (!supermarketId) { alert('Select a Store first'); return; }
      let items: any[] = [];
      let rawPayload: any = undefined;
      try { items = JSON.parse(manItemsText || '[]'); } catch { setManItemsError('Items JSON is invalid'); return; }
      // Validate items schema
      const invalid = items.find((it: any) => !it?.product || typeof it.quantity !== 'number' || typeof it.unit_price !== 'number');
      if (invalid) { setManItemsError('Each item must have product (string), quantity (number), unit_price (number)'); return; }
      if (manRawPayloadText.trim()) {
        try { rawPayload = JSON.parse(manRawPayloadText); } catch { alert('Raw payload JSON invalid'); return; }
      }
      await OrdersService.create({
        supermarket: supermarketId,
        channel: manChannel as any,
        external_order_id: manExternalId || undefined,
        customer_name: manCustomer || undefined,
        status: 'PENDING',
        items,
        raw_payload: rawPayload,
      } as any);
      setManCustomer(''); setManExternalId('');
      await load();
      alert('Order created');
    } catch (e: any) { alert(e?.message || 'Failed to create order'); }
  };

  const onBulkImport = async () => {
    try {
      setImpOrdersError('');
      if (!supermarketId) { alert('Select a Store first'); return; }
      let ordersBody: any[] = [];
      try { ordersBody = JSON.parse(impOrdersText || '[]'); } catch { setImpOrdersError('Orders JSON is invalid'); return; }
      // Basic schema validation for each order
      const bad = ordersBody.find((o: any) => !Array.isArray(o?.items) || o.items.find((it: any) => !it?.product || typeof it.quantity !== 'number' || typeof it.unit_price !== 'number'));
      if (bad) { setImpOrdersError('Each order must have items: [{ product (string), quantity (number), unit_price (number) }]'); return; }
      await OrdersService.import({ channel: impChannel as any, supermarket: supermarketId, orders: ordersBody } as any);
      await load();
      alert('Import completed');
    } catch (e: any) { alert(e?.message || 'Failed to import orders'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl bg-white/80">
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Channel</label>
          <select value={channel} onChange={e => setChannel(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl bg-white/80">
            {channelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Courier</label>
          <select value={courier} onChange={e => setCourier(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl bg-white/80">
            {courierOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Payment</label>
          <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl bg-white/80">
            {paymentStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Store</label>
          <select value={supermarketId} onChange={e => setSupermarketId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl bg-white/80">
            {supermarketOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <button onClick={onFilter} disabled={loading} className="px-4 py-2 bg-rose-500 text-white rounded-xl disabled:opacity-60">{loading ? 'Filtering...' : 'Apply Filters'}</button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 divide-y">
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
            <span className="text-sm text-gray-600">{orders.length} total</span>
          </div>

          {/* Multi-Channel Capture: Manual + Import */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Order Entry */}
            <div className="border rounded-xl p-4 bg-white/80">
              <h3 className="font-semibold mb-3">Manual Order Entry</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Channel</label>
                    <select value={manChannel} onChange={e => setManChannel(e.target.value)} className="w-full px-3 py-2 border rounded">
                      {channelOptions.filter(o=>o.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">External Order ID</label>
                    <input value={manExternalId} onChange={e => setManExternalId(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="optional" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Customer Name</label>
                  <input value={manCustomer} onChange={e => setManCustomer(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="e.g., John Doe" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs text-gray-600">Items JSON</label>
                    {manItemsValid ? (
                      <span className="inline-flex items-center text-emerald-600 text-xs"><CheckCircle className="w-4 h-4 mr-1"/>Valid</span>
                    ) : (
                      <span className="inline-flex items-center text-red-600 text-xs"><AlertCircle className="w-4 h-4 mr-1"/>Invalid</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button type="button" onClick={() => {
                      try { setManItemsText(JSON.stringify(JSON.parse(manItemsText || '[]'), null, 2)); setManItemsError(''); setManItemsValid(true); }
                      catch { setManItemsError('Items JSON is invalid'); setManItemsValid(false); }
                    }} className="px-2 py-1 border rounded">Prettify</button>
                    <span className="text-gray-400" title={"Schema:\nproduct: string\nquantity: number\nunit_price: number"}>?</span>
                  </div>
                </div>
                <div>
                  <div className="border rounded overflow-hidden">
                    <SafeEditor
                      height="180px"
                      defaultLanguage="json"
                      value={manItemsText}
                      onChange={(val) => {
                        setManItemsText(val || '');
                        setManItemsError('');
                        try {
                          const parsed = JSON.parse(val || '[]');
                          const bad = parsed.find((it: any) => !it?.product || typeof it.quantity !== 'number' || typeof it.unit_price !== 'number');
                          setManItemsValid(!bad);
                        } catch { setManItemsValid(false); }
                      }}
                      options={{ minimap: { enabled: false }, wordWrap: 'on', tabSize: 2 }}
                    />
                  </div>
                  {manItemsError && <div className="text-xs text-red-600 mt-1">{manItemsError}</div>}
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={useSimpleForm} onChange={e => setUseSimpleForm(e.target.checked)} />
                      Use simple item form
                    </label>
                  </div>
                  {useSimpleForm && (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products..." className="px-2 py-1 border rounded text-sm w-full mb-1" />
                        <select value={newProduct} onChange={e => setNewProduct(e.target.value)} className="px-2 py-1 border rounded text-sm w-full">
                          <option value="">Select product</option>
                          {productOptions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                      </div>
                      <input type="number" value={newQty} onChange={e => setNewQty(Number(e.target.value))} placeholder="Qty" className="px-2 py-1 border rounded text-sm" />
                      <div className="flex gap-2">
                        <input type="number" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} placeholder="Unit Price" className="px-2 py-1 border rounded text-sm flex-1" />
                        <button type="button" onClick={() => {
                          if (!newProduct.trim()) { setManItemsError('Product name cannot be empty'); return; }
                          const current = (() => { try { return JSON.parse(manItemsText || '[]'); } catch { return []; } })();
                          const next = [...current, { product: newProduct.trim(), quantity: Number(newQty) || 0, unit_price: Number(newPrice) || 0 }];
                          setManItemsText(JSON.stringify(next, null, 2));
                          setNewProduct(''); setNewQty(1); setNewPrice(0);
                        }} className="px-2 py-1 bg-gray-800 text-white rounded text-xs">Add</button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Raw Payload JSON (kept for audit)</label>
                  <textarea value={manRawPayloadText} onChange={e => setManRawPayloadText(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded font-mono text-xs" placeholder="optional" />
                </div>
                <button onClick={onManualCreate} disabled={!supermarketId || !manItemsValid} className={`px-4 py-2 rounded text-white ${(!supermarketId || !manItemsValid) ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-600'}`}>Create Order</button>
              </div>
            </div>

            {/* Bulk Import */}
            <div className="border rounded-xl p-4 bg-white/80">
              <h3 className="font-semibold mb-3">Bulk Import Orders</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Channel</label>
                    <select value={impChannel} onChange={e => setImpChannel(e.target.value)} className="w-full px-3 py-2 border rounded">
                      {channelOptions.filter(o=>o.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs text-gray-600">Orders JSON</label>
                    {impOrdersValid ? (
                      <span className="inline-flex items-center text-emerald-600 text-xs"><CheckCircle className="w-4 h-4 mr-1"/>Valid</span>
                    ) : (
                      <span className="inline-flex items-center text-red-600 text-xs"><AlertCircle className="w-4 h-4 mr-1"/>Invalid</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button type="button" onClick={() => {
                      try { setImpOrdersText(JSON.stringify(JSON.parse(impOrdersText || '[]'), null, 2)); setImpOrdersError(''); setImpOrdersValid(true); }
                      catch { setImpOrdersError('Orders JSON is invalid'); setImpOrdersValid(false); }
                    }} className="px-2 py-1 border rounded">Prettify</button>
                    <span className="text-gray-400" title={"Schema per order:\nexternal_order_id?: string\ncustomer_name?: string\nitems: [{ product: string, quantity: number, unit_price: number }]"}>?</span>
                  </div>
                </div>
                <div>
                  <div className="border rounded overflow-hidden">
                    <SafeEditor
                      height="220px"
                      defaultLanguage="json"
                      value={impOrdersText}
                      onChange={(val) => {
                        setImpOrdersText(val || '');
                        setImpOrdersError('');
                        try {
                          const orders = JSON.parse(val || '[]');
                          const bad = orders.find((o: any) => !Array.isArray(o?.items) || o.items.find((it: any) => !it?.product || typeof it.quantity !== 'number' || typeof it.unit_price !== 'number'));
                          setImpOrdersValid(!bad);
                        } catch { setImpOrdersValid(false); }
                      }}
                      options={{ minimap: { enabled: false }, wordWrap: 'on', tabSize: 2 }}
                    />
                  </div>
                  {impOrdersError && <div className="text-xs text-red-600 mt-1">{impOrdersError}</div>}
                  <div className="mt-2">
                    <JsonView src={(() => { try { return JSON.parse(impOrdersText || '[]'); } catch { return []; } })()} collapsed={1} theme="github" />
                  </div>
                </div>
                <button onClick={onBulkImport} disabled={!supermarketId || !impOrdersValid} className={`px-4 py-2 rounded text-white ${(!supermarketId || !impOrdersValid) ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600'}`}>Import Orders</button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Order</th>
                  <th className="text-left px-4 py-2">Store</th>
                  <th className="text-left px-4 py-2">Channel</th>
                  <th className="text-left px-4 py-2">Customer</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Courier</th>
                  <th className="text-left px-4 py-2">Warehouse</th>
                  <th className="text-right px-4 py-2">Total</th>
                  <th className="text-left px-4 py-2">Created</th>
                  <th className="text-left px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-2 font-medium">{o.id.slice(0,8)}</td>
                    <td className="px-4 py-2">{o.supermarket_name || o.supermarket}</td>
                    <td className="px-4 py-2">{o.channel || '-'}</td>
                    <td className="px-4 py-2">{o.customer_name || '-'}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100">Order: {o.status}</span>
                        {o.shipping_status && <span className="px-2 py-1 rounded-full text-xs bg-gray-100">Ship: {o.shipping_status}</span>}
                        {o.payment_status && <span className="px-2 py-1 rounded-full text-xs bg-gray-100">Pay: {o.payment_status}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2">{o.courier || '-'}</td>
                    <td className="px-4 py-2">{o.assigned_warehouse ? String(o.assigned_warehouse).slice(0,6) : '-'}</td>
                    <td className="px-4 py-2 text-right">{Number(o.total_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => onAssignWarehouse(o.id)} className="px-3 py-1 text-xs bg-indigo-500 text-white rounded">Assign WH</button>
                        {['DPD','YODEL','CITYSPRINT','COLLECTPLUS','TUFFNELLS'].map(c => (
                          <button key={c} onClick={() => onGenerateLabel(o.id, c)} className="px-3 py-1 text-xs bg-emerald-500 text-white rounded">Label {c}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}