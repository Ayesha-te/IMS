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
  description?: string;
  brand?: string;
  weight?: string;
  origin?: string;
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