/**
 * Multi-Store Setup Script
 * Run this script to set up sample data for testing multi-store functionality
 */

// Sample stores data
const sampleStores = [
  {
    id: 'store-main-001',
    name: 'Main Halal Market',
    isSubStore: false,
    location: '123 Main Street, City Center',
    phone: '+1-555-0101',
    email: 'main@halalmarket.com',
    manager: 'Ahmed Hassan',
    isActive: true,
    ownerId: 'user-001'
  },
  {
    id: 'store-branch-001',
    name: 'Downtown Branch',
    isSubStore: true,
    parentStoreId: 'store-main-001',
    location: '456 Downtown Ave, Business District',
    phone: '+1-555-0102',
    email: 'downtown@halalmarket.com',
    manager: 'Fatima Ali',
    isActive: true,
    ownerId: 'user-001'
  },
  {
    id: 'store-branch-002',
    name: 'Mall Location',
    isSubStore: true,
    parentStoreId: 'store-main-001',
    location: 'Shopping Mall, Level 2, Unit 205',
    phone: '+1-555-0103',
    email: 'mall@halalmarket.com',
    manager: 'Omar Khan',
    isActive: true,
    ownerId: 'user-001'
  },
  {
    id: 'store-branch-003',
    name: 'Airport Terminal',
    isSubStore: true,
    parentStoreId: 'store-main-001',
    location: 'International Airport, Terminal A',
    phone: '+1-555-0104',
    email: 'airport@halalmarket.com',
    manager: 'Aisha Rahman',
    isActive: true,
    ownerId: 'user-001'
  }
];

// Sample products distributed across stores
const sampleProducts = [
  // Main Store Products
  {
    id: 'prod-001',
    name: 'Halal Chicken Breast',
    category: 'Meat & Poultry',
    supplier: 'Halal Farms Co',
    brand: 'Pure Halal',
    barcode: '1234567890123',
    price: 12.99,
    costPrice: 8.50,
    sellingPrice: 12.99,
    quantity: 50,
    minStockLevel: 10,
    supermarketId: 'store-main-001',
    halalCertified: true,
    halalStatus: 'CERTIFIED',
    halalCertificationBody: 'JAKIM',
    expiryDate: '2024-12-31',
    location: 'Freezer A1'
  },
  {
    id: 'prod-002',
    name: 'Organic Basmati Rice',
    category: 'Grains & Rice',
    supplier: 'Organic Grains Ltd',
    brand: 'Nature\'s Best',
    barcode: '1234567890124',
    price: 8.99,
    costPrice: 5.50,
    sellingPrice: 8.99,
    quantity: 100,
    minStockLevel: 20,
    supermarketId: 'store-main-001',
    halalCertified: true,
    halalStatus: 'CERTIFIED',
    expiryDate: '2025-06-30',
    location: 'Aisle 3, Shelf B'
  },
  
  // Downtown Branch Products
  {
    id: 'prod-003',
    name: 'Halal Beef Steak',
    category: 'Meat & Poultry',
    supplier: 'Premium Halal Meats',
    brand: 'Gourmet Halal',
    barcode: '1234567890125',
    price: 18.99,
    costPrice: 12.00,
    sellingPrice: 18.99,
    quantity: 25,
    minStockLevel: 5,
    supermarketId: 'store-branch-001',
    halalCertified: true,
    halalStatus: 'CERTIFIED',
    halalCertificationBody: 'MUI',
    expiryDate: '2024-11-15',
    location: 'Freezer B2'
  },
  {
    id: 'prod-004',
    name: 'Fresh Dates',
    category: 'Fruits & Vegetables',
    supplier: 'Middle East Imports',
    brand: 'Desert Gold',
    barcode: '1234567890126',
    price: 6.99,
    costPrice: 4.00,
    sellingPrice: 6.99,
    quantity: 75,
    minStockLevel: 15,
    supermarketId: 'store-branch-001',
    halalCertified: true,
    halalStatus: 'CERTIFIED',
    expiryDate: '2024-10-30',
    location: 'Fresh Section A'
  },
  
  // Mall Location Products
  {
    id: 'prod-005',
    name: 'Halal Lamb Chops',
    category: 'Meat & Poultry',
    supplier: 'Mountain Halal Ranch',
    brand: 'Premium Cuts',
    barcode: '1234567890127',
    price: 24.99,
    costPrice: 16.00,
    sellingPrice: 24.99,
    quantity: 20,
    minStockLevel: 5,
    supermarketId: 'store-branch-002',
    halalCertified: true,
    halalStatus: 'CERTIFIED',
    halalCertificationBody: 'HFA',
    expiryDate: '2024-11-20',
    location: 'Premium Freezer'
  },
  {
    id: 'prod-006',
    name: 'Halal Cheese Selection',
    category: 'Dairy Products',
    supplier: 'Artisan Dairy Co',
    brand: 'Halal Delights',
    barcode: '1234567890128',
    price: 15.99,
    costPrice: 10.00,
    sellingPrice: 15.99,
    quantity: 30,
    minStockLevel: 8,
    supermarketId: 'store-branch-002',
    halalCertified: true,
    halalStatus: 'CERTIFIED',
    expiryDate: '2024-12-01',
    location: 'Dairy Cooler'
  },
  
  // Airport Terminal Products
  {
    id: 'prod-007',
    name: 'Travel Snack Pack',
    category: 'Snacks & Convenience',
    supplier: 'Travel Foods Inc',
    brand: 'On-The-Go Halal',
    barcode: '1234567890129',
    price: 4.99,
    costPrice: 2.50,
    sellingPrice: 4.99,
    quantity: 200,
    minStockLevel: 50,
    supermarketId: 'store-branch-003',
    halalCertified: true,
    halalStatus: 'CERTIFIED',
    expiryDate: '2025-03-15',
    location: 'Display Rack 1'
  },
  {
    id: 'prod-008',
    name: 'Halal Energy Drink',
    category: 'Beverages',
    supplier: 'Energy Plus Ltd',
    brand: 'Halal Boost',
    barcode: '1234567890130',
    price: 3.49,
    costPrice: 1.80,
    sellingPrice: 3.49,
    quantity: 150,
    minStockLevel: 30,
    supermarketId: 'store-branch-003',
    halalCertified: true,
    halalStatus: 'CERTIFIED',
    expiryDate: '2025-01-31',
    location: 'Beverage Cooler'
  }
];

