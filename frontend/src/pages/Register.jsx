import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Signup failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ name, email, password, role });
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#1A1A1A] w-full flex items-start justify-center pt-12 px-4 -mt-8">
      <div className="w-full max-w-md bg-[#FDFBF7] p-8 rounded-2xl shadow-2xl border border-[#C5A059]/20">
        <div className="text-center mb-6">
          <img src="/sk_logo.png" alt="SK Gallery Logo" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1A1A1A] font-['Outfit']">Create an Account</h2>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 font-medium">{error}</div>}
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2 text-center">I want to join as a:</label>
          <div className="flex gap-4">
            <label className={`flex-1 flex justify-center items-center p-3 rounded-xl border-2 cursor-pointer transition-colors ${role === 'customer' ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
              <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} className="sr-only" />
              <span className="font-bold">Customer</span>
            </label>
            <label className={`flex-1 flex justify-center items-center p-3 rounded-xl border-2 cursor-pointer transition-colors ${role === 'artist' ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
              <input type="radio" name="role" value="artist" checked={role === 'artist'} onChange={() => setRole('artist')} className="sr-only" />
              <span className="font-bold">Artist</span>
            </label>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-Up was unsuccessful')}
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#FDFBF7] text-gray-500 font-medium">Or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] bg-white"
            />
          </div>
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
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#C5A059] text-[#1A1A1A] py-3 px-4 rounded-xl font-bold text-lg hover:bg-[#b59049] transition-colors shadow-lg shadow-[#C5A059]/20 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 font-medium">
          Already have an account? <Link to="/login" className="text-[#C5A059] hover:underline font-bold">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
