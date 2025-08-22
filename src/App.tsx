import Auth from './features/auth';
import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProductScanner from './components/ProductScanner';
import ProductForm from './components/ProductForm';
import SupermarketDashboard from './components/SupermarketDashboard';
import ProductCatalog from './components/ProductCatalog';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import SubStoreManagement from './components/SubStoreManagement';
import POSSync from './components/POSSync';
import DashboardGraphs from './components/DashboardGraphs';
import BarcodeTicketManager from './components/BarcodeTicketManager';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useProducts, useCategories, useSuppliers, useSupermarkets } from './hooks/useApi';
import { ProductService, CategoryService, SupplierService, SupermarketService, AuthService } from './services/apiService';
import type { Product, Supermarket, User } from './types/Product';


function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'scanner' | 'add-product' | 'stores' | 'catalog' | 'analytics' | 'pos-sync' | 'settings' | 'barcode-demo' | 'login' | 'signup'>('login');
  const [products, setProducts] = useState<Product[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedForBT, setSelectedForBT] = useState<string[]>([]);

  // Authentication
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await AuthService.login(email, password);
      
      if (response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: `${response.user.first_name} ${response.user.last_name}`.trim() || response.user.email.split('@')[0],
          registrationDate: response.user.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          isVerified: response.user.is_verified || false,
          subscription: {
            plan: response.user.subscription_plan?.toLowerCase() || 'free',
            expiryDate: response.user.subscription_end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        };

        setCurrentUser(user);
        setIsAuthenticated(true);
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, supermarketName?: string, phone?: string, address?: string) => {
    try {
      const registrationData = {
        email,
        password,
        password_confirm: password,
        first_name: firstName,
        last_name: lastName,
        phone: phone || '',
        address: address || '',
        company_name: supermarketName || '',
        supermarket_name: supermarketName || ''
      };

      const response = await AuthService.register(registrationData);
      
      if (response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: `${response.user.first_name} ${response.user.last_name}`.trim() || response.user.email.split('@')[0],
          registrationDate: response.user.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          isVerified: response.user.is_verified || false,
          subscription: {
            plan: response.user.subscription_plan?.toLowerCase() || 'free',
            expiryDate: response.user.subscription_end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        };

        setCurrentUser(user);
        setIsAuthenticated(true);

        // If supermarket name provided, create a main store via API
        if (supermarketName) {
          try {
            console.log('Creating main supermarket during signup:', supermarketName);
            
            const createdSupermarket = await SupermarketService.createSupermarketWithDefaults({
              name: supermarketName,
              address: 'Main Location',
              phone: '+1-555-0100',
              email: email,
              description: `${supermarketName} - Main Store`
            });
            
            console.log('Main supermarket created during signup:', createdSupermarket);
            
            const mainStore: Supermarket = {
              id: createdSupermarket.id,
              name: createdSupermarket.name,
              address: createdSupermarket.address,
              phone: createdSupermarket.phone,
              email: createdSupermarket.email,
              description: createdSupermarket.description,
              registrationDate: createdSupermarket.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
              isVerified: createdSupermarket.is_verified || false,
              ownerId: user.id,
              isSubStore: false,
              posSystem: {
                enabled: false,
                type: 'none',
                syncEnabled: false
              }
            };
            setSupermarkets([mainStore]);
          } catch (error) {
            console.error('Failed to create main supermarket during signup:', error);
            // Don't fail the entire signup process, just log the error
            console.log('Signup completed but supermarket creation failed. User can create it later.');
          }
        }

        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setProducts([]);
      setSupermarkets([]);
      setCurrentView('login');
    }
  };

  // Product Management
  const addProduct = (product: Omit<Product, 'id'>) => {
    const primaryId = primaryStore ? primaryStore.id : supermarkets[0]?.id || 'default';
    const newProduct = {
      ...product,
      // Normalize supermarketId to a string ID
      supermarketId: String((product as any).supermarketId || (product as any).supermarket || primaryId),
      // Ensure price available (prefer sellingPrice)
      price: (product as any).sellingPrice ?? product.price ?? 0,
      id: 'product-' + Date.now()
    } as Product;
    setProducts(prev => [...prev, newProduct]);
  };

  const addBulkProducts = (products: Omit<Product, 'id'>[]) => {
    const newProducts = products.map(product => ({
      ...product,
      // Ensure required display fields are present
      category: product.category || (typeof (product as any).category_name === 'string' ? (product as any).category_name : ''),
      supplier: product.supplier || (typeof (product as any).supplier_name === 'string' ? (product as any).supplier_name : ''),
      supermarketId: product.supermarketId || (typeof (product as any).supermarket === 'string' ? (product as any).supermarket : 'default'),
      price: (product as any).sellingPrice ?? product.price ?? 0,
      id: 'product-' + Date.now() + '-' + Math.random()
    }));
    setProducts(prev => [...prev, ...newProducts]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleProductSave = (product: Product | Omit<Product, 'id'>) => {
    if ('id' in product) {
      updateProduct(product);
    } else {
      addProduct(product);
    }
    setCurrentView('dashboard');
    setEditingProduct(null);
  };

  // Store Management
  const addSupermarket = async (supermarket: Omit<Supermarket, 'id'>) => {
    try {
      console.log('Creating supermarket via API:', supermarket);
      
      // Call the actual API to create supermarket
      const createdSupermarket = await SupermarketService.createSupermarketWithDefaults({
        name: supermarket.name,
        address: supermarket.address,
        phone: supermarket.phone,
        email: supermarket.email,
        description: supermarket.description
      });
      
      console.log('Supermarket created successfully:', createdSupermarket);
      
      // Update local state with the API response
      const newSupermarket = {
        id: createdSupermarket.id,
        name: createdSupermarket.name,
        address: createdSupermarket.address,
        phone: createdSupermarket.phone,
        email: createdSupermarket.email,
        description: createdSupermarket.description,
        registrationDate: createdSupermarket.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        isVerified: createdSupermarket.is_verified || false,
        ownerId: currentUser?.id || '',
        isSubStore: supermarket.isSubStore || false,
        posSystem: {
          enabled: false,
          type: 'none' as const,
          syncEnabled: false
        }
      } as const;
      
      setSupermarkets((prev) => [...prev, newSupermarket as any]);
      alert('Supermarket created successfully!');
    } catch (error) {
      console.error('Failed to create supermarket:', error);
      alert(`Failed to create supermarket: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const updateSupermarket = (updatedSupermarket: Supermarket) => {
    setSupermarkets(prev => prev.map(s => s.id === updatedSupermarket.id ? updatedSupermarket : s));
  };

  const deleteSupermarket = (id: string) => {
    setSupermarkets(prev => prev.filter(s => s.id !== id));
    // Also remove products from that store
    setProducts(prev => prev.filter(p => p.supermarketId !== id));
  };

  const updatePOSConfig = (storeId: string, posConfig: Supermarket['posSystem']) => {
    setSupermarkets(prev => prev.map(store => 
      store.id === storeId 
        ? { ...store, posSystem: posConfig }
        : store
    ));
  };

  // Bulk product actions between stores
  const handleBulkProductAction = (action: 'copy' | 'move', productIds: string[], targetStoreId: string) => {
    const sourceProducts = products.filter(p => productIds.includes(p.id));
    
    if (action === 'copy') {
      const copiedProducts = sourceProducts.map(product => ({
        ...product,
        id: 'product-' + Date.now() + '-' + Math.random(),
        supermarketId: targetStoreId
      }));
      setProducts(prev => [...prev, ...copiedProducts]);
    } else if (action === 'move') {
      setProducts(prev => prev.map(product => 
        productIds.includes(product.id)
          ? { ...product, supermarketId: targetStoreId }
          : product
      ));
    }
  };

  const navigationItems = isAuthenticated ? [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'catalog', label: 'Products', icon: '📦' },
    { id: 'add-product', label: 'Add Products', icon: '➕' },
    { id: 'barcode-demo', label: 'Barcodes & Tickets', icon: '🏷️' },
    { id: 'scanner', label: 'Scanner', icon: '📱' },
    { id: 'stores', label: 'My Stores', icon: '🏪' },
    { id: 'pos-sync', label: 'POS Sync', icon: '🔄' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ] : [
    { id: 'login', label: 'Login', icon: '🔑' },
    { id: 'signup', label: 'Sign Up', icon: '📝' }
  ];

  // Get user's primary store
  const primaryStore = supermarkets.find(s => !s.isSubStore && s.ownerId === currentUser?.id) || supermarkets[0];

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
                  {isAuthenticated 
                    ? 'Managing Halal-certified products with confidence' 
                    : 'Multi-vendor platform for managing Halal-certified products'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {isAuthenticated && currentUser ? (
                  <>
                    {primaryStore && (
                      <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-medium text-sm">
                        {primaryStore.name}
                      </span>
                    )}
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                      <span className="text-sm font-medium">Welcome, {currentUser.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <span className="px-4 py-2 bg-rose-100 text-rose-800 rounded-lg font-medium text-sm">
                    Please login to access your inventory
                  </span>
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

        <main>
          {/* Authentication Views */}
          {currentView === 'login' && (
            <Auth 
              mode="login" 
              onAuthSuccess={(email, password) => handleLogin(email, password)}
              showSignupOption={() => setCurrentView('signup')}
            />
          )}
          {currentView === 'signup' && (
            <Auth 
              mode="signup" 
              onAuthSuccess={(email, password, firstName, lastName, supermarketName, phone, address) => handleSignup(email, password, firstName, lastName, supermarketName, phone, address)}
              showLoginOption={() => setCurrentView('login')}
            />
          )}

          {/* Authenticated Views */}
          {isAuthenticated && (
            <>
              {currentView === 'dashboard' && (
                <div className="space-y-8">
                  <DashboardGraphs 
                    products={products} 
                    supermarkets={supermarkets}
                  />
                  <Dashboard 
                    products={products} 
                    onEditProduct={(product) => {
                      setEditingProduct(product);
                      setCurrentView('add-product');
                    }}
                    onDeleteProduct={deleteProduct}
                  />
                </div>
              )}

              {currentView === 'scanner' && (
                <ProductScanner products={products} />
              )}

              {currentView === 'add-product' && isAuthenticated && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Add Products</h2>
                  <p className="text-gray-600 mb-6">Easily add new products to your inventory using manual entry, Excel upload, or image scan. Choose the method that best fits your workflow.</p>
                  <div className="mb-6 p-4 bg-rose-50 rounded-xl border border-rose-200">
                    <h3 className="font-semibold text-rose-800 mb-2">How to Add Products:</h3>
                    <ul className="list-disc ml-6 text-rose-700 text-sm space-y-1">
                      <li><strong>Manual Entry:</strong> Add products one by one with full details.</li>
                      <li><strong>Excel Import:</strong> Upload an Excel file to add multiple products at once.</li>
                      <li><strong>Image Scan:</strong> Use your camera to scan product labels and auto-fill details.</li>
                    </ul>
                  </div>
                  <ProductForm 
                    onSave={handleProductSave}
                    onBulkSave={addBulkProducts}
                    initialProduct={editingProduct}
                    supermarketId={primaryStore ? primaryStore.id : supermarkets[0]?.id || 'default'}
                    onCancel={() => {
                      setCurrentView('dashboard');
                      setEditingProduct(null);
                    }}
                  />
                </div>
              )}

              {currentView === 'catalog' && (
                <ProductCatalog 
                  products={products}
                  supermarkets={supermarkets}
                />
              )}

              {currentView === 'stores' && currentUser && (
                <SubStoreManagement 
                  supermarkets={supermarkets}
                  products={products}
                  currentUser={currentUser}
                  onAddSupermarket={addSupermarket}
                  onUpdateSupermarket={updateSupermarket}
                  onDeleteSupermarket={deleteSupermarket}
                  onBulkProductAction={handleBulkProductAction}
                />
              )}

              {currentView === 'pos-sync' && isAuthenticated && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">POS Synchronization</h2>
                  <p className="text-gray-600 mb-6">Connect your inventory with your Point-of-Sale (POS) system to keep stock, pricing, and product data in sync automatically. Supported integrations: Square, Shopify, and custom POS systems.</p>
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Why Use POS Sync?</h3>
                    <ul className="list-disc ml-6 text-blue-700 text-sm space-y-1">
                      <li>Automatically update inventory after sales</li>
                      <li>Reduce manual errors and save time</li>
                      <li>Sync product prices and details across platforms</li>
                      <li>Monitor sync status and resolve issues quickly</li>
                    </ul>
                  </div>
                  <POSSync 
                    supermarket={primaryStore ? primaryStore : supermarkets[0]}
                    onUpdatePOS={updatePOSConfig}
                  />
                </div>
              )}

              {currentView === 'barcode-demo' && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
                  <BarcodeTicketManager 
                    products={products}
                    selectedProducts={selectedForBT}
                    onSelectionChange={setSelectedForBT}
                  />
                </div>
              )}

              {currentView === 'analytics' && (
                <Analytics 
                  products={products}
                  supermarkets={supermarkets}
                />
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
}

export default App;