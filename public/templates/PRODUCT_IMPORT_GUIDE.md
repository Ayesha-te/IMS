# 📋 PRODUCT IMPORT GUIDE
## Halal Inventory Management System

---

## 🎯 OVERVIEW

This guide provides comprehensive instructions for importing products into your inventory system using three different methods:

1. **📝 Manual Entry** - Individual product entry with full control
2. **📊 Excel Import** - Bulk import from spreadsheet files  
3. **📸 Image Scan** - AI-powered extraction from product photos

---

## 📊 EXCEL IMPORT METHOD

### Required Excel Format

Your Excel file must contain these **REQUIRED** columns:

| Column Name | Type | Description | Example |
|-------------|------|-------------|---------|
| `name` | Text | Product name | "Coca Cola 330ml" |
| `category` | Text | Category name | "Beverages" |
| `supplier` | Text | Supplier name | "Coca Cola Company" |
| `quantity` | Number | Stock quantity | 100 |
| `cost_price` | Number | Cost price in dollars | 0.75 |
| `selling_price` | Number | Selling price in dollars | 1.25 |
| `expiry_date` | Date | Expiry date (YYYY-MM-DD) | "2025-12-31" |

### Optional Excel Columns

| Column Name | Type | Description | Example |
|-------------|------|-------------|---------|
| `brand` | Text | Brand name | "Coca Cola" |
| `weight` | Text | Weight/size | "330ml" |
| `origin` | Text | Country of origin | "Malaysia" |
| `description` | Text | Product description | "Classic soft drink" |
| `barcode` | Text | Barcode number | "123456789012" |
| `halal_certified` | Boolean | Halal status | true |
| `halal_certification_body` | Text | Certification body | "JAKIM" |
| `location` | Text | Storage location | "Aisle 3, Shelf B" |
| `price` | Number | Display price | 1.25 |

### Excel Sample Data

```csv
name,category,supplier,brand,quantity,cost_price,selling_price,expiry_date,weight,origin,description,barcode,halal_certified,halal_certification_body,location
"Coca Cola 330ml","Beverages","Coca Cola Company","Coca Cola",100,0.75,1.25,"2025-12-31","330ml","USA","Classic Coca Cola soft drink","123456789012",true,"JAKIM","Aisle 3, Shelf B"
"Chicken Breast 1kg","Meat","Fresh Farms Ltd","Fresh Farms",50,8.50,12.99,"2024-12-25","1kg","Malaysia","Fresh halal chicken breast","234567890123",true,"JAKIM","Freezer Section A"
"Basmati Rice 5kg","Grains","Rice Masters","Premium Rice",25,15.00,22.50,"2026-06-30","5kg","India","Premium basmati rice","345678901234",true,"JAKIM","Aisle 1, Shelf A"
```

### Excel Import Steps

1. **Download Template**: Click "Download Template" to get the correct format
2. **Fill Data**: Enter your product information following the format
3. **Save File**: Save as .xlsx, .xls, or .csv format
4. **Upload**: Use the "Choose File" button to upload your file
5. **Review**: Check the extracted data for accuracy
6. **Confirm**: Click "Import Products" to add them to your inventory

### Common Excel Issues & Solutions

| Issue | Problem | Solution |
|-------|---------|----------|
| **Date Format Error** | Wrong date format | Use YYYY-MM-DD format (e.g., 2025-12-31) |
| **Price Format Error** | Non-numeric prices | Use decimal format (e.g., 10.99, not $10.99) |
| **Missing Required Fields** | Empty required columns | Fill all required fields before upload |
| **Category Not Found** | Unknown category | Categories will be auto-created |
| **Supplier Not Found** | Unknown supplier | Suppliers will be auto-created |

---

## 📸 IMAGE SCAN METHOD

### Photo Guidelines for Best Results

#### ✨ Lighting & Quality
- Use good lighting - natural daylight is best
- Avoid shadows on the product label
- Ensure text is clearly visible and not blurry
- Use high resolution (at least 1080p)
- Ensure the image is in focus
- Avoid reflections on glossy packaging
- Clean the camera lens before taking photos

#### 📐 Positioning & Content
- Hold the camera steady to avoid blur
- Position the product label facing the camera
- Fill most of the frame with the product
- Keep the camera parallel to the label for best text recognition
- Capture the front label with product name clearly visible
- Include nutritional information panel if available
- Show barcode if present
- Capture expiry date if visible on packaging

### What AI Can Extract

