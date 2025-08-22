import React, { useState } from 'react';
import { Save, X, Store, MapPin, Phone, Mail, FileText } from 'lucide-react';
import type { Supermarket } from '../types/Product';

interface SupermarketRegistrationProps {
  onSave: (supermarket: Omit<Supermarket, 'id' | 'ownerId' | 'posSystem'>) => void;
  onCancel: () => void;
}

const SupermarketRegistration: React.FC<SupermarketRegistrationProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    registrationDate: new Date().toISOString().split('T')[0],
    isVerified: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-xl mr-4">
              <Store className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">🏪 Register Your Supermarket</h2>
              <p className="text-gray-600">Join our network of verified Halal product retailers</p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-emerald-800 mb-4">Why Join Our Platform?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <Store className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Reach More Customers</p>
                <p className="text-sm text-emerald-600">Expand your customer base</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Easy Management</p>
                <p className="text-sm text-emerald-600">Simple inventory tracking</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">24/7 Support</p>
                <p className="text-sm text-emerald-600">We're here to help</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supermarket Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <Store className="w-4 h-4 inline mr-2" />
                Supermarket Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80"
                placeholder="Enter your supermarket name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80"
                placeholder="Enter email address"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80"
                placeholder="Enter phone number"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80"
                placeholder="Enter complete address"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80"
              placeholder="Tell us about your supermarket, specialties, and what makes you unique..."
            />
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Terms and Conditions</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• All products must be verified Halal-certified</p>
              <p>• Accurate product information must be maintained</p>
              <p>• Regular inventory updates are required</p>
              <p>• Compliance with platform guidelines is mandatory</p>
              <p>• Verification process may take 2-3 business days</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors duration-200 flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Submit Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupermarketRegistration;