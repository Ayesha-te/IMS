import React from 'react';
import { analyzeStoreContext } from '../utils/storeUtils';
import type { Supermarket, User } from '../types/Product';

interface DebugStoreInfoProps {
  stores: Supermarket[];
  currentUser: User | null;
}

const DebugStoreInfo: React.FC<DebugStoreInfoProps> = ({ stores, currentUser }) => {
  const storeContext = analyzeStoreContext(stores, currentUser);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
      <h3 className="font-bold text-yellow-800 mb-3">🐛 Debug Store Information</h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong>Current User ID:</strong> {currentUser?.id || 'null'}
        </div>
        
        <div>
          <strong>Total Stores in Array:</strong> {stores.length}
        </div>
        
        <div>
          <strong>All Stores:</strong>
          <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
            {JSON.stringify(stores.map(s => ({ 
              id: s.id, 
              name: s.name, 
              ownerId: s.ownerId,
              isSubStore: s.isSubStore 
            })), null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Store Context Analysis:</strong>
          <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">
            {JSON.stringify({
              isMultiStore: storeContext.isMultiStore,
              totalStores: storeContext.totalStores,
              userStores: storeContext.userStores.map(s => ({ 
                id: s.id, 
                name: s.name, 
                ownerId: s.ownerId 
              })),
              mainStore: storeContext.mainStore ? {
                id: storeContext.mainStore.id,
                name: storeContext.mainStore.name,
                ownerId: storeContext.mainStore.ownerId
              } : null
            }, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>User Stores (filtered):</strong> {storeContext.userStores.length}
          <ul className="ml-4 mt-1">
            {storeContext.userStores.map(store => (
              <li key={store.id}>
                {store.name} (ID: {store.id}, Owner: {store.ownerId})
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <strong>Manual Filter Test:</strong>
          <ul className="ml-4 mt-1">
            {stores.filter(store => 
              store.ownerId === currentUser?.id || String(store.ownerId) === String(currentUser?.id)
            ).map(store => (
              <li key={store.id} className="text-green-600">
                ✓ {store.name} (ID: {store.id}, Owner: {store.ownerId})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugStoreInfo;