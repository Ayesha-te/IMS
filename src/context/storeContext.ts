import { createContext } from 'react';

export interface StoreContextType {
  supermarketId: string | null;
  substores: string[];
  setSupermarketId: (id: string | null) => void;
  setSubstores: (ids: string[]) => void;
}

export const StoreContext = createContext<StoreContextType>({
  supermarketId: null,
  substores: [],
  setSupermarketId: () => {},
  setSubstores: () => {},
});
