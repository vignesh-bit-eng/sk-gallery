import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2, Plus, Shield, LogOut, Download, CreditCard, Heart, Image as ImageIcon, Upload } from 'lucide-react';

import UpiPayment from '../components/UpiPayment';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ stats: [], totalUsers: 0 });
  const [allArts, setAllArts] = useState([]);
  const [pendingTx, setPendingTx] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const [userArts, setUserArts] = useState([]);

  useEffect(() => {
    if (user?.role === 'owner') {
      fetchOwnerData();
    } else if (user?.role === 'artist') {
      fetchArtistData();
    }
  }, [user]);

  const fetchArtistData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Getting all artworks, and filtering by user for now. 
      // A better API endpoint could be added, but this works immediately.
      const artsRes = await axios.get(import.meta.env.PROD ? '/api/artworks' : 'http://localhost:5000/api/artworks', config);
      setUserArts(artsRes.data.filter(art => art.uploader?._id === user._id || art.uploader === user._id));
    } catch (err) {
      console.error('Failed to fetch artist data', err);
    }
  };

  const fetchOwnerData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [statsRes, artsRes, txRes, catRes] = await Promise.all([
        axios.get('https://sk-gallery-1.onrender.com/api/stats', config),
        axios.get('https://sk-gallery-1.onrender.com/api/artworks/all', config),
        axios.get('https://sk-gallery-1.onrender.com/api/transactions/pending', config),
        axios.get('https://sk-gallery-1.onrender.com/api/categories')
      ]);
      setStats(statsRes.data);
      setAllArts(artsRes.data);
      setPendingTx(txRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveArt = async (id) => {
    try {
      await axios.put(`https://sk-gallery-1.onrender.com/api/artworks/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchOwnerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectArt = async (id) => {
    try {
      await axios.put(`https://sk-gallery-1.onrender.com/api/artworks/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchOwnerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArt = async (id) => {
    if(!window.confirm('Are you sure you want to permanently delete this artwork?')) return;
    try {
      await axios.delete(`https://sk-gallery-1.onrender.com/api/artworks/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchOwnerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyTx = async (id) => {
    try {
      await axios.put(`https://sk-gallery-1.onrender.com/api/transactions/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchOwnerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await axios.post('https://sk-gallery-1.onrender.com/api/categories', { name: newCategoryName }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewCategoryName('');
      fetchOwnerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`https://sk-gallery-1.onrender.com/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchOwnerData();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  if (!user) return <Navigate to="/login" />;

  if (user.role === 'customer') {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1A1A1A] font-['Outfit'] mb-2">Welcome, {user.name}</h1>
            <p className="text-gray-500 font-medium">Your personal gallery dashboard</p>
          </div>
          <button onClick={() => window.location.href='/'} className="bg-white border border-gray-200 text-red-600 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm font-medium text-gray-500">Images Downloaded</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#C5A059]/10 text-[#C5A059] rounded-full flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm font-medium text-gray-500">Favorite Artists</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <button className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-600 font-semibold hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'artist') {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1A1A1A] font-['Outfit'] mb-2">Artist Studio</h1>
            <p className="text-gray-500 font-medium">Manage your portfolio, {user.name}</p>
          </div>
          <button onClick={() => window.location.href='/'} className="bg-white border border-gray-200 text-red-600 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{userArts.length}</h3>
            <p className="text-sm font-medium text-gray-500">Images Posted</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#1A1A1A]/5 text-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{user.artistUploadCount || 0} / 5</h3>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-1 mb-2">
              <div 
                className={`h-full ${user.artistUploadCount >= 5 ? 'bg-red-500' : 'bg-[#C5A059]'}`} 
                style={{ width: `${(Math.min(user.artistUploadCount || 0, 5) / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs font-medium text-gray-500">Free Slots Used</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <button className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-600 font-semibold hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Details
            </button>
          </div>
        </div>

        {(user.artistUploadCount || 0) >= 5 && (
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center mb-10 shadow-sm">
            <p className="text-amber-800 font-bold text-lg mb-2">Free upload limit reached</p>
            <p className="text-amber-700 mb-4">You need to purchase more slots to continue uploading to your portfolio.</p>
            <button 
              onClick={() => setShowPayment(true)}
              className="bg-[#1A1A1A] text-[#C5A059] px-6 py-3 rounded-xl font-bold hover:bg-[#2a2a2a] transition-colors shadow-lg"
            >
              Pay ₹20 for 5 More Slots
            </button>
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A] font-['Outfit']">Your Portfolio</h2>
          {userArts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You haven't uploaded any artworks yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {userArts.map(art => (
                <div key={art._id} className="group relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                  <img src={art.imageUrl.startsWith('http') ? art.imageUrl : (import.meta.env.PROD ? art.imageUrl : `http://localhost:5000${art.imageUrl}`)} alt={art.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${art.status === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {art.status}
                      </span>
                      <button 
                        onClick={() => handleDeleteArt(art._id)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                        title="Delete Artwork"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-white font-bold truncate">{art.title}</p>
                      <p className="text-gray-300 text-xs">{art.priceType === 'Free' ? 'Free' : `₹${art.price}`}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showPayment && (
          <UpiPayment 
            amount={20} 
            purpose="ArtistUploadSlot" 
            artworkId={null}
            onSuccess={() => {
              setShowPayment(false);
              alert("Payment submitted! Wait for owner to verify to unlock your slots.");
            }}
            onCancel={() => setShowPayment(false)}
          />
        )}
      </div>
    );
  }

  if (user.role === 'owner') {
    return <Navigate to="/owner-dashboard" />;
  }

  return <Navigate to="/" />;
}
