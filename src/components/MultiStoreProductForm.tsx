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
  Store
} from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';

interface MultiStoreProductFormProps {
  product?: Product | null;
  stores: Supermarket[];
  categories: string[];
  suppliers: string[];
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

const MultiStoreProductForm: React.FC<MultiStoreProductFormProps> = ({
  product,
  stores,
  categories,
  suppliers,
  onSave,
  onCancel,
  onDuplicateToStores,
  onMultiStoreSave
}) => {
  const [addToAllStores, setAddToAllStores] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    supplier: '',
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
  const [addToMultipleStores, setAddToMultipleStores] = useState(false);
  const [selectedStoresForNewProduct, setSelectedStoresForNewProduct] = useState<string[]>([]);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        supplier: product.supplier || '',
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
      // Set default store if only one store available
      if (stores.length === 1) {
        setFormData(prev => ({ ...prev, supermarketId: stores[0].id }));
      }
    }
  }, [product, stores]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.supplier.trim()) newErrors.supplier = 'Supplier is required';
    if (!formData.barcode.trim()) newErrors.barcode = 'Barcode is required';
    if (!formData.supermarketId) newErrors.supermarketId = 'Store selection is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';

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
      const productData = {
        ...formData,
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
        if (addToAllStores && stores.length > 1 && onMultiStoreSave) {
          // Add to all stores
          const allStoreIds = stores.map(store => store.id);
          onMultiStoreSave(productData, allStoreIds);
        } else {
          onSave(productData);
        }
        
        // If user wants to add to multiple stores and has selected additional stores
        if (addToMultipleStores && selectedStoresForNewProduct.length > 0 && onDuplicateToStores) {
          // Create a temporary product object for duplication
          const tempProduct = { ...productData, id: 'temp-' + Date.now() } as Product;
          onDuplicateToStores(tempProduct, selectedStoresForNewProduct);
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
                {product ? 'Update product information' : 'Add a new product to your inventory'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {product && onDuplicateToStores && (
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
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Store *
                </label>
                <select
                  value={formData.supermarketId}
                  onChange={(e) => setFormData(prev => ({ ...prev, supermarketId: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.supermarketId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Choose a store...</option>
                  {stores.map(store => (
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

              {formData.supermarketId && (
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">
                    <strong>Selected Store:</strong> {getStoreName(formData.supermarketId)}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Multiple Stores Option (only for new products) */}
            {!product && stores.length > 1 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="addToMultipleStores"
                    checked={addToMultipleStores}
                    onChange={(e) => {
                      setAddToMultipleStores(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedStoresForNewProduct([]);
                      }
                    }}
                    className="mr-3"
                  />
                  <label htmlFor="addToMultipleStores" className="text-sm font-medium text-blue-800">
                    Add this product to multiple stores
                  </label>
                </div>
                
                {addToMultipleStores && (
                  <div className="mt-3">
                    <p className="text-sm text-blue-700 mb-3">
                      Select additional stores where you want to add this product:
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {stores
                        .filter(store => store.id !== formData.supermarketId)
                        .map(store => (
                          <label key={store.id} className="flex items-center p-2 hover:bg-blue-100 rounded">
                            <input
                              type="checkbox"
                              checked={selectedStoresForNewProduct.includes(store.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStoresForNewProduct(prev => [...prev, store.id]);
                                } else {
                                  setSelectedStoresForNewProduct(prev => prev.filter(id => id !== store.id));
                                }
                              }}
                              className="mr-2"
                            />
                            <div className="text-sm">
                              <div className="font-medium text-blue-800">{store.name}</div>
                              <div className="text-blue-600">
                                {store.isSubStore ? 'Sub-Store' : 'Main Store'} • {store.address}
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                    {selectedStoresForNewProduct.length > 0 && (
                      <div className="mt-2 text-sm text-blue-700">
                        ✓ Product will be added to {selectedStoresForNewProduct.length + 1} store(s) total
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
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
                  Supplier *
                </label>
                <select
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.supplier ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
                {errors.supplier && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.supplier}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Identification */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Product Identification</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
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
                    required
                  />
                  <button
                    type="button"
                    onClick={generateBarcode}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg"
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
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Pricing Information</h3>
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
                    if (e.target.value && !formData.sellingPrice) {
                      calculateSellingPrice(e.target.value);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.costPrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.costPrice && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.costPrice}
                  </p>
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
                      price: e.target.value // Sync with current price
                    }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.sellingPrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.sellingPrice && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.sellingPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            {formData.costPrice && formData.sellingPrice && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Profit Margin:</strong> {
                    ((Number(formData.sellingPrice) - Number(formData.costPrice)) / Number(formData.costPrice) * 100).toFixed(1)
                  }%
                </div>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-4">
              <Hash className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Inventory Information</h3>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
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
                  required
                />
                {errors.quantity && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.quantity}
                  </p>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Aisle/Shelf"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Additional Details</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                      errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                {errors.expiryDate && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.expiryDate}
                  </p>
                )}
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
                />
              </div>

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
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 10x5x3 cm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Halal Certification */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Halal Certification</h3>
            </div>
            
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
                <label htmlFor="halalCertified" className="text-sm font-medium text-gray-700">
                  This product is Halal certified
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Halal Status
                  </label>
                  <select
                    value={formData.halalStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, halalStatus: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="UNKNOWN">Unknown</option>
                    <option value="CERTIFIED">Halal Certified</option>
                    <option value="NOT_CERTIFIED">Not Certified</option>
                  </select>
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
                      placeholder="e.g., JAKIM, MUI, etc."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Multi-Store Option */}
          {!product && stores.length > 1 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center mb-2">
                <Store className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Multi-Store Options</h3>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={addToAllStores}
                  onChange={(e) => setAddToAllStores(e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Add this product to all my stores ({stores.length} stores)
                </span>
              </label>
              {addToAllStores && (
                <div className="mt-2 text-xs text-blue-600">
                  Product will be added to: {stores.map(store => store.name).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {product ? 'Update Product' : 'Save Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Duplicate to Stores Modal */}
      {showDuplicateModal && product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Duplicate Product to Stores</h3>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Select the stores where you want to duplicate "{product.name}":
              </p>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {stores
                  .filter(store => store.id !== product.supermarketId)
                  .map(store => (
                    <label key={store.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
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
                      <div>
                        <div className="font-medium text-gray-800">{store.name}</div>
                        <div className="text-sm text-gray-600">
                          {store.isSubStore ? 'Sub-Store' : 'Main Store'}
                        </div>
                      </div>
                    </label>
                  ))}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setSelectedStoresForDuplication([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDuplicateToStores}
                  disabled={selectedStoresForDuplication.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Duplicate to {selectedStoresForDuplication.length} Store(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStoreProductForm;