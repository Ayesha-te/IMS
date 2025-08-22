import React, { useState, useRef } from 'react';
import { Download, Printer, QrCode, BarChart3, FileText, Grid3X3, CheckSquare } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ProductTicket from './ProductTicket';
import BarcodeGenerator from './BarcodeGenerator';
import barcodeService from '../services/barcodeService';
import type { Product } from '../types/Product';

// Safely coerce price-like values (string/number/null) to a number for display
const toMoney = (v: unknown): number => {
  const n = Number.parseFloat(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
};

interface BarcodeTicketManagerProps {
  products: Product[];
  selectedProducts?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

const BarcodeTicketManager: React.FC<BarcodeTicketManagerProps> = ({
  products,
  selectedProducts = [],
  onSelectionChange
}) => {
  const [viewMode, setViewMode] = useState<'tickets' | 'barcodes'>('tickets');
  const [includeQR, setIncludeQR] = useState(true);
  const [ticketSize, setTicketSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [selectAll, setSelectAll] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    if (!onSelectionChange) return;
    
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    
    onSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectAll) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  // Get selected products
  const getSelectedProducts = () => {
    return products.filter(p => selectedProducts.includes(p.id));
  };

  // Print function
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Product ${viewMode === 'tickets' ? 'Tickets' : 'Barcodes'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `
  });

  // Export to PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`product-${viewMode}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Download individual barcode
  const downloadBarcode = async (product: Product) => {
    try {
      await barcodeService.downloadBarcodeImage(product.id, product.name);
    } catch (error) {
      console.error('Error downloading barcode:', error);
      alert('Failed to download barcode. Please try again.');
    }
  };

  // Download individual ticket
  const downloadTicket = async (product: Product) => {
    try {
      await barcodeService.downloadTicketPDF(product.id, product.name, includeQR);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  // Download bulk tickets
  const downloadBulkTickets = async () => {
    try {
      await barcodeService.downloadBulkTickets(selectedProducts, 8);
    } catch (error) {
      console.error('Error downloading bulk tickets:', error);
      alert('Failed to download bulk tickets. Please try again.');
    }
  };

  // Download bulk barcodes
  const downloadBulkBarcodes = async () => {
    try {
      await barcodeService.downloadBulkBarcodes(selectedProducts, 20);
    } catch (error) {
      console.error('Error downloading bulk barcodes:', error);
      alert('Failed to download bulk barcodes. Please try again.');
    }
  };

  const selectedProductsData = getSelectedProducts();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">Barcode & Ticket Manager</h2>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('tickets')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                viewMode === 'tickets' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tickets</span>
            </button>
            <button
              onClick={() => setViewMode('barcodes')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                viewMode === 'barcodes' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Barcodes</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {selectedProductsData.length > 0 && (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print ({selectedProductsData.length})</span>
              </button>
              
              <button
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              {viewMode === 'tickets' ? (
                <button
                  onClick={downloadBulkTickets}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Tickets</span>
                </button>
              ) : (
                <button
                  onClick={downloadBulkBarcodes}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Download Barcodes</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Select All */}
        <button
          onClick={handleSelectAll}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <CheckSquare className={`w-4 h-4 ${selectAll ? 'text-blue-600' : 'text-gray-400'}`} />
          <span>Select All</span>
        </button>

        {viewMode === 'tickets' && (
          <>
            {/* Include QR Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeQR}
                onChange={(e) => setIncludeQR(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include QR Code</span>
            </label>

            {/* Ticket Size */}
            <select
              value={ticketSize}
              onChange={(e) => setTicketSize(e.target.value as 'small' | 'medium' | 'large')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="small">Small Tickets</option>
              <option value="medium">Medium Tickets</option>
              <option value="large">Large Tickets</option>
            </select>
          </>
        )}

        <div className="text-sm text-gray-600">
          {selectedProductsData.length} of {products.length} products selected
        </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {products.map((product) => (
          <div
            key={product.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedProducts.includes(product.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleProductSelect(product.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-800 truncate flex-1">{product.name}</h3>
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => handleProductSelect(product.id)}
                className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <div>Price: $${toMoney(product.price).toFixed(2)}</div>
              <div>Barcode: {product.barcode}</div>
              {product.category && <div>Category: {product.category}</div>}
            </div>

            <div className="flex items-center justify-between mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadBarcode(product);
                }}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <BarChart3 className="w-3 h-3 inline mr-1" />
                Barcode
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTicket(product);
                }}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <FileText className="w-3 h-3 inline mr-1" />
                Ticket
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Print Preview */}
      {selectedProductsData.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Preview ({selectedProductsData.length} items)
          </h3>
          
          <div 
            ref={printRef}
            className="bg-white p-4 border border-gray-200 rounded-lg max-h-96 overflow-y-auto"
          >
            {viewMode === 'tickets' ? (
              <div className={`grid gap-4 ${
                ticketSize === 'small' ? 'grid-cols-3' : 
                ticketSize === 'medium' ? 'grid-cols-2' : 
                'grid-cols-1'
              }`}>
                {selectedProductsData.map((product) => (
                  <ProductTicket
                    key={product.id}
                    product={product}
                    includeQR={includeQR}
                    ticketSize={ticketSize}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {selectedProductsData.map((product) => (
                  <div key={product.id} className="text-center p-4 border border-gray-200 rounded">
                    <BarcodeGenerator 
                      value={product.barcode}
                      width={1.5}
                      height={60}
                      fontSize={12}
                    />
                    <div className="mt-2 text-sm">
                      <div className="font-medium truncate">{product.name}</div>
                      <div className="text-gray-600">${toMoney(product.price).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeTicketManager;