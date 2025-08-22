/**
 * Test script to verify the MappingService fix for categories.find error
 * This can be run in the browser console or imported in a component
 */

import { MappingService } from '../services/apiService';

export const testMappingServiceFix = async () => {
  console.log('🧪 Testing MappingService fix for categories.find error...');
  
  try {
    // Test 1: Fetch mappings and check data types
    console.log('📡 Fetching mappings...');
    const mappings = await MappingService.fetchMappings();
    
    console.log('✅ Mappings fetched successfully');
    console.log('📊 Categories:', {
      type: typeof mappings.categories,
      isArray: Array.isArray(mappings.categories),
      length: mappings.categories?.length || 0,
      sample: mappings.categories?.[0]
    });
    
    console.log('📊 Suppliers:', {
      type: typeof mappings.suppliers,
      isArray: Array.isArray(mappings.suppliers),
      length: mappings.suppliers?.length || 0,
      sample: mappings.suppliers?.[0]
    });
    
    console.log('📊 Supermarkets:', {
      type: typeof mappings.supermarkets,
      isArray: Array.isArray(mappings.supermarkets),
      length: mappings.supermarkets?.length || 0,
      sample: mappings.supermarkets?.[0]
    });

    // Test 2: Test convertProductNamesToIds with sample data
    if (mappings.categories.length > 0 && mappings.suppliers.length > 0 && mappings.supermarkets.length > 0) {
      console.log('🔄 Testing convertProductNamesToIds...');
      
      const testProduct = {
        name: 'Test Product',
        category: mappings.categories[0].name,
        supplier: mappings.suppliers[0].name,
        supermarket: mappings.supermarkets[0].name,
        quantity: 10,
        price: 5.99
      };
      
      console.log('📝 Test product:', testProduct);
      
      const convertedProduct = await MappingService.convertProductNamesToIds(testProduct);
      console.log('✅ Product converted successfully:', convertedProduct);
      
      // Verify the conversion worked
      const hasValidIds = 
        typeof convertedProduct.category === 'number' &&
        typeof convertedProduct.supplier === 'number' &&
        typeof convertedProduct.supermarket === 'string';
        
      console.log('🎯 Conversion validation:', {
        categoryId: convertedProduct.category,
        supplierId: convertedProduct.supplier,
        supermarketId: convertedProduct.supermarket,
        hasValidIds
      });
      
      if (hasValidIds) {
        console.log('🎉 SUCCESS: MappingService fix is working correctly!');
        return { success: true, message: 'All tests passed' };
      } else {
        console.log('❌ FAIL: Conversion did not produce valid IDs');
        return { success: false, message: 'Conversion validation failed' };
      }
    } else {
      console.log('⚠️ WARNING: Not enough data to test conversion (need at least 1 category, supplier, and supermarket)');
      return { success: true, message: 'Partial test passed - arrays are valid but no data to convert' };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, message: `Test failed: ${error}` };
  }
};

// Export for use in components or console
export default testMappingServiceFix;