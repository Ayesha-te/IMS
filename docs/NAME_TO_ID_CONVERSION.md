# Name-to-ID Conversion for Excel Import

This document explains how to use the name-to-ID conversion functionality that allows you to import products from Excel files using human-readable names instead of database IDs.

## Overview

The name-to-ID conversion system allows you to:
- Keep your Excel files human-readable with category names, supplier names, and supermarket names
- Automatically convert these names to the corresponding database IDs before sending to the backend
- Handle bulk imports efficiently with proper error handling and validation
- Cache mappings to improve performance

## Key Features

✅ **Human-readable Excel files** - Use names instead of cryptic IDs  
✅ **Automatic conversion** - Names are converted to IDs transparently  
✅ **Bulk operations** - Handle multiple products efficiently  
✅ **Error handling** - Clear error messages with suggestions  
✅ **Caching** - Mappings are cached for 5 minutes to improve performance  
✅ **Validation** - Pre-validate data before attempting import  

## Excel File Format

Your Excel file should contain the following columns with **names** (not IDs):

| Column | Type | Example | Required |
|--------|------|---------|----------|
| name | string | "Organic Apples" | Yes |
| category | string | "Fruits" | Yes |
| supplier | string | "Fresh Farm Co" | Yes |
| supermarket | string | "Downtown Market" | Yes |
| quantity | number | 100 | Yes |
| price | number | 2.99 | Yes |
| cost_price | number | 1.50 | No |
| selling_price | number | 2.99 | No |
| expiry_date | string | "2024-12-31" | No |

### Example Excel Data

```
name,category,supplier,supermarket,quantity,price,cost_price,selling_price,expiry_date
Organic Apples,Fruits,Fresh Farm Co,Downtown Market,100,2.99,1.50,2.99,2024-12-31
Whole Wheat Bread,Bakery,Local Bakery,Downtown Market,50,3.49,2.00,3.49,2024-01-15
Greek Yogurt,Dairy,Dairy Fresh Inc,Uptown Store,75,4.99,3.00,4.99,2024-01-20
```

## API Usage

### 1. Import the Services

```typescript
import { ProductService, MappingService } from '../services/apiService';
```

### 2. Single Product Creation

```typescript
const createProduct = async () => {
  const productData = {
    name: "Organic Apples",
    category: "Fruits",        // Name, not ID
    supplier: "Fresh Farm Co", // Name, not ID
    supermarket: "Downtown Market", // Name, not ID
    quantity: 100,
    price: 2.99,
    cost_price: 1.50,
    selling_price: 2.99,
    expiry_date: "2024-12-31"
  };

  try {
    const result = await ProductService.createProductWithNames(productData);
    console.log('Product created:', result);
  } catch (error) {
    console.error('Failed to create product:', error.message);
  }
};
```

### 3. Bulk Product Creation

```typescript
const bulkCreateProducts = async (excelData) => {
  try {
    const result = await ProductService.bulkCreateProductsWithNames(excelData);
    
    console.log(`Import completed: ${result.successful}/${result.total} successful`);
    
    // Handle any errors
    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        console.log(`Failed: ${error.product.name} - ${error.error}`);
      });
    }
  } catch (error) {
    console.error('Bulk import failed:', error.message);
  }
};
```

### 4. Get Available Options (for validation)

```typescript
const getOptions = async () => {
  try {
    const options = await MappingService.getAvailableOptions();
    
    console.log('Available categories:', options.categories);
    console.log('Available suppliers:', options.suppliers);
    console.log('Available supermarkets:', options.supermarkets);
    
    return options;
  } catch (error) {
    console.error('Failed to fetch options:', error);
  }
};
```

### 5. Manual Conversion (for custom workflows)

```typescript
const manualConversion = async () => {
  const productWithNames = {
    name: "Premium Coffee",
    category: "Beverages",
    supplier: "Coffee Roasters Ltd",
    supermarket: "Central Plaza",
    quantity: 25,
    price: 12.99
  };

  try {
    const convertedProduct = await MappingService.convertProductNamesToIds(productWithNames);
    console.log('Converted:', convertedProduct);
    // convertedProduct now has category: 5, supplier: 12, supermarket: "uuid-string"
  } catch (error) {
    console.error('Conversion failed:', error.message);
  }
};
```

## React Component Integration

