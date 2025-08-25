import React, { useState } from 'react';

interface AuthProps {
  mode: 'login' | 'signup';
  onAuthSuccess: (...args: any[]) => Promise<void>;
  showSignupOption?: () => void;
  showLoginOption?: () => void;
}

// Parse backend error string into field-level messages and a general message.
// The api layer formats errors like: "password: Too short | email: Already taken | Invalid credentials".
function parseBackendError(err: any): { general: string; fields: Record<string, string[]> } {
  const message = (err?.message || String(err) || '').trim();
  const result: { general: string; fields: Record<string, string[]> } = { general: '', fields: {} };
  if (!message) return result;

  // Split combined messages by ' | '
  const parts = message.split(' | ').map(p => p.trim()).filter(Boolean);
  const pushField = (key: string, msg: string) => {
    if (!result.fields[key]) result.fields[key] = [];
    if (msg && !result.fields[key].includes(msg)) result.fields[key].push(msg);
  };

  for (const part of parts) {
    // Try to detect "label: message"
    const idx = part.indexOf(':');
    let label = '';
    let msg = '';
    if (idx > -1) {
      label = part.substring(0, idx).trim().toLowerCase();
      msg = part.substring(idx + 1).trim();
    }

    // Map common backend labels to our field names
    const mapLabelToField = (l: string): string | null => {
      const normalized = l.replace(/\s+/g, ' ').trim();
      // Common variations
      const map: Record<string, string> = {
        'email': 'email',
        'password': 'password',
        'new password': 'password',
        'password1': 'password',
        'password2': 'confirmPassword',
        'password confirm': 'confirmPassword',
        'password confirmation': 'confirmPassword',
        'confirm password': 'confirmPassword',
        'first name': 'firstName',
        'last name': 'lastName',
        'supermarket name': 'supermarketName',
        'company name': 'supermarketName',
        'name': 'supermarketName', // sometimes returned for company/store
        'non field errors': 'general',
      };
      return map[normalized] || null;
    };

    if (label && msg) {
      const field = mapLabelToField(label);
      if (field && field !== 'general') {
        pushField(field, msg);
        continue;
      }
    }

    // Heuristic fallback: route common keywords to fields
    const low = part.toLowerCase();
    if (low.includes('password')) {
      if (low.includes('confirm')) pushField('confirmPassword', part);
      else pushField('password', part);
    } else if (low.includes('email')) {
      pushField('email', part);
    } else if (low.includes('supermarket')) {
      pushField('supermarketName', part);
    } else if (low.includes('first name')) {
      pushField('firstName', part);
    } else if (low.includes('last name')) {
      pushField('lastName', part);
    } else {
      // Otherwise, treat as general error
      result.general = result.general ? `${result.general} | ${part}` : part;
    }
  }

  return result;
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
  const [error, setError] = useState(''); // general/non-field error
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // client-side quick checks
        if (password !== confirmPassword) {
          setFieldErrors({ confirmPassword: ['Passwords do not match'] });
          setIsLoading(false);
          return;
        }
        if (!supermarketName.trim()) {
          setFieldErrors({ supermarketName: ['Supermarket name is required'] });
          setIsLoading(false);
          return;
        }
        await onAuthSuccess(email, password, firstName, lastName, supermarketName, phone, address);
      } else {
        await onAuthSuccess(email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const parsed = parseBackendError(err);
      setFieldErrors(parsed.fields);
      setError(parsed.general || (!Object.keys(parsed.fields).length ? (err?.message || 'Authentication failed') : ''));
    } finally {
      setIsLoading(false);
    }
  };

  const showFieldError = (key: string) => fieldErrors[key]?.[0];

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
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  aria-invalid={!!showFieldError('firstName')}
                  className={`w-full px-4 py-3 border ${showFieldError('firstName') ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
                  placeholder="Enter your first name"
                />
                {showFieldError('firstName') && (
                  <p className="mt-1 text-xs text-red-600">{showFieldError('firstName')}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  aria-invalid={!!showFieldError('lastName')}
                  className={`w-full px-4 py-3 border ${showFieldError('lastName') ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
                  placeholder="Enter your last name"
                />
                {showFieldError('lastName') && (
                  <p className="mt-1 text-xs text-red-600">{showFieldError('lastName')}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-invalid={!!showFieldError('email')}
              className={`w-full px-4 py-3 border ${showFieldError('email') ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
              placeholder="Enter your email"
            />
            {showFieldError('email') && (
              <p className="mt-1 text-xs text-red-600">{showFieldError('email')}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              aria-invalid={!!showFieldError('password')}
              className={`w-full px-4 py-3 border ${showFieldError('password') ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
              placeholder="Enter your password"
            />
            {showFieldError('password') && (
              <p className="mt-1 text-xs text-red-600">{showFieldError('password')}</p>
            )}
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  aria-invalid={!!showFieldError('confirmPassword')}
                  className={`w-full px-4 py-3 border ${showFieldError('confirmPassword') ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
                  placeholder="Confirm your password"
                />
                {showFieldError('confirmPassword') && (
                  <p className="mt-1 text-xs text-red-600">{showFieldError('confirmPassword')}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                  placeholder="Enter your phone number (optional)"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80"
                  placeholder="Enter your address (optional)"
                  rows={2}
                ></textarea>
              </div>
              <div>
                <label htmlFor="supermarketName" className="block text-sm font-medium text-gray-700 mb-1">Supermarket Name *</label>
                <input
                  type="text"
                  id="supermarketName"
                  name="supermarketName"
                  required
                  value={supermarketName}
                  onChange={e => setSupermarketName(e.target.value)}
                  aria-invalid={!!showFieldError('supermarketName')}
                  className={`w-full px-4 py-3 border ${showFieldError('supermarketName') ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/80`}
                  placeholder="Enter your supermarket name"
                />
                {showFieldError('supermarketName') && (
                  <p className="mt-1 text-xs text-red-600">{showFieldError('supermarketName')}</p>
                )}
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