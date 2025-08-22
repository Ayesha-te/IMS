import * as XLSX from "xlsx";
import { ProductService, SupermarketService, CategoryService, SupplierService } from "../services/apiService";

interface ExcelRow {
  name: string;
  category: string;
  supplier: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  expiry_date: string;
  barcode?: string;
  brand?: string;
  weight?: string;
  origin?: string;
  description?: string;
  location?: string;
  halal_certified?: string | boolean;
  halal_certification_body?: string;
}



interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    product: ExcelRow;
    success: boolean;
    error?: string;
  }>;
  newCategories: Category[];
  newSuppliers: Supplier[];
}

export async function handleExcelUploadEnhanced(
  file: File,
  categories: Category[],
  suppliers: Supplier[],
  supermarketId: string,
  jwtToken: string,
  options: {
    createMissingCategories?: boolean;
    createMissingSuppliers?: boolean;
  } = {}
): Promise<ImportResult> {
  console.log(`📊 Starting Excel upload for supermarket ${supermarketId}`);
  console.log('📊 Function parameters:', {
    fileName: file.name,
    fileSize: file.size,
    categoriesCount: categories.length,
    suppliersCount: suppliers.length,
    supermarketId,
    hasToken: !!jwtToken,
    tokenLength: jwtToken?.length,
    options
  });

  // Validate supermarket ID (UUID)
  const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(supermarketId);
  if (!supermarketId || !isValidUUID) {
    throw new Error(`Invalid supermarket ID: ${supermarketId}. Please ensure you have a valid supermarket selected.`);
  }

  // Validate supermarket exists
  try {
    const supermarketsResponse = await SupermarketService.getSupermarkets(jwtToken);
    const supermarkets = supermarketsResponse.results || supermarketsResponse;
    const supermarketsArray = Array.isArray(supermarkets) ? supermarkets : Object.values(supermarkets || {});
    const supermarketExists = supermarketsArray.find((sm: any) => String(sm.id) === String(supermarketId));
    
    if (!supermarketExists) {
      throw new Error(`Supermarket with ID ${supermarketId} does not exist. Available supermarkets: ${supermarketsArray.map((sm: any) => `${sm.name} (ID: ${sm.id})`).join(', ')}`);
    }
    
    console.log(`✅ Validated supermarket: ${supermarketExists.name} (ID: ${supermarketId})`);
  } catch (error) {
    console.error('Failed to validate supermarket:', error);
    throw new Error(`Failed to validate supermarket: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Parse Excel file
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet) as ExcelRow[];

  console.log(`📊 Parsed ${rows.length} rows from Excel file`);

  // Build maps for quick name → ID conversion
  const categoryMap: Record<string, number> = {};
  categories.forEach(cat => {
    categoryMap[cat.name.toLowerCase().trim()] = cat.id;
  });

  const supplierMap: Record<string, number> = {};
  suppliers.forEach(sup => {
    supplierMap[sup.name.toLowerCase().trim()] = sup.id;
  });

  // Track newly created refs if options allow auto-creation
  const newlyCreatedCategories: Category[] = [];
  const newlyCreatedSuppliers: Supplier[] = [];

  // Process products individually using the existing ProductService
  const results: ImportResult['results'] = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let productPayload: any = null; // Declare outside try-catch for error logging
    
    try {
      // Validate required fields
      if (!row.name?.trim()) {
        throw new Error("Product name is required");
      }
      if (!row.category?.trim()) {
        throw new Error("Category is required");
      }
      if (!row.supplier?.trim()) {
        throw new Error("Supplier is required");
      }

      // Resolve or create category
      const rawCategory = row.category.toLowerCase().trim();
      let categoryId = categoryMap[rawCategory];
      if (!categoryId && options.createMissingCategories) {
        console.log(`🆕 Creating missing category: ${row.category}`);
        const created = await CategoryService.createCategory({ name: row.category.trim() }, jwtToken);
        // some backends return object or {id, name}; handle both
        const newCat = { id: Number(created.id || created.pk || created?.data?.id), name: created.name || row.category.trim() } as Category;
        if (!newCat.id) {
          throw new Error(`Failed to auto-create category: ${row.category}`);
        }
        categoryMap[rawCategory] = newCat.id;
        categoryId = newCat.id;
        newlyCreatedCategories.push(newCat);
      }
      if (!categoryId) {
        throw new Error(`Category not found: "${row.category}". Available: ${categories.map(c => c.name).join(', ')}`);
      }

      // Resolve or create supplier
      const rawSupplier = row.supplier.toLowerCase().trim();
      let supplierId = supplierMap[rawSupplier];
      if (!supplierId && options.createMissingSuppliers) {
        console.log(`🆕 Creating missing supplier: ${row.supplier}`);
        const created = await SupplierService.createSupplier({ name: row.supplier.trim() }, jwtToken);
        const newSup = { id: Number(created.id || created.pk || created?.data?.id), name: created.name || row.supplier.trim() } as Supplier;
        if (!newSup.id) {
          throw new Error(`Failed to auto-create supplier: ${row.supplier}`);
        }
        supplierMap[rawSupplier] = newSup.id;
        supplierId = newSup.id;
        newlyCreatedSuppliers.push(newSup);
      }
      if (!supplierId) {
        throw new Error(`Supplier not found: "${row.supplier}". Available: ${suppliers.map(s => s.name).join(', ')}`);
      }

      // Validate and prepare pricing (support various column names and formats)
      const toNumber = (val: any): number => {
        if (val === null || val === undefined || val === '') return NaN;
        if (typeof val === 'number') return val;
        const num = Number(String(val).replace(/,/g, '.').replace(/[^0-9.\-]/g, ''));
        return isNaN(num) ? NaN : num;
      };

      const rawCost = (row as any).cost_price ?? (row as any).price ?? (row as any)['Cost Price'] ?? (row as any)['cost price'] ?? (row as any)['Price'];
      const rawSelling = (row as any).selling_price ?? (row as any).price ?? (row as any)['Selling Price'] ?? (row as any)['selling price'] ?? (row as any)['Price'];

      let costPrice = toNumber(rawCost);
      let sellingPrice = toNumber(rawSelling);

      if (!isFinite(costPrice) || costPrice <= 0) costPrice = 0.01; // enforce > 0
      if (!isFinite(sellingPrice) || sellingPrice <= 0) sellingPrice = costPrice; // default to cost
      if (sellingPrice < costPrice) {
        // Align with backend rule: selling >= cost
        sellingPrice = costPrice;
      }

      // Validate expiry date
      const expiryDate = formatDate(row.expiry_date);
      if (!expiryDate) {
        throw new Error(`Invalid expiry date: "${row.expiry_date}". Supported formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or Excel serial number`);
      }

      // Create product payload with IDs (not names)
      productPayload = {
        name: row.name.trim(),
        category: categoryId,
        supplier: supplierId,
        supermarket: supermarketId,
        quantity: Number((row as any).quantity ?? (row as any).Quantity ?? 0) || 0,
        cost_price: costPrice,
        selling_price: sellingPrice,
        price: sellingPrice, // Set current price to selling price
        expiry_date: expiryDate,
        barcode: ((): string => {
          const rawBarcode: any = (row as any).barcode ?? (row as any)['Barcode'] ?? (row as any).upc ?? (row as any).UPC;
          const b = rawBarcode !== undefined && rawBarcode !== null ? String(rawBarcode).trim() : '';
          return b || generateBarcode();
        })(),
        brand: row.brand?.trim() || '',
        weight: row.weight?.trim() || '',
        origin: row.origin?.trim() || '',
        description: row.description?.trim() || '',
        location: row.location?.trim() || '',
        halal_certified: parseBoolean(row.halal_certified) ?? true,
        halal_certification_body: row.halal_certification_body?.trim() || '',
        synced_with_pos: false,
      };

      console.log(`🔍 Creating product ${i + 1}/${rows.length}: "${row.name}" with category ID ${categoryId} and supplier ID ${supplierId}`);

      // Create the product using ProductService
      await ProductService.createProduct(productPayload, jwtToken);
      
      results.push({ product: row, success: true });
      successful++;
      console.log(`✅ Successfully created product ${i + 1}/${rows.length}: ${row.name}`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.push({ product: row, success: false, error: errorMsg });
      failed++;
      console.error(`❌ Failed to create product ${i + 1}/${rows.length}: ${row.name || 'Unknown'}`);
      console.error('   Error details:', errorMsg);
      
      // Only log payload if it was created (to avoid the ReferenceError)
      if (productPayload) {
        console.error('   Payload that failed:', JSON.stringify(productPayload, null, 2));
      } else {
        console.error('   Failed before payload creation - check row data:', JSON.stringify(row, null, 2));
      }
    }
  }

  console.log(`🎯 Import completed: ${successful} successful, ${failed} failed`);

  return {
    total: rows.length,
    successful,
    failed,
    results,
    newCategories: newlyCreatedCategories,
    newSuppliers: newlyCreatedSuppliers
  };
}

// Helper functions for data processing

// Helper: Convert Excel dates to "YYYY-MM-DD" format (robust parser)
function formatDate(value: any): string {
  if (value === null || value === undefined || value === '') return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // Case 1: Excel serial number
  if (typeof value === 'number') {
    // Excel's serial date baseline handling (accounts for 1900 leap-year bug by subtracting 2 days)
    const excelEpoch = new Date(1900, 0, 1);
    const jsDate = new Date(excelEpoch.getTime() + (value - 2) * 86400000);
    return toYMD(jsDate);
  }

  // Case 2: Already a Date object
  if (value instanceof Date) {
    return toYMD(value);
  }

  // Case 3: String (normalize and parse)
  const raw = String(value).trim();
  if (!raw) return '';

  // Normalize common separators to '-'
  const str = raw.replace(/[\.\s]/g, '-').replace(/\/+/, '/');

  // 3.1: YYYY-M-D or YYYY-MM-DD with '-' or '/'
  const ymd = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (ymd) {
    const [, yyyy, m, d] = ymd;
    return `${yyyy}-${pad(Number(m))}-${pad(Number(d))}`;
  }

  // 3.2: DD-MM-YYYY or DD/MM/YYYY (prefer DD first, then MM)
  const dmy = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (dmy) {
    const [, a, b, yyyy] = dmy.map((v) => String(v));
    const A = Number(a), B = Number(b);
    // Disambiguation: if first > 12 it's definitely day; if second > 12 it's definitely month
    let day = A, month = B;
    if (A <= 12 && B > 12) { month = A; day = B; } // MM/DD/YYYY
    // else default to DD/MM/YYYY
    return `${yyyy}-${pad(month)}-${pad(day)}`;
  }

  // 3.3: Fallback to Date parsing for variants like "3 Dec 2025"
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return toYMD(parsed);
  }

  // If all else fails, return empty to trigger validation error upstream
  return '';
}

// Helper: Convert Excel boolean to true/false
function parseBoolean(value: string | boolean | number | undefined): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (!value) return undefined;
  
  const v = value.toString().toLowerCase().trim();
  if (v === "true" || v === "1" || v === "yes" || v === "y") return true;
  if (v === "false" || v === "0" || v === "no" || v === "n") return false;
  return undefined;
}

// Helper: Generate barcode if not provided
function generateBarcode(): string {
  // Generate a more unique barcode using timestamp + random
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const random = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit random
  return `${timestamp}${random}`;
}

// Simple usage example:
export async function simpleExcelUpload(
  file: File,
  categories: Category[],
  suppliers: Supplier[],
  supermarketId: string,
  jwtToken: string
) {
  const result = await handleExcelUploadEnhanced(
    file,
    categories,
    suppliers,
    supermarketId,
    jwtToken,
    {
      createMissingCategories: true,
      createMissingSuppliers: true
    }
  );

  console.log(`Import Summary:
    📊 Total: ${result.total}
    ✅ Successful: ${result.successful}
    ❌ Failed: ${result.failed}
    🆕 New Categories: ${result.newCategories.length}
    🆕 New Suppliers: ${result.newSuppliers.length}
  `);

  return result;
}