import React from 'react';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import type { Product } from '../types/Product';


interface ExpiryAlertsProps {
  products: Product[];
}

const ExpiryAlerts: React.FC<ExpiryAlertsProps> = ({ products }) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringProducts = products.filter(product => {
    const expiryDate = new Date(product.expiryDate);
    return expiryDate <= thirtyDaysFromNow && expiryDate > now;
  });

  const expiredProducts = products.filter(product => {
    const expiryDate = new Date(product.expiryDate);
    return expiryDate <= now;
  });

  if (expiringProducts.length === 0 && expiredProducts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-xl mr-4">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">All Products Fresh</h3>
            <p className="text-green-600">No products are expiring within the next 30 days.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expiredProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-2 rounded-xl mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Expired Products</h3>
              <p className="text-red-600">These products have already expired and need immediate attention.</p>
            </div>
          </div>
          <div className="space-y-2">
            {expiredProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between bg-red-100 p-3 rounded-xl">
                <div>
                  <p className="font-semibold text-red-800">{product.name}</p>
                  <p className="text-sm text-red-600">Expired: {new Date(product.expiryDate).toLocaleDateString()}</p>
                </div>
                <span className="text-red-700 font-medium">Qty: {product.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiringProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-amber-100 p-2 rounded-xl mr-4">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800">Expiring Soon</h3>
              <p className="text-amber-600">These products will expire within 30 days.</p>
            </div>
          </div>
          <div className="space-y-2">
            {expiringProducts.map(product => {
              const expiryDate = new Date(product.expiryDate);
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={product.id} className="flex items-center justify-between bg-amber-100 p-3 rounded-xl">
                  <div>
                    <p className="font-semibold text-amber-800">{product.name}</p>
                    <p className="text-sm text-amber-600">
                      Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} ({expiryDate.toLocaleDateString()})
                    </p>
                  </div>
                  <span className="text-amber-700 font-medium">Qty: {product.quantity}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryAlerts;