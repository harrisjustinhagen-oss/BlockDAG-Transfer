import React, { useState } from 'react';
import { auth } from '../../services/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';

interface LoginScreenProps {
  onLoginSuccess: (userId: string, userName: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Sign in with email
        const result = await signInWithEmailAndPassword(auth, email, password);
        const name = result.user.displayName || email.split('@')[0];
        onLoginSuccess(result.user.uid, name);
      } else {
        // Sign up with email
        if (!displayName.trim()) {
          setError('Please enter a display name');
          setLoading(false);
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Update display name
        await updateProfile(result.user, { displayName });
        onLoginSuccess(result.user.uid, displayName);
      }
    } catch (err: any) {
      let errorMessage = 'Authentication failed';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please log in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      }
      
      setError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInAnonymously(auth);
      const randomName = `Guest_${Math.random().toString(36).substr(2, 9)}`;
      onLoginSuccess(result.user.uid, randomName);
    } catch (err) {
      setError('Failed to sign in anonymously');
      console.error('Anonymous auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url("/assets/astronaut-visor.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Main form container */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Title */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-2 drop-shadow-lg">
            🎭 BlockDAG
          </h1>
          <p className="text-slate-100 drop-shadow-md">Create your avatar and explore</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-500/30 rounded-2xl p-8 mb-6 shadow-2xl">
          {/* Tab Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setEmail('');
                setPassword('');
                setDisplayName('');
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                isLogin
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setEmail('');
                setPassword('');
                setDisplayName('');
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                !isLogin
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 disabled:opacity-50 transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 disabled:opacity-50 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? 'Enter password' : 'At least 6 characters'}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 disabled:opacity-50 transition-all pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading && <span className="animate-spin">⏳</span>}
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-700/50"></div>
            <span className="text-xs text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-700/50"></div>
          </div>

          {/* Anonymous Login */}
          <button
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full py-2 border border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            👤 Continue as Guest
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400">
            {isLogin
              ? "Don't have an account? Click 'Sign Up' to create one."
              : 'Already have an account? Click "Login" to sign in.'}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Your login info is securely stored on Firebase
          </p>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🎭</div>
            <p className="text-xs text-slate-400">Create Avatar</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">☁️</div>
            <p className="text-xs text-slate-400">Cloud Sync</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">👥</div>
            <p className="text-xs text-slate-400">Community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
