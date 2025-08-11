import React, { useState } from 'react';
import { Store, MapPin, Phone, Mail, Package, CheckCircle, Clock } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';

interface SupermarketDashboardProps {
  supermarkets: Supermarket[];
  products: Product[];
}

const SupermarketDashboard: React.FC<SupermarketDashboardProps> = ({ supermarkets, products }) => {
  const [selectedSupermarket, setSelectedSupermarket] = useState<string | null>(null);

  const getSupermarketProducts = (supermarketId: string) => {
    return products.filter(p => p.supermarketId === supermarketId);
  };

  const getSupermarketStats = (supermarketId: string) => {
    const supermarketProducts = getSupermarketProducts(supermarketId);
    const totalProducts = supermarketProducts.length;
    const totalValue = supermarketProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStock = supermarketProducts.filter(p => p.quantity < 10).length;
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringProducts = supermarketProducts.filter(p => {
      const expiryDate = new Date(p.expiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate > now;
    }).length;

    return { totalProducts, totalValue, lowStock, expiringProducts };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🏪 Supermarket Network</h2>
            <p className="text-gray-600">Manage and monitor all registered supermarkets</p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Store className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Supermarkets</p>
              <p className="text-3xl font-bold text-gray-800">{supermarkets.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Verified Stores</p>
              <p className="text-3xl font-bold text-gray-800">{supermarkets.filter(s => s.isVerified).length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-800">{products.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Verification</p>
              <p className="text-3xl font-bold text-gray-800">{supermarkets.filter(s => !s.isVerified).length}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Supermarket List */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Registered Supermarkets</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {supermarkets.map(supermarket => {
            const stats = getSupermarketStats(supermarket.id);
            
            return (
              <div key={supermarket.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <Store className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{supermarket.name}</h4>
                      <div className="flex items-center">
                        {supermarket.isVerified ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{supermarket.address}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{supermarket.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{supermarket.email}</span>
                  </div>
                </div>

                {/* Description */}
                {supermarket.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{supermarket.description}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Products</p>
                    <p className="text-lg font-bold text-blue-800">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Total Value</p>
                    <p className="text-lg font-bold text-green-800">${stats.totalValue.toFixed(0)}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-xs text-amber-600 font-medium">Low Stock</p>
                    <p className="text-lg font-bold text-amber-800">{stats.lowStock}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-red-600 font-medium">Expiring</p>
                    <p className="text-lg font-bold text-red-800">{stats.expiringProducts}</p>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="text-xs text-gray-500 mb-4">
                  Registered: {new Date(supermarket.registrationDate).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedSupermarket(selectedSupermarket === supermarket.id ? null : supermarket.id)}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    {selectedSupermarket === supermarket.id ? 'Hide Products' : 'View Products'}
                  </button>
                  {!supermarket.isVerified && (
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Verify
                    </button>
                  )}
                </div>

                {/* Products List */}
                {selectedSupermarket === supermarket.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-3">Products ({stats.totalProducts})</h5>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {getSupermarketProducts(supermarket.id).map(product => (
                        <div key={product.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                          <div>
                            <p className="font-medium text-sm text-gray-800">{product.name}</p>
                            <p className="text-xs text-gray-600">{product.category} • ${product.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">Qty: {product.quantity}</p>
                            <p className="text-xs text-gray-600">{new Date(product.expiryDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SupermarketDashboard;