import React, { useState } from 'react';

interface AuthProps {
  mode: 'login' | 'signup';
  onAuthSuccess: (...args: any[]) => Promise<void>;
  showSignupOption?: () => void;
  showLoginOption?: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onAuthSuccess, showSignupOption, showLoginOption }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [supermarketName, setSupermarketName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (!supermarketName.trim()) {
          setError('Supermarket name is required');
          setIsLoading(false);
          return;
        }
        // Pass arguments as expected by handleSignup: (email, password, firstName, lastName, supermarketName, phone, address)
        await onAuthSuccess(email, password, firstName, lastName, supermarketName, phone, address);
      } else {
        // Pass arguments as expected by handleLogin: (email, password)
        await onAuthSuccess(email, password);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === 'login'
              ? 'Sign in to manage your inventory'
              : 'Create your account to get started'}
          </p>

        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" id="firstName" name="firstName" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80" placeholder="Enter your first name" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" id="lastName" name="lastName" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80" placeholder="Enter your last name" />
              </div>
            </>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" name="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80" placeholder="Enter your email" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" id="password" name="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80" placeholder="Enter your password" />
          </div>
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80" placeholder="Confirm your password" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" id="phone" name="phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80" placeholder="Enter your phone number (optional)" />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea id="address" name="address" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80" placeholder="Enter your address (optional)" rows={2}></textarea>
              </div>
              <div>
                <label htmlFor="supermarketName" className="block text-sm font-medium text-gray-700 mb-1">Supermarket Name *</label>
                <input type="text" id="supermarketName" name="supermarketName" required value={supermarketName} onChange={e => setSupermarketName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80" placeholder="Enter your supermarket name" />
              </div>
            </>
          )}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'login' ? 'Logging in...' : 'Signing up...'}
              </>
            ) : (
              mode === 'login' ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        {/* Switch between login/signup */}
        <div className="text-center mt-6 text-sm">
          {mode === 'login' && showSignupOption && (
            <button type="button" className="text-rose-600 hover:underline" onClick={showSignupOption}>
              Don't have an account? Sign Up
            </button>
          )}
          {mode === 'signup' && showLoginOption && (
            <button type="button" className="text-rose-600 hover:underline" onClick={showLoginOption}>
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;