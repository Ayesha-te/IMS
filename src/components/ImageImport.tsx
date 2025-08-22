import React, { useState, useRef } from 'react';
import { Camera, Image, CheckCircle, XCircle, AlertCircle, Edit3, Info, Download, HelpCircle } from 'lucide-react';
import type { Product } from '../types/Product';
import { 
  generateImageImportGuide, 
  validateImageData, 
  IMAGE_CAPTURE_GUIDELINES,
  EXTRACTABLE_INFORMATION
} from '../utils/imageTemplates';
import type { ImageProductData } from '../utils/imageTemplates';

interface ImageImportProps {
  onProductExtracted: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
  supermarketId: string;
}

interface ExtractedData {
  name?: string;
  brand?: string;
  weight?: string;
  price?: number;
  barcode?: string;
  expiryDate?: string;
  category?: string;
  confidence: number;
}

const ImageImport: React.FC<ImageImportProps> = ({ onProductExtracted, onCancel, supermarketId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download image import guide
  const downloadGuide = () => {
    const guideContent = generateImageImportGuide();
    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'image_import_guide.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock extracted data - In real implementation, call image-to-text API
      const mockExtractedData: ExtractedData = {
        name: 'Premium Organic Honey',
        brand: 'Nature\'s Best',
        weight: '500g',
        price: 15.99,
        barcode: '789012345678',
        expiryDate: '2025-06-15',
        category: 'Condiments',
        confidence: 0.85
      };

      setExtractedData(mockExtractedData);
      
      // Initialize editing form with extracted data
      setEditingProduct({
        name: mockExtractedData.name,
        brand: mockExtractedData.brand,
        weight: mockExtractedData.weight,
        price: mockExtractedData.price,
        sellingPrice: mockExtractedData.price,
        barcode: mockExtractedData.barcode,
        expiryDate: mockExtractedData.expiryDate,
        category: mockExtractedData.category,
        addedDate: new Date().toISOString().split('T')[0],
        supermarketId,
        halalCertified: true,
        quantity: 1,
        supplier: ''
      });

    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditingProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmProduct = () => {
    if (editingProduct.name && editingProduct.category && editingProduct.quantity && editingProduct.price && editingProduct.supplier && editingProduct.expiryDate) {
      onProductExtracted(editingProduct as Omit<Product, 'id'>);
    }
  };

  const categories = ['Meat', 'Dairy', 'Snacks', 'Beverages', 'Frozen', 'Bakery', 'Condiments', 'Other'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Import from Image</h2>
            <p className="text-gray-600">Capture or upload product images to extract details automatically</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        {/* Photo Guidelines Section */}
        <div className="bg-green-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <HelpCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">📸 Photo Tips for Best Results</h3>
              <p className="text-green-700 mb-4">
                Follow these guidelines to ensure accurate AI extraction of product information.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={downloadGuide}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Guide</span>
                </button>
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  {showGuide ? 'Hide' : 'Show'} Photo Tips
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Guidelines Details */}
        {showGuide && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h4 className="font-semibold text-gray-800 mb-4">📋 Photo Capture Guidelines:</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">✨ Lighting & Quality:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {IMAGE_CAPTURE_GUIDELINES.lighting.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                  {IMAGE_CAPTURE_GUIDELINES.quality.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">📐 Positioning & Content:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {IMAGE_CAPTURE_GUIDELINES.positioning.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                  {IMAGE_CAPTURE_GUIDELINES.content.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h6 className="font-medium text-blue-800 mb-2">🎯 What AI Can Extract:</h6>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Product name & brand</li>
                  <li>• Weight/size information</li>
                  <li>• Barcode numbers</li>
                  <li>• Expiry dates</li>
                  <li>• Price (if visible)</li>
                  <li>• Halal certification</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h6 className="font-medium text-yellow-800 mb-2">⚠️ Common Issues:</h6>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Blurry or dark images</li>
                  <li>• Partial text visibility</li>
                  <li>• Glare on packaging</li>
                  <li>• Small or unclear text</li>
                  <li>• Multiple products in frame</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h6 className="font-medium text-green-800 mb-2">✅ Best Practices:</h6>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Take multiple angles</li>
                  <li>• Include front & back labels</li>
                  <li>• Verify extracted data</li>
                  <li>• Fill missing information</li>
                  <li>• Use good lighting</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!selectedImage && !isProcessing && (
          <div className="text-center py-12">
            <div className="bg-rose-50 rounded-2xl p-8 mb-6">
              <Camera className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Product Image</h3>
              <p className="text-gray-600 mb-6">
                Take a photo or upload an image of the product for automatic data extraction
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Take Photo
                </button>
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center"
                >
                  <Image className="w-5 h-5 mr-2" />
                  Upload Image
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 text-left">
              <h4 className="font-semibold text-blue-800 mb-3">AI Image Recognition Features:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div>• Product name detection</div>
                <div>• Brand recognition</div>
                <div>• Price extraction</div>
                <div>• Barcode scanning</div>
                <div>• Expiry date reading</div>
                <div>• Weight/size identification</div>
                <div>• Category classification</div>
                <div>• Ingredient analysis</div>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-12">
            {selectedImage && (
              <div className="mb-6">
                <img 
                  src={selectedImage} 
                  alt="Processing" 
                  className="w-48 h-48 object-cover rounded-xl mx-auto mb-4"
                />
              </div>
            )}
            <div className="bg-yellow-50 rounded-xl p-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Image...</h3>
              <p className="text-gray-600">AI is analyzing the product image and extracting information</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 rounded-xl p-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Processing Failed</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setSelectedImage(null);
                  setExtractedData(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {extractedData && selectedImage && !isProcessing && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Captured Image</h3>
                <img 
                  src={selectedImage} 
                  alt="Product" 
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>

              <div>
                <div className="bg-green-50 rounded-xl p-6 mb-4">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="font-semibold text-green-800">
                      Data Extracted Successfully
                    </h3>
                  </div>
                  <p className="text-green-600 text-sm mb-2">
                    Confidence: {Math.round(extractedData.confidence * 100)}%
                  </p>
                  <p className="text-green-600 text-sm">
                    Please review and edit the extracted information below
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Extracted Data:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>Name: {extractedData.name || 'N/A'}</div>
                    <div>Brand: {extractedData.brand || 'N/A'}</div>
                    <div>Price: ${extractedData.price || 'N/A'}</div>
                    <div>Weight: {extractedData.weight || 'N/A'}</div>
                    <div>Category: {extractedData.category || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Edit3 className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Review & Edit Product Details</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                  <input
                    type="text"
                    value={editingProduct.supplier || ''}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={editingProduct.quantity || 1}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                  <input
                    type="date"
                    value={editingProduct.expiryDate || ''}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight/Size</label>
                  <input
                    type="text"
                    value={editingProduct.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={onCancel}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmProduct}
                  disabled={!editingProduct.name || !editingProduct.category || !editingProduct.supplier}
                  className="px-8 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white rounded-xl font-medium flex items-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageImport;