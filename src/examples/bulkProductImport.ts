/**
 * Example usage of the MappingService and ProductService for bulk product import
 * This demonstrates how to convert Excel data with names to API-ready data with IDs
 */

import { ProductService, MappingService, type ProductWithNames } from '../services/apiService';

// Example: Excel data with human-readable names
const excelProducts: ProductWithNames[] = [
  {
    name: "Organic Apples",
    category: "Fruits & Vegetables",
    supplier: "Fresh Farm Co",
    supermarket: "Green Valley Market",
    quantity: 100,
    price: 2.99,
    cost_price: 1.50,
    selling_price: 2.99,
    expiry_date: "2024-02-15"
  },
  {
    name: "Whole Wheat Bread",
    category: "Bakery",
    supplier: "Local Bakery",
    supermarket: "Downtown Grocery",
    quantity: 50,
    price: 3.49,
    cost_price: 2.00,
    selling_price: 3.49,
    expiry_date: "2024-01-20"
  },
  {
    name: "Greek Yogurt",
    category: "Dairy",
    supplier: "Dairy Fresh Ltd",
    supermarket: "Green Valley Market",
    quantity: 75,
    price: 4.99,
    cost_price: 3.25,
    selling_price: 4.99,
    expiry_date: "2024-01-25"
  }
];

/**
 * Example 1: Get available options for validation
 */
export async function getAvailableOptions() {
  try {
    const options = await MappingService.getAvailableOptions();
    console.log('Available options:', options);
    
    // Use this for dropdown validation in your UI
    return options;
  } catch (error) {
    console.error('Failed to get available options:', error);
    throw error;
  }
}

/**
 * Example 2: Convert a single product from names to IDs
 */
export async function convertSingleProduct() {
  try {
    const productWithNames = excelProducts[0];
    console.log('Original product:', productWithNames);
    
    const productWithIds = await MappingService.convertProductNamesToIds(productWithNames);
    console.log('Converted product:', productWithIds);
    
    return productWithIds;
  } catch (error) {
    console.error('Failed to convert product:', error);
    throw error;
  }
}

/**
 * Example 3: Bulk create products from Excel data
 */
export async function bulkCreateProducts() {
  try {
    console.log('Starting bulk product creation...');
    
    const result = await ProductService.bulkCreateProductsWithNames(excelProducts);
    
    console.log('Bulk creation result:', {
      total: result.total,
      successful: result.successCount,
      failed: result.errorCount,
      errors: result.errors
    });
    
    if (result.errors.length > 0) {
      console.warn('Some products failed to create:', result.errors);
    }
    
    return result;
  } catch (error) {
    console.error('Bulk creation failed:', error);
    throw error;
  }
}

/**
 * Example 4: Create a single product with names
 */
export async function createSingleProductWithNames() {
  try {
    const productData: ProductWithNames = {
      name: "Premium Coffee Beans",
      category: "Beverages",
      supplier: "Coffee Roasters Inc",
      supermarket: "Downtown Grocery",
      quantity: 25,
      price: 12.99,
      cost_price: 8.50,
      selling_price: 12.99,
      expiry_date: "2024-06-01"
    };
    
    console.log('Creating product with names:', productData);
    
    const result = await ProductService.createProductWithNames(productData);
    console.log('Product created successfully:', result);
    
    return result;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

/**
 * Example 5: Handle validation errors gracefully
 */
export async function validateAndCreateProducts(products: ProductWithNames[]) {
  try {
    // First, get available options for validation
    const availableOptions = await MappingService.getAvailableOptions();
    
    // Validate products before attempting to create them
    const validationErrors: string[] = [];
    
    products.forEach((product, index) => {
      if (!availableOptions.categories.includes(product.category)) {
        validationErrors.push(`Row ${index + 1}: Invalid category "${product.category}". Available: ${availableOptions.categories.join(', ')}`);
      }
      
      if (!availableOptions.suppliers.includes(product.supplier)) {
        validationErrors.push(`Row ${index + 1}: Invalid supplier "${product.supplier}". Available: ${availableOptions.suppliers.join(', ')}`);
      }
      
      if (!availableOptions.supermarkets.includes(product.supermarket)) {
        validationErrors.push(`Row ${index + 1}: Invalid supermarket "${product.supermarket}". Available: ${availableOptions.supermarkets.join(', ')}`);
      }
    });
    
    if (validationErrors.length > 0) {
      console.error('Validation errors found:', validationErrors);
      throw new Error(`Validation failed:\n${validationErrors.join('\n')}`);
    }
    
    // If validation passes, create the products
    return await ProductService.bulkCreateProductsWithNames(products);
    
  } catch (error) {
    console.error('Validation and creation failed:', error);
    throw error;
  }
}

/**
 * Example 6: Clear cache when needed (e.g., after adding new categories/suppliers)
 */
export function clearMappingCache() {
  console.log('Clearing mapping cache...');
  MappingService.clearCache();
  console.log('Cache cleared. Next API call will fetch fresh data.');
}

/**
 * Complete workflow example
 */
export async function completeWorkflow() {
  try {
    console.log('=== Starting Complete Workflow ===');
    
    // Step 1: Get available options for reference
    console.log('\n1. Getting available options...');
    const options = await getAvailableOptions();
    
    // Step 2: Validate and create products
    console.log('\n2. Validating and creating products...');
    const result = await validateAndCreateProducts(excelProducts);
    
    console.log('\n=== Workflow Complete ===');
    console.log(`Successfully created ${result.successCount} out of ${result.total} products`);
    
    if (result.errors.length > 0) {
      console.log('Errors encountered:', result.errors);
    }
    
    return result;
    
  } catch (error) {
    console.error('Workflow failed:', error);
    throw error;
  }
}

// Usage in a React component would look like this:
/*
import { completeWorkflow, validateAndCreateProducts } from './examples/bulkProductImport';

// In your component
const handleBulkImport = async (excelData: ProductWithNames[]) => {
  try {
    setLoading(true);
    const result = await validateAndCreateProducts(excelData);
    
    if (result.successCount > 0) {
      toast.success(`Successfully imported ${result.successCount} products`);
    }
    
    if (result.errors.length > 0) {
      toast.error(`${result.errors.length} products failed to import`);
      console.log('Import errors:', result.errors);
    }
    
  } catch (error) {
    toast.error('Import failed: ' + error.message);
  } finally {
    setLoading(false);
  }
};
*/