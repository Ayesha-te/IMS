/**
 * Excel Template Generator for Product Import
 * Provides templates and validation for bulk product import
 */

export interface ExcelProductRow {
  name: string;
  category: string;
  supplier: string;
  brand?: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  price?: number;
  expiry_date: string;
  weight?: string;
  origin?: string;
  description?: string;
  barcode?: string;
  halal_certified?: boolean;
  halal_certification_body?: string;
  location?: string;
}

export const EXCEL_TEMPLATE_HEADERS = [
  'name',
  'category',
  'supplier',
  'brand',
  'quantity',
  'cost_price',
  'selling_price',
  'price',
  'expiry_date',
  'weight',
  'origin',
  'description',
  'halal_certified',
  'halal_certification_body',
  'location',
];

export const EXCEL_REQUIRED_FIELDS = [
  'name',
  'category',
  'supplier', 
  'quantity',
  'cost_price',
  'selling_price',
  'expiry_date'
];

export const SAMPLE_EXCEL_DATA: ExcelProductRow[] = [
  {
    name: "Coca Cola 330ml",
    category: "Beverages",
    supplier: "Test Supplier",
    brand: "Coca Cola",
    quantity: 100,
    cost_price: 0.75,
    selling_price: 1.25,
    price: 1.25,
    expiry_date: "2025-12-31",
    weight: "330ml",
    origin: "USA",
    description: "Classic Coca Cola soft drink",
    barcode: "123456789012",
    halal_certified: true,
    halal_certification_body: "JAKIM",
    location: "Aisle 3, Shelf B"
  },
  {
    name: "Chicken Breast 1kg",
    category: "Meat & Poultry",
    supplier: "Test Supplier",
    brand: "Fresh Farms",
    quantity: 50,
    cost_price: 8.50,
    selling_price: 12.99,
    price: 12.99,
    expiry_date: "2024-12-25",
    weight: "1kg",
    origin: "Malaysia",
    description: "Fresh halal chicken breast",
    barcode: "234567890123",
    halal_certified: true,
    halal_certification_body: "JAKIM",
    location: "Freezer Section A"
  },
  {
    name: "Basmati Rice 5kg",
    category: "Other",
    supplier: "Test Supplier",
    brand: "Premium Rice",
    quantity: 25,
    cost_price: 15.00,
    selling_price: 22.50,
    price: 22.50,
    expiry_date: "2026-06-30",
    weight: "5kg",
    origin: "India",
    description: "Premium basmati rice",
    barcode: "345678901234",
    halal_certified: true,
    halal_certification_body: "JAKIM",
    location: "Aisle 1, Shelf A"
  }
];

export const FIELD_DESCRIPTIONS = {
  name: "Product name (Required) - e.g., 'Coca Cola 330ml'",
  category: "Category name (Required) - must match existing backend category (e.g., 'Beverages', 'Meat & Poultry', 'Dairy')",
  supplier: "Supplier name (Required) - must match existing backend supplier (e.g., 'Test Supplier')",
  brand: "Brand name (Optional) - e.g., 'Coca Cola'",
  quantity: "Stock quantity (Required) - e.g., 100",
  cost_price: "Cost price in dollars (Required) - e.g., 0.75",
  selling_price: "Selling price in dollars (Required) - e.g., 1.25",
  price: "Display price (Optional) - defaults to selling_price if empty",
  expiry_date: "Expiry date (Required) - format: YYYY-MM-DD e.g., '2025-12-31'",
  weight: "Weight/Size (Optional) - e.g., '330ml', '1kg', '500g'",
  origin: "Country of origin (Optional) - e.g., 'Malaysia', 'USA'",
  description: "Product description (Optional)",
  barcode: "Barcode (Optional) - will be auto-generated if empty",
  halal_certified: "Halal certified (Optional) - true/false, defaults to true",
  halal_certification_body: "Certification body (Optional) - e.g., 'JAKIM'",
  location: "Storage location (Optional) - e.g., 'Aisle 3, Shelf B'"
};

export const COMMON_CATEGORIES = [
  "Beverages",
  "Meat & Poultry", 
  "Dairy",
  "Snacks",
  "Frozen",
  "Bakery",
  "Condiments",
  "Fruits",
  "Vegetables",
  "Cleaning",
  "Personal Care",
  "Other",
  "Test Category"
];

