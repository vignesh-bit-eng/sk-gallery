import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Palette, Mail, KeyRound, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('https://sk-gallery-1.onrender.com/api/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('https://sk-gallery-1.onrender.com/api/auth/reset-password', { email, code, newPassword });
      alert('Password reset successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6 group">
          <div className="bg-red-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900 group-hover:text-red-600 transition-colors">SK Gallery</span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {step === 1 ? 'Reset Password' : 'Create New Password'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 ? 'Enter your email to receive a code' : 'Enter the verification code sent to your email'}
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-red-100 sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSendCode}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all gap-2 items-center"
              >
                {loading ? 'Sending...' : 'Send Verification Code'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                    placeholder="6-digit code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all gap-2 items-center"
              >
                {loading ? 'Resetting...' : 'Create New Password'} <CheckCircle className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-red-600 hover:text-red-500 flex justify-center items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


