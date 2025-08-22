import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download, Info, Plus } from 'lucide-react';
import type { Product, UploadSessionType } from '../types/Product';
import { 
  generateExcelTemplate, 
  generateFieldGuide, 
  validateExcelRow, 
  SAMPLE_EXCEL_DATA
} from '../utils/excelTemplates';
import type { ExcelProductRow } from '../utils/excelTemplates';

import { CategoryService, SupplierService, AuthService } from '../services/apiService';
import { handleExcelUploadEnhanced } from '../utils/excelImportService';

interface ExcelUploadProps {
  onProductsExtracted: (products: Product[]) => void;
  onCancel: () => void;
  supermarketId: string;
}

interface ExcelRow {
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  expiryDate: string;
  barcode?: string;
  brand?: string;
  weight?: string;
  costPrice?: number;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onProductsExtracted, onCancel, supermarketId }) => {
  console.log('🚀 ExcelUpload component rendered');
  console.log('🏪 ExcelUpload received supermarketId:', supermarketId);
  console.log('📋 ExcelUpload props:', { onProductsExtracted: !!onProductsExtracted, onCancel: !!onCancel, supermarketId });
  
  // Fetch categories and suppliers dynamically
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    console.log('🔄 ExcelUpload useEffect triggered');
    const fetchData = async () => {
      try {
        console.log('🔑 Getting authentication token...');
        const token = AuthService.getToken();
        if (!token) {
          console.error('❌ No authentication token found. User must be logged in.');
          return;
        }
        console.log('✅ Token found, length:', token.length);

        // Fetch categories with authentication
        console.log('📂 Fetching categories...');
        const categoriesData = await CategoryService.getCategories(token);
        console.log('📂 Categories response:', categoriesData);
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
          console.log('✅ Set categories (array):', categoriesData.length);
        } else if (categoriesData.results) {
          setCategories(categoriesData.results);
          console.log('✅ Set categories (results):', categoriesData.results.length);
        }

        // Fetch suppliers with authentication
        console.log('🏭 Fetching suppliers...');
        const suppliersData = await SupplierService.getSuppliers(token);
        console.log('🏭 Suppliers response:', suppliersData);
        if (Array.isArray(suppliersData)) {
          setSuppliers(suppliersData);
          console.log('✅ Set suppliers (array):', suppliersData.length);
        } else if (suppliersData.results) {
          setSuppliers(suppliersData.results);
          console.log('✅ Set suppliers (results):', suppliersData.results.length);
        }
      } catch (error) {
        console.error('Failed to fetch categories and suppliers:', error);
        if (error instanceof Error && error.message.includes('401')) {
          setAuthError('Authentication required. Please log in to import products.');
        } else {
          setAuthError('Failed to load categories and suppliers. Please try again.');
        }
      }
    };

    fetchData();
  }, []);

  const [uploadSession, setUploadSession] = useState<UploadSessionType | null>(null);
  const [extractedProducts, setExtractedProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [authError, setAuthError] = useState<string>('');
  const [showGuide, setShowGuide] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importOptions, setImportOptions] = useState({
    createMissingCategories: true,
    createMissingSuppliers: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Excel template
  const downloadTemplate = () => {
    const csvContent = generateExcelTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download field guide
  const downloadGuide = () => {
    const guideContent = generateFieldGuide();
    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'excel_import_guide.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File selection triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    console.log('✅ File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Check authentication
    const token = AuthService.getToken();
    if (!token) {
      setAuthError('Authentication required. Please log in to import products.');
      return;
    }

    // Validate supermarket ID (UUID)
    console.log('🏪 Validating supermarket ID:', supermarketId);
    const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(supermarketId);
    if (!supermarketId || supermarketId === 'default' || !isValidUUID) {
      console.log('❌ Invalid supermarket ID detected');
      setAuthError(`Invalid supermarket ID: "${supermarketId}". Please ensure you have a valid supermarket set up and selected. If you just registered, please refresh the page and try again.`);
      return;
    }
    console.log('✅ Supermarket ID validation passed:', supermarketId);

    // Create upload session
    const session: UploadSessionType = {
      id: Date.now().toString(),
      type: 'excel',
      status: 'uploading',
      fileName: file.name,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setUploadSession(session);
    setErrors([]);
    setAuthError('');
    setImportResult(null);

    try {
      console.log('🚀 Starting Excel import process...');
      console.log('📊 Import data:', {
        fileName: file.name,
        categoriesCount: categories.length,
        suppliersCount: suppliers.length,
        supermarketId,
        hasToken: !!token,
        importOptions
      });
      
      // Show progress
      setUploadSession(prev => prev ? { ...prev, progress: 25 } : null);
      
      // Use the enhanced import service
      console.log('📤 Calling handleExcelUploadEnhanced...');
      const result = await handleExcelUploadEnhanced(
        file,
        categories,
        suppliers,
        supermarketId, // UUID string
        token,
        importOptions
      );
      console.log('✅ Import completed successfully:', result);

      setUploadSession(prev => prev ? { ...prev, progress: 100, status: 'completed' } : null);
      setImportResult(result);

      // Convert result to display format for existing UI
      const displayProducts = result.results
        .filter(r => r.success)
        .map((r, index) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: r.product.name,
          category: r.product.category,
          supplier: r.product.supplier,
          quantity: r.product.quantity,
          price: r.product.selling_price || r.product.cost_price,
          // barcode removed from display, system auto-generates
          brand: r.product.brand || '',
          weight: r.product.weight || '',
          origin: r.product.origin || '',
          description: r.product.description || '',
          location: r.product.location || '',
          addedDate: new Date().toISOString().split('T')[0],
          expiryDate: (() => {
            const ed = r.product.expiry_date as any;
            if (typeof ed === 'string') return ed;
            if (ed && typeof ed === 'object' && typeof ed.toISOString === 'function') return ed.toISOString().split('T')[0];
            return '';
          })(),
          supermarketId: supermarketId || '',
          halalCertified: typeof r.product.halal_certified === 'string' ? r.product.halal_certified.toLowerCase() === 'true' : (r.product.halal_certified ?? true),
          halalCertificationBody: r.product.halal_certification_body || '',
          syncedWithPOS: false
        }));

      setExtractedProducts(displayProducts);

      // Show errors if any
      const failedResults = result.results.filter(r => !r.success);
      if (failedResults.length > 0) {
        setErrors(failedResults.map(r => `${r.product.name}: ${r.error}`));
      }

    } catch (error) {
      console.error('❌ Excel import failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        error
      });
      
      setUploadSession(prev => prev ? {
        ...prev,
        status: 'error',
        error: 'Failed to process Excel file. Please check the format and try again.'
      } : null);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to process Excel file. Please ensure it follows the required format.';
      console.error('❌ Setting error message:', errorMessage);
      setErrors([errorMessage]);
    }
  };

  const generateBarcode = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };

  const handleConfirmImport = () => {
    if (extractedProducts.length > 0) {
      // For UI state, return human-readable products (no IDs)
      const uiProducts = extractedProducts.map(({ id, ...rest }) => rest);
      onProductsExtracted(uiProducts as any);
    }
  };

  const removeProduct = (index: number) => {
    const updated = extractedProducts.filter((_, i) => i !== index);
    setExtractedProducts(updated);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Import from Excel</h2>
            <p className="text-gray-600">Upload an Excel file to import multiple products</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        {/* Authentication Error */}
        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="text-red-800 font-medium">Authentication Error</h4>
                <p className="text-red-700 text-sm">{authError}</p>
              </div>
            </div>
          </div>
        )}

        {!uploadSession && (
          <>
            {/* Template Download Section */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 First Time? Download Template</h3>
                  <p className="text-blue-700 mb-4">
                    Get the correct Excel format with sample data and field descriptions to ensure successful import.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={downloadTemplate}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Template</span>
                    </button>
                    <button
                      onClick={downloadGuide}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Info className="w-4 h-4" />
                      <span>Field Guide</span>
                    </button>
                    <button
                      onClick={() => setShowGuide(!showGuide)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      {showGuide ? 'Hide' : 'Show'} Format Info
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Format Guide */}
            {showGuide && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <h4 className="font-semibold text-gray-800 mb-4">📝 Required Excel Format:</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Required Fields:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>name</strong> - Product name</li>
                      <li>• <strong>category</strong> - Category name (e.g., "Beverages")</li>
                      <li>• <strong>supplier</strong> - Supplier name</li>
                      <li>• <strong>quantity</strong> - Stock quantity (number)</li>
                      <li>• <strong>cost_price</strong> - Cost price (e.g., 8.50)</li>
                      <li>• <strong>selling_price</strong> - Selling price (e.g., 12.99)</li>
                      <li>• <strong>expiry_date</strong> - Date (YYYY-MM-DD format)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Optional Fields:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>brand</strong> - Brand name</li>
                      <li>• <strong>weight</strong> - Weight/size (e.g., "1kg")</li>
                      <li>• <strong>origin</strong> - Country of origin</li>
                      <li>• <strong>description</strong> - Product description</li>
                      <li>• <strong>barcode</strong> - Barcode (auto-generated if empty)</li>
                      <li>• <strong>location</strong> - Storage location</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Pro Tip:</strong> Categories and suppliers will be automatically created if they don't exist. 
                    Use consistent naming for better organization.
                  </p>
                </div>
              </div>
            )}



            {/* Import Options */}
            <div className="bg-green-50 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <Plus className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">🚀 Enhanced Import Options</h3>
                  <p className="text-green-700 mb-4">
                    Configure how the import should handle missing data and upload process.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={importOptions.createMissingCategories}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, createMissingCategories: e.target.checked }))}
                        className="rounded border-green-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-green-800">Auto-create missing categories</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={importOptions.createMissingSuppliers}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, createMissingSuppliers: e.target.checked }))}
                        className="rounded border-green-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-green-800">Auto-create missing suppliers</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center py-12">
              <div className="bg-rose-50 rounded-2xl p-8 mb-6">
                <FileSpreadsheet className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Excel File</h3>
                <p className="text-gray-600 mb-6">
                  Choose an Excel file (.xlsx, .xls, .csv) with your product data
                </p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  console.log('📁 File input onChange triggered');
                  console.log('📁 Event target:', e.target);
                  console.log('📁 Files:', e.target.files);
                  handleFileSelect(e);
                }}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              
              <button
                onClick={() => {
                  console.log('🖱️ Choose File button clicked');
                  console.log('📁 File input ref:', fileInputRef.current);
                  fileInputRef.current?.click();
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center mx-auto"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose File
              </button>
            </div>
          </div>
          </>
        )}

        {uploadSession && uploadSession.status === 'uploading' && (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-xl p-8">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Uploading File...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadSession.progress}%` }}
                ></div>
              </div>
              <p className="text-gray-600">{uploadSession.progress}% Complete</p>
            </div>
          </div>
        )}

        {uploadSession && uploadSession.status === 'processing' && (
          <div className="text-center py-12">
            <div className="bg-yellow-50 rounded-xl p-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Excel File...</h3>
              <p className="text-gray-600">Extracting product data from your file</p>
            </div>
          </div>
        )}

        {uploadSession && uploadSession.status === 'error' && (
          <div className="text-center py-12">
            <div className="bg-red-50 rounded-xl p-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Upload Failed</h3>
              <p className="text-red-600 mb-6">{uploadSession.error}</p>
              <button
                onClick={() => setUploadSession(null)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {uploadSession && uploadSession.status === 'completed' && extractedProducts.length > 0 && (
          <div>
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    Successfully processed Excel file
                  </h3>
                  <p className="text-green-600 text-sm">
                    {importResult ? 
                      `${importResult.successful} products imported successfully, ${importResult.failed} failed` :
                      `${extractedProducts.length} products ready for review`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Import Results */}
            {importResult && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-blue-800 mb-4">📊 Import Summary</h4>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                    <div className="text-sm text-blue-700">Total Rows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.successful}</div>
                    <div className="text-sm text-green-700">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {importResult.newCategories.length + importResult.newSuppliers.length}
                    </div>
                    <div className="text-sm text-purple-700">New Items Created</div>
                  </div>
                </div>
                
                {(importResult.newCategories.length > 0 || importResult.newSuppliers.length > 0) && (
                  <div className="border-t border-blue-200 pt-4">
                    <h5 className="font-medium text-blue-800 mb-2">🆕 Newly Created Items:</h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      {importResult.newCategories.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium text-blue-700 mb-1">Categories:</h6>
                          <div className="flex flex-wrap gap-1">
                            {importResult.newCategories.map((cat: any) => (
                              <span key={cat.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {importResult.newSuppliers.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium text-blue-700 mb-1">Suppliers:</h6>
                          <div className="flex flex-wrap gap-1">
                            {importResult.newSuppliers.map((sup: any) => (
                              <span key={sup.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {sup.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="max-h-96 overflow-y-auto mb-6">
              <div className="space-y-3">
                {extractedProducts.map((product, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            {product.category} • {product.quantity} units • ${product.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Expires: {product.expiryDate}</p>
                          <p className="text-sm text-gray-500">Supplier: {product.supplier}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeProduct(index)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium flex items-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Import {extractedProducts.length} Products
              </button>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
            <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
            <ul className="text-sm text-red-600 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;