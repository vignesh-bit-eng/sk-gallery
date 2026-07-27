import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, Users, Image as ImageIcon, MessageSquare, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  
  const [stats, setStats] = useState({ totalUsers: 0, totalDownloads: 0 });
  const [allUsers, setAllUsers] = useState([]);

  const [feedbacks, setFeedbacks] = useState([]);
  const [masterGallery, setMasterGallery] = useState([]);
  const [pendingTx, setPendingTx] = useState([]);

  useEffect(() => {
    if (user && user.email === 'vlss15092005vignesh@gmail.com') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:5000';
      
      const [statsRes, artsRes, fbRes, txRes] = await Promise.all([
        axios.get(`${baseUrl}/api/stats`, config),
        axios.get(`${baseUrl}/api/artworks/all`, config),
        axios.get(`${baseUrl}/api/feedback`, config),
        axios.get(`${baseUrl}/api/transactions/pending`, config)
      ]);
      
      setStats(statsRes.data);
      setAllUsers(statsRes.data.allUsers || []);
      setMasterGallery(artsRes.data);
      setFeedbacks(fbRes.data);
      setPendingTx(txRes.data);
      
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveArt = async (id) => {
    try {
      const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:5000';
      await axios.put(`${baseUrl}/api/artworks/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectArt = async (id) => {
    if(!window.confirm('Reject and archive this artwork?')) return;
    try {
      const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:5000';
      await axios.put(`${baseUrl}/api/artworks/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArt = async (id) => {
    if(!window.confirm('Delete this artwork?')) return;
    try {
      const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:5000';
      await axios.delete(`${baseUrl}/api/artworks/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyTx = async (txId) => {
    try {
      const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:5000';
      await axios.put(`${baseUrl}/api/transactions/${txId}/verify`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to verify transaction');
    }
  };

  if (!user || user.email !== 'vlss15092005vignesh@gmail.com') {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] font-['Outfit'] mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#C5A059]" /> Secure Owner Portal
          </h1>
          <p className="text-gray-500 font-medium">Platform Administration & Monitoring</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'stats' ? 'bg-[#1A1A1A] text-[#C5A059]' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
        >
          <Users className="w-5 h-5" /> Platform Statistics
        </button>
        <button 
          onClick={() => setActiveTab('feedback')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'feedback' ? 'bg-[#1A1A1A] text-[#C5A059]' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
        >
          <MessageSquare className="w-5 h-5" /> Feedback Center
        </button>
        <button 
          onClick={() => setActiveTab('gallery')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'gallery' ? 'bg-[#1A1A1A] text-[#C5A059]' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
        >
          <ImageIcon className="w-5 h-5" /> Master Gallery
        </button>
        <button 
          onClick={() => setActiveTab('queue')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'queue' ? 'bg-[#1A1A1A] text-[#C5A059]' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 relative'}`}
        >
          <CheckCircle className="w-5 h-5" /> Approval Queue
          {masterGallery.filter(a => a.status === 'Pending').length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
              {masterGallery.filter(a => a.status === 'Pending').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'transactions' ? 'bg-[#1A1A1A] text-[#C5A059]' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
        >
          <CheckCircle className="w-5 h-5" /> Pending Transactions
        </button>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-gray-800 p-8 rounded-2xl shadow-xl text-white">
              <h3 className="text-[#C5A059] font-bold text-lg mb-2 uppercase tracking-widest">Total Registered Users</h3>
              <p className="text-6xl font-light font-['Outfit']">{stats.totalUsers || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-[#1A1A1A] to-gray-800 p-8 rounded-2xl shadow-xl text-white">
              <h3 className="text-[#C5A059] font-bold text-lg mb-2 uppercase tracking-widest">Total Site Downloads</h3>
              <p className="text-6xl font-light font-['Outfit']">{stats.totalDownloads || 0}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A] font-['Outfit']">All Registered Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="pb-3 font-bold text-gray-500 uppercase tracking-wider text-sm">Name</th>
                    <th className="pb-3 font-bold text-gray-500 uppercase tracking-wider text-sm">Email</th>
                    <th className="pb-3 font-bold text-gray-500 uppercase tracking-wider text-sm">Account Type</th>
                    <th className="pb-3 font-bold text-gray-500 uppercase tracking-wider text-sm text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-bold text-gray-900">{u.name}</td>
                      <td className="py-4 text-gray-600">{u.email}</td>
                      <td className="py-4">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-bold uppercase">{u.role}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${u.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isVerified ? 'Active' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {allUsers.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-gray-500">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A] font-['Outfit']">Feedback Center</h2>
          <div className="space-y-4">
            {feedbacks.map(fb => (
              <div key={fb._id} className="p-6 rounded-xl border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{fb.name}</h4>
                    <p className="text-sm text-gray-500">{fb.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 italic">"{fb.message}"</p>
              </div>
            ))}
            {feedbacks.length === 0 && <p className="text-gray-500 text-center py-8">No feedbacks received yet.</p>}
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A] font-['Outfit']">Master Gallery Page</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {masterGallery.map(art => (
              <div key={art._id} className="group relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                <img src={art.imageUrl.startsWith('http') ? art.imageUrl : (import.meta.env.PROD ? art.imageUrl : `http://localhost:5000${art.imageUrl}`)} alt={art.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
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
                    <p className="text-[#C5A059] font-bold truncate text-lg">{art.title}</p>
                    <p className="text-gray-300 text-xs">By: {art.uploader?.name || 'Unknown'}</p>
                    <p className="text-gray-400 text-[10px] truncate">{art.uploader?.email || 'N/A'}</p>
                    {art.status === 'Pending' && (
                      <button 
                        onClick={() => handleApproveArt(art._id)}
                        className="mt-2 w-full bg-emerald-500 text-white py-1.5 rounded flex items-center justify-center gap-1 text-xs font-bold hover:bg-emerald-600"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {masterGallery.length === 0 && <p className="col-span-full text-center text-gray-500 py-8">No artworks uploaded yet.</p>}
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A] font-['Outfit']">Approval Queue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {masterGallery.filter(art => art.status === 'Pending').map(art => (
              <div key={art._id} className="flex gap-4 p-4 border border-gray-100 rounded-xl items-center hover:bg-gray-50 transition-colors shadow-sm">
                <img src={art.imageUrl.startsWith('http') ? art.imageUrl : `http://localhost:5000${art.imageUrl}`} alt="art" className="w-24 h-24 object-cover rounded-lg shadow-sm" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{art.title}</p>
                  <p className="text-sm text-gray-500">By: <span className="font-medium text-gray-700">{art.uploader?.name || 'Unknown'}</span></p>
                  <p className="text-xs text-[#C5A059] font-bold mt-1">Category: {art.category}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleApproveArt(art._id)}
                    className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1 w-full"
                  >
                    <CheckCircle className="w-4 h-4" /> APPROVE
                  </button>
                  <button 
                    onClick={() => handleRejectArt(art._id)}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors flex items-center justify-center gap-1 w-full"
                  >
                    <XCircle className="w-4 h-4" /> REJECT
                  </button>
                </div>
              </div>
            ))}
            {masterGallery.filter(art => art.status === 'Pending').length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-8">No artworks pending approval!</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A] font-['Outfit'] flex items-center gap-2">
            <span className="bg-amber-100 text-amber-600 w-8 h-8 flex items-center justify-center rounded-full text-sm">{pendingTx.length}</span>
            Pending Transactions
          </h2>
          {pendingTx.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No pending payments.</p>
          ) : (
            <div className="space-y-4">
              {pendingTx.map(tx => (
                <div key={tx._id} className="p-5 border border-gray-100 rounded-xl flex justify-between items-center hover:bg-gray-50 transition-colors shadow-sm">
                  <div>
                    <p className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                      UPI TxID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm text-[#C5A059]">{tx.transactionId}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-[#1A1A1A]">{tx.type}</span> - <span className="font-bold text-emerald-600">₹{tx.amount}</span> from {tx.user.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleVerifyTx(tx._id)}
                      className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors shadow-sm"
                    >
                      Verify Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
