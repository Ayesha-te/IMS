import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Store,
  Package,
  Loader,
  Eye,
  Save,
  Trash2
} from 'lucide-react';
import { parseExcelFile, validateExcelFile, downloadExcelTemplate } from '../utils/excelParser';
import { analyzeStoreContext, getStoreOptions, validateStoreSelection } from '../utils/storeUtils';
import type { Product, Supermarket, User } from '../types/Product';
import type { ProductWithNames } from '../services/apiService';

interface AdaptiveExcelUploadProps {
  stores: Supermarket[];
  currentUser: User | null;
  onProductsImported: (products: Omit<Product, 'id'>[], storeIds?: string[]) => void;
  onClose: () => void;
}

interface ImportPreview {
  products: ProductWithNames[];
  validProducts: ProductWithNames[];
  invalidProducts: { product: ProductWithNames; errors: string[] }[];
  duplicates: ProductWithNames[];
}

const AdaptiveExcelUpload: React.FC<AdaptiveExcelUploadProps> = ({
  stores,
  currentUser,
  onProductsImported,
  onClose
}) => {
  const storeContext = analyzeStoreContext(stores, currentUser);
  const storeOptions = getStoreOptions(storeContext);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>(
    storeContext.isMultiStore ? [] : storeContext.mainStore ? [storeContext.mainStore.id] : []
  );
  const [importToAllStores, setImportToAllStores] = useState(false);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setPreview(null);

    const validation = validateExcelFile(selectedFile);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
  };

  // Process Excel file
  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const products = await parseExcelFile(file);
      
      // Validate products and categorize them
      const validProducts: ProductWithNames[] = [];
      const invalidProducts: { product: ProductWithNames; errors: string[] }[] = [];
      const duplicates: ProductWithNames[] = [];

      products.forEach(product => {
        const errors: string[] = [];

        // Basic validation
        if (!product.name?.trim()) errors.push('Product name is required');
        if (!product.category?.trim()) errors.push('Category is required');
        if (!product.supplier?.trim()) errors.push('Supplier is required');
        if (!product.supermarket?.trim()) errors.push('Supermarket is required');
        if (!product.price || product.price <= 0) errors.push('Valid price is required');
        if (!product.quantity || product.quantity < 0) errors.push('Valid quantity is required');

        // Check for duplicates (by name and barcode if available)
        const isDuplicate = validProducts.some(existing => 
          existing.name.toLowerCase() === product.name?.toLowerCase() ||
          (product.barcode && existing.barcode && existing.barcode === product.barcode)
        );

        if (isDuplicate) {
          duplicates.push(product);
        } else if (errors.length > 0) {
          invalidProducts.push({ product, errors });
        } else {
          validProducts.push(product);
        }
      });

      setPreview({
        products,
        validProducts,
        invalidProducts,
        duplicates
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle store selection
  const handleStoreSelection = (storeId: string, checked: boolean) => {
    if (checked) {
      setSelectedStores(prev => [...prev, storeId]);
    } else {
      setSelectedStores(prev => prev.filter(id => id !== storeId));
    }
  };

  // Import products
  const handleImport = () => {
    if (!preview?.validProducts.length) return;

    // Validate store selection
    const storeIds = importToAllStores 
      ? storeContext.userStores.map(store => store.id)
      : selectedStores;

    if (storeContext.isMultiStore) {
      const validation = validateStoreSelection(storeIds, storeContext);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid store selection');
        return;
      }
    }

    // Convert ProductWithNames to Product format
    const productsToImport = preview.validProducts.map(product => ({
      name: product.name,
      description: '',
      category: product.category,
      supplier: product.supplier,
      brand: product.brand || '',
      barcode: product.barcode || '',
      price: product.price,
      quantity: product.quantity,
      expiryDate: product.expiry_date || '',
      supermarketId: storeContext.isMultiStore ? '' : (storeContext.mainStore?.id || ''), // Will be set per store
      halalCertified: false,
      addedDate: new Date().toISOString(),
      costPrice: product.cost_price,
      sellingPrice: product.selling_price || product.price,
      minStockLevel: 5,
      location: '',
      syncedWithPOS: false,
      weight: '',
      origin: '',
      imageUrl: '',
      halalCertificationBody: ''
    }));

    onProductsImported(productsToImport, storeContext.isMultiStore ? storeIds : undefined);
    onClose();
  };

  // Get store name by ID
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {storeContext.isMultiStore ? 'Multi-Store Excel Import' : 'Excel Import'}
                </h2>
                <p className="text-blue-100">
                  {storeContext.isMultiStore 
                    ? 'Import products to multiple stores from Excel/CSV files'
                    : `Import products to ${storeContext.mainStore?.name || 'your store'} from Excel/CSV files`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* File Upload Section */}
          {!preview && (
            <div className="space-y-6">
              {/* Template Download */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Download Template</h3>
                    <p className="text-blue-600 text-sm">
                      Download our Excel template to ensure your data is formatted correctly
                    </p>
                  </div>
                  <button
                    onClick={downloadExcelTemplate}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </button>
                </div>
              </div>

              {/* Store Selection for Multi-Store Users */}
              {storeContext.isMultiStore && (
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <Store className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-800">Store Selection</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="importToAllStores"
                        checked={importToAllStores}
                        onChange={(e) => {
                          setImportToAllStores(e.target.checked);
                          if (e.target.checked) {
                            setSelectedStores(storeContext.userStores.map(store => store.id));
                          } else {
                            setSelectedStores([]);
                          }
                        }}
                        className="mr-3"
                      />
                      <label htmlFor="importToAllStores" className="text-sm font-medium text-green-800">
                        Import to all my stores ({storeContext.userStores.length} stores)
                      </label>
                    </div>

                    {!importToAllStores && (
                      <div className="mt-3">
                        <p className="text-sm text-green-700 mb-3">Select specific stores:</p>
                        <div className="max-h-32 overflow-y-auto space-y-2 bg-white rounded-lg p-3 border border-green-200">
                          {storeContext.userStores.map(store => (
                            <label key={store.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedStores.includes(store.id)}
                                onChange={(e) => handleStoreSelection(store.id, e.target.checked)}
                                className="mr-3"
                              />
                              <span className="text-sm">
                                {store.name} {store.isSubStore ? '(Sub-Store)' : '(Main Store)'}
                              </span>
                            </label>
                          ))}
                        </div>
                        {selectedStores.length > 0 && (
                          <div className="mt-2 p-2 bg-green-100 rounded-lg">
                            <p className="text-sm text-green-800">
                              Products will be imported to {selectedStores.length} store(s)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {file ? file.name : 'Upload Excel or CSV File'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop your file here, or click to browse
                    </p>
                    
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>

                  <p className="text-sm text-gray-500">
                    Supported formats: .xlsx, .xls, .csv (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Process Button */}
              {file && (
                <div className="flex justify-center">
                  <button
                    onClick={processFile}
                    disabled={isProcessing || (storeContext.isMultiStore && selectedStores.length === 0)}
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Import
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Section */}
          {preview && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 text-blue-600 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-blue-800">{preview.products.length}</p>
                      <p className="text-blue-600 text-sm">Total Products</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-green-800">{preview.validProducts.length}</p>
                      <p className="text-green-600 text-sm">Valid Products</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-red-800">{preview.invalidProducts.length}</p>
                      <p className="text-red-600 text-sm">Invalid Products</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-yellow-800">{preview.duplicates.length}</p>
                      <p className="text-yellow-600 text-sm">Duplicates</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Assignment Preview */}
              {storeContext.isMultiStore && selectedStores.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Import Destination</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStores.map(storeId => (
                      <span key={storeId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {getStoreName(storeId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Products Preview */}
              {preview.validProducts.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                    <h3 className="font-semibold text-green-800">Valid Products ({preview.validProducts.length})</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-4">Name</th>
                          <th className="text-left py-2 px-4">Category</th>
                          <th className="text-left py-2 px-4">Supplier</th>
                          <th className="text-left py-2 px-4">Price</th>
                          <th className="text-left py-2 px-4">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.validProducts.slice(0, 10).map((product, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 px-4 font-medium">{product.name}</td>
                            <td className="py-2 px-4">{product.category}</td>
                            <td className="py-2 px-4">{product.supplier}</td>
                            <td className="py-2 px-4">${product.price?.toFixed(2)}</td>
                            <td className="py-2 px-4">{product.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.validProducts.length > 10 && (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        ... and {preview.validProducts.length - 10} more products
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invalid Products */}
              {preview.invalidProducts.length > 0 && (
                <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                    <h3 className="font-semibold text-red-800">Invalid Products ({preview.invalidProducts.length})</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {preview.invalidProducts.slice(0, 5).map((item, index) => (
                      <div key={index} className="p-4 border-b border-red-100">
                        <div className="font-medium text-gray-800 mb-1">{item.product.name || 'Unnamed Product'}</div>
                        <div className="space-y-1">
                          {item.errors.map((error, errorIndex) => (
                            <div key={errorIndex} className="text-sm text-red-600 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {preview.invalidProducts.length > 5 && (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        ... and {preview.invalidProducts.length - 5} more invalid products
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Start Over
                </button>

                <button
                  onClick={handleImport}
                  disabled={preview.validProducts.length === 0 || (storeContext.isMultiStore && selectedStores.length === 0)}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Import {preview.validProducts.length} Products
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveExcelUpload;