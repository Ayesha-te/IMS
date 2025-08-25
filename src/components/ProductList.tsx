import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Package,
  Calendar,
  Search,
  Filter,
  BarChart3,
  FileText,
  Download,
  MapPin,
} from "lucide-react";
import type { Product, Supermarket } from "../types/Product";
import BarcodeTicketManager from "./BarcodeTicketManager";
import barcodeService from "../services/barcodeService";

interface ProductListProps {
  products: Product[];
  supermarkets?: Supermarket[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  fallbackStoreName?: string; // used when resolution fails
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  supermarkets = [],
  onEdit,
  onDelete,
  fallbackStoreName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showBarcodeManager, setShowBarcodeManager] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(c => !!c && String(c).trim() !== "")))
  ] as string[];

  // Helper function to get supermarket name and details
  const getSupermarketInfo = (supermarketId: string) => {
    if (!supermarketId) return { name: 'Unknown Store', address: '', isSubStore: false };
    
    // Try by ID first
    const byId = supermarkets.find(s => String(s.id) === String(supermarketId));
    if (byId) return { name: byId.name, address: byId.address, isSubStore: byId.isSubStore || false };
    
    // Then try by name (handles older data where supermarketId stored the name)
    const byName = supermarkets.find(
      s => String(s.name).trim().toLowerCase() === String(supermarketId).trim().toLowerCase()
    );
    if (byName) return { name: byName.name, address: byName.address, isSubStore: byName.isSubStore || false };

    // Then try by address (handles cases where supermarketId stored the address/location)
    const byAddress = supermarkets.find(
      s => String(s.address || '').trim().toLowerCase() === String(supermarketId).trim().toLowerCase()
    );
    if (byAddress) return { name: byAddress.name, address: byAddress.address, isSubStore: byAddress.isSubStore || false };
    
    // Final fallback: use provided fallback name (e.g., navbar primary store) or generic label
    return { name: fallbackStoreName || 'Unknown Store', address: '', isSubStore: false };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || String(product.category).trim() === filterCategory;
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

  // Download individual barcode
  const downloadBarcode = async (product: Product) => {
    try {
      await barcodeService.downloadBarcodeImage(product.id, product.name);
    } catch (error) {
      console.error('Error downloading barcode:', error);
      alert('Failed to download barcode. Please try again.');
    }
  };

  // Download individual ticket
  const downloadTicket = async (product: Product) => {
    try {
      await barcodeService.downloadTicketPDF(product.id, product.name);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  if (showBarcodeManager) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowBarcodeManager(false)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Product List
          </button>
        </div>
        <BarcodeTicketManager
          products={filteredProducts}
          selectedProducts={selectedProducts}
          onSelectionChange={setSelectedProducts}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product Inventory</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBarcodeManager(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Barcode & Tickets</span>
          </button>
        </div>
      </div>

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
                <th className="px-4 py-3">Supermarket</th>
                <th className="px-4 py-3">Barcode</th>
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
                const supermarketInfo = getSupermarketInfo(product.supermarketId);
                return (
                  <tr
                    key={product.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-bold">
                      {product.name}
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-blue-800">
                        {supermarketInfo.name}
                        {supermarketInfo.isSubStore && (
                          <span className="ml-1 px-1 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                            Sub
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {product.barcode}
                      </code>
                    </td>
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
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <ActionButton
                          color="blue"
                          icon={<Edit className="w-3 h-3" />}
                          label="Edit"
                          onClick={() => onEdit(product)}
                          size="sm"
                        />
                        <ActionButton
                          color="green"
                          icon={<BarChart3 className="w-3 h-3" />}
                          label="Barcode"
                          onClick={() => downloadBarcode(product)}
                          size="sm"
                        />
                        <ActionButton
                          color="purple"
                          icon={<FileText className="w-3 h-3" />}
                          label="Ticket"
                          onClick={() => downloadTicket(product)}
                          size="sm"
                        />
                        <ActionButton
                          color="red"
                          icon={<Trash2 className="w-3 h-3" />}
                          label="Delete"
                          onClick={() => {
                            if (
                              window.confirm("Delete this product permanently?")
                            ) {
                              onDelete(product.id);
                            }
                          }}
                          size="sm"
                        />
                      </div>
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
  size = "md",
}: {
  color: "blue" | "red" | "green" | "purple";
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  size?: "sm" | "md";
}) => {
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600",
    red: "bg-red-500 hover:bg-red-600",
    green: "bg-green-500 hover:bg-green-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} ${sizeClasses[size]} text-white rounded transition-colors flex items-center justify-center gap-1`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default ProductList;