// Categories
const categories = [
  'Meat & Poultry',
  'Grains & Rice',
  'Fruits & Vegetables',
  'Dairy Products',
  'Snacks & Convenience',
  'Beverages',
  'Spices & Seasonings',
  'Frozen Foods',
  'Bakery Items',
  'Personal Care'
];

// Suppliers
const suppliers = [
  'Halal Farms Co',
  'Organic Grains Ltd',
  'Premium Halal Meats',
  'Middle East Imports',
  'Mountain Halal Ranch',
  'Artisan Dairy Co',
  'Travel Foods Inc',
  'Energy Plus Ltd',
  'Spice Masters',
  'Fresh Bakery Co'
];

/**
 * Setup function to initialize multi-store data
 */
function setupMultiStoreData() {
  console.log('🏪 Setting up Multi-Store Sample Data...');
  
  // Store data in localStorage for demo purposes
  localStorage.setItem('multistore_stores', JSON.stringify(sampleStores));
  localStorage.setItem('multistore_products', JSON.stringify(sampleProducts));
  localStorage.setItem('multistore_categories', JSON.stringify(categories));
  localStorage.setItem('multistore_suppliers', JSON.stringify(suppliers));
  
  console.log('✅ Sample data setup complete!');
  console.log(`📊 Created ${sampleStores.length} stores`);
  console.log(`📦 Created ${sampleProducts.length} products`);
  console.log(`🏷️ Created ${categories.length} categories`);
  console.log(`🏭 Created ${suppliers.length} suppliers`);
  
  return {
    stores: sampleStores,
    products: sampleProducts,
    categories,
    suppliers
  };
}

/**
 * Load multi-store data from localStorage
 */
function loadMultiStoreData() {
  const stores = JSON.parse(localStorage.getItem('multistore_stores') || '[]');
  const products = JSON.parse(localStorage.getItem('multistore_products') || '[]');
  const categories = JSON.parse(localStorage.getItem('multistore_categories') || '[]');
  const suppliers = JSON.parse(localStorage.getItem('multistore_suppliers') || '[]');
  
  return { stores, products, categories, suppliers };
}

/**
 * Clear all multi-store data
 */
function clearMultiStoreData() {
  localStorage.removeItem('multistore_stores');
  localStorage.removeItem('multistore_products');
  localStorage.removeItem('multistore_categories');
  localStorage.removeItem('multistore_suppliers');
  console.log('🗑️ Multi-store data cleared');
}

/**
 * Generate additional sample products for testing
 */
function generateAdditionalProducts(count = 50) {
  const additionalProducts = [];
  const productNames = [
    'Halal Chicken Wings', 'Organic Quinoa', 'Fresh Spinach', 'Halal Yogurt',
    'Mixed Nuts', 'Green Tea', 'Whole Wheat Bread', 'Olive Oil',
    'Honey', 'Coconut Milk', 'Basmati Rice', 'Lentils',
    'Chickpeas', 'Tomato Sauce', 'Pasta', 'Spice Mix'
  ];
  
  for (let i = 0; i < count; i++) {
    const storeIndex = i % sampleStores.length;
    const nameIndex = i % productNames.length;
    const categoryIndex = i % categories.length;
    const supplierIndex = i % suppliers.length;
    
    additionalProducts.push({
      id: `prod-gen-${String(i + 1).padStart(3, '0')}`,
      name: `${productNames[nameIndex]} ${i + 1}`,
      category: categories[categoryIndex],
      supplier: suppliers[supplierIndex],
      brand: 'Generic Brand',
      barcode: `123456789${String(i + 1000).padStart(4, '0')}`,
      price: Math.round((Math.random() * 20 + 5) * 100) / 100,
      costPrice: Math.round((Math.random() * 10 + 2) * 100) / 100,
      quantity: Math.floor(Math.random() * 100) + 10,
      minStockLevel: Math.floor(Math.random() * 10) + 5,
      supermarketId: sampleStores[storeIndex].id,
      halalCertified: Math.random() > 0.3,
      halalStatus: Math.random() > 0.3 ? 'CERTIFIED' : 'NOT_CERTIFIED',
      expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: `Aisle ${Math.floor(Math.random() * 10) + 1}`
    });
  }
  
  return additionalProducts;
}

// Export functions for use in the application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setupMultiStoreData,
    loadMultiStoreData,
    clearMultiStoreData,
    generateAdditionalProducts,
    sampleStores,
    sampleProducts,
    categories,
    suppliers
  };
}

// Auto-setup when script is loaded in browser
if (typeof window !== 'undefined') {
  window.MultiStoreSetup = {
    setup: setupMultiStoreData,
    load: loadMultiStoreData,
    clear: clearMultiStoreData,
    generateMore: generateAdditionalProducts
  };
  
  console.log('🚀 Multi-Store Setup Script Loaded!');
  console.log('Run MultiStoreSetup.setup() to initialize sample data');
}