// Simple image-to-text extraction service placeholder.
// Returns detected fields from an image using a very light heuristic/mock until a real OCR is wired.
// Replace this with a real OCR (e.g., Tesseract.js, Azure Vision, Google Cloud Vision) when available.

export interface ExtractedProductFields {
  name?: string;
  brand?: string;
  weight?: string;
  price?: number;
  barcode?: string;
  expiryDate?: string; // ISO string yyyy-mm-dd if possible
  category?: string;
  confidence: number; // 0..1
}

export async function extractTextFromImage(imageFile: File): Promise<ExtractedProductFields> {
  // For now, we mock a deterministic response based on filename to keep UX consistent.
  // This avoids breaking the flow and allows backend to receive valid data.
  const lower = imageFile.name.toLowerCase();

  // Very naive parsing based on filename hints
  const guess = {
    name: lower.includes('honey') ? "Premium Organic Honey" : lower.includes('milk') ? 'Fresh Milk' : undefined,
    brand: lower.includes('nature') ? "Nature's Best" : lower.includes('brandx') ? 'BrandX' : undefined,
    weight: lower.match(/(\d{2,4})(g|ml|kg|l)/)?.[0]?.toUpperCase(),
    price: lower.match(/(\d+)(?:\.(\d{1,2}))?\$/) ? Number(lower.match(/(\d+)(?:\.(\d{1,2}))?\$/)![0].replace('$','')) : undefined,
    barcode: lower.match(/\b\d{12,13}\b/)?.[0],
    expiryDate: undefined,
    category: undefined,
  } as Partial<ExtractedProductFields>;

  // Simulate latency
  await new Promise(r => setTimeout(r, 800));

  return {
    name: guess.name || 'Product Name',
    brand: guess.brand || 'Generic',
    weight: guess.weight || '500g',
    price: guess.price ?? 9.99,
    barcode: guess.barcode || '789012345678',
    expiryDate: new Date(Date.now() + 1000*60*60*24*365).toISOString().split('T')[0],
    category: guess.name?.includes('honey') ? 'Condiments' : 'Other',
    confidence: 0.8,
  };
}
