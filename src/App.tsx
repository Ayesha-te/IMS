import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ProductScanner from './components/ProductScanner';
import ProductForm from './components/ProductForm';
import SupermarketRegistration from './components/SupermarketRegistration';
import SupermarketDashboard from './components/SupermarketDashboard';
import ProductCatalog from './components/ProductCatalog';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import type { Product, Supermarket } from './types/Product';
import { mockProducts, mockSupermarkets } from './data/mockData';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'scanner' | 'add-product' | 'supermarket-registration' | 'supermarket-dashboard' | 'catalog' | 'analytics' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>(mockSupermarkets);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now().toString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleProductSave = (product: Product | Omit<Product, 'id'>) => {
    if ('id' in product) {
      // This is an existing product (editing)
      updateProduct(product);
    } else {
      // This is a new product
      addProduct(product);
    }
    // Return to dashboard after saving
    setCurrentView('dashboard');
    setEditingProduct(null);
  };

  const addSupermarket = (supermarket: Omit<Supermarket, 'id'>) => {
    const newSupermarket = {
      ...supermarket,
      id: Date.now().toString()
    };
    setSupermarkets(prev => [...prev, newSupermarket]);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'catalog', label: 'Product Catalog', icon: '📦' },
    { id: 'scanner', label: 'Scanner', icon: '📱' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'supermarket-dashboard', label: 'Supermarkets', icon: '🏪' },
    { id: 'add-product', label: 'Add Product', icon: '➕' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  🕌 Halal Inventory Management System
                </h1>
                <p className="text-gray-600">
                  Multi-vendor platform for managing Halal-certified products with confidence
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {setCurrentView('supermarket-registration'); setEditingProduct(null);}}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                >
                  Register Supermarket
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-4">
            <div className="flex flex-wrap gap-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as any);
                    setEditingProduct(null);
                  }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    currentView === item.id
                      ? 'bg-rose-500 text-white shadow-lg'
                      : 'bg-white/50 text-gray-700 hover:bg-white/80'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main>
          {currentView === 'dashboard' && (
            <Dashboard 
              products={products} 
              onEditProduct={(product) => {
                setEditingProduct(product);
                setCurrentView('add-product');
              }}
              onDeleteProduct={deleteProduct}
            />
          )}
          {currentView === 'scanner' && (
            <ProductScanner products={products} />
          )}
          {currentView === 'add-product' && (
            <ProductForm 
              onSave={handleProductSave}
              initialProduct={editingProduct}
              onCancel={() => {
                setCurrentView('dashboard');
                setEditingProduct(null);
              }}
            />
          )}
          {currentView === 'catalog' && (
            <ProductCatalog 
              products={products}
              supermarkets={supermarkets}
            />
          )}
          {currentView === 'analytics' && (
            <Analytics 
              products={products}
              supermarkets={supermarkets}
            />
          )}
          {currentView === 'supermarket-registration' && (
            <SupermarketRegistration 
              onSave={addSupermarket}
              onCancel={() => setCurrentView('dashboard')}
            />
          )}
          {currentView === 'supermarket-dashboard' && (
            <SupermarketDashboard 
              supermarkets={supermarkets}
              products={products}
            />
          )}
          {currentView === 'settings' && (
            <Settings />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;