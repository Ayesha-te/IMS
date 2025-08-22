import React, { useState } from 'react';
import { StoreContext, StoreContextType } from './storeContext';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supermarketId, setSupermarketId] = useState<string | null>(null);
  const [substores, setSubstores] = useState<string[]>([]);

  const value: StoreContextType = {
    supermarketId,
    substores,
    setSupermarketId,
    setSubstores,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
