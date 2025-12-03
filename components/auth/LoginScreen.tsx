
import React, { useState } from 'react';
import { LockIcon } from '../icons/LockIcon';
import { ProfileIcon } from '../icons/ProfileIcon';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!username || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    try {
        const usersJSON = localStorage.getItem('blockdag_users');
        const users = usersJSON ? JSON.parse(usersJSON) : [];

        if (users.some((user: any) => user.username.toLowerCase() === username.toLowerCase())) {
            setError("Username already exists.");
            return;
        }

        const newUser = { username, password }; // Note: In a real app, hash the password!
        users.push(newUser);
        localStorage.setItem('blockdag_users', JSON.stringify(users));
        
        setSuccess("Account created successfully! Please log in.");
        clearForm();
        setIsLoginView(true);

    } catch (err) {
        setError("An error occurred. Please try again.");
        console.error("Registration error:", err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!username || !password) {
        setError("Username and password are required.");
        return;
    }

    try {
        const usersJSON = localStorage.getItem('blockdag_users');
        if (!usersJSON) {
            setError("Invalid username or password.");
            return;
        }
        
        const users = JSON.parse(usersJSON);
        const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

        if (user) {
            onLoginSuccess(user.username);
        } else {
            setError("Invalid username or password.");
        }
    } catch (err) {
        setError("An error occurred. Please try again.");
        console.error("Login error:", err);
    }
  };
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    clearMessages();
    clearForm();
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="w-full space-y-6">
      <div className="relative">
        <ProfileIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Username"
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-3 pl-11 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        />
      </div>
      <div className="relative">
        <LockIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          type="password" 
          placeholder="Password"
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-3 pl-11 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        />
      </div>
      <button 
        type="submit" 
        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-all duration-300 transform hover:scale-105">
        LOG IN
      </button>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="w-full space-y-6">
      <div className="relative">
        <ProfileIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-3 pl-11 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        />
      </div>
      <div className="relative">
        <LockIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-3 pl-11 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        />
      </div>
      <div className="relative">
        <LockIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-3 pl-11 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        />
      </div>
      <button 
        type="submit" 
        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-all duration-300 transform hover:scale-105">
        CREATE ACCOUNT
      </button>
    </form>
  );

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 font-sans"
      style={{
        backgroundImage: `url('https://storage.googleapis.com/aai-web-samples/apps/marc/login-background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div 
        className="w-full max-w-sm rounded-2xl p-8 space-y-6 animate-fadeIn"
        style={{
          background: 'rgba(10, 20, 39, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 191, 255, 0.3)',
          boxShadow: '0 0 25px rgba(0, 191, 255, 0.3)',
        }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-wider uppercase">
            {isLoginView ? 'Welcome' : 'Register'}
          </h2>
          <p className="text-gray-400 mt-1 text-sm">
            {isLoginView ? 'Sign in to your account' : 'Create your new account'}
          </p>
        </div>
        
        {error && <div className="p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-md text-sm text-center">{error}</div>}
        {success && <div className="p-3 bg-green-900/50 text-green-300 border border-green-700 rounded-md text-sm text-center">{success}</div>}
            
        {isLoginView ? renderLoginForm() : renderRegisterForm()}
        
        <div className="flex justify-between text-xs sm:text-sm">
          {isLoginView ? (
            <>
              <a href="#" className="font-medium text-gray-400 hover:text-white transition-colors">
                Forgot Password?
              </a>
              <button onClick={toggleView} className="font-medium text-gray-400 hover:text-white transition-colors">
                Create Account
              </button>
            </>
          ) : (
            <p className="w-full text-center">
              Already have an account?{' '}
              <button onClick={toggleView} className="font-medium text-blue-400 hover:text-blue-300">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
