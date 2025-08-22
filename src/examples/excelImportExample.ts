/**
 * Example usage of the enhanced Excel import service
 * This shows how to use the new Excel import functionality with all features
 */

import { handleExcelUploadEnhanced, simpleExcelUpload } from '../utils/excelImportService';

// Example 1: Basic usage with all features enabled
export async function basicExcelImport(
  file: File,
  categories: { id: number; name: string }[],
  suppliers: { id: number; name: string }[],
  supermarketId: string,
  jwtToken: string
) {
  try {
    const result = await simpleExcelUpload(
      file,
      categories,
      suppliers,
      supermarketId,
      jwtToken
    );

    console.log('Import completed!', result);
    return result;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Example 2: Advanced usage with custom options
export async function advancedExcelImport(
  file: File,
  categories: { id: number; name: string }[],
  suppliers: { id: number; name: string }[],
  supermarketId: string,
  jwtToken: string
) {
  try {
    const result = await handleExcelUploadEnhanced(
      file,
      categories,
      suppliers,
      supermarketId,
      jwtToken,
      {
        createMissingCategories: true,  // Auto-create missing categories
        createMissingSuppliers: false   // Don't create missing suppliers
      }
    );

    // Handle the results
    if (result.failed > 0) {
      console.warn(`${result.failed} products failed to import:`);
      result.results
        .filter(r => !r.success)
        .forEach(r => console.warn(`- ${r.product.name}: ${r.error}`));
    }

    if (result.newCategories.length > 0) {
      console.log('New categories created:', result.newCategories.map(c => c.name));
    }

    if (result.newSuppliers.length > 0) {
      console.log('New suppliers created:', result.newSuppliers.map(s => s.name));
    }

    return result;
  } catch (error) {
    console.error('Advanced import failed:', error);
    throw error;
  }
}

// Example 3: Conservative import (no auto-creation)
export async function conservativeExcelImport(
  file: File,
  categories: { id: number; name: string }[],
  suppliers: { id: number; name: string }[],
  supermarketId: string,
  jwtToken: string
) {
  try {
    const result = await handleExcelUploadEnhanced(
      file,
      categories,
      suppliers,
      supermarketId,
      jwtToken,
      {
        createMissingCategories: false, // Don't create missing categories
        createMissingSuppliers: false   // Don't create missing suppliers
      }
    );

    // This will only import products where categories and suppliers already exist
    console.log(`Conservative import: ${result.successful}/${result.total} products imported`);
    
    return result;
  } catch (error) {
    console.error('Conservative import failed:', error);
    throw error;
  }
}

// Example Excel data format that works with the import service
export const EXAMPLE_EXCEL_DATA = [
  {
    name: "Coca Cola 500ml",
    category: "Beverages",
    supplier: "Coca Cola Company",
    quantity: 50,
    cost_price: 1.20,
    selling_price: 2.50,
    expiry_date: "2024-12-31",
    barcode: "1234567890123",
    brand: "Coca Cola",
    weight: "500ml",
    origin: "USA",
    description: "Refreshing cola drink",
    location: "Aisle 1, Shelf A",
    halal_certified: true,
    halal_certification_body: "JAKIM"
  },
  {
    name: "Beef Steak 1kg",
    category: "Meat",
    supplier: "Local Farm",
    quantity: 20,
    cost_price: 15.00,
    selling_price: 25.00,
    expiry_date: "2024-06-15",
    brand: "Premium Beef",
    weight: "1kg",
    origin: "Malaysia",
    description: "Fresh beef steak",
    location: "Freezer Section",
    halal_certified: true,
    halal_certification_body: "JAKIM"
  },
  {
    name: "Basmati Rice 5kg",
    category: "Grains",
    supplier: "Rice Supplier",
    quantity: 30,
    cost_price: 8.50,
    selling_price: 12.00,
    expiry_date: "2025-01-31",
    brand: "Golden Rice",
    weight: "5kg",
    origin: "India",
    description: "Premium basmati rice",
    location: "Aisle 2, Shelf C",
    halal_certified: true,
    halal_certification_body: "JAKIM"
  }
];

// Backend format that gets sent to Django
export const BACKEND_FORMAT_EXAMPLE = {
  name: "Coca Cola 500ml",
  category: 1,                    // ID, not name
  supplier: 2,                    // ID, not name
  quantity: 50,
  cost_price: 1.20,
  selling_price: 2.50,
  expiry_date: "2024-12-31",      // YYYY-MM-DD format
  supermarket: 3,                 // Supermarket ID
  barcode: "1234567890123",
  brand: "Coca Cola",
  weight: "500ml",
  origin: "USA",
  description: "Refreshing cola drink",
  location: "Aisle 1, Shelf A",
  halalCertified: true,           // boolean
  halalCertificationBody: "JAKIM",
  syncedWithPOS: false            // boolean
};