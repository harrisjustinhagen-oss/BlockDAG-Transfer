import React, { useState } from 'react';
import { auth } from '../../services/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { BlockDAGIcon } from '../icons/BlockDAGIcon';
import KYCForm from './KYCForm';

interface CinemagraphLoginProps {
  onLoginSuccess: (userId: string, userName: string) => void;
}

/**
 * Cinemagraph Login Screen
 * Features astronaut background with login form
 */
const CinemagraphLoginScreen: React.FC<CinemagraphLoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showKYC, setShowKYC] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requiresPinVerification, setRequiresPinVerification] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<{ uid: string; displayName: string } | null>(null);



  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If clicking signup, go directly to KYC form
    if (!isLogin) {
      setShowKYC(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate email and password
      if (!email.trim()) {
        setError('Please enter your email');
        setLoading(false);
        return;
      }
      if (!password.trim()) {
        setError('Please enter your password');
        setLoading(false);
        return;
      }

      // Authenticate directly with email and password
      try {
        const result = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
        console.log('Login successful:', result.user.uid);
        setLoading(false);
        onLoginSuccess(result.user.uid, result.user.displayName || 'Guest');
      } catch (loginErr: any) {
        console.error('Login error:', loginErr);
        if (loginErr.code === 'auth/user-not-found') {
          setError('No account found with this email');
        } else if (loginErr.code === 'auth/wrong-password') {
          setError('Incorrect password');
        } else {
          setError('Invalid email or password');
        }
        setLoading(false);
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  const handleKYCSubmit = async (kycData: any) => {
    setLoading(true);
    setError('');

    console.log('=== KYC SUBMIT START ===');
    console.log('Display name:', kycData.displayName);
    console.log('Email:', kycData.accountEmail);
    console.log('Creating account...');

    try {
      const db = getFirestore();

      // Run username and email checks in parallel for speed
      const [usernameQuery, emailQuery] = await Promise.all([
        getDocs(query(collection(db, 'profiles'), where('username', '==', kycData.displayName.toLowerCase().trim()))),
        getDocs(query(collection(db, 'profiles'), where('email', '==', kycData.accountEmail.toLowerCase().trim())))
      ]);

      if (!usernameQuery.empty) {
        setError('This username is already taken. Please choose a different one.');
        setLoading(false);
        return;
      }

      if (!emailQuery.empty) {
        setError('This email is already registered. Please log in instead.');
        setLoading(false);
        return;
      }

      // Create Firebase user account
      console.log('Creating Firebase user...');
      const result = await createUserWithEmailAndPassword(auth, kycData.accountEmail, kycData.accountPassword);
      console.log('Firebase user created:', result.user.uid);
      
      await updateProfile(result.user, { displayName: kycData.displayName });
      console.log('Firebase profile updated');
      
      const userId = result.user.uid;

      // Save both user KYC data and profile in parallel
      console.log('Saving Firestore documents...');
      try {
        const usersDoc = setDoc(doc(db, 'users', userId), {
          displayName: kycData.displayName,
          accountEmail: kycData.accountEmail,
          fullName: kycData.fullName || '',
          email: kycData.email || '',
          phone: kycData.phone || '',
          dateOfBirth: kycData.dateOfBirth || '',
          street: kycData.street || '',
          city: kycData.city || '',
          state: kycData.state || '',
          zipCode: kycData.zipCode || '',
          idType: kycData.idType || '',
          idNumber: kycData.idNumber || '',
          createdAt: new Date().toISOString()
        });
        const profilesDoc = setDoc(doc(db, 'profiles', userId), {
          userId: userId,
          username: kycData.displayName.toLowerCase().trim(),
          displayName: kycData.displayName,
          email: kycData.accountEmail.toLowerCase().trim(),
          avatar: '',
          bio: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        await Promise.all([usersDoc, profilesDoc]);
        console.log('=== DOCUMENTS SAVED SUCCESSFULLY ===');
        console.log('Created profile with username:', kycData.displayName.toLowerCase().trim());
      } catch (firestoreErr: any) {
        console.error('=== FIRESTORE WRITE ERROR ===', firestoreErr);
        console.error('Error code:', firestoreErr.code);
        console.error('Error message:', firestoreErr.message);
        setError('Failed to save profile: ' + firestoreErr.message);
        setLoading(false);
        return;
      }

      // Account created successfully - log them in automatically
      console.log('Account created successfully for:', kycData.displayName);
      setLoading(false);
      
      // Close form and auto-login after brief delay
      setTimeout(async () => {
        console.log('Closing KYC form and logging in...');
        setShowKYC(false);
        setIsLogin(true);
        setEmail(kycData.accountEmail);
        setPassword(kycData.accountPassword);
        setPin('');
        setError('');
        
        // Auto-login with new credentials
        try {
          const loginResult = await signInWithEmailAndPassword(auth, kycData.accountEmail, kycData.accountPassword);
          onLoginSuccess(loginResult.user.uid, kycData.displayName);
        } catch (loginErr) {
          console.error('Auto-login failed:', loginErr);
          setError('Account created! Please log in with your credentials.');
        }
      }, 1000);
    } catch (err: any) {
      console.error('Account creation error:', err);
      let errorMessage = 'Account creation failed';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please log in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password authentication is not enabled. Please contact support.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log('Setting error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePinVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      setError('Please enter your PIN');
      return;
    }

    if (!pendingLoginData) {
      setError('Session expired. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const db = getFirestore();
      
      // Query to get the email from the profile of the pending login
      const profileDoc = await getDocs(
        query(collection(db, 'profiles'), where('displayName', '==', pendingLoginData.displayName))
      );

      if (profileDoc.empty) {
        setError('User profile not found');
        setLoading(false);
        return;
      }

      const storedEmail = profileDoc.docs[0].data().email;

      // Get user's PIN from Firestore
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('accountEmail', '==', storedEmail))
      );

      if (userDoc.empty) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const userData = userDoc.docs[0].data();
      
      // Verify PIN
      if (userData.pin !== pin) {
        setError('Incorrect PIN');
        setLoading(false);
        return;
      }

      // PIN is correct - proceed with login
      setRequiresPinVerification(false);
      setPendingLoginData(null);
      setPin('');
      onLoginSuccess(pendingLoginData.uid, pendingLoginData.displayName);
    } catch (err: any) {
      console.error('PIN verification error:', err);
      setError('PIN verification failed. Please try again.');
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
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-gradient-to-b from-slate-900 to-black">
      {console.log('CinemagraphLoginScreen rendering, showKYC:', showKYC, 'isLogin:', isLogin, 'requiresPinVerification:', requiresPinVerification)}
      {console.log('Component state:', { showKYC, isLogin, requiresPinVerification, email, error: error.substring(0, 50) })}
      
      {/* Background - simplified */}
      <div className="absolute inset-0 z-0 opacity-30" style={{
        backgroundImage: 'url("/assets/astronaut-visor.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />

      {/* KYC Modal - rendered separately at full screen */}
      {showKYC && (
        <div className="z-50">
          {console.log('Showing KYC form')}
          <KYCForm 
            onSubmit={handleKYCSubmit}
            onCancel={() => {
              setShowKYC(false);
              setError('');
            }}
            isLoading={loading}
            error={error}
          />
        </div>
      )}

      {/* Main form container - moved to bottom of screen */}
      {!showKYC && (
      <div className="w-full max-w-xs fixed left-1/2 -translate-x-1/2 z-50" style={{ bottom: '2%' }}>
        <>
          {/* Auth Card */}
          <div className="bg-blue-900/30 backdrop-blur-3xl border border-blue-400/40 rounded-2xl p-4 mb-0 shadow-2xl">
              {/* Welcome Header */}
              <div className="text-center mb-3 pb-3 border-b border-blue-400/20">
                <p className="text-sm font-semibold text-cyan-200 drop-shadow-lg tracking-wide">
                  Welcome! You Are Not Alone
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-3 p-2 bg-red-900/30 border border-red-700/50 rounded">
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}

              {/* PIN Verification Modal (appears after successful login) */}
              {requiresPinVerification && (
              <form onSubmit={handlePinVerification} className="space-y-3 mb-4">
                <p className="text-sm text-slate-300 mb-3">This account requires PIN verification</p>
                <div>
                  <label htmlFor="verificationPin" className="block text-xs font-semibold text-slate-300 mb-1">
                    Enter PIN
                  </label>
                  <input
                    id="verificationPin"
                    name="pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter your PIN"
                    disabled={loading}
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="off"
                    className="w-full px-2.5 py-1.5 bg-slate-700/40 border border-slate-500/60 rounded text-sm text-white placeholder-slate-300 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/50 disabled:opacity-50 transition-all tracking-widest"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-1.5 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold rounded transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30"
                >
                  {loading && <span className="animate-spin">⏳</span>}
                  Verify PIN
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequiresPinVerification(false);
                    setPendingLoginData(null);
                    setPin('');
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full py-1.5 text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 font-semibold rounded transition-all"
                >
                  Cancel
                </button>
              </form>
              )}

              {/* Email/Password Login Form */}
              {isLogin && !requiresPinVerification && (
              <form onSubmit={handleEmailAuth} className="space-y-3 mb-4">
                <div>
                  <label htmlFor="loginEmail" className="block text-xs font-semibold text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    id="loginEmail"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    disabled={loading}
                    autoComplete="email"
                    className="w-full px-2.5 py-1.5 bg-slate-700/40 border border-slate-500/60 rounded text-sm text-white placeholder-slate-300 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/50 disabled:opacity-50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="loginPassword" className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="loginPassword"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isLogin ? 'Enter password' : 'At least 6 characters'}
                      disabled={loading}
                      autoComplete="current-password"
                      className="w-full px-2.5 py-1.5 bg-slate-700/40 border border-slate-500/60 rounded text-sm text-white placeholder-slate-300 focus:outline-none focus:border-cyan-400 focus:bg-slate-700/50 disabled:opacity-50 transition-all pr-8"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-300 text-sm"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Tab Toggle - Login and Sign Up Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-1.5 rounded text-sm font-semibold transition-all bg-cyan-500 text-white shadow-lg shadow-cyan-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <span className="animate-spin">⏳</span>}
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowKYC(true);
                      setError('');
                    }}
                    className="flex-1 py-1.5 rounded text-sm font-semibold transition-all bg-slate-700 text-slate-300 hover:bg-slate-600"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
              )}

            {/* BlockDAG Below Form */}
            <div className="text-center mt-3">
              <div className="flex items-center justify-center gap-3">
                <BlockDAGIcon className="w-10 h-10 text-cyan-400 drop-shadow-lg" />
                <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-lg">
                  BlockDAG
                </span>
              </div>
            </div>
          </div>
        </>
      </div>
      )}
    </div>
  );
};

export default CinemagraphLoginScreen;
