import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Store, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Copy,
  Barcode,
  Calendar,
  DollarSign,
  Hash,
  Plus,
  Minus
} from 'lucide-react';
import type { Product, Supermarket, User } from '../types/Product';
import { 
  analyzeStoreContext, 
  getStoreOptions, 
  getDefaultStoreForProduct,
  validateStoreSelection 
} from '../utils/storeUtils';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getSavedCurrencies, saveCurrency, getDefaultCurrency } from '../utils/currencyOptions';
import { getSavedCategories, saveCategory } from '../utils/categoryOptions';

interface AdaptiveProductFormProps {
  product?: Product | null;
  stores: Supermarket[];
  categories: string[];
  suppliers: string[];
  currentUser: User | null;
  onSave: (product: Product | Omit<Product, 'id'>) => void;
  onCancel: () => void;
  onDuplicateToStores?: (product: Product, storeIds: string[]) => void;
  onMultiStoreSave?: (product: Omit<Product, 'id'>, storeIds: string[]) => void;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  supplier: string;
  suppliers: string[];
  brand: string;
  barcode: string;
  sku: string;
  costPrice: string;
  sellingPrice: string;
  price: string;
  quantity: string;
  minStockLevel: string;
  maxStockLevel: string;
  weight: string;
  dimensions: string;
  origin: string;
  expiryDate: string;
  location: string;
  halalCertified: boolean;
  halalStatus: 'CERTIFIED' | 'NOT_CERTIFIED' | 'UNKNOWN';
  halalCertificationBody: string;
  imageUrl: string;
  supermarketId: string;
}

