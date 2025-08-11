import React, { useState, useEffect } from 'react';
import { Save, X, Package } from 'lucide-react';
import type { Product } from '../types/Product';

interface ProductFormProps {
  onSave: (product: Product | Omit<Product, 'id'>) => void;
  initialProduct?: Product | null;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, initialProduct, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    quantity: 0,
    expiryDate: '',
    halalCertified: true,
    supplier: '',
    price: 0,
    addedDate: new Date().toISOString().split('T')[0],
    supermarketId: '1', // Default to first supermarket
    description: '',
    brand: '',
    weight: '',
    origin: '',
    halalCertificationBody: ''
  });

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name,
        barcode: initialProduct.barcode,
        category: initialProduct.category,
        quantity: initialProduct.quantity,
        expiryDate: initialProduct.expiryDate,
        halalCertified: initialProduct.halalCertified,
        supplier: initialProduct.supplier,
        price: initialProduct.price,
        addedDate: initialProduct.addedDate,
        supermarketId: initialProduct.supermarketId,
        description: initialProduct.description || '',
        brand: initialProduct.brand || '',
        weight: initialProduct.weight || '',
        origin: initialProduct.origin || '',
        halalCertificationBody: initialProduct.halalCertificationBody || ''
      });
    }
  }, [initialProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialProduct) {
      onSave({
        ...formData,
        id: initialProduct.id
      });
    } else {
      onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const categories = ['Meat', 'Dairy', 'Snacks', 'Beverages', 'Frozen', 'Bakery', 'Condiments', 'Other'];

  return (
    <div className="max-w-4xl mx-auto">
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
                {initialProduct ? 'Update product information' : 'Enter details for a new Halal product'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter product name"
              />
            </div>

            {/* Barcode */}
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                Barcode *
              </label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80 font-mono"
                placeholder="Enter barcode"
              />
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
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
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter supplier name"
              />
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

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter price"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
              />
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

            {/* Halal Certification Body */}
            <div className="md:col-span-2">
              <label htmlFor="halalCertificationBody" className="block text-sm font-medium text-gray-700 mb-2">
                Halal Certification Body
              </label>
              <select
                id="halalCertificationBody"
                name="halalCertificationBody"
                value={formData.halalCertificationBody}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
              >
                <option value="">Select certification body</option>
                <option value="Islamic Society of North America (ISNA)">Islamic Society of North America (ISNA)</option>
                <option value="Halal Monitoring Committee (HMC)">Halal Monitoring Committee (HMC)</option>
                <option value="Islamic Food and Nutrition Council of America (IFANCA)">Islamic Food and Nutrition Council of America (IFANCA)</option>
                <option value="Emirates Authority for Standardization and Metrology (ESMA)">Emirates Authority for Standardization and Metrology (ESMA)</option>
                <option value="Malaysia Halal Corporation (MHC)">Malaysia Halal Corporation (MHC)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Halal Certified */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="halalCertified"
                  name="halalCertified"
                  checked={formData.halalCertified}
                  onChange={handleChange}
                  className="w-5 h-5 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                />
                <label htmlFor="halalCertified" className="ml-3 text-sm font-medium text-gray-700">
                  This product is Halal certified
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Only Halal-certified products will be visible in the system
              </p>
            </div>
          </div>

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
    </div>
  );
};

export default ProductForm;