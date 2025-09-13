// Utility functions to persist and retrieve user-defined supplier options
// Mirrors currencyOptions behavior but for suppliers

import { STORAGE_KEYS } from '../constants/storageKeys';

const sanitize = (value: string): string => {
  const v = (value || '').trim();
  return v;
};

export interface SupplierOption {
  id: string;
  name: string;
}

export const getSavedSuppliers = (): SupplierOption[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIER_OPTIONS as string);
    const list: (string | SupplierOption)[] = raw ? JSON.parse(raw) : [];
    
    // Handle both old format (string[]) and new format (SupplierOption[])
    const suppliers = list.map((item, index) => {
      if (typeof item === 'string') {
        return { id: `local-${index}`, name: sanitize(item) };
      } else {
        return { id: item.id, name: sanitize(item.name) };
      }
    }).filter(supplier => supplier.name.length > 0);
    
    // Remove duplicates by name
    const uniqueSuppliers = suppliers.filter((supplier, index, self) => 
      self.findIndex(s => s.name === supplier.name) === index
    );
    
    return uniqueSuppliers;
  } catch {
    return [];
  }
};

export const saveSupplier = (name: string, id?: string): void => {
  const clean = sanitize(name);
  if (!clean) return;
  
  const list = getSavedSuppliers();
  const exists = list.some(supplier => supplier.name === clean);
  
  if (!exists) {
    const newSupplier: SupplierOption = {
      id: id || `local-${Date.now()}`,
      name: clean
    };
    const updated = [...list, newSupplier];
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_OPTIONS as string, JSON.stringify(updated));
  }
};

export const removeSupplier = (name: string): void => {
  const list = getSavedSuppliers();
  const filtered = list.filter(supplier => supplier.name !== sanitize(name));
  localStorage.setItem(STORAGE_KEYS.SUPPLIER_OPTIONS as string, JSON.stringify(filtered));
};