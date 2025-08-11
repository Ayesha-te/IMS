import React from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, Package, Store, DollarSign, AlertTriangle } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';

interface AnalyticsProps {
  products: Product[];
  supermarkets: Supermarket[];
}

const Analytics: React.FC<AnalyticsProps> = ({ products, supermarkets }) => {
  // Calculate analytics data
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const averagePrice = totalValue / products.reduce((sum, p) => sum + p.quantity, 0);
  
  // Category distribution
  const categoryStats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Supermarket distribution
  const supermarketStats = products.reduce((acc, product) => {
    const supermarket = supermarkets.find(s => s.id === product.supermarketId);
    const name = supermarket?.name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Expiry analysis
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiredProducts = products.filter(p => new Date(p.expiryDate) <= now).length;
  const expiringProducts = products.filter(p => {
    const expiry = new Date(p.expiryDate);
    return expiry <= thirtyDaysFromNow && expiry > now;
  }).length;
  const freshProducts = products.filter(p => new Date(p.expiryDate) > thirtyDaysFromNow).length;

  // Monthly trends (mock data for demonstration)
  const monthlyData = [
    { month: 'Jan', products: 45, value: 12500 },
    { month: 'Feb', products: 52, value: 14200 },
    { month: 'Mar', products: 48, value: 13800 },
    { month: 'Apr', products: 61, value: 16900 },
    { month: 'May', products: 58, value: 15600 },
    { month: 'Jun', products: 65, value: 18200 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">📈 Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive insights into your Halal inventory network</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-800">{totalProducts}</p>
              <p className="text-sm text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Value</p>
              <p className="text-3xl font-bold text-gray-800">${totalValue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+8% from last month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Average Price</p>
              <p className="text-3xl font-bold text-gray-800">${averagePrice.toFixed(2)}</p>
              <p className="text-sm text-blue-600 mt-1">Stable pricing</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Stores</p>
              <p className="text-3xl font-bold text-gray-800">{supermarkets.length}</p>
              <p className="text-sm text-green-600 mt-1">All verified</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Store className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Product Categories</h3>
            <PieChart className="w-6 h-6 text-rose-600" />
          </div>
          <div className="space-y-4">
            {Object.entries(categoryStats)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count], index) => {
                const percentage = (count / totalProducts * 100).toFixed(1);
                const colors = ['bg-rose-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-indigo-500', 'bg-pink-500'];
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]} mr-3`}></div>
                      <span className="font-medium text-gray-800">{category}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">{count} products</span>
                      <span className="text-sm font-semibold text-gray-800">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Expiry Status */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Expiry Status</h3>
            <Calendar className="w-6 h-6 text-rose-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                <span className="font-medium text-green-800">Fresh Products</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-800">{freshProducts}</span>
                <p className="text-sm text-green-600">{(freshProducts / totalProducts * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 mr-3"></div>
                <span className="font-medium text-amber-800">Expiring Soon</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-800">{expiringProducts}</span>
                <p className="text-sm text-amber-600">{(expiringProducts / totalProducts * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                <span className="font-medium text-red-800">Expired</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-red-800">{expiredProducts}</span>
                <p className="text-sm text-red-600">{(expiredProducts / totalProducts * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supermarket Performance */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Supermarket Performance</h3>
          <Store className="w-6 h-6 text-rose-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(supermarketStats)
            .sort(([,a], [,b]) => b - a)
            .map(([name, count], index) => {
              const supermarket = supermarkets.find(s => s.name === name);
              const supermarketProducts = products.filter(p => p.supermarketId === supermarket?.id);
              const totalValue = supermarketProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
              
              return (
                <div key={name} className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-800">{name}</h4>
                    <div className="bg-rose-100 p-2 rounded-lg">
                      <Store className="w-5 h-5 text-rose-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products:</span>
                      <span className="font-semibold text-gray-800">{count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-semibold text-gray-800">${totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Price:</span>
                      <span className="font-semibold text-gray-800">
                        ${supermarketProducts.length > 0 ? (totalValue / supermarketProducts.reduce((sum, p) => sum + p.quantity, 0)).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Monthly Trends</h3>
          <TrendingUp className="w-6 h-6 text-rose-600" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {monthlyData.map((data, index) => (
            <div key={data.month} className="text-center">
              <div className="bg-gradient-to-t from-rose-500 to-rose-300 rounded-lg mb-2" style={{height: `${(data.products / 70) * 100}px`, minHeight: '20px'}}></div>
              <p className="text-sm font-medium text-gray-800">{data.month}</p>
              <p className="text-xs text-gray-600">{data.products} products</p>
              <p className="text-xs text-gray-600">${(data.value / 1000).toFixed(1)}k</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;