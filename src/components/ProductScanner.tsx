import React, { useState } from 'react';
import { Scan, Search, Package, CheckCircle, XCircle } from 'lucide-react';
import type { Product } from '../types/Product'; 




interface ProductScannerProps {
  products: Product[];
}

const ProductScanner: React.FC<ProductScannerProps> = ({ products }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleScan = () => {
    if (!barcodeInput.trim()) return;
    
    setIsScanning(true);
    setNotFound(false);
    
    // Simulate scanning delay
    setTimeout(() => {
      const foundProduct = products.find(p => p.name.toLowerCase().includes(barcodeInput.trim().toLowerCase()));
      
      if (foundProduct) {
        setScannedProduct(foundProduct);
      } else {
        setNotFound(true);
        setScannedProduct(null);
      }
      
      setIsScanning(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const clearScan = () => {
    setBarcodeInput('');
    setScannedProduct(null);
    setNotFound(false);
  };

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (expiry <= now) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-100' };
    if (expiry <= thirtyDaysFromNow) return { status: 'expiring', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { status: 'fresh', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
        <div className="text-center mb-8">
          <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scan className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Product Scanner</h2>
          <p className="text-gray-600">Search for products by name</p>
        </div>

        {/* Scanner Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter product name to search..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-lg bg-white/80"
              />
            </div>
            <button
              onClick={handleScan}
              disabled={!barcodeInput.trim() || isScanning}
              className="px-8 py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
          
          <div className="flex justify-center mt-4">
            <button
              onClick={clearScan}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Clear search
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-2xl mx-auto">
          {isScanning && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <div className="animate-pulse">
                <Package className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-blue-700 font-medium">Searching for products...</p>
              </div>
            </div>
          )}

          {notFound && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-1">Product Not Found</h3>
                  <p className="text-red-600">
                    No product found matching: <span className="font-mono">{barcodeInput}</span>
                  </p>
                  <p className="text-red-500 text-sm mt-2">
                    Please check the product name and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {scannedProduct && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Product Found</h3>
                    <p className="text-emerald-600 font-medium">Product information</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-1">{scannedProduct.name}</h4>
                    <p className="text-gray-600">{scannedProduct.category}</p>
                  </div>

                  <div className="space-y-3">

                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="text-gray-800">{scannedProduct.supplier}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-gray-800 font-semibold">${scannedProduct.price}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h5 className="font-semibold text-gray-800 mb-2">Stock Information</h5>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quantity Available:</span>
                      <span className={`text-xl font-bold ${
                        scannedProduct.quantity > 10 ? 'text-green-600' : 
                        scannedProduct.quantity > 5 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {scannedProduct.quantity}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${getExpiryStatus(scannedProduct.expiryDate).bg}`}>
                    <h5 className="font-semibold text-gray-800 mb-2">Expiry Information</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="text-gray-800 font-medium">
                          {new Date(scannedProduct.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold capitalize ${getExpiryStatus(scannedProduct.expiryDate).color}`}>
                          {getExpiryStatus(scannedProduct.expiryDate).status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductScanner;