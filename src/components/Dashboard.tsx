import React from 'react';
import { Package } from 'lucide-react';
import type { Product } from '../types/Product';
import ProductList from './ProductList';
import ExpiryAlerts from './ExpiryAlerts';
import StatsCards from './StatsCards';

interface DashboardProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, onEditProduct, onDeleteProduct }) => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <StatsCards products={products} />
      
      {/* Expiry Alerts */}
      <ExpiryAlerts products={products} />

      {/* Product List */}
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

        {/* Product Grid - handled inside ProductList */}
        <ProductList 
          products={products} 
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
        />
      </div>
    </div>
  );
};

export default Dashboard;
