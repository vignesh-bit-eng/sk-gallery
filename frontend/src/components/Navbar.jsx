import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, CreditCard, UserCircle, MessageSquare, Shield, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  // For Drawer features
  const [newName, setNewName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [nameUpdated, setNameUpdated] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (user) {
      setNewName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUpdateName = async () => {
    try {
      const API_URL = import.meta.env.PROD ? '/api/users/profile' : 'http://localhost:5000/api/users/profile';
      const token = localStorage.getItem('token');
      await axios.put(API_URL, { name: newName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNameUpdated(true);
      setTimeout(() => setNameUpdated(false), 3000);
      // Soft reload to show new name immediately (AuthContext can be improved later to update user)
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert('Failed to update name');
    }
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;
    try {
      const API_URL = import.meta.env.PROD ? '/api/feedback' : 'http://localhost:5000/api/feedback';
      await axios.post(API_URL, { 
        name: user.name, 
        email: user.email, 
        message: feedback 
      });
      setFeedback('');
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to send feedback');
    }
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200' : 'bg-white border-b border-gray-100'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-20 items-center">
            
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-12 w-12 overflow-hidden rounded-md flex items-center justify-center bg-white shadow-sm border border-gray-100 group-hover:scale-105 transition-transform">
                <img src="/sk_logo.png" alt="SK Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-extrabold text-2xl tracking-wide text-[#1A1A1A] group-hover:text-[#C5A059] transition-colors font-['Outfit']">SK Gallery</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {user ? (
                <button 
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none group"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full border-2 border-transparent group-hover:border-[#C5A059] transition-colors" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#1A1A1A] to-gray-600 flex items-center justify-center text-[#C5A059] font-bold ring-2 ring-transparent group-hover:ring-[#C5A059] transition-all">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <Menu className="w-6 h-6 text-gray-700 group-hover:text-[#1A1A1A]" />
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/owner-login" className="text-gray-500 hover:text-[#C5A059] p-2" title="Owner Portal">
                    <Shield className="h-5 w-5" />
                  </Link>
                  <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-[#C5A059] transition-colors">
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#2a2a2a] transition-all shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Drawer overlay */}
      <AnimatePresence>
        {drawerOpen && user && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full border-2 border-[#C5A059]" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#C5A059] font-bold text-xl">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{user.email}</p>
                    <span className="inline-block mt-0.5 text-[10px] uppercase tracking-wider font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-md border border-[#C5A059]/20">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-8">
                
                {/* Name Customization */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <UserCircle className="w-4 h-4 text-[#C5A059]" /> Display Name
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:bg-white transition-colors text-sm"
                    />
                    <button 
                      onClick={handleUpdateName}
                      className="bg-[#1A1A1A] hover:bg-gray-800 text-[#C5A059] px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
                    >
                      {nameUpdated ? <Check className="w-4 h-4 text-green-400" /> : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Payment Details Button */}
                <div className="space-y-3">
                  <button 
                    onClick={() => { setDrawerOpen(false); navigate('/dashboard'); }}
                    className="w-full bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-[#C5A059] p-4 rounded-xl flex items-center justify-between group transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#C5A059]/10 text-[#C5A059] rounded-lg group-hover:bg-[#C5A059] group-hover:text-white transition-colors">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-800">Payment Details</span>
                    </div>
                  </button>

                  {(user.role === 'artist' || user.role === 'owner') && (
                    <button 
                      onClick={() => { setDrawerOpen(false); navigate('/upload'); }}
                      className="w-full bg-gradient-to-r from-[#1A1A1A] to-gray-800 border border-[#1A1A1A] p-4 rounded-xl flex items-center justify-between group transition-all shadow-sm hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#C5A059]/20 text-[#C5A059] rounded-lg group-hover:bg-[#C5A059] group-hover:text-white transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        </div>
                        <span className="font-bold text-white">Upload Artwork</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Feedback Panel */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <MessageSquare className="w-4 h-4 text-[#C5A059]" /> Share Feedback
                  </h3>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="We'd love to hear your thoughts or feature requests..."
                    className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A059] mb-3 text-sm resize-none"
                  ></textarea>
                  <button 
                    onClick={handleSendFeedback}
                    className="w-full bg-white border border-gray-200 hover:border-[#C5A059] text-[#1A1A1A] font-bold py-2 rounded-lg text-sm transition-colors flex justify-center items-center gap-2"
                  >
                    {feedbackSent ? <span className="text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Sent</span> : 'Submit Feedback'}
                  </button>
                </div>

              </div>

              {/* Profile & Logout Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors font-bold"
                >
                  <LogOut className="w-5 h-5" /> LOGOUT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

