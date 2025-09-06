import React, { useState, useEffect } from 'react';
import { Save, X, Package, FileSpreadsheet, Camera, Plus, Store } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';
import ExcelUpload from './ExcelUpload';
import ImageImport from './ImageImport';

interface ProductFormProps {
  onSave: (product: Product | Omit<Product, 'id'>) => void;
  onBulkSave?: (products: Omit<Product, 'id'>[]) => void;
  onMultiStoreSave?: (product: Omit<Product, 'id'>, storeIds: string[]) => void;
  initialProduct?: Product | null;
  onCancel: () => void;
  supermarketId: string;
  userStores?: Supermarket[];
  supplierOptions?: { id: number|string; name: string }[]; // dropdown options
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, onBulkSave, onMultiStoreSave, initialProduct, onCancel, supermarketId, userStores = [], supplierOptions = [] }) => {
  const [currentView, setCurrentView] = useState<'options' | 'manual' | 'excel' | 'image'>('options');
  const [addToAllStores, setAddToAllStores] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    expiryDate: '',
    supplier: '',
    price: 0,
    costPrice: 0,
    sellingPrice: 0,
    addedDate: new Date().toISOString().split('T')[0],
    supermarketId: supermarketId, // Use passed supermarket ID
    description: '',
    brand: '',
    weight: '',
    origin: ''
  });

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name,
        category: initialProduct.category,
        quantity: initialProduct.quantity,
        expiryDate: initialProduct.expiryDate,
        supplier: initialProduct.supplier,
        price: initialProduct.price,
        costPrice: initialProduct.costPrice || 0,
        sellingPrice: initialProduct.sellingPrice || 0,
        addedDate: initialProduct.addedDate,
        supermarketId: initialProduct.supermarketId,
        description: initialProduct.description || '',
        brand: initialProduct.brand || '',
        weight: initialProduct.weight || '',
        origin: initialProduct.origin || ''
      });
    }
  }, [initialProduct]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    // Validate required fields
    if (!formData.name.trim()) {
      setFieldErrors(prev => ({ ...prev, name: 'Product name is required' }));
    }
    if (!formData.category.trim()) {
      setFieldErrors(prev => ({ ...prev, category: 'Category is required' }));
    }
    if (!formData.supplier.trim()) {
      setFieldErrors(prev => ({ ...prev, supplier: 'Supplier is required' }));
    }
    if (!formData.expiryDate) {
      setFieldErrors(prev => ({ ...prev, expiryDate: 'Expiry date is required' }));
    }
    if (formData.costPrice <= 0) {
      setFieldErrors(prev => ({ ...prev, costPrice: 'Cost price must be greater than 0' }));
    }
    if (formData.sellingPrice <= 0) {
      setFieldErrors(prev => ({ ...prev, sellingPrice: 'Selling price must be greater than 0' }));
    }

    const hasErrors = (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.supplier.trim() ||
      !formData.expiryDate ||
      formData.costPrice <= 0 ||
      formData.sellingPrice <= 0
    );
    if (hasErrors) return;
    
    if (initialProduct) {
      onSave({
        ...formData,
        id: initialProduct.id
      });
    } else {
      // Let backend generate barcode automatically
      const productData = {
        ...formData,
        // Ensure display price defaults to selling price if not set
        price: formData.price || formData.sellingPrice
      };
      
      // Check if user wants to add to all stores
      if (addToAllStores && userStores.length > 1 && onMultiStoreSave) {
        const allStoreIds = userStores.map(store => store.id);
        onMultiStoreSave(productData, allStoreIds);
      } else {
        onSave(productData);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => {
        const newData = { ...prev, [name]: numValue };
        
        // Auto-set display price to selling price if display price is 0 or not set
        if (name === 'sellingPrice' && (prev.price === 0 || !prev.price)) {
          newData.price = numValue;
        }
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };



  const categories = ['Meat', 'Dairy', 'Snacks', 'Beverages', 'Frozen', 'Bakery', 'Condiments', 'Other'];

  // Handle bulk import from Excel
  const handleExcelImport = (products: Omit<Product, 'id'>[]) => {
    if (onBulkSave) {
      onBulkSave(products);
    }
    onCancel();
  };

  // Handle single product from image
  const handleImageImport = (product: Omit<Product, 'id'>) => {
    onSave(product);
    onCancel();
  };

  // If editing existing product, go directly to manual form
  useEffect(() => {
    if (initialProduct) {
      setCurrentView('manual');
    }
  }, [initialProduct]);

  return (
    <div className="max-w-4xl mx-auto">
      {currentView === 'options' && !initialProduct && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="bg-rose-100 p-3 rounded-xl mr-4">
                <Package className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Add Products</h2>
                <p className="text-gray-600">Choose how you want to add products to your inventory</p>
              </div>
            </div>
            
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div 
              onClick={() => setCurrentView('manual')}
              className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="bg-rose-100 group-hover:bg-rose-200 p-4 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Plus className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Manual Entry</h3>
                <p className="text-gray-600 text-sm">Add products one by one with complete control over all details</p>
              </div>
            </div>

            <div 
              onClick={() => setCurrentView('excel')}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="bg-green-100 group-hover:bg-green-200 p-4 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4 transition-colors">
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Excel Import</h3>
                <p className="text-gray-600 text-sm">Upload Excel files to import multiple products at once</p>
              </div>
            </div>

            <div 
              onClick={() => setCurrentView('image')}
              className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6 border border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="bg-blue-100 group-hover:bg-blue-200 p-4 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Image Scan</h3>
                <p className="text-gray-600 text-sm">Capture product images and extract details using AI</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2">💡 Quick Tips:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Use <strong>Manual Entry</strong> for precise control and single products</li>
              <li>• Use <strong>Excel Import</strong> for bulk uploads from spreadsheets</li>
              <li>• Use <strong>Image Scan</strong> for quick entry using AI recognition</li>
            </ul>
          </div>
        </div>
      )}

      {currentView === 'excel' && (
        <ExcelUpload 
          onProductsExtracted={handleExcelImport}
          onCancel={() => setCurrentView('options')}
          supermarketId={supermarketId}
        />
      )}

      {currentView === 'image' && (
        <ImageImport 
          onProductExtracted={handleImageImport}
          onCancel={() => setCurrentView('options')}
          supermarketId={supermarketId}
        />
      )}

      {currentView === 'manual' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="bg-rose-100 p-3 rounded-xl mr-4">
                <Package className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {initialProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-gray-600">
                  {initialProduct ? 'Update product information' : 'Enter details for a new product'}
                </p>
              </div>
            </div>
            
            <button
              onClick={initialProduct ? onCancel : () => setCurrentView('options')}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

        {generalError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {generalError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store (single select) */}
            <div>
              <label htmlFor="supermarketId" className="block text-sm font-medium text-gray-700 mb-2">
                Store *
              </label>
              <select
                id="supermarketId"
                name="supermarketId"
                value={formData.supermarketId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
              >
                <option value="">Select a store</option>
                {userStores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                aria-invalid={!!fieldErrors.name}
                className={`w-full px-4 py-3 border ${fieldErrors.name ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
                placeholder="Enter product name"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>


            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                aria-invalid={!!fieldErrors.category}
                className={`w-full px-4 py-3 border ${fieldErrors.category ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <select
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                required
                aria-invalid={!!fieldErrors.supplier}
                className={`w-full px-4 py-3 border ${fieldErrors.supplier ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
              >
                <option value="">Select supplier</option>
                {supplierOptions.map(opt => (
                  <option key={String(opt.id)} value={String(opt.name)}>{opt.name}</option>
                ))}
              </select>
              {fieldErrors.supplier && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.supplier}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter quantity"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                aria-invalid={!!fieldErrors.expiryDate}
                className={`w-full px-4 py-3 border ${fieldErrors.expiryDate ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
              />
              {fieldErrors.expiryDate && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.expiryDate}</p>
              )}
            </div>

            {/* Cost Price */}
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price ($) *
              </label>
              <input
                type="number"
                id="costPrice"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                aria-invalid={!!fieldErrors.costPrice}
                className={`w-full px-4 py-3 border ${fieldErrors.costPrice ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
                placeholder="Enter cost price"
              />
              {fieldErrors.costPrice && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.costPrice}</p>
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price ($) *
              </label>
              <input
                type="number"
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                aria-invalid={!!fieldErrors.sellingPrice}
                className={`w-full px-4 py-3 border ${fieldErrors.sellingPrice ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
                placeholder="Enter selling price"
              />
              {fieldErrors.sellingPrice && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.sellingPrice}</p>
              )}
            </div>

            {/* Display Price (calculated or manual) */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Display Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter display price (defaults to selling price)"
              />
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter brand name"
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                Weight/Size
              </label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="e.g., 500g, 1L, 12 pieces"
              />
            </div>

            {/* Origin */}
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                Country of Origin
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter country of origin"
              />
            </div>

            {/* Expiry Date */}
            <div className="md:col-span-2">
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                aria-invalid={!!fieldErrors.expiryDate}
                className={`w-full px-4 py-3 border ${fieldErrors.expiryDate ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
              />
              {fieldErrors.expiryDate && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.expiryDate}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter product description"
              />
            </div>



            {/* Halal Certified */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="halalCertified"
                  checked={formData.halalCertified}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Halal Certified</span>
              </label>
            </div>

            {/* Halal Certification Body */}
            <div>
              <label htmlFor="halalCertificationBody" className="block text-sm font-medium text-gray-700 mb-2">
                Halal Certification Body
              </label>
              <input
                type="text"
                id="halalCertificationBody"
                name="halalCertificationBody"
                value={formData.halalCertificationBody}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter certification authority"
              />
            </div>
          </div>

          {/* Multi-Store Option */}
          {!initialProduct && userStores.length > 1 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center">
                <Store className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800 mb-2">Multi-Store Options</h3>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={addToAllStores}
                  onChange={(e) => setAddToAllStores(e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Add this product to all my stores ({userStores.length} stores)
                </span>
              </label>
              {addToAllStores && (
                <div className="mt-2 text-xs text-blue-600">
                  Product will be added to: {userStores.map(store => store.name).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors duration-200 flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {initialProduct ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  );
};

export default ProductForm;