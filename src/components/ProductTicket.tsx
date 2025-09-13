import React, { forwardRef } from 'react';
import BarcodeGenerator from './BarcodeGenerator';
import QRCodeGenerator from './QRCodeGenerator';
import type { Product } from '../types/Product';

// Safely coerce price-like values (string/number/null) to a number for display
const toMoney = (v: unknown): number => {
  const n = Number.parseFloat(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
};

interface ProductTicketProps {
  product: Product;
  includeQR?: boolean;
  ticketSize?: 'small' | 'medium' | 'large';
  className?: string;
}

const ProductTicket = forwardRef<HTMLDivElement, ProductTicketProps>(({
  product,
  includeQR = true,
  ticketSize = 'medium',
  className = ''
}, ref) => {
  const sizeClasses = {
    small: 'w-64 min-h-56',
    medium: 'w-80 min-h-72',
    large: 'w-96 min-h-80'
  };

  const qrData = JSON.stringify({
    name: product.name,
    barcode: product.barcode,
    price: product.price,
    id: product.id
  });

  // Size-based dimensions - adjusted for better scaling
  const dimensions = {
    small: { qrSize: 30, barcodeHeight: 25, fontSize: 9, titleSize: 12, priceSize: 16, padding: 2 },
    medium: { qrSize: 40, barcodeHeight: 30, fontSize: 11, titleSize: 14, priceSize: 20, padding: 3 },
    large: { qrSize: 50, barcodeHeight: 35, fontSize: 13, titleSize: 16, priceSize: 24, padding: 4 }
  };

  return (
    <div 
      ref={ref}
      className={`bg-white border-2 border-gray-300 border-dashed flex flex-col ${sizeClasses[ticketSize]} ${className}`}
      style={{ 
        pageBreakInside: 'avoid', 
        position: 'relative', 
        zIndex: 1,
        padding: `${dimensions[ticketSize].padding * 4}px`
      }}
    >
      {/* Header */}
      <div className="text-center" style={{ marginBottom: `${dimensions[ticketSize].padding * 2}px` }}>
        <h3 
          className="font-bold text-gray-800 mb-1 leading-tight"
          style={{ 
            fontSize: `${dimensions[ticketSize].titleSize}px`,
            wordWrap: 'break-word',
            hyphens: 'auto'
          }}
        >
          {product.name}
        </h3>
        <div 
          className="font-bold text-green-600"
          style={{ 
            fontSize: `${dimensions[ticketSize].priceSize}px`,
            marginBottom: `${dimensions[ticketSize].padding * 2}px`
          }}
        >
          ${toMoney(product.price).toFixed(2)}
        </div>
      </div>

      {/* Barcode */}
      <div 
        className="flex items-center justify-center"
        style={{ marginBottom: `${dimensions[ticketSize].padding * 3}px` }}
      >
        <BarcodeGenerator 
          value={product.barcode || ''}
          width={ticketSize === 'small' ? 1.2 : ticketSize === 'medium' ? 1.5 : 1.8}
          height={dimensions[ticketSize].barcodeHeight}
          fontSize={dimensions[ticketSize].fontSize}
          className="max-w-full"
        />
      </div>

      {/* Product Details */}
      <div 
        className="text-center flex-1" 
        style={{ 
          fontSize: `${dimensions[ticketSize].fontSize}px`,
          lineHeight: '1.3',
          marginBottom: `${dimensions[ticketSize].padding * 2}px`
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${dimensions[ticketSize].padding}px` }}>
          {product.brand && (
            <div className="text-gray-600">
              <span className="font-medium">Brand:</span> {product.brand}
            </div>
          )}
          
          {product.category && (
            <div className="text-gray-600">
              <span className="font-medium">Category:</span> {product.category}
            </div>
          )}
          
          {product.weight && (
            <div className="text-gray-600">
              <span className="font-medium">Weight:</span> {product.weight}
            </div>
          )}
        </div>
      </div>

      {/* QR Code (if enabled) - positioned within ticket bounds */}
      {includeQR && (
        <div 
          className="flex justify-center items-center" 
          style={{ 
            marginTop: `${dimensions[ticketSize].padding * 2}px`,
            minHeight: `${dimensions[ticketSize].qrSize + dimensions[ticketSize].padding * 2}px`
          }}
        >
          <QRCodeGenerator 
            value={qrData}
            size={dimensions[ticketSize].qrSize}
            className="opacity-75"
          />
        </div>
      )}
    </div>
  );
});

ProductTicket.displayName = 'ProductTicket';

export default ProductTicket;