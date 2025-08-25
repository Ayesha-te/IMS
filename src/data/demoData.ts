/**
 * Demo data for categories and suppliers
 * Used as fallback when API data is not available
 */

export const demoCategories = [
  'Electronics',
  'Clothing & Fashion',
  'Food & Beverages',
  'Health & Beauty',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games',
  'Automotive',
  'Office Supplies',
  'Pet Supplies',
  'Baby & Kids',
  'Jewelry & Accessories',
  'Tools & Hardware',
  'Arts & Crafts',
  'Musical Instruments',
  'Travel & Luggage',
  'Grocery',
  'Pharmacy',
  'Bakery',
  'Dairy Products',
  'Frozen Foods',
  'Snacks & Confectionery',
  'Beverages',
  'Personal Care',
  'Household Items',
  'Cleaning Supplies',
  'Stationery',
  'Mobile & Accessories',
  'Computer & IT'
];

export const demoSuppliers = [
  'Global Electronics Ltd',
  'Fashion Forward Co',
  'Fresh Foods Distributors',
  'Beauty Supply Inc',
  'Home Essentials Ltd',
  'Sports Gear Pro',
  'Book World Publishers',
  'Toy Kingdom Ltd',
  'Auto Parts Express',
  'Office Solutions Inc',
  'Pet Care Supplies',
  'Baby Needs Co',
  'Jewelry Crafters Ltd',
  'Tool Masters Inc',
  'Creative Arts Supply',
  'Music Store Wholesale',
  'Travel Gear Ltd',
  'Local Grocery Wholesale',
  'Pharma Distributors',
  'Bakery Supplies Co',
  'Dairy Fresh Ltd',
  'Frozen Foods Express',
  'Snack Attack Wholesale',
  'Beverage Distributors',
  'Personal Care Pro',
  'Household Goods Ltd',
  'Clean Solutions Inc',
  'Stationery World',
  'Mobile Tech Distributors',
  'IT Solutions Wholesale'
];

/**
 * Get categories with fallback to demo data
 */
export const getCategoriesWithFallback = (apiCategories: string[]): string[] => {
  if (apiCategories && apiCategories.length > 0) {
    return [...new Set([...apiCategories, ...demoCategories])].sort();
  }
  return demoCategories;
};

/**
 * Get suppliers with fallback to demo data
 */
export const getSuppliersWithFallback = (apiSuppliers: string[]): string[] => {
  if (apiSuppliers && apiSuppliers.length > 0) {
    return [...new Set([...apiSuppliers, ...demoSuppliers])].sort();
  }
  return demoSuppliers;
};