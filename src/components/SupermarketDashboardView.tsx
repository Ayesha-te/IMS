import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import type { Product, Supermarket, User } from '../types/Product';

interface SupermarketDashboardViewProps {
  user: User;
  supermarkets: Supermarket[];
  products: Product[];
  onViewSupermarket: (supermarketId: string) => void;
  onManageSupermarket: (supermarketId: string) => void;
  onCreateSupermarket: () => void;
}

interface SupermarketStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  expiringCount: number;
  averagePrice: number;
}

const SupermarketDashboardView: React.FC<SupermarketDashboardViewProps> = ({
  user,
  supermarkets,
  products,
  onViewSupermarket,
  onManageSupermarket,
  onCreateSupermarket
}) => {
  const [selectedView, setSelectedView] = useState<'grid' | 'columns'>('columns');

  // Calculate statistics for each supermarket
  const getSupermarketStats = (supermarketId: string): SupermarketStats => {
    const supermarketProducts = products.filter(p => 
      String(p.supermarketId) === String(supermarketId)
    );
    
    const totalValue = supermarketProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStockCount = supermarketProducts.filter(p => p.quantity <= 5).length;
    const expiringCount = supermarketProducts.filter(p => {
      const expiryDate = new Date(p.expiryDate);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    }).length;
    const averagePrice = supermarketProducts.length > 0 
      ? supermarketProducts.reduce((sum, p) => sum + p.price, 0) / supermarketProducts.length 
      : 0;

    return {
      totalProducts: supermarketProducts.length,
      totalValue,
      lowStockCount,
      expiringCount,
      averagePrice
    };
  };

  // Separate main stores and sub-stores
  const mainStores = supermarkets.filter(store => !store.isSubStore);
  const subStores = supermarkets.filter(store => store.isSubStore);

  // Group sub-stores by parent
  const subStoresByParent = subStores.reduce((acc, subStore) => {
    const parentId = subStore.parentId || 'unknown';
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(subStore);
    return acc;
  }, {} as Record<string, Supermarket[]>);

  // Overall statistics
  const overallStats = {
    totalSupermarkets: supermarkets.length,
    totalMainStores: mainStores.length,
    totalSubStores: subStores.length,
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    averageProductsPerStore: supermarkets.length > 0 ? Math.round(products.length / supermarkets.length) : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-xl mr-4">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Supermarket Dashboard</h2>
              <p className="text-gray-600">Manage all your supermarkets and their inventory</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedView('columns')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedView === 'columns'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Columns
              </button>
              <button
                onClick={() => setSelectedView('grid')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedView === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Grid
              </button>
            </div>
            <button
              onClick={onCreateSupermarket}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Supermarket
            </button>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center">
              <Store className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-blue-800">{overallStats.totalSupermarkets}</p>
                <p className="text-blue-600 text-xs">Total Stores</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center">
              <Package className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-green-800">{overallStats.totalProducts}</p>
                <p className="text-green-600 text-xs">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-purple-800">${overallStats.totalValue.toFixed(0)}</p>
                <p className="text-purple-600 text-xs">Total Value</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-orange-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-orange-800">{overallStats.averageProductsPerStore}</p>
                <p className="text-orange-600 text-xs">Avg Products/Store</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="flex items-center">
              <Store className="w-6 h-6 text-indigo-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-indigo-800">{overallStats.totalMainStores}</p>
                <p className="text-indigo-600 text-xs">Main Stores</p>
              </div>
            </div>
          </div>

          <div className="bg-pink-50 rounded-xl p-4">
            <div className="flex items-center">
              <Store className="w-6 h-6 text-pink-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-pink-800">{overallStats.totalSubStores}</p>
                <p className="text-pink-600 text-xs">Sub Stores</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supermarkets Display */}
      {selectedView === 'columns' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {mainStores.map(supermarket => {
            const stats = getSupermarketStats(supermarket.id);
            const relatedSubStores = subStoresByParent[supermarket.id] || [];
            
            return (
              <div key={supermarket.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200">
                {/* Main Store Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Store className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center">
                          {supermarket.name}
                          {supermarket.isVerified && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                          )}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex items-center mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {supermarket.address}
                          </div>
                          {supermarket.phone && (
                            <div className="flex items-center mb-1">
                              <Phone className="w-3 h-3 mr-1" />
                              {supermarket.phone}
                            </div>
                          )}
                          {supermarket.email && (
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {supermarket.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewSupermarket(supermarket.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onManageSupermarket(supermarket.id)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Manage Store"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main Store Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-green-600 mr-2" />
                        <div>
                          <p className="text-lg font-bold text-green-800">{stats.totalProducts}</p>
                          <p className="text-green-600 text-xs">Products</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-purple-600 mr-2" />
                        <div>
                          <p className="text-lg font-bold text-purple-800">${stats.totalValue.toFixed(0)}</p>
                          <p className="text-purple-600 text-xs">Total Value</p>
                        </div>
                      </div>
                    </div>

                    {stats.lowStockCount > 0 && (
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                          <div>
                            <p className="text-lg font-bold text-orange-800">{stats.lowStockCount}</p>
                            <p className="text-orange-600 text-xs">Low Stock</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {stats.expiringCount > 0 && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-red-600 mr-2" />
                          <div>
                            <p className="text-lg font-bold text-red-800">{stats.expiringCount}</p>
                            <p className="text-red-600 text-xs">Expiring</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-Stores */}
                {relatedSubStores.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Store className="w-4 h-4 mr-1" />
                      Sub-Stores ({relatedSubStores.length})
                    </h4>
                    <div className="space-y-2">
                      {relatedSubStores.map(subStore => {
                        const subStats = getSupermarketStats(subStore.id);
                        return (
                          <div key={subStore.id} className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="bg-purple-100 p-1 rounded mr-2">
                                  <Store className="w-3 h-3 text-purple-600" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-purple-800 text-sm">{subStore.name}</h5>
                                  <p className="text-xs text-purple-600 truncate max-w-32">{subStore.address}</p>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => onViewSupermarket(subStore.id)}
                                  className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors"
                                  title="View Sub-Store"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onManageSupermarket(subStore.id)}
                                  className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors"
                                  title="Manage Sub-Store"
                                >
                                  <Settings className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <p className="font-semibold text-purple-800">{subStats.totalProducts}</p>
                                <p className="text-purple-600">Products</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-purple-800">${subStats.totalValue.toFixed(0)}</p>
                                <p className="text-purple-600">Value</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-purple-800">{subStats.lowStockCount}</p>
                                <p className="text-purple-600">Low Stock</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {supermarkets.map(supermarket => {
            const stats = getSupermarketStats(supermarket.id);
            
            return (
              <div key={supermarket.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${supermarket.isSubStore ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      <Store className={`w-4 h-4 ${supermarket.isSubStore ? 'text-purple-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm flex items-center">
                        {supermarket.name}
                        {supermarket.isVerified && (
                          <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
                        )}
                        {supermarket.isSubStore && (
                          <span className="ml-1 px-1 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                            Sub
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-600 truncate max-w-32">{supermarket.address}</p>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => onViewSupermarket(supermarket.id)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onManageSupermarket(supermarket.id)}
                      className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center bg-green-50 rounded p-2">
                    <p className="font-semibold text-green-800">{stats.totalProducts}</p>
                    <p className="text-green-600">Products</p>
                  </div>
                  <div className="text-center bg-purple-50 rounded p-2">
                    <p className="font-semibold text-purple-800">${stats.totalValue.toFixed(0)}</p>
                    <p className="text-purple-600">Value</p>
                  </div>
                  {stats.lowStockCount > 0 && (
                    <div className="text-center bg-orange-50 rounded p-2">
                      <p className="font-semibold text-orange-800">{stats.lowStockCount}</p>
                      <p className="text-orange-600">Low Stock</p>
                    </div>
                  )}
                  {stats.expiringCount > 0 && (
                    <div className="text-center bg-red-50 rounded p-2">
                      <p className="font-semibold text-red-800">{stats.expiringCount}</p>
                      <p className="text-red-600">Expiring</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {supermarkets.length === 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Supermarkets Yet</h3>
          <p className="text-gray-400 mb-6">Create your first supermarket to start managing inventory</p>
          <button
            onClick={onCreateSupermarket}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium flex items-center mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Supermarket
          </button>
        </div>
      )}
    </div>
  );
};

export default SupermarketDashboardView;