import React from 'react';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';
import type { Product } from '../types/Product';

interface StatsCardsProps {
  products: Product[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ products }) => {
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringProducts = products.filter(product => {
    const expiryDate = new Date(product.expiryDate);
    return expiryDate <= thirtyDaysFromNow && expiryDate > now;
  }).length;

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Quantity',
      value: totalQuantity,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Expiring Soon',
      value: expiringProducts,
      icon: AlertTriangle,
      color: 'amber',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-xl`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