| Information Type | Description | Tips |
|------------------|-------------|------|
| **Product Name** | Main product name from label | Usually the largest text on package |
| **Brand** | Brand or manufacturer name | Often appears as logo or prominent text |
| **Category** | Product category (AI suggested) | Determined by product appearance and text |
| **Weight/Size** | Product weight, volume, or quantity | Look for ml, L, g, kg, oz, pieces |
| **Price** | Product price if visible | May appear as stickers or printed price |
| **Barcode** | Product barcode number | Usually 12-13 digits on back or side |
| **Expiry Date** | Best before or expiry date | Look for 'EXP', 'Best Before', 'Use By' |
| **Origin** | Country of origin | Look for 'Made in', 'Product of' |
| **Halal Certification** | Halal certification logos | Look for JAKIM, MUI, or other halal logos |

### Image Scan Steps

1. **Read Guidelines**: Review photo tips for best results
2. **Take Photo**: Use "Take Photo" or "Upload Image"
3. **AI Processing**: Wait for AI to extract information
4. **Review Data**: Check and edit extracted information
5. **Fill Missing**: Add required fields not detected
6. **Save Product**: Confirm to add to inventory

### Common Image Issues & Solutions

| Issue | Problem | Solution |
|-------|---------|----------|
| **Blurry Text** | AI cannot read unclear text | Retake with better focus and lighting |
| **Poor Lighting** | Dark images affect recognition | Use natural daylight or better lighting |
| **Partial Information** | AI only extracts some details | Take multiple photos from different angles |
| **Wrong Category** | AI suggests incorrect category | Manually select the correct category |
| **Missing Expiry Date** | Date not detected | Look for date stamps, enter manually |

---

## 📝 MANUAL ENTRY METHOD

### Required Fields

When entering products manually, you must provide:

- **Product Name** - Full product name
- **Category** - Select from dropdown or enter new
- **Supplier** - Supplier name (will be created if new)
- **Quantity** - Current stock quantity
- **Cost Price** - Your cost per unit
- **Selling Price** - Your selling price per unit
- **Expiry Date** - Product expiry date

### Optional Fields

- Brand name
- Weight/size information
- Country of origin
- Product description
- Storage location
- Halal certification details
- Barcode (auto-generated if empty)

---

## 🔄 DATA TRANSFORMATION

### How the System Handles Your Data

1. **Category Mapping**: Category names are converted to IDs
   - If category doesn't exist, it's automatically created
   - Use consistent naming for better organization

2. **Supplier Mapping**: Supplier names are converted to IDs
   - If supplier doesn't exist, it's automatically created
   - Maintains supplier contact information

3. **Price Handling**: Multiple price fields are processed
   - `cost_price`: Your purchase cost
   - `selling_price`: Your selling price
   - `price`: Display price (defaults to selling_price)

4. **Date Formatting**: Dates are standardized
   - Input: Various formats accepted
   - Output: YYYY-MM-DD format in database

5. **Barcode Generation**: Automatic barcode creation
   - If no barcode provided, system generates unique code
   - Ensures all products have scannable barcodes

---

## ✅ VALIDATION RULES

### Data Validation Checks

- **Required Fields**: All mandatory fields must be filled
- **Data Types**: Numbers must be numeric, dates must be valid
- **Price Logic**: Selling price should be ≥ cost price
- **Date Logic**: Expiry date should be in the future
- **Text Limits**: Field length limits enforced
- **Duplicate Check**: Barcode uniqueness verified

### Error Handling

- **Validation Errors**: Clear error messages provided
- **Auto-Correction**: System attempts to fix minor issues
- **Manual Review**: You can review and edit all data
- **Rollback**: Failed imports don't affect existing data

---

## 🎯 BEST PRACTICES

### For Excel Import
- Always download and use the provided template
- Test with a small batch first
- Keep consistent naming for categories and suppliers
- Use proper date formats (YYYY-MM-DD)
- Include all required fields

### For Image Scan
- Take clear, well-lit photos
- Capture multiple angles if needed
- Always review extracted data
- Fill in missing required information
- Use consistent category names

### For Manual Entry
- Use the barcode generator for new products
- Set up categories and suppliers first
- Enter complete product information
- Double-check expiry dates
- Use consistent naming conventions

---

## 🆘 TROUBLESHOOTING

### Common Issues

1. **Import Fails**
   - Check all required fields are filled
   - Verify date formats are correct
   - Ensure numeric fields contain only numbers

2. **Categories Not Found**
   - Categories are auto-created, no action needed
   - Use consistent spelling for better organization

3. **Suppliers Not Found**
   - Suppliers are auto-created, no action needed
   - You can edit supplier details later

4. **Image Recognition Poor**
   - Retake photo with better lighting
   - Ensure text is clearly visible
   - Try different angles

5. **Data Looks Wrong**
   - Always review extracted data
   - Edit any incorrect information
   - Use manual entry for complex products

---

## 📞 SUPPORT

If you encounter issues not covered in this guide:

1. Check the in-app help sections
2. Review error messages carefully
3. Try the alternative import methods
4. Contact system administrator

---

**Last Updated**: December 2024  
**Version**: 1.0  
**System**: Halal Inventory Management System