export const VALIDATION_RULES = {
  name: { required: true, maxLength: 255 },
  category: { required: true, maxLength: 100 },
  supplier: { required: true, maxLength: 255 },
  brand: { maxLength: 100 },
  quantity: { required: true, min: 0, type: 'number' },
  cost_price: { required: true, min: 0, type: 'number' },
  selling_price: { required: true, min: 0, type: 'number' },
  price: { min: 0, type: 'number' },
  expiry_date: { required: true, type: 'date' },
  weight: { maxLength: 50 },
  origin: { maxLength: 100 },
  description: { maxLength: 1000 },
  barcode: { maxLength: 50 },
  halal_certified: { type: 'boolean' },
  halal_certification_body: { maxLength: 255 },
  location: { maxLength: 100 }
};

/**
 * Validates a single product row from Excel
 */
export function validateExcelRow(row: any, rowIndex: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  EXCEL_REQUIRED_FIELDS.forEach(field => {
    if (!row[field] || row[field] === '') {
      errors.push(`Row ${rowIndex + 1}: ${field} is required`);
    }
  });
  
  // Validate data types and constraints
  Object.entries(VALIDATION_RULES).forEach(([field, rules]) => {
    const value = row[field];
    
    if (value !== undefined && value !== null && value !== '') {
      // Type validation
      if (rules.type === 'number' && isNaN(Number(value))) {
        errors.push(`Row ${rowIndex + 1}: ${field} must be a number`);
      }
      
      if (rules.type === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`Row ${rowIndex + 1}: ${field} must be a valid date (YYYY-MM-DD)`);
        }
      }
      
      if (rules.type === 'boolean' && typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        errors.push(`Row ${rowIndex + 1}: ${field} must be true or false`);
      }
      
      // Length validation
      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors.push(`Row ${rowIndex + 1}: ${field} exceeds maximum length of ${rules.maxLength}`);
      }
      
      // Min value validation
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`Row ${rowIndex + 1}: ${field} must be at least ${rules.min}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates Excel template data as CSV string
 */
export function generateExcelTemplate(): string {
  const headers = EXCEL_TEMPLATE_HEADERS.join(',');
  const sampleRows = SAMPLE_EXCEL_DATA.map(row => 
    EXCEL_TEMPLATE_HEADERS.map(header => {
      const value = row[header as keyof ExcelProductRow];
      // Wrap strings containing commas in quotes
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value || '';
    }).join(',')
  ).join('\n');
  
  return `${headers}\n${sampleRows}`;
}

/**
 * Generates field descriptions as text
 */
export function generateFieldGuide(): string {
  let guide = "EXCEL IMPORT FIELD GUIDE\n";
  guide += "========================\n\n";
  
  guide += "REQUIRED FIELDS (must be filled):\n";
  EXCEL_REQUIRED_FIELDS.forEach(field => {
    guide += `• ${field}: ${FIELD_DESCRIPTIONS[field as keyof typeof FIELD_DESCRIPTIONS]}\n`;
  });
  
  guide += "\nOPTIONAL FIELDS:\n";
  Object.keys(FIELD_DESCRIPTIONS).forEach(field => {
    if (!EXCEL_REQUIRED_FIELDS.includes(field)) {
      guide += `• ${field}: ${FIELD_DESCRIPTIONS[field as keyof typeof FIELD_DESCRIPTIONS]}\n`;
    }
  });
  
  guide += "\nCOMMON CATEGORIES:\n";
  COMMON_CATEGORIES.forEach(category => {
    guide += `• ${category}\n`;
  });
  
  guide += "\nIMPORTANT NOTES:\n";
  guide += "• Date format must be YYYY-MM-DD (e.g., 2025-12-31)\n";
  guide += "• Prices should be in decimal format (e.g., 10.99)\n";
  guide += "• Boolean fields accept: true, false, TRUE, FALSE\n";
  guide += "• If barcode is empty, one will be auto-generated\n";
  guide += "• Categories and suppliers must match existing ones, or will be auto-created if you enable that option before upload\n";
  
  return guide;
}