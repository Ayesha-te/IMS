import React, { useState, useEffect } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';
import { apiRequest, HTTP_METHODS } from '../services/apiService';

const APITest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runAPITests = async () => {
    setIsLoading(true);
    const results: any[] = [];

    // Test 1: Check if backend is accessible
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/`);
      results.push({
        test: 'Backend Accessibility',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        details: `Status: ${response.status}`,
        url: `${API_CONFIG.BASE_URL}/admin/`
      });
    } catch (error) {
      results.push({
        test: 'Backend Accessibility',
        status: 'FAIL',
        details: `Error: ${error}`,
        url: `${API_CONFIG.BASE_URL}/admin/`
      });
    }

    // Test 2: Check API endpoints structure
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/`);
      results.push({
        test: 'API Root Endpoint',
        status: response.status < 500 ? 'PASS' : 'FAIL',
        details: `Status: ${response.status}`,
        url: `${API_CONFIG.BASE_URL}/api/`
      });
    } catch (error) {
      results.push({
        test: 'API Root Endpoint',
        status: 'FAIL',
        details: `Error: ${error}`,
        url: `${API_CONFIG.BASE_URL}/api/`
      });
    }

    // Test 3: Check inventory endpoints
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.INVENTORY.PRODUCTS}`);
      results.push({
        test: 'Products Endpoint',
        status: response.status === 401 || response.status === 200 ? 'PASS' : 'FAIL', // 401 is expected without auth
        details: `Status: ${response.status} (401 expected without authentication)`,
        url: `${API_CONFIG.BASE_URL}${ENDPOINTS.INVENTORY.PRODUCTS}`
      });
    } catch (error) {
      results.push({
        test: 'Products Endpoint',
        status: 'FAIL',
        details: `Error: ${error}`,
        url: `${API_CONFIG.BASE_URL}${ENDPOINTS.INVENTORY.PRODUCTS}`
      });
    }

    // Test 4: Check authentication endpoints
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });
      
      let responseText = '';
      try {
        const responseData = await response.json();
        responseText = JSON.stringify(responseData);
      } catch {
        responseText = await response.text();
      }
      
      results.push({
        test: 'Login Endpoint',
        status: response.status === 400 || response.status === 401 ? 'PASS' : 'FAIL',
        details: `Status: ${response.status} - Response: ${responseText.substring(0, 100)}...`,
        url: `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`
      });
    } catch (error) {
      results.push({
        test: 'Login Endpoint',
        status: 'FAIL',
        details: `Error: ${error}`,
        url: `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`
      });
    }

    // Test 5: Try to create a test user (registration)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123',
          first_name: 'Demo',
          last_name: 'User'
        })
      });
      
      let responseText = '';
      try {
        const responseData = await response.json();
        responseText = JSON.stringify(responseData);
      } catch {
        responseText = await response.text();
      }
      
      results.push({
        test: 'Registration Endpoint',
        status: response.status === 201 || response.status === 400 ? 'PASS' : 'FAIL',
        details: `Status: ${response.status} - Response: ${responseText.substring(0, 100)}...`,
        url: `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REGISTER}`
      });
    } catch (error) {
      results.push({
        test: 'Registration Endpoint',
        status: 'FAIL',
        details: `Error: ${error}`,
        url: `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REGISTER}`
      });
    }

    // Test 5: Check barcode endpoints
    try {
      const testProductId = 'test-uuid-123';
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.BARCODE.GENERATE_BARCODE(testProductId)}`);
      results.push({
        test: 'Barcode Generation Endpoint',
        status: response.status === 401 || response.status === 404 ? 'PASS' : 'FAIL',
        details: `Status: ${response.status} (401/404 expected without auth or invalid ID)`,
        url: `${API_CONFIG.BASE_URL}${ENDPOINTS.BARCODE.GENERATE_BARCODE(testProductId)}`
      });
    } catch (error) {
      results.push({
        test: 'Barcode Generation Endpoint',
        status: 'FAIL',
        details: `Error: ${error}`,
        url: `${API_CONFIG.BASE_URL}${ENDPOINTS.BARCODE.GENERATE_BARCODE('test-uuid-123')}`
      });
    }

    // Test 6: Test MappingService fix for categories.find error
    try {
      const { MappingService } = await import('../services/apiService');
      
      // Test fetchMappings to see what the API returns
      const mappings = await MappingService.fetchMappings();
      
      results.push({
        test: 'MappingService - Categories Array Check',
        status: Array.isArray(mappings.categories) ? 'PASS' : 'FAIL',
        details: `Categories type: ${typeof mappings.categories}, isArray: ${Array.isArray(mappings.categories)}, length: ${mappings.categories?.length || 0}`,
        url: 'MappingService.fetchMappings()'
      });

      results.push({
        test: 'MappingService - Suppliers Array Check',
        status: Array.isArray(mappings.suppliers) ? 'PASS' : 'FAIL',
        details: `Suppliers type: ${typeof mappings.suppliers}, isArray: ${Array.isArray(mappings.suppliers)}, length: ${mappings.suppliers?.length || 0}`,
        url: 'MappingService.fetchMappings()'
      });

      results.push({
        test: 'MappingService - Supermarkets Array Check',
        status: Array.isArray(mappings.supermarkets) ? 'PASS' : 'FAIL',
        details: `Supermarkets type: ${typeof mappings.supermarkets}, isArray: ${Array.isArray(mappings.supermarkets)}, length: ${mappings.supermarkets?.length || 0}`,
        url: 'MappingService.fetchMappings()'
      });

    } catch (error) {
      results.push({
        test: 'MappingService Test',
        status: 'FAIL',
        details: `Error: ${error}`,
        url: 'MappingService.fetchMappings()'
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runAPITests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">API Integration Test</h2>
          <button
            onClick={runAPITests}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Testing...' : 'Run Tests'}
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Backend URL:</span>
              <br />
              <code className="text-blue-600">{API_CONFIG.BASE_URL}</code>
            </div>
            <div>
              <span className="font-medium">Environment:</span>
              <br />
              <span className="text-green-600">
                {API_CONFIG.BASE_URL.includes('localhost') ? 'Development' : 'Production'}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Running API tests...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.status === 'PASS'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{result.test}</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.status === 'PASS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.details}</p>
                <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {result.url}
                </code>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
          <ul className="list-disc ml-6 text-blue-700 text-sm space-y-1">
            <li>If tests pass, the API integration is working correctly</li>
            <li>401/404 errors are expected for protected endpoints without authentication</li>
            <li>Use the login form to authenticate and access protected resources</li>
            <li>Check the browser's Network tab for detailed request/response information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APITest;