See `src/examples/ExcelImportComponent.tsx` for a complete React component example that includes:

- File upload handling
- Data preview
- Validation with error display
- Import progress tracking
- Results display

## Error Handling

The system provides detailed error messages:

### Invalid Names
```
Category not found: "NonExistentCategory". 
Available categories: Fruits, Bakery, Dairy, Beverages
```

### Bulk Import Errors
```
Failed to convert 2 products:
Row 3: Category not found: "InvalidCategory". Available categories: Fruits, Bakery, Dairy
Row 5: Supplier not found: "InvalidSupplier". Available suppliers: Fresh Farm Co, Local Bakery
```

## Performance Optimization

### Caching
- Mappings are automatically cached for 5 minutes
- Cache is shared across all operations
- Manual cache clearing available: `MappingService.clearCache()`

### Bulk Operations
- Mappings are fetched once for all products in a batch
- Individual product failures don't stop the entire batch
- Detailed results show which products succeeded/failed

## Best Practices

### 1. Validate Before Import
```typescript
// Get available options first
const options = await MappingService.getAvailableOptions();

// Validate your Excel data against available options
const isValidCategory = options.categories.includes(product.category);
const isValidSupplier = options.suppliers.includes(product.supplier);
const isValidSupermarket = options.supermarkets.includes(product.supermarket);
```

### 2. Handle Partial Failures
```typescript
const result = await ProductService.bulkCreateProductsWithNames(products);

// Process successful imports
const successfulProducts = result.results.filter(r => r.success);

// Handle failed imports
const failedProducts = result.results.filter(r => !r.success);
failedProducts.forEach(failed => {
  console.log(`Fix needed for: ${failed.product.name} - ${failed.error}`);
});
```

### 3. Use Consistent Naming
- Ensure Excel data uses exact name matches (case-insensitive matching is supported)
- Trim whitespace from names
- Use consistent naming conventions

### 4. Error Recovery
```typescript
try {
  await ProductService.bulkCreateProductsWithNames(products);
} catch (error) {
  if (error.message.includes('Category not found')) {
    // Show user available categories
    const options = await MappingService.getAvailableOptions();
    console.log('Available categories:', options.categories);
  }
}
```

## API Endpoints Used

The conversion system uses these existing endpoints:
- `GET /api/inventory/categories/` - Fetch all categories
- `GET /api/inventory/suppliers/` - Fetch all suppliers  
- `GET /api/supermarkets/` - Fetch all supermarkets
- `POST /api/inventory/products/` - Create products (with converted IDs)

## Troubleshooting

### Common Issues

1. **"Category not found" errors**
   - Check that category names in Excel match exactly with backend data
   - Use `MappingService.getAvailableOptions()` to see valid names

2. **"Failed to fetch mappings" errors**
   - Check authentication token
   - Verify API endpoints are accessible
   - Check network connectivity

3. **Cache issues**
   - Clear cache manually: `MappingService.clearCache()`
   - Cache expires automatically after 5 minutes

4. **Performance issues with large imports**
   - Consider breaking large imports into smaller batches
   - Use the bulk methods instead of individual calls

### Debug Mode

Enable detailed logging by checking browser console - all operations are logged with:
- API requests and responses
- Conversion steps
- Cache hits/misses
- Error details

## Migration from ID-based System

If you're migrating from an ID-based system:

1. **Keep existing ID-based methods** - They still work unchanged
2. **Use new name-based methods** - For new Excel imports
3. **Gradual migration** - Convert Excel files to use names over time

### Example Migration

```typescript
// Old way (still works)
const oldProduct = {
  name: "Product",
  category: 5,           // ID
  supplier: 12,          // ID
  supermarket: "uuid",   // ID
  quantity: 100,
  price: 2.99
};
await ProductService.createProduct(oldProduct);

// New way (recommended for Excel imports)
const newProduct = {
  name: "Product",
  category: "Fruits",         // Name
  supplier: "Fresh Farm Co",  // Name
  supermarket: "Downtown Market", // Name
  quantity: 100,
  price: 2.99
};
await ProductService.createProductWithNames(newProduct);
```

## Summary

The name-to-ID conversion system makes Excel imports much more user-friendly while maintaining backend compatibility. Users can work with readable names in their Excel files, and the system handles all the ID conversion automatically with proper error handling and performance optimization.