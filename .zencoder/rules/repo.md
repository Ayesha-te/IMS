# Repository Overview

- **Name**: IMS (Inventory Management System)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Key Features**:
  - Authentication (JWT via custom backend endpoints)
  - Supermarket and Sub-store management
  - Product catalog, barcode and ticket generation
  - Excel-based bulk import with name-to-ID mapping and auto-supermarket creation
  - POS sync scaffolding

## Structure
- **src/components**: UI components (Dashboard, ProductCatalog, ExcelUpload, BarcodeTicketManager, etc.)
- **src/services**: API integrations (apiService with AuthService, ProductService, CategoryService, SupplierService, SupermarketService, MappingService utilities)
- **src/utils**: Helpers (excel parsing/templates, debug tools)
- **src/context**: Auth provider and Store context
- **src/features**: Feature pages
- **public/templates**: Import guides and templates

## Backend
- **Base URL**: From config `src/config/api.ts` (Render backend)
- **Endpoints**: See `src/services/apiService.ts` (AUTH, ACCOUNTS, INVENTORY, SUPERMARKETS, etc.)

## Notable Behaviors
- **Auth**: Tokens stored in localStorage; login accepts `{ tokens: {access, refresh} }` or `{ access, refresh }`.
- **Excel Import**: `ExcelUpload` uses `handleExcelUploadEnhanced` and API mapping services to convert names→IDs.
- **Mapping**: When supermarket name isn't found, app attempts to create it (with defaults) then clears cache.
- **Barcode/Ticket**: `barcodeService` downloads images/PDFs; `BarcodeTicketManager` handles bulk.

## Known Improvements
- Ensure MappingService implementation is complete in `apiService.ts` (fetchMappings, converters present).
- Type guard/strictness in some components (e.g., product price display).
- Add robust error toasts instead of `alert()`.

## Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## Notes
- Keep `.env`/config in `src/config/api.ts` aligned with backend.
- Ensure CORS and token headers for file downloads.