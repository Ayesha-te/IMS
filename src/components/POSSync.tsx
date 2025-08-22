import React, { useState } from 'react';
import { RefreshCw, Settings, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import type { Supermarket } from '../types/Product';

interface POSSyncProps {
  supermarket: Supermarket;
  onUpdatePOS: (supermarketId: string, posConfig: Supermarket['posSystem']) => void;
}

const POSSync: React.FC<POSSyncProps> = ({ supermarket, onUpdatePOS }) => {
  // Guard: If supermarket is undefined, show a message and return
  if (!supermarket) {
    return <div className="text-center text-blue-600 font-semibold py-8">No store selected. Please add or select a store to configure POS sync.</div>;
  }

  const posSystem = supermarket.posSystem || { enabled: false, type: 'none', apiKey: '', syncEnabled: false };

  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);

  const [posConfig, setPosConfig] = useState({
    enabled: posSystem.enabled,
    type: posSystem.type,
    apiKey: posSystem.apiKey,
    syncEnabled: posSystem.syncEnabled
  });

  const posTypes = [
    { value: 'none', label: 'No POS Integration', description: 'Manual inventory management only' },
    { value: 'square', label: 'Square POS', description: 'Integrate with Square payment system' },
    { value: 'shopify', label: 'Shopify POS', description: 'Connect with Shopify point-of-sale' },
    { value: 'custom', label: 'Custom POS', description: 'Connect with custom POS system via API' }
  ];

  const handleConfigSave = () => {
    const newConfig = {
      enabled: posConfig.enabled,
      type: posConfig.type,
      apiKey: posConfig.apiKey,
      syncEnabled: posConfig.syncEnabled && posConfig.enabled && posConfig.type !== 'none',
      lastSync: supermarket.posSystem?.lastSync
    };

    onUpdatePOS(supermarket.id, newConfig);
    setIsConfiguring(false);
  };

  const handleSync = async () => {
    if (!posConfig.enabled || posConfig.type === 'none') return;

    setIsSyncing(true);
    setSyncProgress(0);
    setLastSyncStatus(null);

    try {
      // Simulate sync progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setSyncProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate success/failure
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        setLastSyncStatus('success');
        const now = new Date().toISOString();
        const updatedConfig = {
          ...posConfig,
          lastSync: now
        };
        onUpdatePOS(supermarket.id, updatedConfig);
      } else {
        setLastSyncStatus('error');
      }
    } catch (error) {
      setLastSyncStatus('error');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const isConnected = posConfig.enabled && posConfig.type !== 'none' && posConfig.apiKey;
  const canSync = isConnected && posConfig.syncEnabled;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl mr-4 ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
            {isConnected ? (
              <Wifi className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
            ) : (
              <WifiOff className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">POS Integration</h2>
            <p className="text-gray-600">
              {isConnected ? `Connected to ${posConfig.type.charAt(0).toUpperCase() + posConfig.type.slice(1)} POS` : 'No POS connection configured'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {supermarket.posSystem?.lastSync && (
            <div className="text-sm text-gray-500">
              Last sync: {new Date(supermarket.posSystem.lastSync).toLocaleDateString()}
            </div>
          )}
          
          <button
            onClick={() => setIsConfiguring(!isConfiguring)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isConfiguring && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">POS Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={posConfig.enabled}
                  onChange={(e) => setPosConfig({...posConfig, enabled: e.target.checked})}
                  className="mr-3 h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Enable POS Integration</span>
              </label>
            </div>

            {posConfig.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    POS System Type
                  </label>
                  <select
                    value={posConfig.type}
                    onChange={(e) => setPosConfig({...posConfig, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    {posTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {posConfig.type !== 'none' && (
                    <p className="text-xs text-gray-500 mt-1">
                      {posTypes.find(t => t.value === posConfig.type)?.description}
                    </p>
                  )}
                </div>

                {posConfig.type !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key / Connection String
                    </label>
                    <input
                      type="password"
                      value={posConfig.apiKey}
                      onChange={(e) => setPosConfig({...posConfig, apiKey: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter your POS system API key"
                    />
                  </div>
                )}

                {posConfig.type !== 'none' && posConfig.apiKey && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={posConfig.syncEnabled}
                        onChange={(e) => setPosConfig({...posConfig, syncEnabled: e.target.checked})}
                        className="mr-3 h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Automatic Sync</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-7">
                      Automatically sync inventory changes with POS system
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsConfiguring(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfigSave}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {!isConfiguring && (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <div>
                <p className="font-medium text-gray-800">
                  {isConnected ? 'Connected' : 'Not Connected'}
                </p>
                <p className="text-sm text-gray-600">
                  {isConnected 
                    ? `${posConfig.type.charAt(0).toUpperCase() + posConfig.type.slice(1)} POS System` 
                    : 'Configure POS integration to get started'}
                </p>
              </div>
            </div>
            
            {canSync && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>

          {/* Sync Progress */}
          {isSyncing && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Syncing with POS...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-600 mt-1">{syncProgress}% complete</p>
            </div>
          )}

          {/* Last Sync Status */}
          {lastSyncStatus && !isSyncing && (
            <div className={`p-4 rounded-lg ${lastSyncStatus === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center">
                {lastSyncStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className={`font-medium ${lastSyncStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {lastSyncStatus === 'success' ? 'Sync completed successfully' : 'Sync failed'}
                </span>
              </div>
              {lastSyncStatus === 'success' && (
                <p className="text-sm text-green-600 mt-1">
                  Inventory data has been synchronized with your POS system
                </p>
              )}
              {lastSyncStatus === 'error' && (
                <p className="text-sm text-red-600 mt-1">
                  Failed to sync with POS. Please check your connection and try again.
                </p>
              )}
            </div>
          )}

          {/* Sync Features */}
          {canSync && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-medium text-emerald-800 mb-2">✅ What Gets Synced</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Product inventory levels</li>
                  <li>• Price updates</li>
                  <li>• New product additions</li>
                  <li>• Product discontinuations</li>
                </ul>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">⚠️ Sync Guidelines</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Sync during off-peak hours</li>
                  <li>• Backup data before sync</li>
                  <li>• Monitor for conflicts</li>
                  <li>• Test with sample data first</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default POSSync;