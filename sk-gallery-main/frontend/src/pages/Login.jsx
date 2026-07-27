import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        navigate('/verify-email', { state: { email } });
      } else {
        setError(err.response?.data?.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#1A1A1A] w-full flex items-start justify-center pt-12 px-4 -mt-8">
      <div className="w-full max-w-md bg-[#FDFBF7] p-8 rounded-2xl shadow-2xl border border-[#C5A059]/20">
        <div className="text-center mb-6">
          <img src="/sk_logo.png" alt="SK Gallery Logo" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-['Outfit']">Sign In to SK Art Gallery</h2>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 font-medium">{error}</div>}
        
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-In was unsuccessful')}
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#FDFBF7] text-gray-500 font-medium">Or continue with email (Owner only)</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] bg-white"
            />
          </div>

          <div className="flex items-center justify-end mb-2">
            <Link to="/forgot-password" className="text-sm font-bold text-[#C5A059] hover:text-[#a08045] transition-colors">
              Forgot your password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#C5A059] text-[#1A1A1A] py-3 px-4 rounded-xl font-bold text-lg hover:bg-[#b59049] transition-colors shadow-lg shadow-[#C5A059]/20 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 font-medium">
          Don't have an account? <Link to="/register" className="text-[#C5A059] hover:underline font-bold">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
