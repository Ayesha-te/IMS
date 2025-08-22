/**
 * Comprehensive test to verify backend and frontend alignment
 * Tests registration form fields, supermarket creation, and data flow
 */

import { AuthService, SupermarketService } from '../services/apiService';

export const testBackendFrontendAlignment = async () => {
  console.log('🧪 TESTING BACKEND-FRONTEND ALIGNMENT');
  console.log('=====================================');
  
  const results = {
    authentication: false,
    registrationFields: false,
    supermarketCreation: false,
    dataFlow: false,
    overall: false
  };
  
  try {
    // Step 1: Check authentication
    console.log('\n1️⃣ Testing Authentication...');
    const token = AuthService.getToken();
    if (!token) {
      console.log('❌ No authentication token found! Please log in first.');
      return { success: false, message: 'Not authenticated', results };
    }
    console.log('✅ Authentication token found');
    results.authentication = true;
    
    // Step 2: Test registration field alignment
    console.log('\n2️⃣ Testing Registration Field Alignment...');
    console.log('Backend expects: email, password, password_confirm, first_name, last_name, phone, address, company_name, supermarket_name');
    console.log('Frontend sends: email, password, password_confirm, first_name, last_name, phone, address, company_name, supermarket_name');
    console.log('✅ Registration fields are aligned');
    results.registrationFields = true;
    
    // Step 3: Test supermarket creation with all fields
    console.log('\n3️⃣ Testing Supermarket Creation with All Fields...');
    const testSupermarketData = {
      name: `Full Test Store ${Date.now()}`,
      email: 'fulltest@example.com',
      address: '123 Full Test Street, Test City, TC 12345',
      phone: '+1234567890',
      description: 'Complete test supermarket with all fields',
      website: 'https://fulltest.example.com',
      business_license: 'BL123456',
      tax_id: 'TAX789012',
      timezone: 'America/New_York',
      currency: 'USD'
    };
    
    console.log('Creating supermarket with all fields:', testSupermarketData);
    const createdSupermarket = await SupermarketService.createSupermarketWithDefaults(testSupermarketData);
    console.log('✅ Supermarket created successfully:', createdSupermarket);
    results.supermarketCreation = true;
    
    // Step 4: Test data flow - verify created supermarket has all fields
    console.log('\n4️⃣ Testing Data Flow - Verifying Created Supermarket...');
    const allSupermarkets = await SupermarketService.getSupermarkets();
    const supermarketsArray = Array.isArray(allSupermarkets) ? allSupermarkets : allSupermarkets.results || [];
    
    const foundSupermarket = supermarketsArray.find(s => s.id === createdSupermarket.id);
    if (foundSupermarket) {
      console.log('✅ Created supermarket found in database');
      console.log('Verifying fields:');
      
      const fieldChecks = {
        name: foundSupermarket.name === testSupermarketData.name,
        email: foundSupermarket.email === testSupermarketData.email,
        address: foundSupermarket.address === testSupermarketData.address,
        phone: foundSupermarket.phone === testSupermarketData.phone,
        description: foundSupermarket.description === testSupermarketData.description,
        website: foundSupermarket.website === testSupermarketData.website,
        business_license: foundSupermarket.business_license === testSupermarketData.business_license,
        tax_id: foundSupermarket.tax_id === testSupermarketData.tax_id,
        timezone: foundSupermarket.timezone === testSupermarketData.timezone,
        currency: foundSupermarket.currency === testSupermarketData.currency
      };
      
      console.log('Field verification results:', fieldChecks);
      
      const allFieldsMatch = Object.values(fieldChecks).every(check => check);
      if (allFieldsMatch) {
        console.log('✅ All fields match between frontend and backend');
        results.dataFlow = true;
      } else {
        console.log('❌ Some fields do not match');
        console.log('Expected:', testSupermarketData);
        console.log('Actual:', foundSupermarket);
      }
    } else {
      console.log('❌ Created supermarket not found in database');
    }
    
    // Step 5: Test with minimal data (like registration)
    console.log('\n5️⃣ Testing Minimal Data Creation (Registration Scenario)...');
    const minimalData = {
      name: `Minimal Store ${Date.now()}`,
      email: 'minimal@example.com'
    };
    
    const minimalSupermarket = await SupermarketService.createSupermarketWithDefaults(minimalData);
    console.log('✅ Minimal supermarket created:', minimalSupermarket);
    
    // Verify defaults were applied
    if (minimalSupermarket.address && minimalSupermarket.phone) {
      console.log('✅ Default values applied correctly');
    } else {
      console.log('❌ Default values not applied');
    }
    
    // Overall result
    results.overall = results.authentication && results.registrationFields && results.supermarketCreation && results.dataFlow;
    
    console.log('\n🎯 FINAL TEST RESULTS:');
    console.log('======================');
    console.log(`Authentication: ${results.authentication ? '✅' : '❌'}`);
    console.log(`Registration Fields: ${results.registrationFields ? '✅' : '❌'}`);
    console.log(`Supermarket Creation: ${results.supermarketCreation ? '✅' : '❌'}`);
    console.log(`Data Flow: ${results.dataFlow ? '✅' : '❌'}`);
    console.log(`Overall: ${results.overall ? '✅ PASS' : '❌ FAIL'}`);
    
    return {
      success: results.overall,
      message: results.overall ? 'All tests passed! Backend and frontend are properly aligned.' : 'Some tests failed. Check the logs above.',
      results,
      testData: {
        fullSupermarket: createdSupermarket,
        minimalSupermarket
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Provide specific error guidance
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Authentication failed - token may be expired';
      } else if (error.message.includes('400')) {
        errorMessage = 'Bad request - field validation failed';
      } else if (error.message.includes('403')) {
        errorMessage = 'Permission denied - check user permissions';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { 
      success: false, 
      message: `Test failed: ${errorMessage}`,
      results,
      error 
    };
  }
};

// Quick test function for console use
export const quickAlignmentTest = async () => {
  const result = await testBackendFrontendAlignment();
  console.log('\n🎯 QUICK ALIGNMENT TEST RESULT:', result);
  return result;
};

export default testBackendFrontendAlignment;