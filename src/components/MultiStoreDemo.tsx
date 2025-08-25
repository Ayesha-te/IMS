import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  Users, 
  BarChart3, 
  ArrowRight, 
  CheckCircle,
  Star,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

interface MultiStoreDemoProps {
  onGetStarted: () => void;
}

const MultiStoreDemo: React.FC<MultiStoreDemoProps> = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');

  const singleStoreFeatures = [
    {
      icon: <Package className="w-6 h-6 text-blue-600" />,
      title: 'Simple Product Management',
      description: 'Add, edit, and manage products directly without store selection complexity'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-600" />,
      title: 'Focused Analytics',
      description: 'Clear insights and reports for your single store operations'
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      title: 'Streamlined Interface',
      description: 'Clean, fast interface designed for single-store efficiency'
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: 'Secure & Private',
      description: 'Your store data is completely private and secure'
    }
  ];

  const multiStoreFeatures = [
    {
      icon: <Store className="w-6 h-6 text-blue-600" />,
      title: 'Multiple Store Management',
      description: 'Manage unlimited stores and sub-stores from one dashboard'
    },
    {
      icon: <Package className="w-6 h-6 text-green-600" />,
      title: 'Bulk Product Operations',
      description: 'Add products to multiple stores, copy/move inventory between locations'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      title: 'Cross-Store Analytics',
      description: 'Compare performance across all your stores with detailed insights'
    },
    {
      icon: <Globe className="w-6 h-6 text-orange-600" />,
      title: 'Centralized Control',
      description: 'Control all your stores from one central location with role-based access'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
            Adaptive Multi-Store System
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            One System, <span className="text-blue-600">Every Store Size</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our intelligent inventory management system adapts to your business - whether you have one store or a hundred. 
            The interface changes based on your needs, ensuring the perfect experience every time.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl font-semibold text-lg">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'single'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Single Store Experience
              </button>
              <button
                onClick={() => setActiveTab('multi')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'multi'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Multi-Store Experience
              </button>
            </div>
          </div>

          {/* Single Store Features */}
          {activeTab === 'single' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <Store className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Single Store Mode</h2>
                    <p className="text-blue-100 text-lg">Perfect for focused, efficient store management</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {singleStoreFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-gray-100 p-3 rounded-xl mr-4 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-800">What You Get</h3>
                  </div>
                  <ul className="space-y-2 text-blue-700">
                    <li>• Clean, distraction-free interface</li>
                    <li>• No complex store selection - everything is direct</li>
                    <li>• Faster product addition and management</li>
                    <li>• Store-specific analytics and insights</li>
                    <li>• Easy upgrade path to multi-store when you grow</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Store Features */}
          {activeTab === 'multi' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <Globe className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Multi-Store Mode</h2>
                    <p className="text-purple-100 text-lg">Advanced features for growing businesses</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {multiStoreFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-gray-100 p-3 rounded-xl mr-4 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-purple-50 rounded-xl">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-6 h-6 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-purple-800">Advanced Capabilities</h3>
                  </div>
                  <ul className="space-y-2 text-purple-700">
                    <li>• Add products to multiple stores simultaneously</li>
                    <li>• Copy/move products between store locations</li>
                    <li>• Store-specific filtering and management</li>
                    <li>• Bulk operations across all your stores</li>
                    <li>• Centralized dashboard with store comparisons</li>
                    <li>• Sub-store management and hierarchies</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Adapts to You</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Detection</h3>
              <p className="text-gray-600">
                System automatically detects if you have one store or multiple stores and adapts the interface accordingly
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Instant Adaptation</h3>
              <p className="text-gray-600">
                Navigation, forms, and features change in real-time based on your store configuration
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Privacy Protected</h3>
              <p className="text-gray-600">
                You can only see and manage your own stores. Complete privacy and data isolation
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Adaptive Inventory Management?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start with one store and grow to hundreds. Our system grows with you, adapting every step of the way.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-bold text-lg flex items-center mx-auto"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiStoreDemo;