// Service for parsing Excel files
import * as XLSX from 'xlsx';
import type { Product } from '../types/Product';

export async function parseExcelFile(file: File): Promise<Partial<Product>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map Excel columns to Product properties
        const products = jsonData.map((row: any) => {
          return {
            name: row.name || row.Name || row.product_name || row.ProductName || '',
            category: row.category || row.Category || '',
            quantity: Number(row.quantity || row.Quantity || 0),
            expiryDate: row.expiryDate || row.ExpiryDate || row.expiry_date || new Date().toISOString().split('T')[0],
            supplier: row.supplier || row.Supplier || '',
            price: Number(row.price || row.Price || 0),
            brand: row.brand || row.Brand || '',
            weight: row.weight || row.Weight || '',
            origin: row.origin || row.Origin || row.country_of_origin || '',
            barcode: row.barcode || row.Barcode || row.upc || row.UPC || '',
            halalCertified: Boolean(row.halalCertified || row.HalalCertified || row.halal_certified || true),
            halalCertificationBody: row.halalCertificationBody || row.HalalCertificationBody || '',
            description: row.description || row.Description || '',
            supermarketId: row.supermarketId || row.SupermarketId || row.store_id || '1'
          };
        });
        
        resolve(products);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
}

// Generate Excel template for products
export function generateExcelTemplate(): Blob {
  const template = [
    {
      name: 'Sample Product',
      category: 'Meat',
      quantity: 10,
      expiryDate: new Date().toISOString().split('T')[0],
      supplier: 'Sample Supplier',
      price: 9.99,
      brand: 'Sample Brand',
      weight: '500g',
      origin: 'Country',
      barcode: '123456789012',
      halalCertified: true,
      halalCertificationBody: 'Certification Authority',
      description: 'Product description'
    }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
