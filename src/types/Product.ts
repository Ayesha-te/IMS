interface ProductInterface {
  id: string;
  name: string;
  barcode: string;
  category: string;
  quantity: number;
  expiryDate: string;
  halalCertified: boolean;
  supplier: string;
  price: number;
  addedDate: string;
  supermarketId: string;
  description?: string;
  brand?: string;
  weight?: string;
  origin?: string;
  halalCertificationBody?: string;
  imageUrl?: string;
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
}

export type Product = ProductInterface;
export type Supermarket = SupermarketInterface;