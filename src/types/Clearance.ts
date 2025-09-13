// Types for Clearance deals
export type ClearanceType = 'bogo' | 'discount' | 'flat' | 'bundle';

export interface BundleItem {
  productId: string;
  productName?: string;
  quantity: number;
}

export interface ClearanceDeal {
  id: string;
  productId: string; // primary product
  productName?: string;
  type: ClearanceType;
  // For discount: percentage 0-100
  // For flat: newPrice
  value?: number; // percentage for discount or new price for flat

  // BOGO configurable
  bogoBuyX?: number;
  bogoGetY?: number;

  // Bundle: support N products
  bundleItems?: BundleItem[];

  // Legacy single-bundle UI (optional display)
  bundleProductId?: string;
  bundleProductName?: string;
  bundlePrice?: number; // optional if you later want bundle-level price

  expiresAt: string; // ISO date
  isActive?: boolean; // computed on backend ideally

  // Generated identifiers for clearance
  generatedSku?: string;
  generatedBarcode?: string;
}