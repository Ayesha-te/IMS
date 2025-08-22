# Bulk Product Import with Name-to-ID Conversion

This implementation provides a complete solution for importing products from Excel files using human-readable names (categories, suppliers, supermarkets) that are automatically converted to the required IDs before sending to the backend.

## 🎯 Features

- ✅ **Human-readable Excel files** - Use category names, supplier names, and supermarket names instead of IDs
- ✅ **Automatic name-to-ID conversion** - Fetches mappings from your API and converts names to IDs
- ✅ **Intelligent caching** - Caches mappings for 5 minutes to improve performance
- ✅ **Comprehensive validation** - Validates all data before import
- ✅ **Bulk operations** - Import multiple products efficiently
- ✅ **Error handling** - Detailed error reporting with row numbers
- ✅ **Multiple file formats** - Supports .xlsx, .xls, and .csv files
- ✅ **React hooks** - Easy-to-use React integration
- ✅ **TypeScript support** - Full type safety

## 📁 File Structure

```
src/
├── services/
│   └── apiService.ts          # Enhanced API service with MappingService
├── hooks/
│   └── useBulkProductImport.ts # React hook for bulk import
├── components/
│   └── BulkProductImport.tsx   # Complete React component
├── utils/
│   └── excelParser.ts          # Excel/CSV parsing utilities
└── examples/
    └── bulkProductImport.ts    # Usage examples
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# For Excel parsing (choose one)
npm install xlsx @types/xlsx
# OR
npm install react-excel-renderer
```

### 2. Basic Usage

```typescript
import { ProductService, MappingService } from './services/apiService';

// Example Excel data with names
const excelProducts = [
  {
    name: "Organic Apples",
    category: "Fruits & Vegetables",    // Name, not ID
    supplier: "Fresh Farm Co",          // Name, not ID  
    supermarket: "Green Valley Market", // Name, not ID
    quantity: 100,
    price: 2.99,
    cost_price: 1.50,
    selling_price: 2.99,
    expiry_date: "2024-02-15"
  }
];

// Import products (names automatically converted to IDs)
const result = await ProductService.bulkCreateProductsWithNames(excelProducts);
console.log(`Successfully imported ${result.successCount} products`);
```

### 3. Using the React Hook

```typescript
import { useBulkProductImport } from './hooks/useBulkProductImport';

function MyComponent() {
  const {
    importProducts,
    validateProducts,
    isLoading,
    validationOptions
  } = useBulkProductImport();

  const handleImport = async (products) => {
    try {
      const result = await importProducts(products);
      alert(`Imported ${result.successCount} products successfully!`);
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  // ... rest of component
}
```

## 📊 Excel File Format

Your Excel file should have these columns (column names are flexible):

| Column | Required | Variations | Example |
|--------|----------|------------|---------|
| name | ✅ | product_name, title | "Organic Apples" |
| category | ✅ | category_name | "Fruits & Vegetables" |
| supplier | ✅ | supplier_name, vendor | "Fresh Farm Co" |
| supermarket | ✅ | store, location | "Green Valley Market" |
| quantity | ✅ | qty, stock | 100 |
| price | ✅ | unit_price, selling_price | 2.99 |
| cost_price | ❌ | cost, purchase_price | 1.50 |
| selling_price | ❌ | sale_price | 2.99 |
| expiry_date | ❌ | expiration_date, exp_date | "2024-02-15" |

### Sample Excel Data

```csv
name,category,supplier,supermarket,quantity,price,cost_price,selling_price,expiry_date
Organic Apples,Fruits & Vegetables,Fresh Farm Co,Green Valley Market,100,2.99,1.50,2.99,2024-02-15
Whole Wheat Bread,Bakery,Local Bakery,Downtown Grocery,50,3.49,2.00,3.49,2024-01-20
Greek Yogurt,Dairy,Dairy Fresh Ltd,Green Valley Market,75,4.99,3.25,4.99,2024-01-25
```

## 🔧 API Service Methods

### MappingService

```typescript
// Fetch all mappings (cached for 5 minutes)
const mappings = await MappingService.fetchMappings();

// Convert single product
const convertedProduct = await MappingService.convertProductNamesToIds(product);

// Convert multiple products
const convertedProducts = await MappingService.convertProductsNamesToIds(products);

// Get available options for validation
const options = await MappingService.getAvailableOptions();

// Clear cache
MappingService.clearCache();
```

### ProductService (Enhanced)

```typescript
// Create single product with names
const result = await ProductService.createProductWithNames(productData);

// Update product with names
const result = await ProductService.updateProductWithNames(productId, productData);

// Bulk create products with names
const result = await ProductService.bulkCreateProductsWithNames(products);

// Bulk update products with names
const result = await ProductService.bulkUpdateProductsWithNames(products);
```

## 🎣 React Hook API

### useBulkProductImport()

```typescript
const {
  // State
  isLoading,                    // boolean
  validationOptions,            // { categories, suppliers, supermarkets }
  lastImportResult,            // Import result object
  
  // Functions
  fetchValidationOptions,       // () => Promise<ValidationOptions>
  validateProducts,             // (products) => { isValid, errors }
  importProducts,              // (products) => Promise<ImportResult>
  createSingleProduct,         // (product) => Promise<any>
  clearCache,                  // () => void
  getImportStats,              // () => ImportStats | null
  
  // Computed
  isValidationOptionsLoaded,    // boolean
  hasImportResult,             // boolean
} = useBulkProductImport();
```

