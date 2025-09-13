import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import { useProducts, useCategories, useSuppliers, useSupermarkets } from './hooks/useApi';
import { ProductService, CategoryService, SupplierService, SupermarketService } from './services/apiService';
import Auth from './features/auth';
import Dashboard from './components/Dashboard';
import ProductScanner from './components/ProductScanner';
import ProductForm from './components/ProductForm';
import ProductCatalog from './components/ProductCatalog';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import SubStoreManagement from './components/SubStoreManagement';
import MyStores from './components/MyStores';
import POSSync from './components/POSSync';
import DashboardGraphs from './components/DashboardGraphs';
import BarcodeTicketManager from './components/BarcodeTicketManager';
import { STORAGE_KEYS } from './constants/storageKeys';
import Suppliers from './components/Suppliers';
import Orders from './components/Orders';
import ClearancePage from './components/ClearancePage';

import type { Product, User } from './types/Product';

// Main App Content Component
const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'scanner' | 'add-product' | 'stores' | 'catalog' | 'analytics' | 'pos-sync' | 'settings' | 'barcode-demo' | 'suppliers' | 'orders' | 'clearance' | 'login' | 'signup'>('login');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedForBT, setSelectedForBT] = useState<string[]>([]);

  // API data hooks
  const { data: products, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const { data: categories } = useCategories();
  const { data: suppliers } = useSuppliers();
  const { data: supermarkets, refetch: refetchSupermarkets } = useSupermarkets();

  // Handle authentication
  const handleLogin = async (email: string, password: string, supermarketName?: string) => {
    try {
      await login(email, password);
      setCurrentView('dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      // Surface meaningful error back to Auth component
      throw new Error(error?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, supermarketName?: string, phone?: string, address?: string) => {
    try {
      // Validate required fields
      if (!supermarketName?.trim()) {
        throw new Error('Supermarket name is required');
      }

      const userData = {
        email,
        password,
        password_confirm: password, // Add password confirmation field
        first_name: firstName || email.split('@')[0],
        last_name: lastName || '',
        phone: phone || '',
        address: address || '',
        company_name: supermarketName,
        supermarket_name: supermarketName
      };
      
      console.log('Registering user:', userData);
      await register(userData);
      
      // After successful registration, login to get token
      console.log('Logging in after registration...');
      await login(email, password);
      
      // After login, refresh supermarkets (auto-created on backend during registration)
      try {
        await refetchSupermarkets();
      } catch (e) {
        console.warn('Failed to refresh supermarkets after signup:', e);
      }
      
      setCurrentView('dashboard');
    } catch (error: any) {
      console.error('Signup failed:', error);
      // Bubble backend validation like password too short, email taken
      throw new Error(error?.message || 'Registration failed. Please check your details.');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentView('login');
  };

  // Product management
  const handleProductSave = async (productData: Product | Omit<Product, 'id'>) => {
    try {
      console.log('Saving product data:', productData);
      
      // Transform the data to match backend expectations
      const transformedData = await transformProductDataForAPI(productData);
      console.log('Transformed data for API:', transformedData);
      
      if ('id' in productData) {
        // Update existing product
        await ProductService.updateProduct(productData.id, transformedData);
        alert('Product updated successfully!');
      } else {
        // Create new product
        await ProductService.createProduct(transformedData);
        alert('Product created successfully!');
      }
      
      // Refresh products list
      refetchProducts();
      setCurrentView('dashboard');
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to save product. ';
      if (error instanceof Error) {
        if (error.message.includes('category')) {
          errorMessage += 'There was an issue with the category.';
        } else if (error.message.includes('supplier')) {
          errorMessage += 'There was an issue with the supplier.';
        } else if (error.message.includes('supermarket')) {
          errorMessage += 'No supermarket is available. Please go to Settings to create a supermarket, or try logging out and registering again.';
        } else if (error.message.includes('required')) {
          errorMessage += 'Please fill in all required fields.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please check your input and try again.';
      }
      
      alert(errorMessage);
      throw error;
    }
  };

  // Helper function to transform product data for API
  const transformProductDataForAPI = async (productData: Product | Omit<Product, 'id'>) => {
    let categoryId = null;
    let supplierId = null;
    
    // Debug logging to identify the issue
    console.log("DEBUG categories:", categories);
    console.log("DEBUG categories type:", typeof categories);
    console.log("DEBUG categories is array:", Array.isArray(categories));
    console.log("DEBUG suppliers:", suppliers);
    console.log("DEBUG suppliers type:", typeof suppliers);
    console.log("DEBUG suppliers is array:", Array.isArray(suppliers));
    
    // Validate category by name and map to ID (auto-create if missing)
    if (productData.category) {
      const categoriesArray = Array.isArray(categories) ? categories : Object.values(categories || {});
      const normalize = (v: any) => String(v || '').trim().toLowerCase();
      const getCatName = (c: any) => (typeof c === 'string' ? c : c?.name);
      const existingCategory = categoriesArray.find((cat: any) => normalize(getCatName(cat)) === normalize(productData.category));
      if (existingCategory?.id) {
        categoryId = existingCategory.id;
      } else {
        try {
          const created = await CategoryService.createCategory({ name: productData.category });
          categoryId = created?.id ?? created?.pk ?? created?.uuid ?? null;
        } catch (e) {
          throw new Error(`Category not found and could not be created: ${productData.category}`);
        }
      }
    }
    
    // Validate supplier by name and map to ID (auto-create if missing)
    if (productData.supplier) {
      const suppliersArray = Array.isArray(suppliers) ? suppliers : Object.values(suppliers || {});
      const normalize = (v: any) => String(v || '').trim().toLowerCase();
      const getSupName = (s: any) => (typeof s === 'string' ? s : s?.name);
      const existingSupplier = suppliersArray.find((sup: any) => normalize(getSupName(sup)) === normalize(productData.supplier));
      if (existingSupplier?.id) {
        supplierId = existingSupplier.id;
      } else {
        try {
          const created = await SupplierService.createSupplier({ name: productData.supplier });
          supplierId = created?.id ?? created?.pk ?? created?.uuid ?? null;
        } catch (e) {
          throw new Error(`Supplier not found and could not be created: ${productData.supplier}`);
        }
      }
    }
    
    // Determine supermarket ID:
    // 1) Use explicitly provided productData.supermarketId (if any)
    // 2) Use persisted selection from localStorage (STORAGE_KEYS.CURRENT_SUPERMARKET_ID)
    // 3) Fallback to the first available from fetched list
    const supermarketsArray = Array.isArray(supermarkets) ? supermarkets : Object.values(supermarkets || {});
    let supermarketId =
      // @ts-ignore - productData may be Omit<Product, 'id'>
      (productData as any).supermarketId ||
      (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CURRENT_SUPERMARKET_ID) : null) ||
      supermarketsArray?.[0]?.id || null;

    // Log all supermarkets to aid debugging
    try {
      console.log('All supermarkets:', supermarketsArray.map((s: any) => ({ id: s.id, name: s.name })));
    } catch {}

    console.log('Chosen supermarketId:', supermarketId);
    
    // If no supermarket exists, try to fetch fresh data first, then create one if still none
    if (!supermarketId) {
      console.log("No supermarket found in cached data, fetching fresh data...");
      
      try {
        // Try to fetch fresh supermarkets data directly
        const freshSupermarkets = await SupermarketService.getSupermarkets();
        const freshSupermarketsArray = Array.isArray(freshSupermarkets) ? freshSupermarkets : freshSupermarkets.results || [];
        
        console.log("Fresh supermarkets data:", freshSupermarketsArray);
        
        if (freshSupermarketsArray.length > 0) {
          supermarketId = freshSupermarketsArray[0].id;
          console.log("Found supermarket in fresh data:", supermarketId);
        } else {
          console.log("No supermarket found even in fresh data, creating default supermarket...");
          
          const defaultSupermarketData = {
            name: (user as any)?.company_name || `${user?.first_name || 'My'} Supermarket` || 'Default Supermarket',
            description: 'Default supermarket created automatically',
            address: (user as any)?.address || 'Address not provided',
            phone: (user as any)?.phone || 'Phone not provided',
            email: user?.email || 'admin@example.com',
            is_active: true
          };
          
          const newSupermarket = await SupermarketService.createSupermarketWithDefaults(defaultSupermarketData);
          supermarketId = newSupermarket.id;
          
          console.log("Default supermarket created:", newSupermarket);
        }
        
        // Refresh supermarkets data in the hook
        await refetchSupermarkets();
        
      } catch (error) {
        console.error('Failed to fetch or create supermarket:', error);
        throw new Error('Unable to create or find a supermarket. Please contact support or try again later.');
      }
    }
    
    // Transform the data structure
    const apiData = {
      name: productData.name,
      description: productData.description || '',
      category: categoryId,
      supplier: supplierId,
      supermarket: supermarketId,
      brand: productData.brand || '',
      barcode: productData.barcode,
      cost_price: productData.costPrice || productData.price || 0,
      selling_price: productData.sellingPrice || productData.price || 0,
      price: productData.price || productData.sellingPrice || 0,
      quantity: productData.quantity,
      min_stock_level: productData.minStockLevel || 5,
      weight: productData.weight || '',
      origin: productData.origin || '',
      expiry_date: productData.expiryDate,
      location: productData.location || '',
      // halal_certified: productData.halalCertified || false,
      // halal_certification_body: productData.halalCertificationBody || '',
      image_url: productData.imageUrl || '',
      is_active: true
    };

    return apiData;
  };

  const handleProductDelete = async (productId: string) => {
    try {
      await ProductService.deleteProduct(productId);
      refetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  // Navigation items
  const navigationItems = isAuthenticated ? [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'catalog', label: 'Products', icon: '📦' },
    { id: 'add-product', label: 'Add Products', icon: '➕' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'clearance', label: 'Clearance', icon: '🏷️' },
    { id: 'barcode-demo', label: 'Barcodes & Tickets', icon: '🏷️' },
    { id: 'scanner', label: 'Scanner', icon: '📱' },
    { id: 'stores', label: 'My Stores', icon: '🏪' },
    { id: 'pos-sync', label: 'POS Sync', icon: '🔄' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'suppliers', label: 'Suppliers', icon: '🤝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ] : [];
  
  // Small helper to allow in-app links to switch tabs
  const navigate = (viewId: typeof currentView) => setCurrentView(viewId);

  // Determine selected supermarket: saved selection -> first available
  const savedSupermarketId = (typeof window !== 'undefined') ? localStorage.getItem(STORAGE_KEYS.CURRENT_SUPERMARKET_ID) : null;
  const selectedSupermarket = (supermarkets || []).find((s: any) => String(s.id) === String(savedSupermarketId)) || (supermarkets && supermarkets[0]) || null;
  
  // Debug supermarket data
  console.log('🏪 Supermarkets data:', supermarkets);
  console.log('🏪 Selected supermarket:', selectedSupermarket);
  console.log('🏪 Supermarket ID being passed:', selectedSupermarket?.id?.toString() || '(none)');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  🕌  Inventory Management System
                </h1>
                <p className="text-gray-600">
                  {isAuthenticated 
                    ? 'Managing Halal-certified products with confidence' 
                    : 'Multi-vendor platform for managing Halal-certified products'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {isAuthenticated && user ? (
                  <>
                    {selectedSupermarket && (
                      <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-medium text-sm">
                        {selectedSupermarket.name}
                      </span>
                    )}
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                      <span className="text-sm font-medium">Welcome, {user.first_name || user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentView('login')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        currentView === 'login'
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setCurrentView('signup')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        currentView === 'signup'
                          ? 'bg-rose-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        {isAuthenticated && (
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
        )}

        {/* Main Content */}
        <main>
          {/* Authentication Views */}
          {currentView === 'login' && (
            <Auth 
              mode="login" 
              onAuthSuccess={handleLogin}
              showSignupOption={() => setCurrentView('signup')}
            />
          )}
          {currentView === 'signup' && (
            <Auth 
              mode="signup" 
              onAuthSuccess={handleSignup}
              showLoginOption={() => setCurrentView('login')}
            />
          )}

          {/* Authenticated Views */}
          {isAuthenticated && (
            <>
              {currentView === 'dashboard' && (
                <div className="space-y-8">
                  {products && (
                    <>
                      <DashboardGraphs 
                        products={products} 
                        supermarkets={supermarkets || []}
                      />
                      <Dashboard 
                        products={products} 
                        supermarkets={supermarkets || []}
                        selectedSupermarketId={selectedSupermarket?.id?.toString() || ''}
                        onEditProduct={(product) => {
                          setEditingProduct(product);
                          setCurrentView('add-product');
                        }}
                        onDeleteProduct={handleProductDelete}
                      />
                    </>
                  )}
                  {productsLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  )}
                </div>
              )}

              {currentView === 'scanner' && products && (
                <ProductScanner products={products} />
              )}

              {currentView === 'add-product' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Add Products</h2>
                  <p className="text-gray-600 mb-6">
                    Easily add new products to your inventory using manual entry, Excel upload, or image scan.
                  </p>
                  <ProductForm 
                    onSave={handleProductSave}
                    onBulkSave={async (products) => {
                      // Handle bulk save
                      for (const product of products) {
                        await ProductService.createProduct(product);
                      }
                      refetchProducts();
                    }}
                    initialProduct={editingProduct}
                    supermarketId={selectedSupermarket?.id?.toString() || ''}
                    userStores={supermarkets || []}
                    supplierOptions={(suppliers || []).map((s: any) => ({ id: s.id, name: s.name }))}
                    onCancel={() => {
                      setCurrentView('dashboard');
                      setEditingProduct(null);
                    }}
                  />
                </div>
              )}

              {currentView === 'catalog' && products && (
                <ProductCatalog 
                  products={products}
                  supermarkets={supermarkets || []}
                />
              )}

              {currentView === 'barcode-demo' && products && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
                  <BarcodeTicketManager
                    products={products}
                    selectedProducts={selectedForBT}
                    onSelectionChange={setSelectedForBT}
                  />
                </div>
              )}

              {currentView === 'stores' && user && (
                <MyStores 
                  stores={supermarkets || []}
                  onNavigateToStore={(storeId: string) => {
                    try {
                      if (typeof window !== 'undefined') {
                        localStorage.setItem(STORAGE_KEYS.CURRENT_SUPERMARKET_ID, String(storeId));
                      }
                      setCurrentView('dashboard');
                    } catch {}
                  }}
                />
              )}

              {currentView === 'pos-sync' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">POS Synchronization</h2>
                  <p className="text-gray-600 mb-6">
                    Connect your inventory with your Point-of-Sale (POS) system.
                  </p>
                  <POSSync 
                    supermarket={selectedSupermarket as any}
                    onUpdatePOS={(storeId, posConfig) => {
                      // Handle POS update
                    }}
                  />
                </div>
              )}

              {currentView === 'analytics' && (
                <Analytics 
                  products={products || []}
                  supermarkets={supermarkets || []}
                />
              )}

              {currentView === 'suppliers' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
                  <Suppliers />
                </div>
              )}

              {currentView === 'orders' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
                  <Orders />
                </div>
              )}

              {currentView === 'clearance' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
                  <ClearancePage />
                </div>
              )}

              {currentView === 'settings' && (
                <Settings />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Main App Component with Auth Provider
const AppWithAPI: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default AppWithAPI;