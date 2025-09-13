import React, { useState } from 'react';
import { Search, Package, MapPin, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';
import { DEFAULT_REORDER_LEVEL } from '../constants/inventory';

interface ProductCatalogProps {
  products: Product[];
  supermarkets: Supermarket[];
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, supermarkets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSupermarket, setFilterSupermarket] = useState('all');
  const [sortBy, setSortBy] = useState('price-high');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Build non-empty category list
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(c => !!c && String(c).trim() !== '')))] as string[];

  // Low stock count for alert banner
  const lowStockCount = products.filter(p => {
    const threshold = typeof p.minStockLevel === 'number' ? p.minStockLevel : DEFAULT_REORDER_LEVEL;
    return typeof p.quantity === 'number' && p.quantity <= threshold;
  }).length;

  // Resolve a supermarket display name from either an ID or a name value
  const getSupermarketName = (supermarketRef: string) => {
    if (!supermarketRef) return 'Unknown Store';
    // Try by ID first
    const byId = supermarkets.find(s => String(s.id) === String(supermarketRef));
    if (byId) return byId.name;
    // Then try by name (handles older data where supermarketId stored the name)
    const byName = supermarkets.find(
      s => String(s.name).trim().toLowerCase() === String(supermarketRef).trim().toLowerCase()
    );
    if (byName) return byName.name;
    // Fallback to whatever was stored so at least something is shown
    return supermarketRef || 'Unknown Store';
  };

  const selectedStore = supermarkets.find(s => String(s.id) === String(filterSupermarket));

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           String(product.barcode ?? '').includes(searchTerm);
      const matchesCategory = filterCategory === 'all' || String(product.category).trim() === filterCategory;

      // Simplified supermarket filtering - only show products from selected supermarket
      const matchesSupermarket = filterSupermarket === 'all' || 
        String(product.supermarketId) === String(filterSupermarket);

      const threshold = typeof product.minStockLevel === 'number' ? product.minStockLevel : DEFAULT_REORDER_LEVEL;
      const isLowStock = typeof product.quantity === 'number' && product.quantity <= threshold;
      const matchesLowStock = !lowStockOnly || isLowStock;

      return matchesSearch && matchesCategory && matchesSupermarket && matchesLowStock && (product.halalCertified ?? true);
    })
    .sort((a, b) => {
      const numA = (val: any) => Number(val ?? 0);
      const priceA = numA((a as any).sellingPrice ?? a.price);
      const priceB = numA((b as any).sellingPrice ?? b.price);
      const parseExpiry = (d: string) => {
        const t = new Date(d).getTime();
        return Number.isNaN(t) ? Infinity : t;
      };

      switch (sortBy) {
        case 'price-low': return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'expiry': return parseExpiry(a.expiryDate) - parseExpiry(b.expiryDate);
        case 'quantity': return numA(a.quantity) - numA(b.quantity);
        default: return a.name.localeCompare(b.name);
      }
    });



  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (expiry <= now) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-100' };
    if (expiry <= thirtyDaysFromNow) return { status: 'expiring', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { status: 'fresh', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">📦 Product Catalog</h2>
            <p className="text-gray-600">Browse all Halal-certified products from verified supermarkets</p>
          </div>
          <div className="bg-rose-100 p-3 rounded-xl">
            <Package className="w-8 h-8 text-rose-600" />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
          >
            <option value="all">All Categories</option>
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterSupermarket}
            onChange={(e) => setFilterSupermarket(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
          >
            <option value="all">All Supermarkets</option>
            {supermarkets.map(supermarket => (
              <option key={supermarket.id} value={supermarket.id}>{supermarket.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="expiry">Expiry Date</option>
            <option value="quantity">Stock Quantity</option>
          </select>

          {/* Low stock filter */}
          <label className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white/80">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Low stock only</span>
          </label>
        </div>
      </div>

      {/* Product Grid */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {filteredProducts.length} Products Found
          </h3>
          <div className="text-sm text-gray-600">
            Showing Halal-certified products only
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const expiryStatus = getExpiryStatus(product.expiryDate);
              
              return (
                <div key={product.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-rose-400" />
                    )}
                  </div>

                  <div className="p-4">
                    {/* Halal Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-emerald-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs font-medium">Halal Certified</span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${expiryStatus.bg} ${expiryStatus.color}`}>
                        {expiryStatus.status}
                      </div>
                      {(() => {
                        const threshold = typeof product.minStockLevel === 'number' ? product.minStockLevel : DEFAULT_REORDER_LEVEL;
                        const lowStock = typeof product.quantity === 'number' && product.quantity <= threshold;
                        return lowStock ? (
                          <div className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                            Low stock
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Product Info */}
                    <h4 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    <p className="text-xs text-gray-500 mb-3">{product.category} • {product.weight}</p>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-xl font-bold text-gray-800">${product.price}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Stock: <span className="font-semibold">{product.quantity}</span>
                      </div>
                    </div>

                    {/* Supermarket Info */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center text-sm text-blue-800 mb-1">
                        <span className="font-semibold">{getSupermarketName(product.supermarketId)}</span>
                      </div>
                      {(() => {
                        const supermarket = supermarkets.find(s => 
                          String(s.id) === String(product.supermarketId) ||
                          String(s.name).trim().toLowerCase() === String(product.supermarketId).trim().toLowerCase()
                        );
                        return supermarket ? (
                          <div className="text-xs text-blue-600">
                            <div>{supermarket.address}</div>
                            {supermarket.phone && <div>📞 {supermarket.phone}</div>}
                            {supermarket.isSubStore && (
                              <div className="mt-1">
                                <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                                  Sub-Store
                                </span>
                              </div>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Expiry Date */}
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Expires: {new Date(product.expiryDate).toLocaleDateString()}</span>
                    </div>

                    {/* Certification Body */}
                    {product.halalCertificationBody && (
                      <div className="text-xs text-gray-500 mb-3">
                        Certified by: {product.halalCertificationBody}
                      </div>
                    )}

                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                    )}

                    {/* Action Button */}
                    <button className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;