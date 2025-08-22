/**
 * React component example for Excel import with name-to-ID conversion
 * This demonstrates how to integrate the name-to-ID conversion in a React UI
 */

import React, { useState, useCallback } from 'react';
import { ProductService, MappingService } from '../services/apiService';

interface ExcelRow {
  name: string;
  category: string;
  supplier: string;
  supermarket: string;
  quantity: number;
  price: number;
  cost_price?: number;
  selling_price?: number;
  expiry_date?: string;
}

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  results: any[];
  errors: any[];
}

const ExcelImportComponent: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [availableOptions, setAvailableOptions] = useState<{
    categories: string[];
    suppliers: string[];
    supermarkets: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load available options when component mounts
  React.useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    try {
      setIsLoading(true);
      const options = await MappingService.getAvailableOptions();
      setAvailableOptions(options);
      console.log('Available options loaded:', options);
    } catch (error) {
      console.error('Failed to load available options:', error);
      alert('Failed to load available options. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Excel file parsing (you would use a library like xlsx here)
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // This is a simulation - in real implementation, you'd parse the Excel file
    // using libraries like xlsx, csv-parser, etc.
    const simulatedExcelData: ExcelRow[] = [
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
        name: "Invalid Product",
        category: "NonExistentCategory", // This will cause validation error
        supplier: "Valid Supplier",
        supermarket: "Valid Supermarket",
        quantity: 10,
        price: 5.99
      }
    ];

    setExcelData(simulatedExcelData);
    setImportResult(null);
    setValidationErrors([]);
  }, []);

  // Validate Excel data against available options
  const validateExcelData = useCallback(() => {
    if (!availableOptions || !excelData.length) return [];

    const errors: string[] = [];

    excelData.forEach((row, index) => {
      const rowNumber = index + 1;

      // Check category
      if (!availableOptions.categories.includes(row.category)) {
        errors.push(`Row ${rowNumber}: Invalid category "${row.category}". Available: ${availableOptions.categories.join(', ')}`);
      }

      // Check supplier
      if (!availableOptions.suppliers.includes(row.supplier)) {
        errors.push(`Row ${rowNumber}: Invalid supplier "${row.supplier}". Available: ${availableOptions.suppliers.join(', ')}`);
      }

      // Check supermarket
      if (!availableOptions.supermarkets.includes(row.supermarket)) {
        errors.push(`Row ${rowNumber}: Invalid supermarket "${row.supermarket}". Available: ${availableOptions.supermarkets.join(', ')}`);
      }

      // Check required fields
      if (!row.name?.trim()) {
        errors.push(`Row ${rowNumber}: Product name is required`);
      }
      if (!row.quantity || row.quantity <= 0) {
        errors.push(`Row ${rowNumber}: Valid quantity is required`);
      }
      if (!row.price || row.price <= 0) {
        errors.push(`Row ${rowNumber}: Valid price is required`);
      }
    });

    return errors;
  }, [excelData, availableOptions]);

  // Import products with name-to-ID conversion
  const handleImport = async () => {
    if (!excelData.length) {
      alert('Please upload an Excel file first');
      return;
    }

    // Validate data first
    const errors = validateExcelData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      setValidationErrors([]);
      
      console.log('Starting import process...');
      
      // Use the bulk import method with name-to-ID conversion
      const result = await ProductService.bulkCreateProductsWithNames(excelData);
      
      setImportResult(result);
      
      if (result.successful > 0) {
        alert(`Import completed! ${result.successful} products created successfully.`);
      }
      
      if (result.failed > 0) {
        alert(`${result.failed} products failed to import. Check the results below.`);
      }
      
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="excel-import-container" style={{ padding: '20px', maxWidth: '1200px' }}>
      <h2>Excel Product Import</h2>
      
      {/* File Upload Section */}
      <div className="upload-section" style={{ marginBottom: '20px' }}>
        <h3>Step 1: Upload Excel File</h3>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
        <p style={{ fontSize: '14px', color: '#666' }}>
          Excel should contain columns: name, category, supplier, supermarket, quantity, price, cost_price, selling_price, expiry_date
        </p>
      </div>

      {/* Available Options Display */}
      {availableOptions && (
        <div className="options-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h3>Available Options</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Categories:</strong>
              <ul style={{ fontSize: '12px', margin: '5px 0' }}>
                {availableOptions.categories.map(cat => <li key={cat}>{cat}</li>)}
              </ul>
            </div>
            <div>
              <strong>Suppliers:</strong>
              <ul style={{ fontSize: '12px', margin: '5px 0' }}>
                {availableOptions.suppliers.map(sup => <li key={sup}>{sup}</li>)}
              </ul>
            </div>
            <div>
              <strong>Supermarkets:</strong>
              <ul style={{ fontSize: '12px', margin: '5px 0' }}>
                {availableOptions.supermarkets.map(sup => <li key={sup}>{sup}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Excel Data Preview */}
      {excelData.length > 0 && (
        <div className="preview-section" style={{ marginBottom: '20px' }}>
          <h3>Step 2: Preview Data ({excelData.length} rows)</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f0f0f0', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Category</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Supplier</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Supermarket</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Quantity</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.name}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.category}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.supplier}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.supermarket}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.quantity}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>${row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="validation-errors" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffebee', borderRadius: '5px', border: '1px solid #f44336' }}>
          <h3 style={{ color: '#d32f2f' }}>Validation Errors</h3>
          <ul style={{ color: '#d32f2f', fontSize: '14px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Import Button */}
      <div className="import-section" style={{ marginBottom: '20px' }}>
        <h3>Step 3: Import Products</h3>
        <button
          onClick={handleImport}
          disabled={isLoading || excelData.length === 0 || validationErrors.length > 0}
          style={{
            padding: '12px 24px',
            backgroundColor: isLoading ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isLoading ? 'Importing...' : `Import ${excelData.length} Products`}
        </button>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="results-section" style={{ marginTop: '20px' }}>
          <h3>Import Results</h3>
          <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '5px', marginBottom: '15px' }}>
            <p><strong>Total:</strong> {importResult.total}</p>
            <p><strong>Successful:</strong> {importResult.successful}</p>
            <p><strong>Failed:</strong> {importResult.failed}</p>
          </div>

          {importResult.errors.length > 0 && (
            <div style={{ padding: '15px', backgroundColor: '#ffebee', borderRadius: '5px' }}>
              <h4>Failed Products:</h4>
              <ul>
                {importResult.errors.map((error, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    <strong>{error.product.name}:</strong> {error.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Refresh Options Button */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={loadAvailableOptions}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Refresh Available Options
        </button>
      </div>
    </div>
  );
};

export default ExcelImportComponent;