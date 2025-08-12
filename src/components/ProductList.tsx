import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Package,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import type { Product } from "../types/Product";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (expiry <= now) return "expired";
    if (expiry <= thirtyDays) return "expiring";
    return "fresh";
  };

  const expiryColorClasses: Record<string, string> = {
    expired: "bg-red-100 text-red-800 border-red-200",
    expiring: "bg-amber-100 text-amber-800 border-amber-200",
    fresh: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <div>
      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white/80"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white/80 appearance-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No products found
          </h3>
          <p className="text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const status = getExpiryStatus(product.expiryDate);
                return (
                  <tr
                    key={product.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-bold">
                      {product.name}
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">{product.quantity}</td>
                    <td className="px-4 py-3">${product.price}</td>
                    <td className="px-4 py-3">{product.supplier}</td>
                    <td className="px-4 py-3">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${expiryColorClasses[status]}`}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(product.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <ActionButton
                        color="blue"
                        icon={<Edit className="w-4 h-4 mr-1" />}
                        label="Edit"
                        onClick={() => onEdit(product)}
                      />
                      <ActionButton
                        color="red"
                        icon={<Trash2 className="w-4 h-4 mr-1" />}
                        label="Delete"
                        onClick={() => {
                          if (
                            window.confirm("Delete this product permanently?")
                          ) {
                            onDelete(product.id);
                          }
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({
  color,
  icon,
  label,
  onClick,
}: {
  color: "blue" | "red";
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => {
  const colorClasses =
    color === "blue"
      ? "bg-blue-500 hover:bg-blue-600"
      : "bg-red-500 hover:bg-red-600";
  return (
    <button
      onClick={onClick}
      className={`flex-1 ${colorClasses} text-white px-3 py-1 rounded-lg transition-colors flex items-center justify-center text-sm`}
    >
      {icon}
      {label}
    </button>
  );
};

export default ProductList;
