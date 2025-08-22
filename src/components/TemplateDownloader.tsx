import React from 'react';
import { Download, FileText, Image, FileSpreadsheet } from 'lucide-react';

interface TemplateDownloaderProps {
  className?: string;
}

const TemplateDownloader: React.FC<TemplateDownloaderProps> = ({ className = '' }) => {
  
  const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcelTemplate = () => {
    const csvContent = `name,category,supplier,brand,quantity,cost_price,selling_price,expiry_date,weight,origin,description,barcode,halal_certified,halal_certification_body,location
"Coca Cola 330ml","Beverages","Coca Cola Company","Coca Cola",100,0.75,1.25,"2025-12-31","330ml","USA","Classic Coca Cola soft drink","123456789012",true,"JAKIM","Aisle 3, Shelf B"
"Chicken Breast 1kg","Meat","Fresh Farms Ltd","Fresh Farms",50,8.50,12.99,"2024-12-25","1kg","Malaysia","Fresh halal chicken breast","234567890123",true,"JAKIM","Freezer Section A"
"Basmati Rice 5kg","Grains","Rice Masters","Premium Rice",25,15.00,22.50,"2026-06-30","5kg","India","Premium basmati rice","345678901234",true,"JAKIM","Aisle 1, Shelf A"`;
    
    downloadFile('product_import_template.csv', csvContent, 'text/csv');
  };

  const downloadQuickReference = () => {
    const content = `QUICK REFERENCE CARD - Product Import
=====================================

EXCEL IMPORT - REQUIRED COLUMNS:
name | category | supplier | quantity | cost_price | selling_price | expiry_date

EXAMPLE ROW:
"Coca Cola 330ml" | "Beverages" | "Coca Cola Co" | 100 | 0.75 | 1.25 | "2025-12-31"

DATE FORMAT: YYYY-MM-DD (e.g., 2025-12-31)
PRICE FORMAT: Decimal numbers (e.g., 10.99)
BOOLEAN FORMAT: true/false

IMAGE SCAN - PHOTO TIPS:
✅ DO: Use good lighting, hold steady, fill frame, capture front label
❌ DON'T: Use flash, take blurry photos, include multiple products

COMMON ERRORS & FIXES:
• "Date format invalid" → Use YYYY-MM-DD
• "Price must be number" → Remove $ signs, use decimals  
• "Required field missing" → Fill all required columns
• "Image too blurry" → Retake with better focus

QUICK HELP:
Excel Issues: Download template, check format
Image Issues: Better lighting, steady camera
Data Issues: Review before saving
Missing Info: Use manual entry to complete`;

    downloadFile('quick_reference_card.txt', content);
  };

  const downloadFullGuide = () => {
    const content = `PRODUCT IMPORT GUIDE - Halal Inventory Management System
========================================================

OVERVIEW:
This guide covers three import methods:
1. Manual Entry - Individual product entry
2. Excel Import - Bulk import from spreadsheets  
3. Image Scan - AI-powered extraction from photos

EXCEL IMPORT METHOD:
===================

Required Columns:
• name - Product name (e.g., "Coca Cola 330ml")
• category - Category name (e.g., "Beverages")
• supplier - Supplier name (e.g., "Coca Cola Company")
• quantity - Stock quantity (e.g., 100)
• cost_price - Cost price in dollars (e.g., 0.75)
• selling_price - Selling price in dollars (e.g., 1.25)
• expiry_date - Expiry date YYYY-MM-DD (e.g., "2025-12-31")

Optional Columns:
• brand, weight, origin, description, barcode, location
• halal_certified (true/false), halal_certification_body

Steps:
1. Download template
2. Fill your data following the format
3. Save as .xlsx, .xls, or .csv
4. Upload using "Choose File"
5. Review extracted data
6. Click "Import Products"

IMAGE SCAN METHOD:
==================

Photo Guidelines:
• Use good lighting (natural daylight best)
• Hold camera steady, avoid blur
• Position product label facing camera
• Fill most of frame with product
• Capture front label with name clearly visible
• Include barcode and expiry date if visible

What AI Can Extract:
• Product name & brand
• Weight/size information  
• Barcode numbers
• Expiry dates
• Price (if visible)
• Halal certification logos

Steps:
1. Read photo guidelines
2. Take photo or upload image
3. Wait for AI processing
4. Review and edit extracted data
5. Fill missing required fields
6. Save product

MANUAL ENTRY METHOD:
====================

Required Fields:
• Product Name, Category, Supplier
• Quantity, Cost Price, Selling Price
• Expiry Date

Optional Fields:
• Brand, Weight, Origin, Description
• Storage Location, Halal Certification
• Barcode (auto-generated if empty)

BEST PRACTICES:
===============

Excel Import:
• Always use the provided template
• Test with small batch first
• Use consistent naming
• Proper date formats (YYYY-MM-DD)

Image Scan:
• Take clear, well-lit photos
• Capture multiple angles if needed
• Always review extracted data
• Fill missing required information

Manual Entry:
• Use barcode generator for new products
• Set up categories and suppliers first
• Enter complete information
• Double-check expiry dates

TROUBLESHOOTING:
================

Import Fails:
• Check all required fields filled
• Verify date formats correct
• Ensure numeric fields contain only numbers

Categories/Suppliers Not Found:
• Auto-created, no action needed
• Use consistent spelling

Image Recognition Poor:
• Retake with better lighting
• Ensure text clearly visible
• Try different angles

Data Looks Wrong:
• Always review extracted data
• Edit incorrect information
• Use manual entry for complex products

For more help, check in-app help sections or contact administrator.`;

    downloadFile('product_import_guide.txt', content);
  };

  return (
    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <FileText className="w-6 h-6 text-rose-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-800">📋 Import Templates & Guides</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Download templates and guides to help you import products successfully using Excel, images, or manual entry.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h4 className="font-semibold text-blue-800 mb-2">Excel Template</h4>
          <p className="text-sm text-blue-700 mb-3">
            CSV template with sample data and correct format for bulk import
          </p>
          <button
            onClick={downloadExcelTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center mx-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </button>
        </div>

        <div className="bg-green-50 rounded-xl p-4 text-center">
          <Image className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h4 className="font-semibold text-green-800 mb-2">Quick Reference</h4>
          <p className="text-sm text-green-700 mb-3">
            Printable quick reference card with key formats and tips
          </p>
          <button
            onClick={downloadQuickReference}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center mx-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Card
          </button>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h4 className="font-semibold text-purple-800 mb-2">Complete Guide</h4>
          <p className="text-sm text-purple-700 mb-3">
            Comprehensive guide covering all import methods and troubleshooting
          </p>
          <button
            onClick={downloadFullGuide}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center mx-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Guide
          </button>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <h5 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips:</h5>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>First time?</strong> Start with the Excel template to understand the format</li>
          <li>• <strong>Bulk import?</strong> Use Excel method for multiple products at once</li>
          <li>• <strong>Quick entry?</strong> Use image scan for individual products with photos</li>
          <li>• <strong>Complex products?</strong> Use manual entry for full control over all fields</li>
        </ul>
      </div>
    </div>
  );
};

export default TemplateDownloader;