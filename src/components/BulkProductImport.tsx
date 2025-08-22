/**
 * React component for bulk product import from Excel files
 * Demonstrates usage of the useBulkProductImport hook
 */

import React, { useState, useRef, useEffect } from 'react';
import { useBulkProductImport } from '../hooks/useBulkProductImport';
import { type ProductWithNames } from '../services/apiService';

// Mock Excel parsing function - replace with actual Excel parsing library
const parseExcelFile = (file: File): Promise<ProductWithNames[]> => {
  return new Promise((resolve) => {
    // This is a mock implementation
    // In real implementation, use libraries like xlsx, react-excel-renderer, etc.
    setTimeout(() => {
      resolve([
        {
          name: "Sample Product 1",
          category: "Electronics",
          supplier: "Tech Supplier",
          supermarket: "Main Store",
          quantity: 10,
          price: 99.99,
          cost_price: 70.00,
          selling_price: 99.99,
          expiry_date: "2024-12-31"
        },
        {
          name: "Sample Product 2",
          category: "Clothing",
          supplier: "Fashion Co",
          supermarket: "Branch Store",
          quantity: 25,
          price: 49.99,
          cost_price: 30.00,
          selling_price: 49.99,
        }
      ]);
    }, 1000);
  });
};

const BulkProductImport: React.FC = () => {
  const {
    isLoading,
    validationOptions,
    lastImportResult,
    fetchValidationOptions,
    validateProducts,
    importProducts,
    getImportStats,
    isValidationOptionsLoaded,
    hasImportResult,
  } = useBulkProductImport();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ProductWithNames[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load validation options on component mount
  useEffect(() => {
    if (!isValidationOptionsLoaded) {
      fetchValidationOptions().catch(console.error);
    }
  }, [isValidationOptionsLoaded, fetchValidationOptions]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationErrors([]);
    setParsedProducts([]);
    setShowPreview(false);

    try {
      console.log('Parsing Excel file...');
      const products = await parseExcelFile(file);
      setParsedProducts(products);
      setShowPreview(true);
      
      // Auto-validate if options are loaded
      if (isValidationOptionsLoaded) {
        const validation = validateProducts(products);
        setValidationErrors(validation.errors);
      }
    } catch (error) {
      console.error('Failed to parse file:', error);
      alert('Failed to parse Excel file. Please check the file format.');
    }
  };

  const handleValidate = () => {
    if (!isValidationOptionsLoaded) {
      alert('Validation options not loaded. Please wait...');
      return;
    }

    const validation = validateProducts(parsedProducts);
    setValidationErrors(validation.errors);
    
    if (validation.isValid) {
      alert('All products are valid and ready for import!');
    }
  };

  const handleImport = async () => {
    if (parsedProducts.length === 0) {
      alert('No products to import');
      return;
    }

    if (validationErrors.length > 0) {
      const proceed = window.confirm(
        `There are ${validationErrors.length} validation errors. Do you want to proceed anyway? Some products may fail to import.`
      );
      if (!proceed) return;
    }

    try {
      await importProducts(parsedProducts);
      alert('Import completed! Check the results below.');
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setParsedProducts([]);
    setValidationErrors([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const importStats = getImportStats();

  return (
    <div className="bulk-product-import" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Bulk Product Import</h2>
      
      {/* File Upload Section */}
      <div className="upload-section" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>1. Select Excel File</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          disabled={isLoading}
          style={{ marginBottom: '10px' }}
        />
        {selectedFile && (
          <div style={{ marginTop: '10px' }}>
            <p>Selected: {selectedFile.name}</p>
            <button onClick={handleClearFile} disabled={isLoading}>
              Clear File
            </button>
          </div>
        )}
      </div>

      {/* Validation Options Status */}
      <div className="validation-status" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>2. Validation Options</h3>
        {isLoading && !isValidationOptionsLoaded && <p>Loading validation options...</p>}
        {isValidationOptionsLoaded && validationOptions && (
          <div>
            <p>✅ Validation options loaded successfully</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '10px' }}>
              <div>
                <strong>Categories ({validationOptions.categories.length}):</strong>
                <ul style={{ fontSize: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                  {validationOptions.categories.map(cat => <li key={cat}>{cat}</li>)}
                </ul>
              </div>
              <div>
                <strong>Suppliers ({validationOptions.suppliers.length}):</strong>
                <ul style={{ fontSize: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                  {validationOptions.suppliers.map(sup => <li key={sup}>{sup}</li>)}
                </ul>
              </div>
              <div>
                <strong>Supermarkets ({validationOptions.supermarkets.length}):</strong>
                <ul style={{ fontSize: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                  {validationOptions.supermarkets.map(sup => <li key={sup}>{sup}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Preview */}
      {showPreview && (
        <div className="preview-section" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>3. Product Preview ({parsedProducts.length} products)</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <button onClick={handleValidate} disabled={isLoading || !isValidationOptionsLoaded}>
              Validate Products
            </button>
            <button 
              onClick={handleImport} 
              disabled={isLoading || parsedProducts.length === 0}
              style={{ marginLeft: '10px', backgroundColor: validationErrors.length > 0 ? '#ff9800' : '#4caf50', color: 'white' }}
            >
              {isLoading ? 'Importing...' : 'Import Products'}
            </button>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
              <h4 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>Validation Errors ({validationErrors.length}):</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {validationErrors.slice(0, 10).map((error, index) => (
                  <li key={index} style={{ color: '#d32f2f', fontSize: '14px' }}>{error}</li>
                ))}
                {validationErrors.length > 10 && (
                  <li style={{ color: '#d32f2f', fontSize: '14px' }}>... and {validationErrors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}

          {/* Products Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Supplier</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Supermarket</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Quantity</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {parsedProducts.slice(0, 10).map((product, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.name}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.category}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.supplier}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.supermarket}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.quantity}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>${product.price}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.expiry_date || 'N/A'}</td>
                  </tr>
                ))}
                {parsedProducts.length > 10 && (
                  <tr>
                    <td colSpan={7} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontStyle: 'italic' }}>
                      ... and {parsedProducts.length - 10} more products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Results */}
      {hasImportResult && importStats && (
        <div className="results-section" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>4. Import Results</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '15px' }}>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>{importStats.total}</div>
              <div>Total</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>{importStats.successful}</div>
              <div>Successful</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>{importStats.failed}</div>
              <div>Failed</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f3e5f5', borderRadius: '4px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2' }}>{importStats.successRate}%</div>
              <div>Success Rate</div>
            </div>
          </div>

          {lastImportResult && lastImportResult.errors.length > 0 && (
            <div style={{ padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
              <h4 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>Import Errors:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                {lastImportResult.errors.map((e, index) => (
                  <li key={index} style={{ color: '#d32f2f', fontSize: '14px', marginBottom: '5px' }}>
                    {typeof e === 'string' ? e : `${e.product?.name ?? 'Unknown'}: ${e.error ?? ''}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="instructions" style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Instructions</h3>
        <ol>
          <li><strong>Excel Format:</strong> Your Excel file should have columns: name, category, supplier, supermarket, quantity, price, cost_price (optional), selling_price (optional), expiry_date (optional)</li>
          <li><strong>Names:</strong> Use exact names as they appear in your system for categories, suppliers, and supermarkets</li>
          <li><strong>Validation:</strong> The system will validate all names against your database before importing</li>
          <li><strong>Error Handling:</strong> Products with errors will be skipped, but valid products will still be imported</li>
          <li><strong>Date Format:</strong> Use YYYY-MM-DD format for expiry dates</li>
        </ol>
      </div>
    </div>
  );
};

export default BulkProductImport;