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
    // DEBUG: inspect raw response supermarket-related fields
    try {
      const sample = raw.slice(0, 3).map((p: any) => ({
        id: p.id,
        supermarket: p.supermarket,
        supermarket_id: p.supermarket_id,
        supermarket_uuid: p.supermarket_uuid,
        supermarket_name: p.supermarket_name,
        store: p.store,
        store_id: p.store_id,
        store_name: p.store_name,
        market: p.market,
        market_id: p.market_id,
        market_name: p.market_name,
      }));
      // eslint-disable-next-line no-console
      console.table(sample);
      // eslint-disable-next-line no-console
      console.log('RAW_SUPERMARKET_FIELDS_JSON', JSON.stringify(sample));
    } catch {}

    const mapped = raw.map((p: any) => {
      // Normalize supermarket reference from many possible backend shapes
      const smObj = (val: any) => (val && typeof val === 'object') ? val : null;
      const firstTruthy = (...vals: any[]) => vals.find(v => v !== undefined && v !== null && String(v).trim() !== '');

      let normalizedSupermarketRef: string = 'default';
      const sm = firstTruthy(
        p.supermarket, p.supermarket_id, p.supermarket_uuid,
        p.store, p.store_id, p.store_uuid,
        p.market, p.market_id, p.market_uuid,
        p.supermarketRef, p.supermarket_ref,
        // also consider parent relationships for sub-stores
        p.supermarket_parent, p.supermarket_parent_name,
        p.parent, p.parent_id, p.parent_uuid,
        p.parent_name
      );

      if (smObj(sm)) {
        const o = smObj(sm)!;
        normalizedSupermarketRef = String(
          firstTruthy(o.id, o.pk, o.uuid, o.uid, o.identifier, o.name) ?? 'default'
        );
      } else if (sm !== undefined && sm !== null) {
        normalizedSupermarketRef = String(sm);
      } else {
        // Fallback to name-based fields so UI can still match by name
        normalizedSupermarketRef = String(
          firstTruthy(
            p.supermarket_name, p.supermarketName,
            p.store_name, p.storeName,
            p.market_name, p.marketName
          ) ?? 'default'
        );
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
        supermarketId: normalizedSupermarketRef,
        supermarketName: String(p.supermarket_name ?? p.store_name ?? p.market_name ?? ''),
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

// Supermarkets hook - returns current user's supermarkets, mapped to UI shape
export const useSupermarkets = () => {
  const { token } = useAuth();
  return useApiData(async () => {
    const response = await SupermarketService.getSupermarkets(token || undefined);

    // Debug the raw shape once
    try {
      // eslint-disable-next-line no-console
      console.log('RAW_SUPERMARKETS_RESPONSE', response);
    } catch {}

    let rawArray: any[] = [];
    if (Array.isArray(response)) {
      rawArray = response;
    } else if (Array.isArray(response?.results)) {
      rawArray = response.results;
    } else if (Array.isArray(response?.supermarkets)) {
      rawArray = response.supermarkets;
    } else if (Array.isArray(response?.my_stores)) {
      rawArray = response.my_stores;
    } else if (Array.isArray(response?.items)) {
      rawArray = response.items;
    } else if (Array.isArray(response?.data)) {
      rawArray = response.data;
    } else if (response?.data?.results && Array.isArray(response.data.results)) {
      rawArray = response.data.results;
    }

    // Map to Supermarket UI shape expected by components
    const mapped = rawArray.map((s: any) => ({
      id: String(s.id ?? s.uuid ?? s.pk ?? ''),
      name: String(s.name ?? s.title ?? ''),
      address: String(s.address ?? s.location ?? ''),
      phone: String(s.phone ?? s.contact_phone ?? ''),
      email: String(s.email ?? s.contact_email ?? ''),
      registrationDate: String(s.created_at ?? s.registration_date ?? s.date_joined ?? new Date().toISOString()),
      isVerified: Boolean(s.is_verified ?? s.verified ?? false),
      logo: s.logo ?? undefined,
      description: s.description ?? '',
      parentId: s.parent_id ? String(s.parent_id) : (s.parent ? String(s.parent) : undefined),
      isSubStore: Boolean(s.is_sub_store ?? s.sub_store ?? false),
      ownerId: s.owner_id ? String(s.owner_id) : (s.owner ? String(s.owner) : ''),
    }));

    return mapped;
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