import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

export default function OwnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.role !== 'owner') {
        setError('Unauthorized: You are not an owner.');
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-center mb-4">
        <div className="bg-red-100 p-3 rounded-full">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Owner Portal</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex items-center justify-end mb-2">
          <Link to="/forgot-password" className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors">
            Forgot your password?
          </Link>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Access Dashboard'}
        </button>
      </form>
    </div>
  );
}

