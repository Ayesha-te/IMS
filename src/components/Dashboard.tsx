import React from 'react';
import { Package } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';
import ProductList from './ProductList';

interface DashboardProps {
  products: Product[];
  supermarkets?: Supermarket[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  fallbackStoreName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ products, supermarkets, onEditProduct, onDeleteProduct, fallbackStoreName }) => {
  return (
    <div className="space-y-8">
      {/* Inventory Overview */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Inventory Overview</h2>
            <p className="text-gray-600">Manage your inventory products</p>
          </div>
          <div className="bg-rose-100 p-3 rounded-xl">
            <Package className="w-6 h-6 text-rose-600" />
          </div>
        </div>

        {/* Product List */}
        <ProductList 
          products={products} 
          supermarkets={supermarkets}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
          fallbackStoreName={fallbackStoreName}
        />
      </div>
    </div>
  );
};

export default Dashboard;
