/**
 * Example usage of name-to-ID conversion functionality
 * This demonstrates how to use Excel data with human-readable names
 * and convert them to IDs before sending to the backend
 */

import { ProductService, MappingService } from '../services/apiService';

// Example: Single product creation with names
export const createSingleProductExample = async () => {
  try {
    // This is what you get from Excel - human-readable names
    const productFromExcel = {
      name: "Organic Apples",
      category: "Fruits", // Name instead of ID
      supplier: "Fresh Farm Co", // Name instead of ID
      supermarket: "Downtown Market", // Name instead of ID
      quantity: 100,
      price: 2.99,
      cost_price: 1.50,
      selling_price: 2.99,
      expiry_date: "2024-12-31"
    };

    console.log('Creating product with names:', productFromExcel);

    // Use the new method that handles name-to-ID conversion automatically
    const result = await ProductService.createProductWithNames(productFromExcel);
    
    console.log('Product created successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
};

// Example: Bulk product creation from Excel data
export const bulkCreateProductsExample = async () => {
  try {
    // This is what you typically get from Excel import
    const productsFromExcel = [
      {
        name: "Organic Apples",
        category: "Fruits",
        supplier: "Fresh Farm Co",
        supermarket: "Downtown Market",
        quantity: 100,
        price: 2.99,
        cost_price: 1.50,
        selling_price: 2.99,
        expiry_date: "2024-12-31"
      },
      {
        name: "Whole Wheat Bread",
        category: "Bakery",
        supplier: "Local Bakery",
        supermarket: "Downtown Market",
        quantity: 50,
        price: 3.49,
        cost_price: 2.00,
        selling_price: 3.49,
        expiry_date: "2024-01-15"
      },
      {
        name: "Greek Yogurt",
        category: "Dairy",
        supplier: "Dairy Fresh Inc",
        supermarket: "Uptown Store",
        quantity: 75,
        price: 4.99,
        cost_price: 3.00,
        selling_price: 4.99,
        expiry_date: "2024-01-20"
      }
    ];

    console.log(`Starting bulk creation of ${productsFromExcel.length} products...`);

    // Use the bulk method that handles name-to-ID conversion
    const result = await ProductService.bulkCreateProductsWithNames(productsFromExcel);
    
    console.log('Bulk creation results:', {
      total: result.total,
      successful: result.successful,
      failed: result.failed
    });

    // Log any errors
    if (result.errors.length > 0) {
      console.log('Errors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.product.name}: ${error.error}`);
      });
    }

    return result;
  } catch (error) {
    console.error('Bulk creation failed:', error);
    throw error;
  }
};

// Example: Get available options for validation
export const getAvailableOptionsExample = async () => {
  try {
    console.log('Fetching available options...');
    
    const options = await MappingService.getAvailableOptions();
    
    console.log('Available options:');
    console.log('Categories:', options.categories);
    console.log('Suppliers:', options.suppliers);
    console.log('Supermarkets:', options.supermarkets);
    
    return options;
  } catch (error) {
    console.error('Failed to fetch options:', error);
    throw error;
  }
};

// Example: Manual name-to-ID conversion (for custom use cases)
export const manualConversionExample = async () => {
  try {
    const productWithNames = {
      name: "Premium Coffee",
      category: "Beverages",
      supplier: "Coffee Roasters Ltd",
      supermarket: "Central Plaza",
      quantity: 25,
      price: 12.99,
      cost_price: 8.00,
      selling_price: 12.99
    };

    console.log('Original product with names:', productWithNames);

    // Convert manually if you need the converted data for other purposes
    const convertedProduct = await MappingService.convertProductNamesToIds(productWithNames);
    
    console.log('Converted product with IDs:', convertedProduct);
    
    return convertedProduct;
  } catch (error) {
    console.error('Manual conversion failed:', error);
    throw error;
  }
};

// Example: Error handling for invalid names
export const errorHandlingExample = async () => {
  try {
    const productWithInvalidNames = {
      name: "Test Product",
      category: "NonExistentCategory", // This will cause an error
      supplier: "Valid Supplier",
      supermarket: "Valid Supermarket",
      quantity: 10,
      price: 5.99
    };

    console.log('Attempting to create product with invalid category...');
    
    await ProductService.createProductWithNames(productWithInvalidNames);
  } catch (error) {
    console.log('Expected error caught:', error.message);
    
    // The error message will include available categories
    // Example: "Category not found: 'NonExistentCategory'. Available categories: Fruits, Bakery, Dairy, Beverages"
  }
};

// Example: Using the cache efficiently
export const cacheExample = async () => {
  console.log('Demonstrating cache usage...');
  
  // First call - fetches from API
  console.time('First mapping fetch');
  await MappingService.fetchMappings();
  console.timeEnd('First mapping fetch');
  
  // Second call - uses cache (much faster)
  console.time('Second mapping fetch (cached)');
  await MappingService.fetchMappings();
  console.timeEnd('Second mapping fetch (cached)');
  
  // Clear cache if needed
  MappingService.clearCache();
  console.log('Cache cleared');
  
  // Third call - fetches from API again
  console.time('Third mapping fetch (after cache clear)');
  await MappingService.fetchMappings();
  console.timeEnd('Third mapping fetch (after cache clear)');
};

// Example: Integration with Excel import workflow
export const excelImportWorkflow = async (excelData: any[]) => {
  try {
    console.log(`Processing ${excelData.length} rows from Excel...`);
    
    // Step 1: Validate that all required names exist
    console.log('Step 1: Validating available options...');
    const availableOptions = await MappingService.getAvailableOptions();
    
    // Step 2: Check for any invalid names before processing
    const validationErrors: string[] = [];
    
    excelData.forEach((row, index) => {
      if (!availableOptions.categories.includes(row.category)) {
        validationErrors.push(`Row ${index + 1}: Invalid category "${row.category}"`);
      }
      if (!availableOptions.suppliers.includes(row.supplier)) {
        validationErrors.push(`Row ${index + 1}: Invalid supplier "${row.supplier}"`);
      }
      if (!availableOptions.supermarkets.includes(row.supermarket)) {
        validationErrors.push(`Row ${index + 1}: Invalid supermarket "${row.supermarket}"`);
      }
    });
    
    if (validationErrors.length > 0) {
      console.log('Validation errors found:');
      validationErrors.forEach(error => console.log(error));
      throw new Error(`Validation failed: ${validationErrors.length} errors found`);
    }
    
    // Step 3: Bulk create products
    console.log('Step 2: All names validated, proceeding with bulk creation...');
    const result = await ProductService.bulkCreateProductsWithNames(excelData);
    
    console.log('Excel import completed:', {
      total: result.total,
      successful: result.successful,
      failed: result.failed
    });
    
    return result;
  } catch (error) {
    console.error('Excel import workflow failed:', error);
    throw error;
  }
};