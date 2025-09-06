interface ProductInterface {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;
  supplier: string;
  price: number;
  addedDate: string;
  supermarketId: string;
  supermarketName?: string;
  description?: string;
  brand?: string;
  weight?: string;
  origin?: string;
  imageUrl?: string;
  barcode?: string;
  // halalCertified: boolean;
  // halalCertificationBody?: string;
  costPrice?: number;
  sellingPrice?: number;
  minStockLevel?: number;
  location?: string; // Aisle/shelf location
  syncedWithPOS?: boolean;
  posId?: string;
}

interface SupermarketInterface {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  registrationDate: string;
  isVerified: boolean;
  logo?: string;
  description?: string;
  parentId?: string; // For sub-store relationship
  isSubStore?: boolean;
  ownerId: string; // User ID who owns this supermarket
  posSystem?: {
    enabled: boolean;
    type: 'square' | 'shopify' | 'custom' | 'none';
    apiKey?: string;
    syncEnabled: boolean;
    lastSync?: string;
  };
}

interface UserInterface {
  id: string;
  email: string;
  name: string;
  registrationDate: string;
  isVerified: boolean;
  company_name?: string;
  address?: string;
  phone?: string;
  subscription?: {
    plan: 'free' | 'basic' | 'premium';
    expiryDate?: string;
  };
}

interface UploadSession {
  id: string;
  type: 'excel' | 'image';
  status: 'uploading' | 'processing' | 'completed' | 'error';
  fileName?: string;
  progress: number;
  extractedData?: Partial<Product>[];
  error?: string;
  createdAt: string;
}

export type Product = ProductInterface;
export type Supermarket = SupermarketInterface;
export type User = UserInterface;
export type UploadSessionType = UploadSession;