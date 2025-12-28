import React, { useState } from 'react';

interface KYCFormData {
  displayName: string;
  accountEmail: string;
  accountPassword: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  idType: string;
  idNumber: string;
}

interface KYCFormProps {
  onSubmit: (data: KYCFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

const KYCForm: React.FC<KYCFormProps> = ({ onSubmit, onCancel, isLoading = false, error = '' }) => {
  const [formData, setFormData] = useState<KYCFormData>({
    displayName: '',
    accountEmail: '',
    accountPassword: '',
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    idType: 'passport',
    idNumber: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<KYCFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name as keyof KYCFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<KYCFormData> = {};

    // Account validation - REQUIRED
    if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required';
    if (!formData.accountEmail.trim()) newErrors.accountEmail = 'Email is required';
    if (!formData.accountPassword.trim()) newErrors.accountPassword = 'Password is required';
    if (formData.accountPassword.length < 6) newErrors.accountPassword = 'Password must be at least 6 characters';

    // KYC fields are optional - only validate if at least one is filled
    // This allows users to skip KYC and come back to it later

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== KYC FORM SUBMIT CLICKED ===');
    console.log('Form data:', formData);
    if (validateForm()) {
      console.log('Form validation passed, calling onSubmit');
      onSubmit(formData);
    } else {
      console.log('Form validation failed, errors:', errors);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto pt-8">
      <div className="w-full max-w-3xl bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 my-auto">
        <div className="p-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-cyan-300">Create Account</h2>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white text-xl"
            >
              ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error/Success Messages */}
        {error && (
          <div className={`p-3 rounded-lg border ${
            error.toLowerCase().includes('success')
              ? 'bg-green-900/30 border-green-700/50 text-green-300'
              : 'bg-red-900/30 border-red-700/50 text-red-300'
          }`}>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Account Setup */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Account Information</h3>
          
          <div>
            <label htmlFor="displayName" className="block text-sm font-semibold text-slate-300 mb-2">Display Name</label>
            <input
              id="displayName"
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Your display name"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
            />
            {errors.displayName && <p className="text-red-400 text-xs mt-1">{errors.displayName}</p>}
          </div>

          <div>
            <label htmlFor="accountEmail" className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
            <input
              id="accountEmail"
              type="email"
              name="accountEmail"
              value={formData.accountEmail}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
            />
            {errors.accountEmail && <p className="text-red-400 text-xs mt-1">{errors.accountEmail}</p>}
          </div>

          <div>
            <label htmlFor="accountPassword" className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
            <div className="relative">
              <input
                id="accountPassword"
                type={showPassword ? 'text' : 'password'}
                name="accountPassword"
                value={formData.accountPassword}
                onChange={handleChange}
                placeholder="At least 6 characters"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all pr-10 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.accountPassword && <p className="text-red-400 text-xs mt-1">{errors.accountPassword}</p>}
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Personal Information</h3>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={isLoading}
              autoComplete="name"
              className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
            />
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-300 mb-2">Phone</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                disabled={isLoading}
                autoComplete="tel"
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-300 mb-2">Date of Birth</label>
              <input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="bday"
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
              />
              {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4 pt-4 border-t border-slate-600/30">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Address</h3>
          
          <div>
            <label htmlFor="street" className="block text-sm font-semibold text-slate-300 mb-2">Street Address</label>
            <input
              id="street"
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="123 Main Street"
              disabled={isLoading}
              autoComplete="street-address"
              className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
            />
            {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-slate-300 mb-2">City</label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                disabled={isLoading}
                autoComplete="address-level2"
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
              />
              {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-slate-300 mb-2">State</label>
              <input
                id="state"
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="NY"
                disabled={isLoading}
                autoComplete="address-level1"
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
              />
              {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-semibold text-slate-300 mb-2">Zip Code</label>
              <input
                id="zipCode"
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="10001"
                disabled={isLoading}
                autoComplete="postal-code"
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
              />
              {errors.zipCode && <p className="text-red-400 text-xs mt-1">{errors.zipCode}</p>}
            </div>
          </div>
        </div>

        {/* Identity Verification */}
        <div className="space-y-4 pt-4 border-t border-slate-600/30">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Identity Verification</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="idType" className="block text-sm font-semibold text-slate-300 mb-2">ID Type</label>
              <select
                id="idType"
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
              >
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="national_id">National ID</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="idNumber" className="block text-sm font-semibold text-slate-300 mb-2">ID Number</label>
              <input
                id="idNumber"
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="123456789"
                disabled={isLoading}
                autoComplete="off"
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-500/60 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/80 disabled:opacity-50 transition-all text-base"
              />
              {errors.idNumber && <p className="text-red-400 text-xs mt-1">{errors.idNumber}</p>}
            </div>
          </div>
        </div>



        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-slate-600/30">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 border border-slate-500/50 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={(e) => {
              console.log('Verify Identity button clicked directly');
              handleSubmit(e);
            }}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30"
          >
            {isLoading && <span className="animate-spin">⏳</span>}
            {isLoading ? 'Verifying...' : 'Verify Identity'}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default KYCForm;