## 📋 Complete Component Example

```typescript
import React from 'react';
import { useBulkProductImport } from './hooks/useBulkProductImport';
import { parseExcelFile } from './utils/excelParser';

function BulkImportPage() {
  const {
    importProducts,
    validateProducts,
    isLoading,
    validationOptions,
    getImportStats
  } = useBulkProductImport();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Parse Excel file
      const products = await parseExcelFile(file);
      
      // Validate products
      const validation = validateProducts(products);
      if (!validation.isValid) {
        alert(`Validation errors:\n${validation.errors.join('\n')}`);
        return;
      }

      // Import products
      const result = await importProducts(products);
      alert(`Successfully imported ${result.successCount} products!`);
      
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Bulk Product Import</h2>
      <input 
        type="file" 
        accept=".xlsx,.xls,.csv" 
        onChange={handleFileUpload}
        disabled={isLoading}
      />
      {isLoading && <p>Processing...</p>}
      
      {validationOptions && (
        <div>
          <h3>Available Options:</h3>
          <p>Categories: {validationOptions.categories.join(', ')}</p>
          <p>Suppliers: {validationOptions.suppliers.join(', ')}</p>
          <p>Supermarkets: {validationOptions.supermarkets.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
```

## 🛠️ Excel Parsing Utilities

```typescript
import { parseExcelFile, validateExcelFile, downloadExcelTemplate } from './utils/excelParser';

// Parse any Excel file (.xlsx, .xls, .csv)
const products = await parseExcelFile(file);

// Validate file before parsing
const validation = validateExcelFile(file);
if (!validation.isValid) {
  alert(validation.error);
  return;
}

// Download template file
downloadExcelTemplate();
```

## 🔍 Error Handling

The system provides detailed error messages with row numbers:

```typescript
try {
  await ProductService.bulkCreateProductsWithNames(products);
} catch (error) {
  // Error message includes:
  // - Row numbers for validation errors
  // - Available options for invalid names
  // - Specific field validation errors
  console.error(error.message);
  /*
  Example error:
  "Failed to convert 2 products:
  Row 1: Category not found: "Invalid Category". Available categories: Electronics, Clothing, Books
  Row 3: Supplier not found: "Unknown Supplier". Available suppliers: Supplier A, Supplier B"
  */
}
```

## ⚡ Performance Optimization

1. **Caching**: Mappings are cached for 5 minutes to reduce API calls
2. **Batch Processing**: All mappings fetched in parallel
3. **Validation**: Client-side validation before API calls
4. **Error Recovery**: Failed products don't stop the entire import

## 🔒 Security Considerations

1. **File Size Limits**: Max 10MB file size
2. **File Type Validation**: Only .xlsx, .xls, .csv allowed
3. **Data Sanitization**: All input data is validated and sanitized
4. **Authentication**: All API calls use proper authentication tokens

## 🧪 Testing

```typescript
// Test the mapping service
import { MappingService } from './services/apiService';

describe('MappingService', () => {
  test('converts product names to IDs', async () => {
    const product = {
      name: 'Test Product',
      category: 'Electronics',
      supplier: 'Test Supplier',
      supermarket: 'Test Store',
      quantity: 10,
      price: 99.99
    };

    const converted = await MappingService.convertProductNamesToIds(product);
    
    expect(typeof converted.category).toBe('number');
    expect(typeof converted.supplier).toBe('number');
    expect(typeof converted.supermarket).toBe('string');
  });
});
```

## 🚨 Common Issues & Solutions

### Issue: "Category not found" error
**Solution**: Check that category names in Excel exactly match those in your database (case-insensitive matching is supported).

### Issue: Import is slow
**Solution**: The system caches mappings for 5 minutes. First import may be slower as it fetches all mappings.

### Issue: Some products fail to import
**Solution**: Check the error messages - they include row numbers and specific issues. Valid products will still be imported.

### Issue: Excel file not parsing
**Solution**: Ensure your file is in .xlsx, .xls, or .csv format and has the required columns.

## 📈 Monitoring & Analytics

```typescript
// Get import statistics
const stats = getImportStats();
if (stats) {
  console.log(`Import completed: ${stats.successRate}% success rate`);
  console.log(`${stats.successful}/${stats.total} products imported`);
}

// Monitor cache performance
MappingService.clearCache(); // Force fresh data fetch
```

## 🔄 Migration from ID-based System

If you're migrating from an ID-based system:

1. **Gradual Migration**: Use both methods during transition
2. **Data Validation**: Verify name-to-ID mappings are correct
3. **Backup**: Always backup before bulk operations
4. **Testing**: Test with small batches first

## 📞 Support

For issues or questions:
1. Check the error messages - they're designed to be helpful
2. Verify your Excel file format matches the expected structure
3. Ensure your categories, suppliers, and supermarkets exist in the system
4. Check network connectivity for API calls

---

This implementation keeps your Excel files human-readable while providing robust, type-safe bulk import functionality! 🎉