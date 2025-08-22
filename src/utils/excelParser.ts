/**
 * Excel parsing utilities for bulk product import
 * Supports multiple Excel parsing libraries
 */

import { type ProductWithNames } from '../services/apiService';

// Type for Excel row data
interface ExcelRow {
  [key: string]: any;
}

/**
 * Parse Excel file using xlsx library
 * npm install xlsx @types/xlsx
 */
export const parseExcelWithXLSX = async (file: File): Promise<ProductWithNames[]> => {
  // Dynamically import xlsx to avoid bundling if not used
  const XLSX = await import('xlsx');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
        
        // Convert to ProductWithNames format
        const products = jsonData.map((row, index) => {
          try {
            return convertRowToProduct(row, index + 1);
          } catch (error) {
            console.warn(`Row ${index + 1} skipped:`, error);
            return null;
          }
        }).filter((product): product is ProductWithNames => product !== null);
        
        resolve(products);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse CSV file
 */
export const parseCSV = async (file: File): Promise<ProductWithNames[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header row and one data row');
        }
        
        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Parse data rows
        const products: ProductWithNames[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]);
            const row: ExcelRow = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
            const product = convertRowToProduct(row, i + 1);
            products.push(product);
          } catch (error) {
            console.warn(`Row ${i + 1} skipped:`, error);
          }
        }
        
        resolve(products);
      } catch (error) {
        reject(new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Parse a CSV line handling quoted values
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

/**
 * Convert Excel row to ProductWithNames
 */
const convertRowToProduct = (row: ExcelRow, rowNumber: number): ProductWithNames => {
  // Define possible column name variations
  const columnMappings = {
    name: ['name', 'product_name', 'productname', 'product name', 'title'],
    category: ['category', 'category_name', 'categoryname', 'category name'],
    supplier: ['supplier', 'supplier_name', 'suppliername', 'supplier name', 'vendor'],
    supermarket: ['supermarket', 'supermarket_name', 'supermarketname', 'supermarket name', 'store', 'location'],
    quantity: ['quantity', 'qty', 'stock', 'amount'],
    price: ['price', 'unit_price', 'unitprice', 'unit price', 'selling_price', 'sellingprice'],
    cost_price: ['cost_price', 'costprice', 'cost price', 'cost', 'purchase_price', 'purchaseprice'],
    selling_price: ['selling_price', 'sellingprice', 'selling price', 'sale_price', 'saleprice'],
    expiry_date: ['expiry_date', 'expirydate', 'expiry date', 'expiration_date', 'expirationdate', 'exp_date', 'expdate']
  };

  // Helper function to find value by column variations
  const findValue = (variations: string[]): any => {
    for (const variation of variations) {
      // Try exact match first
      if (row[variation] !== undefined) {
        return row[variation];
      }
      
      // Try case-insensitive match
      const key = Object.keys(row).find(k => 
        k.toLowerCase().trim() === variation.toLowerCase().trim()
      );
      if (key && row[key] !== undefined) {
        return row[key];
      }
    }
    return undefined;
  };

  // Extract values
  const name = findValue(columnMappings.name);
  const category = findValue(columnMappings.category);
  const supplier = findValue(columnMappings.supplier);
  const supermarket = findValue(columnMappings.supermarket);
  const quantity = findValue(columnMappings.quantity);
  const price = findValue(columnMappings.price);
  const cost_price = findValue(columnMappings.cost_price);
  const selling_price = findValue(columnMappings.selling_price);
  const expiry_date = findValue(columnMappings.expiry_date);

  // Validate required fields
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new Error(`Row ${rowNumber}: Product name is required`);
  }
  if (!category || typeof category !== 'string' || !category.trim()) {
    throw new Error(`Row ${rowNumber}: Category is required`);
  }
  if (!supplier || typeof supplier !== 'string' || !supplier.trim()) {
    throw new Error(`Row ${rowNumber}: Supplier is required`);
  }
  if (!supermarket || typeof supermarket !== 'string' || !supermarket.trim()) {
    throw new Error(`Row ${rowNumber}: Supermarket is required`);
  }

  // Parse numeric values
  const parsedQuantity = parseFloat(quantity);
  if (isNaN(parsedQuantity) || parsedQuantity < 0) {
    throw new Error(`Row ${rowNumber}: Valid quantity is required`);
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    throw new Error(`Row ${rowNumber}: Valid price is required`);
  }

  // Parse optional numeric values
  const parsedCostPrice = cost_price ? parseFloat(cost_price) : undefined;
  const parsedSellingPrice = selling_price ? parseFloat(selling_price) : undefined;

  // Parse date
  let formattedExpiryDate: string | undefined;
  if (expiry_date) {
    const date = new Date(expiry_date);
    if (!isNaN(date.getTime())) {
      formattedExpiryDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
  }

  return {
    name: name.toString().trim(),
    category: category.toString().trim(),
    supplier: supplier.toString().trim(),
    supermarket: supermarket.toString().trim(),
    quantity: parsedQuantity,
    price: parsedPrice,
    ...(parsedCostPrice !== undefined && { cost_price: parsedCostPrice }),
    ...(parsedSellingPrice !== undefined && { selling_price: parsedSellingPrice }),
    ...(formattedExpiryDate && { expiry_date: formattedExpiryDate })
  };
};

/**
 * Auto-detect file type and parse accordingly
 */
export const parseExcelFile = async (file: File): Promise<ProductWithNames[]> => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return parseCSV(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcelWithXLSX(file);
  } else {
    throw new Error('Unsupported file format. Please use .xlsx, .xls, or .csv files.');
  }
};

/**
 * Validate Excel file before parsing
 */
export const validateExcelFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  const fileName = file.name.toLowerCase();
  const supportedExtensions = ['.xlsx', '.xls', '.csv'];
  const isSupported = supportedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!isSupported) {
    return { 
      isValid: false, 
      error: `Unsupported file format. Please use: ${supportedExtensions.join(', ')}` 
    };
  }

  return { isValid: true };
};

/**
 * Generate Excel template for download
 */
export const generateExcelTemplate = (): Blob => {
  const headers = [
    'name',
    'category',
    'supplier', 
    'supermarket',
    'quantity',
    'price',
    'cost_price',
    'selling_price',
    'expiry_date'
  ];

  const sampleData = [
    [
      'Sample Product 1',
      'Electronics',
      'Tech Supplier Co',
      'Main Store',
      '10',
      '99.99',
      '70.00',
      '99.99',
      '2024-12-31'
    ],
    [
      'Sample Product 2',
      'Clothing',
      'Fashion Supplier',
      'Branch Store',
      '25',
      '49.99',
      '30.00',
      '49.99',
      ''
    ]
  ];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Download Excel template
 */
export const downloadExcelTemplate = () => {
  const blob = generateExcelTemplate();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'product_import_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};