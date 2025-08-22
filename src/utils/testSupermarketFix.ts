/**
 * Test script to verify the supermarket fix
 * This can be run in the browser console to test the supermarket creation logic
 */

import { SupermarketService } from '../services/apiService';

export const testSupermarketFix = async () => {
  console.log('🧪 Testing supermarket fix...');
  
  try {
    // Test 0: Check authentication
    console.log('🔐 Testing authentication...');
    const connectionTest = await SupermarketService.testConnection();
    if (!connectionTest.success) {
      console.error('❌ Authentication failed:', connectionTest.error);
      return { success: false, message: `Authentication failed: ${connectionTest.error}` };
    }
    console.log('✅ Authentication successful');
    
    // Test 1: Check if we can fetch supermarkets
    console.log('📡 Fetching supermarkets...');
    const supermarkets = await SupermarketService.getSupermarkets();
    
    console.log('✅ Supermarkets fetched:', supermarkets);
    
    const supermarketsArray = Array.isArray(supermarkets) ? supermarkets : supermarkets.results || [];
    console.log('📊 Supermarkets array:', supermarketsArray);
    console.log('📊 Number of supermarkets:', supermarketsArray.length);
    
    if (supermarketsArray.length === 0) {
      console.log('⚠️ No supermarkets found, testing creation...');
      
      // Test 2: Try to create a supermarket with full data
      const testSupermarketData = {
        name: 'Test Supermarket',
        address: 'Test Address',
        phone: '123-456-7890',
        email: 'test@example.com',
        description: 'Test supermarket created by fix verification'
      };
      
      const createdSupermarket = await SupermarketService.createSupermarket(testSupermarketData);
      console.log('✅ Test supermarket created with full data:', createdSupermarket);
      
      // Test 3: Try to create a supermarket with defaults
      const testSupermarketDataDefaults = {
        name: 'Test Supermarket with Defaults',
        email: 'testdefaults@example.com'
      };
      
      const createdSupermarketDefaults = await SupermarketService.createSupermarketWithDefaults(testSupermarketDataDefaults);
      console.log('✅ Test supermarket created with defaults:', createdSupermarketDefaults);
      
      // Test 4: Verify they were created
      const updatedSupermarkets = await SupermarketService.getSupermarkets();
      const updatedArray = Array.isArray(updatedSupermarkets) ? updatedSupermarkets : updatedSupermarkets.results || [];
      
      console.log('✅ Updated supermarkets count:', updatedArray.length);
      
      if (updatedArray.length > 0) {
        console.log('🎉 SUCCESS: Supermarket creation and fetching works correctly!');
        return { success: true, message: 'Supermarket fix is working', supermarkets: updatedArray };
      } else {
        console.log('❌ FAIL: Supermarket was created but not found in list');
        return { success: false, message: 'Supermarket creation issue' };
      }
    } else {
      console.log('✅ Supermarkets already exist:', supermarketsArray.map((s: any) => s.name));
      console.log('🎉 SUCCESS: Supermarkets are available!');
      return { success: true, message: 'Supermarkets already exist', supermarkets: supermarketsArray };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, message: `Test failed: ${error}` };
  }
};

// Export for use in components or console
export default testSupermarketFix;