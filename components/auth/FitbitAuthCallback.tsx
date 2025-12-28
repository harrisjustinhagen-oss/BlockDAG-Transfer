import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import fitbitService from '../../services/fitbitService';

export const FitbitAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(`Fitbit auth error: ${errorParam}`);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!code || !state) {
          setError('Missing OAuth code or state');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        const success = await fitbitService.handleOAuthCallback(code, state);
        
        if (success) {
          setLoading(false);
          setTimeout(() => navigate('/'), 2000);
        } else {
          setError('Failed to authenticate with Fitbit');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An error occurred during authentication');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Authenticating with Fitbit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">{error}</p>
          <p className="text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <p className="text-green-500 text-lg mb-2">Successfully authenticated!</p>
        <p className="text-slate-400">Redirecting...</p>
      </div>
    </div>
  );
};
