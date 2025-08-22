/**
 * Debug script to test supermarket authentication and creation
 * Run this in the browser console after logging in
 */

import { SupermarketService, AuthService } from '../services/apiService';

export const debugSupermarketAuth = async () => {
  console.log('🔍 DEBUGGING SUPERMARKET AUTHENTICATION');
  console.log('=====================================');
  
  // Step 1: Check if user is logged in
  console.log('\n1️⃣ Checking authentication status...');
  const token = AuthService.getToken();
  const refreshToken = AuthService.getRefreshToken();
  
  console.log('Access token exists:', !!token);
  console.log('Refresh token exists:', !!refreshToken);
  
  if (token) {
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // Try to decode the token to check expiry (basic check)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < now;
        console.log('Token expires at:', new Date(payload.exp * 1000));
        console.log('Token is expired:', isExpired);
        console.log('Token user ID:', payload.user_id);
      }
    } catch (e) {
      console.log('Could not decode token:', e);
    }
  } else {
    console.log('❌ No access token found! User needs to log in.');
    return { success: false, message: 'No authentication token found' };
  }
  
  // Step 2: Test API connectivity
  console.log('\n2️⃣ Testing API connectivity...');
  try {
    const connectionTest = await SupermarketService.testConnection();
    if (!connectionTest.success) {
      console.log('❌ API connection failed:', connectionTest.error);
      return { success: false, message: `API connection failed: ${connectionTest.error}` };
    }
    console.log('✅ API connection successful');
  } catch (error) {
    console.log('❌ API connection error:', error);
    return { success: false, message: `API connection error: ${error}` };
  }
  
  // Step 3: Test supermarket creation
  console.log('\n3️⃣ Testing supermarket creation...');
  try {
    const testData = {
      name: `Debug Test Supermarket ${Date.now()}`,
      address: '123 Debug Street, Test City',
      phone: '+1234567890',
      email: 'debug@test.com',
      description: 'Debug test supermarket'
    };
    
    console.log('Creating supermarket with data:', testData);
    const result = await SupermarketService.createSupermarket(testData);
    console.log('✅ Supermarket created successfully:', result);
    
    return { 
      success: true, 
      message: 'All tests passed!', 
      supermarket: result 
    };
  } catch (error) {
    console.log('❌ Supermarket creation failed:', error);
    
    // Try to get more details about the error
    if (error instanceof Error) {
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
    }
    
    return { 
      success: false, 
      message: `Supermarket creation failed: ${error}`,
      error 
    };
  }
};

// Also export a simple version for console use
export const quickDebug = async () => {
  const result = await debugSupermarketAuth();
  console.log('\n🎯 FINAL RESULT:', result);
  return result;
};

export default debugSupermarketAuth;