/**
 * React hook for bulk product import with name-to-ID conversion
 * Provides easy-to-use functions for importing products from Excel data
 */

import { useState, useCallback } from 'react';
import { ProductService, MappingService, type ProductWithNames } from '../services/apiService';

interface ImportResult {
  success: any[];
  errors: string[];
  total: number;
  successCount: number;
  errorCount: number;
}

interface ValidationOptions {
  categories: string[];
  suppliers: string[];
  supermarkets: string[];
}

export const useBulkProductImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [validationOptions, setValidationOptions] = useState<ValidationOptions | null>(null);
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);

  /**
   * Fetch available options for validation
   */
  const fetchValidationOptions = useCallback(async () => {
    try {
      setIsLoading(true);
      const options = await MappingService.getAvailableOptions();
      setValidationOptions(options);
      return options;
    } catch (error) {
      console.error('Failed to fetch validation options:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Validate products against available options
   */
  const validateProducts = useCallback((products: ProductWithNames[], options?: ValidationOptions) => {
    const validationOpts = options || validationOptions;
    if (!validationOpts) {
      throw new Error('Validation options not loaded. Call fetchValidationOptions first.');
    }

    const errors: string[] = [];

    products.forEach((product, index) => {
      const rowNumber = index + 1;

      // Validate required fields
      if (!product.name?.trim()) {
        errors.push(`Row ${rowNumber}: Product name is required`);
      }
      if (!product.category?.trim()) {
        errors.push(`Row ${rowNumber}: Category is required`);
      }
      if (!product.supplier?.trim()) {
        errors.push(`Row ${rowNumber}: Supplier is required`);
      }
      if (!product.supermarket?.trim()) {
        errors.push(`Row ${rowNumber}: Supermarket is required`);
      }
      if (typeof product.quantity !== 'number' || product.quantity < 0) {
        errors.push(`Row ${rowNumber}: Valid quantity is required`);
      }
      if (typeof product.price !== 'number' || product.price < 0) {
        errors.push(`Row ${rowNumber}: Valid price is required`);
      }

      // Validate against available options (case-insensitive)
      if (product.category && !validationOpts.categories.some(cat => 
        cat.toLowerCase().trim() === product.category.toLowerCase().trim()
      )) {
        errors.push(`Row ${rowNumber}: Invalid category "${product.category}". Available: ${validationOpts.categories.join(', ')}`);
      }

      if (product.supplier && !validationOpts.suppliers.some(sup => 
        sup.toLowerCase().trim() === product.supplier.toLowerCase().trim()
      )) {
        errors.push(`Row ${rowNumber}: Invalid supplier "${product.supplier}". Available: ${validationOpts.suppliers.join(', ')}`);
      }

      if (product.supermarket && !validationOpts.supermarkets.some(sup => 
        sup.toLowerCase().trim() === product.supermarket.toLowerCase().trim()
      )) {
        errors.push(`Row ${rowNumber}: Invalid supermarket "${product.supermarket}". Available: ${validationOpts.supermarkets.join(', ')}`);
      }

      // Validate date format if provided
      if (product.expiry_date && product.expiry_date.trim()) {
        const date = new Date(product.expiry_date);
        if (isNaN(date.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid expiry date format "${product.expiry_date}". Use YYYY-MM-DD format.`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [validationOptions]);

  /**
   * Import products with validation
   */
  const importProducts = useCallback(async (products: ProductWithNames[]) => {
    try {
      setIsLoading(true);

      // Ensure validation options are loaded
      let options = validationOptions;
      if (!options) {
        console.log('Loading validation options...');
        options = await fetchValidationOptions();
      }

      // Validate products
      console.log('Validating products...');
      const validation = validateProducts(products, options);
      if (!validation.isValid) {
        throw new Error(`Validation failed:\n${validation.errors.join('\n')}`);
      }

      // Import products
      console.log('Starting bulk import...');
      const result = await ProductService.bulkCreateProductsWithNames(products);
      
      setLastImportResult(result);
      return result;

    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [validationOptions, fetchValidationOptions, validateProducts]);

  /**
   * Import products without validation (use with caution)
   */
  const importProductsWithoutValidation = useCallback(async (products: ProductWithNames[]) => {
    try {
      setIsLoading(true);
      console.log('Starting bulk import without validation...');
      const result = await ProductService.bulkCreateProductsWithNames(products);
      setLastImportResult(result);
      return result;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a single product with names
   */
  const createSingleProduct = useCallback(async (product: ProductWithNames) => {
    try {
      setIsLoading(true);
      return await ProductService.createProductWithNames(product);
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear the mapping cache
   */
  const clearCache = useCallback(() => {
    MappingService.clearCache();
    setValidationOptions(null);
  }, []);

  /**
   * Get import statistics
   */
  const getImportStats = useCallback(() => {
    if (!lastImportResult) return null;

    return {
      total: lastImportResult.total,
      successful: lastImportResult.successCount,
      failed: lastImportResult.errorCount,
      successRate: lastImportResult.total > 0 
        ? Math.round((lastImportResult.successCount / lastImportResult.total) * 100) 
        : 0
    };
  }, [lastImportResult]);

  return {
    // State
    isLoading,
    validationOptions,
    lastImportResult,

    // Functions
    fetchValidationOptions,
    validateProducts,
    importProducts,
    importProductsWithoutValidation,
    createSingleProduct,
    clearCache,
    getImportStats,

    // Computed values
    isValidationOptionsLoaded: !!validationOptions,
    hasImportResult: !!lastImportResult,
  };
};

export default useBulkProductImport;