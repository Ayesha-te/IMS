/**
 * Test script to verify that supermarket creation now actually calls the API
 * Run this in the browser console after logging in
 */

import { SupermarketService, AuthService } from '../services/apiService';

export const testSupermarketCreationFix = async () => {
  console.log('🧪 TESTING SUPERMARKET CREATION FIX');
  console.log('===================================');
  
  // Step 1: Check authentication
  console.log('\n1️⃣ Checking authentication...');
  const token = AuthService.getToken();
  if (!token) {
    console.log('❌ No authentication token found! Please log in first.');
    return { success: false, message: 'Not authenticated' };
  }
  console.log('✅ Authentication token found');
  
  // Step 2: Test direct API call
  console.log('\n2️⃣ Testing direct API call...');
  try {
    const testSupermarket = {
      name: `API Test Store ${Date.now()}`,
      address: '123 API Test Street',
      phone: '+1234567890',
      email: 'apitest@example.com',
      description: 'Test store created via direct API call'
    };
    
    console.log('Creating supermarket via API:', testSupermarket);
    const apiResult = await SupermarketService.createSupermarket(testSupermarket);
    console.log('✅ Direct API call successful:', apiResult);
    
    // Step 3: Verify it was actually saved
    console.log('\n3️⃣ Verifying supermarket was saved...');
    const allSupermarkets = await SupermarketService.getSupermarkets();
    const supermarketsArray = Array.isArray(allSupermarkets) ? allSupermarkets : allSupermarkets.results || [];
    
    const foundSupermarket = supermarketsArray.find(s => s.id === apiResult.id);
    if (foundSupermarket) {
      console.log('✅ Supermarket found in database:', foundSupermarket);
    } else {
      console.log('❌ Supermarket not found in database!');
      return { success: false, message: 'Supermarket not persisted' };
    }
    
    // Step 4: Test with defaults
    console.log('\n4️⃣ Testing creation with defaults...');
    const testSupermarketDefaults = {
      name: `Defaults Test Store ${Date.now()}`,
      email: 'defaultstest@example.com'
    };
    
    const defaultsResult = await SupermarketService.createSupermarketWithDefaults(testSupermarketDefaults);
    console.log('✅ Creation with defaults successful:', defaultsResult);
    
    // Step 5: Final verification
    console.log('\n5️⃣ Final verification...');
    const finalSupermarkets = await SupermarketService.getSupermarkets();
    const finalArray = Array.isArray(finalSupermarkets) ? finalSupermarkets : finalSupermarkets.results || [];
    
    console.log(`✅ Total supermarkets in database: ${finalArray.length}`);
    console.log('✅ Recent supermarkets:', finalArray.slice(-3).map(s => ({ id: s.id, name: s.name })));
    
    return {
      success: true,
      message: 'All tests passed! Supermarket creation is working correctly.',
      results: {
        directApiCall: apiResult,
        withDefaults: defaultsResult,
        totalSupermarkets: finalArray.length
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Provide specific error guidance
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return { success: false, message: 'Authentication failed - token may be expired' };
      } else if (error.message.includes('400')) {
        return { success: false, message: 'Bad request - check required fields' };
      } else if (error.message.includes('403')) {
        return { success: false, message: 'Permission denied - check user permissions' };
      }
    }
    
    return { 
      success: false, 
      message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error 
    };
  }
};

// Quick test function for console use
export const quickTest = async () => {
  const result = await testSupermarketCreationFix();
  console.log('\n🎯 FINAL TEST RESULT:', result);
  return result;
};

export default testSupermarketCreationFix;