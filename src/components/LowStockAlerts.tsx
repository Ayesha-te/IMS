import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import type { Product } from '../types/Product';
import { DEFAULT_REORDER_LEVEL } from '../constants/inventory';

interface LowStockAlertsProps {
  products: Product[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
  const lowStockProducts = products.filter(p => {
    const threshold = typeof p.minStockLevel === 'number' ? p.minStockLevel : DEFAULT_REORDER_LEVEL;
    return typeof p.quantity === 'number' && p.quantity <= threshold;
  });

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-xl mr-4">
            <Package className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Stock Levels Healthy</h3>
            <p className="text-green-600">No products are at or below their reorder level.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
      <div className="flex items-center mb-4">
        <div className="bg-red-100 p-2 rounded-xl mr-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-800">Low Stock Alerts</h3>
          <p className="text-red-600">These products have reached their reorder level.</p>
        </div>
      </div>
      <div className="space-y-2">
        {lowStockProducts.map(product => (
          <div key={product.id} className="flex items-center justify-between bg-red-100 p-3 rounded-xl">
            <div>
              <p className="font-semibold text-red-800">{product.name}</p>
              <p className="text-sm text-red-600">
                Qty: {product.quantity} (Reorder 

 
                {typeof product.minStockLevel === 'number' ? product.minStockLevel : DEFAULT_REORDER_LEVEL})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlerts;