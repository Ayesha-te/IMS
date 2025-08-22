import { useState, useEffect } from 'react';
import { 
  ProductService, 
  CategoryService, 
  SupplierService, 
  SupermarketService 
} from '../services/apiService';
import { useAuth } from './useAuth.tsx';

// Generic API hook
export const useApiData = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Products hook
export const useProducts = () => {
  const { token } = useAuth();
  return useApiData(async () => {
    const response = await ProductService.getProducts(token || undefined);
    const raw = Array.isArray(response) ? response : response?.results || [];

    // Map backend fields to frontend Product shape expected by UI
    const mapped = raw.map((p: any) => {
      // Normalize supermarket ID from API: can be ID, nested object, or separate field
      let normalizedSupermarketId = 'default';
      if (p.supermarket && typeof p.supermarket === 'object') {
        normalizedSupermarketId = String(p.supermarket.id ?? p.supermarket.pk ?? 'default');
      } else if (p.supermarket != null) {
        normalizedSupermarketId = String(p.supermarket);
      } else if (p.supermarket_id != null) {
        normalizedSupermarketId = String(p.supermarket_id);
      }

      return {
        id: String(p.id ?? ''),
        name: String(p.name ?? ''),
        // Prefer human-readable names if present
        category: String(p.category_name ?? p.category_name_display ?? p.category ?? ''),
        quantity: Number(p.quantity ?? 0),
        expiryDate: String(p.expiry_date ?? p.expiryDate ?? ''),
        supplier: String(p.supplier_name ?? p.supplier_name_display ?? p.supplier ?? ''),
        price: Number(p.selling_price ?? p.price ?? 0),
        addedDate: String(p.added_date ?? p.addedDate ?? new Date().toISOString()),
        supermarketId: normalizedSupermarketId,
        description: p.description ?? '',
        brand: p.brand ?? '',
        weight: p.weight ?? '',
        origin: p.origin ?? '',
        imageUrl: p.image ?? p.image_url ?? '',
        barcode: String(p.barcode ?? ''),
        halalCertified: (p.halal_certified ?? p.halalCertified) ?? true,
        halalCertificationBody: p.halal_certification_body ?? p.halalCertificationBody ?? '',
        costPrice: p.cost_price ?? undefined,
        sellingPrice: p.selling_price ?? p.price ?? undefined,
        minStockLevel: p.min_stock_level ?? undefined,
        location: p.location ?? '',
        syncedWithPOS: p.synced_with_pos ?? false,
        posId: p.pos_id ? String(p.pos_id) : undefined,
      };
    });

    console.log('Products fetched:', mapped.length);
    try {
      console.table(mapped.map((p: any) => ({ id: p.id, name: p.name, supermarketId: p.supermarketId })));
    } catch {}
    return mapped;
  }, [token]);
};

// Categories hook
export const useCategories = () => {
  const { token } = useAuth();
  return useApiData(async () => {
    const response = await CategoryService.getCategories(token || undefined);
    // Handle paginated response from DRF
    return Array.isArray(response) ? response : response.results || [];
  }, [token]);
};

// Suppliers hook
export const useSuppliers = () => {
  const { token } = useAuth();
  return useApiData(async () => {
    const response = await SupplierService.getSuppliers(token || undefined);
    // Handle paginated response from DRF
    return Array.isArray(response) ? response : response.results || [];
  }, [token]);
};

// Supermarkets hook
export const useSupermarkets = () => {
  const { token } = useAuth();
  return useApiData(async () => {
    const response = await SupermarketService.getSupermarkets(token || undefined);
    // Handle paginated/object response
    if (Array.isArray(response)) return response;
    if (response.supermarkets && Array.isArray(response.supermarkets)) return response.supermarkets;
    return response.results || [];
  }, [token]);
};

// Product stats hook
export const useProductStats = () => {
  const { token } = useAuth();
  return useApiData(() => ProductService.getProductStats(token || undefined), [token]);
};

// Supermarket stats hook
export const useSupermarketStats = () => {
  const { token } = useAuth();
  return useApiData(() => SupermarketService.getSupermarketStats(token || undefined), [token]);
};