const AdaptiveProductForm: React.FC<AdaptiveProductFormProps> = ({
  product,
  stores,
  categories,
  suppliers,
  currentUser,
  onSave,
  onCancel,
  onDuplicateToStores,
  onMultiStoreSave
}) => {
  const storeContext = analyzeStoreContext(stores, currentUser);
  
  // Debug logging for AdaptiveProductForm
  console.log('🔧 AdaptiveProductForm Debug:');
  console.log('Total stores passed to form:', stores.length);
  console.log('Store context in form:', storeContext);
  console.log('User stores in form:', storeContext.userStores.length);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    supplier: '',
    suppliers: [],
    brand: '',
    barcode: '',
    sku: '',
    costPrice: '',
    sellingPrice: '',
    price: '',
    quantity: '',
    minStockLevel: '5',
    maxStockLevel: '',
    weight: '',
    dimensions: '',
    origin: '',
    expiryDate: '',
    location: '',
    halalCertified: false,
    halalStatus: 'UNKNOWN',
    halalCertificationBody: '',
    imageUrl: '',
    supermarketId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedStoresForDuplication, setSelectedStoresForDuplication] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Multi-store options for new products
  const [addToMultipleStores, setAddToMultipleStores] = useState(false);
  const [selectedStoresForNewProduct, setSelectedStoresForNewProduct] = useState<string[]>([]);

  // Currency state for this form (persisted locally for reuse)
  const [currencyOptions, setCurrencyOptions] = useState<string[]>([]);
  const [currencyMode, setCurrencyMode] = useState<'select' | 'custom'>('select');
  const [currency, setCurrency] = useState<string>('USD');
  const defaultCurrency = getDefaultCurrency(storeContext.mainStore?.currency);

  useEffect(() => {
    const opts = getSavedCurrencies();
    setCurrencyOptions(opts.length ? opts : (defaultCurrency ? [defaultCurrency] : []));
    setCurrencyMode(opts.length ? 'select' : 'custom');
    setCurrency(defaultCurrency || 'USD');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeContext.mainStore?.currency]);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        supplier: product.supplier || '',
        suppliers: product.suppliers || (product.supplier ? [product.supplier] : []),
        brand: product.brand || '',
        barcode: product.barcode || '',
        sku: product.sku || '',
        costPrice: product.costPrice?.toString() || '',
        sellingPrice: product.sellingPrice?.toString() || '',
        price: product.price?.toString() || '',
        quantity: product.quantity?.toString() || '',
        minStockLevel: product.minStockLevel?.toString() || '5',
        maxStockLevel: product.maxStockLevel?.toString() || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        origin: product.origin || '',
        expiryDate: product.expiryDate || '',
        location: product.location || '',
        halalCertified: product.halalCertified || false,
        halalStatus: product.halalStatus || 'UNKNOWN',
        halalCertificationBody: product.halalCertificationBody || '',
        imageUrl: product.imageUrl || '',
        supermarketId: product.supermarketId || ''
      });
    } else {
      // Set default store for new products
      const defaultStoreId = getDefaultStoreForProduct(storeContext);
      setFormData(prev => ({ ...prev, supermarketId: defaultStoreId }));
    }
  }, [product, storeContext]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if ((formData.suppliers?.length ?? 0) === 0) newErrors.suppliers = 'Select at least one supplier';

    if (!formData.barcode.trim()) newErrors.barcode = 'Barcode is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';

    // Store validation
    if (!product && !addToMultipleStores && !formData.supermarketId) {
      newErrors.supermarketId = 'Store selection is required';
    }
    
    if (!product && addToMultipleStores && selectedStoresForNewProduct.length === 0) {
      newErrors.selectedStores = 'At least one store must be selected';
    }

    // Validate numeric fields
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (formData.costPrice && (isNaN(Number(formData.costPrice)) || Number(formData.costPrice) < 0)) {
      newErrors.costPrice = 'Cost price must be a valid number';
    }
    if (formData.sellingPrice && (isNaN(Number(formData.sellingPrice)) || Number(formData.sellingPrice) < 0)) {
      newErrors.sellingPrice = 'Selling price must be a valid number';
    }

    // Validate expiry date is in the future
    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const normalizedSuppliers = (formData.suppliers && formData.suppliers.length > 0)
        ? formData.suppliers
        : (formData.supplier ? [formData.supplier] : []);

      const productData = {
        ...formData,
        supplier: normalizedSuppliers[0] || formData.supplier || '',
        suppliers: normalizedSuppliers,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        sellingPrice: formData.sellingPrice ? Number(formData.sellingPrice) : undefined,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        minStockLevel: Number(formData.minStockLevel),
        maxStockLevel: formData.maxStockLevel ? Number(formData.maxStockLevel) : undefined,
      };

      if (product) {
        // Editing existing product
        onSave({ ...productData, id: product.id } as Product);
      } else {
        // Creating new product
        if (addToMultipleStores && selectedStoresForNewProduct.length > 0 && onMultiStoreSave) {
          // Add to multiple selected stores
          onMultiStoreSave(productData, selectedStoresForNewProduct);
        } else {
          // Add to single store
          onSave(productData);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle duplicate to multiple stores
  const handleDuplicateToStores = () => {
    if (product && selectedStoresForDuplication.length > 0 && onDuplicateToStores) {
      const validation = validateStoreSelection(selectedStoresForDuplication, storeContext);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
      
      onDuplicateToStores(product, selectedStoresForDuplication);
      setShowDuplicateModal(false);
      setSelectedStoresForDuplication([]);
    }
  };

  // Generate barcode
  const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const barcode = `${timestamp.slice(-8)}${random}`;
    setFormData(prev => ({ ...prev, barcode }));
  };

  // Auto-calculate selling price based on cost price and margin
  const calculateSellingPrice = (costPrice: string, margin: number = 30) => {
    const cost = Number(costPrice);
    if (cost > 0) {
      const sellingPrice = cost * (1 + margin / 100);
      setFormData(prev => ({ 
        ...prev, 
        sellingPrice: sellingPrice.toFixed(2),
        price: sellingPrice.toFixed(2)
      }));
    }
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };

  // Handle store selection for multi-store new products
  const handleStoreSelection = (storeId: string, checked: boolean) => {
    if (checked) {
      setSelectedStoresForNewProduct(prev => [...prev, storeId]);
    } else {
      setSelectedStoresForNewProduct(prev => prev.filter(id => id !== storeId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-xl mr-4">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-gray-600">
                {product 
                  ? 'Update product information' 
                  : storeContext.isMultiStore 
                    ? 'Add a new product to your stores'
                    : `Add a new product to ${storeContext.mainStore?.name || 'your store'}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {product && storeContext.isMultiStore && onDuplicateToStores && (
              <button
                type="button"
                onClick={() => setShowDuplicateModal(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate to Stores
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Selection */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <Store className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-800">Store Assignment</h3>
            </div>
            
            {storeContext.isMultiStore ? (
              <div className="space-y-4">
                {/* Single store selection for editing or simple add */}
                {(product || !addToMultipleStores) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {product ? 'Current Store' : 'Select Store'} *
                    </label>
                    <select
                      value={formData.supermarketId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setFormData(prev => ({ ...prev, supermarketId: id }));
                        try { localStorage.setItem(STORAGE_KEYS.CURRENT_SUPERMARKET_ID, id); } catch {}
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.supermarketId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required={!addToMultipleStores}
                      disabled={product ? true : false} // Disable for editing
                    >
                      <option value="">Choose a store...</option>
                      {storeContext.userStores.map(store => (
                        <option key={store.id} value={store.id}>
                          {store.name} {store.isSubStore ? '(Sub-Store)' : '(Main Store)'}
                        </option>
                      ))}
                    </select>
                    {errors.supermarketId && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.supermarketId}
                      </p>
                    )}
                  </div>
                )}

                {/* Multi-store option for new products */}
                {!product && (
                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="addToMultipleStores"
                        checked={addToMultipleStores}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAddToMultipleStores(checked);
                          if (!checked) {
                            setSelectedStoresForNewProduct([]);
                          }
                        }}
                        className="mr-3"
                      />
                      <label htmlFor="addToMultipleStores" className="text-sm font-medium text-blue-800">
                        Add this product to multiple stores
                      </label>
                    </div>

                    {/* Quick toggle: add to ALL stores */}
                    {addToMultipleStores && (
                      <div className="mb-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            id="addToAllStores"
                            checked={selectedStoresForNewProduct.length === storeContext.userStores.length && storeContext.userStores.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const allIds = storeContext.userStores.map(s => s.id);
                                setSelectedStoresForNewProduct(allIds);
                              } else {
                                setSelectedStoresForNewProduct([]);
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-blue-800">
                            Add to all my stores ({storeContext.userStores.length})
                          </span>
                        </label>
                      </div>
                    )}
                    
                    {addToMultipleStores && (
                      <div className="mt-3">
                        <p className="text-sm text-blue-700 mb-3">
                          Select stores where you want to add this product:
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-2 bg-white rounded-lg p-3 border border-blue-200">
                          {storeContext.userStores.map(store => (
                            <label key={store.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedStoresForNewProduct.includes(store.id)}
                                onChange={(e) => handleStoreSelection(store.id, e.target.checked)}
                                className="mr-3"
                              />
                              <span className="text-sm">
                                {store.name} {store.isSubStore ? '(Sub-Store)' : '(Main Store)'}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.selectedStores && (
                          <p className="text-red-600 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.selectedStores}
                          </p>
                        )}
                        {selectedStoresForNewProduct.length > 0 && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                              Product will be added to {selectedStoresForNewProduct.length} store(s)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Single store display */
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <strong>Store:</strong> {storeContext.mainStore?.name || 'No store available'}
                </div>
                <input type="hidden" value={formData.supermarketId} />
              </div>
            )}
          </div>

          {/* Basic Product Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
                required
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const name = window.prompt('Enter new category name');
                    if (!name || !name.trim()) return;
                    const clean = name.trim();
                    try {
                      // Persist locally
                      saveCategory(clean);
                      const updated = getSavedCategories();
                      // Update the form selection
                      setFormData(prev => ({ ...prev, category: clean }));
                      // Optionally, call backend create non-blocking
                      try { (window as any).CategoryService?.createCategory?.({ name: clean }); } catch {}
                    } catch {}
                  }}
                  className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select category</option>
                {[...new Set([...(getSavedCategories() || []), ...categories])].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suppliers *
              </label>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border rounded-lg ${errors.suppliers ? 'border-red-300' : 'border-gray-300'}`}>
                {suppliers.map((s) => {
                  const checked = formData.suppliers?.includes(s) ?? false;
                  return (
                    <label key={s} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData(prev => {
                            const current = new Set(prev.suppliers || []);
                            if (isChecked) current.add(s); else current.delete(s);
                            const next = Array.from(current);
                            return {
                              ...prev,
                              suppliers: next,
                              supplier: next[0] || '' // keep primary for compatibility
                            };
                          });
                        }}
                      />
                      <span>{s}</span>
                    </label>
                  );
                })}
              </div>
              {errors.suppliers && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.suppliers}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter brand name"
              />
            </div>
          </div>

          {/* Product Identification */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode *
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  className={`flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-green-500 ${
                    errors.barcode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter or generate barcode"
                  required
                />
                <button
                  type="button"
                  onClick={generateBarcode}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg flex items-center"
                >
                  <Barcode className="w-4 h-4" />
                </button>
              </div>
              {errors.barcode && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.barcode}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter SKU"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-yellow-50 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pricing Information
            </h3>

            {/* Currency Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <div className="flex items-center gap-3">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  {currencyOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setCurrencyMode('custom')}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Custom…
                </button>
              </div>
              {currencyMode === 'custom' && (
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="e.g., USD, PKR, EUR"
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (currency.trim()) {
                        saveCurrency(currency.trim());
                        const updated = getSavedCurrencies();
                        setCurrencyOptions(updated);
                        setCurrencyMode('select');
                        setCurrency(updated.includes(currency.trim().toUpperCase()) ? currency.trim().toUpperCase() : currency.trim());
                      }
                    }}
                    className="px-3 py-2 text-sm rounded-lg bg-yellow-600 text-white hover:bg-yellow-700"
                  >
                    Save Currency
                  </button>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-600">Last/Store default: <span className="font-medium">{defaultCurrency}</span></p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, costPrice: e.target.value }));
                    if (e.target.value) {
                      calculateSellingPrice(e.target.value);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 ${
                    errors.costPrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.costPrice && (
                  <p className="text-red-600 text-sm mt-1">{errors.costPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      sellingPrice: e.target.value,
                      price: e.target.value // Sync with price field
                    }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 ${
                    errors.sellingPrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.sellingPrice && (
                  <p className="text-red-600 text-sm mt-1">{errors.sellingPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  required
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price}</p>
                )}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
                required
              />
              {errors.quantity && (
                <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStockLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="100"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.expiryDate && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.expiryDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Aisle 1, Shelf A"
              />
            </div>
          </div>

          {/* Halal Certification */}
          <div className="bg-green-50 rounded-xl p-4">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Halal Certification
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="halalCertified"
                  checked={formData.halalCertified}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    halalCertified: e.target.checked,
                    halalStatus: e.target.checked ? 'CERTIFIED' : 'NOT_CERTIFIED'
                  }))}
                  className="mr-3"
                />
                <label htmlFor="halalCertified" className="text-sm font-medium text-green-800">
                  This product is Halal certified
                </label>
              </div>
              
              {formData.halalCertified && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification Body
                  </label>
                  <input
                    type="text"
                    value={formData.halalCertificationBody}
                    onChange={(e) => setFormData(prev => ({ ...prev, halalCertificationBody: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., JAKIM, MUI, HFA"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 500g, 1kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Country of origin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Product description..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>

      {/* Duplicate Modal - only for multi-store editing */}
      {showDuplicateModal && product && storeContext.isMultiStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Duplicate Product to Other Stores
            </h3>
            <p className="text-gray-600 mb-4">
              Select the stores where you want to duplicate "{product.name}":
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
              {storeContext.userStores
                .filter(store => store.id !== product.supermarketId)
                .map(store => (
                  <label key={store.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedStoresForDuplication.includes(store.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStoresForDuplication(prev => [...prev, store.id]);
                        } else {
                          setSelectedStoresForDuplication(prev => prev.filter(id => id !== store.id));
                        }
                      }}
                      className="mr-3"
                    />
                    <span className="text-sm">
                      {store.name} {store.isSubStore ? '(Sub-Store)' : '(Main Store)'}
                    </span>
                  </label>
                ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setSelectedStoresForDuplication([]);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDuplicateToStores}
                disabled={selectedStoresForDuplication.length === 0}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                Duplicate ({selectedStoresForDuplication.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptiveProductForm;