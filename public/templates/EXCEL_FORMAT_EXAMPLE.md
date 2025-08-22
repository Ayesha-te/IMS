# 📊 EXCEL FORMAT EXAMPLE
## Correct Format for Product Import

---

## ✅ **GOOD NEWS: Use Human-Readable Names!**

You can use **category names** and **supplier names** in your Excel file. The system automatically converts them to database IDs.

---

## 📝 **EXCEL TEMPLATE FORMAT**

### Required Columns (Must Have):
```
name | category | supplier | quantity | cost_price | selling_price | expiry_date
```

### Optional Columns (Nice to Have):
```
brand | weight | origin | description | barcode | halal_certified | halal_certification_body | location | price
```

---

## 📋 **COMPLETE EXAMPLE**

```csv
name,category,supplier,brand,quantity,cost_price,selling_price,expiry_date,weight,origin,description,barcode,halal_certified,halal_certification_body,location
"Coca Cola 330ml","Beverages","Coca Cola Company","Coca Cola",100,0.75,1.25,"2025-12-31","330ml","USA","Classic Coca Cola soft drink","123456789012",true,"JAKIM","Aisle 3, Shelf B"
"Chicken Breast 1kg","Meat","Fresh Farms Ltd","Fresh Farms",50,8.50,12.99,"2024-12-25","1kg","Malaysia","Fresh halal chicken breast","234567890123",true,"JAKIM","Freezer Section A"
"Basmati Rice 5kg","Grains","Rice Masters","Premium Rice",25,15.00,22.50,"2026-06-30","5kg","India","Premium basmati rice","345678901234",true,"JAKIM","Aisle 1, Shelf A"
"Fresh Milk 1L","Dairy","Pure Dairy","Pure",30,2.50,3.99,"2024-01-20","1L","Malaysia","Fresh whole milk","456789012345",true,"JAKIM","Dairy Section"
"Potato Chips 150g","Snacks","Snack Masters","Crispy",75,1.20,2.50,"2025-03-15","150g","Malaysia","Crispy potato chips","567890123456",true,"JAKIM","Aisle 2, Shelf C"
```

---

## 🔄 **WHAT HAPPENS BEHIND THE SCENES**

### Your Excel (Human-Readable):
```json
{
  "name": "Coca Cola 330ml",
  "category": "Beverages",           ← You write the name
  "supplier": "Coca Cola Company",   ← You write the name
  "cost_price": 0.75,
  "selling_price": 1.25,
  "expiry_date": "2025-12-31"
}
```

### System Converts to API Format:
```json
{
  "name": "Coca Cola 330ml", 
  "category": 1,                     ← System finds/creates ID
  "supplier": 2,                     ← System finds/creates ID
  "supermarket": 1,                  ← System assigns supermarket
  "cost_price": 0.75,
  "selling_price": 1.25,
  "expiry_date": "2025-12-31"
}
```

---

## 📊 **FIELD DETAILS**

| Field | Type | Required | Example | Notes |
|-------|------|----------|---------|-------|
| **name** | Text | ✅ Yes | "Coca Cola 330ml" | Product name |
| **category** | Text | ✅ Yes | "Beverages" | Will be created if new |
| **supplier** | Text | ✅ Yes | "Coca Cola Company" | Will be created if new |
| **quantity** | Number | ✅ Yes | 100 | Stock quantity |
| **cost_price** | Number | ✅ Yes | 0.75 | Your cost per unit |
| **selling_price** | Number | ✅ Yes | 1.25 | Your selling price |
| **expiry_date** | Date | ✅ Yes | "2025-12-31" | YYYY-MM-DD format |
| **brand** | Text | ❌ No | "Coca Cola" | Brand name |
| **weight** | Text | ❌ No | "330ml" | Weight/size |
| **origin** | Text | ❌ No | "USA" | Country of origin |
| **description** | Text | ❌ No | "Classic soft drink" | Product description |
| **barcode** | Text | ❌ No | "123456789012" | Auto-generated if empty |
| **halal_certified** | Boolean | ❌ No | true | true/false |
| **halal_certification_body** | Text | ❌ No | "JAKIM" | Certification body |
| **location** | Text | ❌ No | "Aisle 3, Shelf B" | Storage location |
| **price** | Number | ❌ No | 1.25 | Display price (defaults to selling_price) |

---

## ✅ **VALIDATION RULES**

### Required Fields:
- All required fields must have values
- Cannot be empty or blank

### Data Types:
- **Numbers**: Use decimal format (e.g., 10.99, not $10.99)
- **Dates**: Use YYYY-MM-DD format (e.g., 2025-12-31)
- **Boolean**: Use true/false (not yes/no)
- **Text**: Can contain any characters

### Business Rules:
- **Selling price** should be ≥ cost price
- **Expiry date** should be in the future
- **Quantity** should be ≥ 0

---

## 🎯 **CATEGORY & SUPPLIER EXAMPLES**

### Common Categories:
```
Beverages, Meat, Dairy, Snacks, Frozen, Bakery, 
Condiments, Grains, Fruits, Vegetables, Cleaning, 
Personal Care, Household, Electronics, Other
```

### Example Suppliers:
```
Coca Cola Company, Fresh Farms Ltd, Pure Dairy, 
Rice Masters, Snack Masters, Local Supplier, 
Import Trading Co, Wholesale Distributors
```

---

## 💡 **PRO TIPS**

### For Categories:
- Use consistent naming (e.g., always "Beverages", not sometimes "Drinks")
- Keep names simple and clear
- New categories are automatically created

### For Suppliers:
- Use full company names for clarity
- Be consistent with naming
- New suppliers are automatically created with basic info

### For Dates:
- Always use YYYY-MM-DD format
- Excel may auto-format dates - check before saving
- Future dates are recommended for expiry

### For Prices:
- Use decimal numbers only (no currency symbols)
- Cost price = what you pay
- Selling price = what customers pay
- Price field is optional (defaults to selling_price)

---

## ⚠️ **COMMON MISTAKES TO AVOID**

| ❌ Wrong | ✅ Correct | Issue |
|----------|------------|-------|
| `$10.99` | `10.99` | Remove currency symbols |
| `31/12/2025` | `2025-12-31` | Use YYYY-MM-DD format |
| `yes` | `true` | Use true/false for booleans |
| Empty required field | Fill with data | All required fields needed |
| `Beverages` vs `beverages` | `Beverages` | Be consistent with naming |

---

## 🔧 **TROUBLESHOOTING**

### Import Fails:
1. Check all required columns are present
2. Verify date format is YYYY-MM-DD
3. Ensure numbers don't have currency symbols
4. Make sure no required fields are empty

### Categories/Suppliers Not Found:
- Don't worry! They'll be created automatically
- Use consistent spelling for better organization

### Data Looks Wrong:
- Always review the preview before confirming import
- Edit any incorrect information
- Use manual entry for complex products

---

## 📞 **NEED HELP?**

1. Download the template file for the correct format
2. Use the quick reference card for common issues
3. Check the complete import guide for detailed instructions
4. Contact support if problems persist

---

**Remember**: The system is designed to be user-friendly. Use names you recognize, and let the system handle the technical conversion to database IDs!