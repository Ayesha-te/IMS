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
    category: '',
    quantity: 0,
    expiryDate: '',
    supplier: '',
    price: 0,
    addedDate: new Date().toISOString().split('T')[0],
    supermarketId: '1', // Default to first supermarket
    description: '',
    brand: '',
    weight: '',
    origin: '',
    barcode: '',
    halalCertified: true,
    halalCertificationBody: ''
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
        addedDate: initialProduct.addedDate,
        supermarketId: initialProduct.supermarketId,
        description: initialProduct.description || '',
        brand: initialProduct.brand || '',
        weight: initialProduct.weight || '',
        origin: initialProduct.origin || '',
        barcode: initialProduct.barcode,
        halalCertified: initialProduct.halalCertified,
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
                {initialProduct ? 'Update product information' : 'Enter details for a new product'}
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                placeholder="Enter product barcode"
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