import React, { useState } from 'react';
import { Search, Package, MapPin, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';

interface ProductCatalogProps {
  products: Product[];
  supermarkets: Supermarket[];
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, supermarkets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSupermarket, setFilterSupermarket] = useState('all');
  const [sortBy, setSortBy] = useState('price-high');

  // Build non-empty category list
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(c => !!c && String(c).trim() !== '')))] as string[];

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

      // Accept either ID or Store Name saved in product.supermarketId
      const productStoreRef = String(product.supermarketId ?? '').trim();
      const matchesSupermarket = filterSupermarket === 'all' || (
        selectedStore && (
          // Direct ID match
          productStoreRef === String(selectedStore.id) ||
          // Direct name match (if product stored the name)
          productStoreRef.toLowerCase() === String(selectedStore.name).trim().toLowerCase() ||
          // Name resolved from ID matches selected store name
          getSupermarketName(productStoreRef).toLowerCase() === String(selectedStore.name).trim().toLowerCase()
        )
      );

      return matchesSearch && matchesCategory && matchesSupermarket && (product.halalCertified ?? true);
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

  // Debug: how many match selected store
  try {
    if (filterSupermarket !== 'all') {
      const idMatches = products.filter(p => String(p.supermarketId) === String(filterSupermarket)).length;
      // eslint-disable-next-line no-console
      console.log('Catalog debug — selected store:', filterSupermarket, 'ID matches:', idMatches, 'after filter:', filteredProducts.length);
    }
  } catch {}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{getSupermarketName(product.supermarketId)}</span>
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