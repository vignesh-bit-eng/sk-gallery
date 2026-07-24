import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

export default function UploadArt() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [priceType, setPriceType] = useState('Free');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [is4K, setIs4K] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Owner specific
  const [uploaderId, setUploaderId] = useState('');
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (user?.role === 'owner') {
      fetchArtists();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('https://sk-gallery-1.onrender.com/api/categories');
      setCategories(data);
      if (data.length > 0) setCategory(data[0].name);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArtists = async () => {
    try {
      const { data } = await axios.get('https://sk-gallery-1.onrender.com/api/users/search?query=');
      setArtists(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user || user.role === 'customer') {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Explicitly fetch the latest token before any processing
    const freshToken = localStorage.getItem('token');
    
    if (!category) {
      setError('Please select or create a category first.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('priceType', priceType);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('is4K', is4K);
    
    if (user.role === 'owner' && uploaderId) {
      formData.append('uploaderId', uploaderId);
    }

    try {
      await axios.post('https://sk-gallery-1.onrender.com/api/artworks', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${freshToken}` 
        }
      });
      alert(user.role === 'owner' ? 'Artwork uploaded and auto-approved successfully!' : 'Request sent to Owner for approval successfully!');
      setTitle('');
      setCategory('');
      setPriceType('Free');
      setPrice('');
      setImage(null);
    } catch (err) {
      if (err.response?.data?.needsPayment) {
        setError(err.response.data.message);
      } else {
        console.error("Upload failed details:", err);
        setError(err.response?.data?.message || 'Failed to upload artwork');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Upload Masterpiece</h1>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Divine Sketch"
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <input 
                type="text" 
                list="category-suggestions"
                required 
                placeholder="Select or type new category..."
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
              <datalist id="category-suggestions">
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name} />
                ))}
              </datalist>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pricing Model</label>
              <select 
                value={priceType} 
                onChange={e => {
                  setPriceType(e.target.value);
                  if (e.target.value === 'Free') setPrice(0);
                  if (e.target.value === 'Paid' && price === 0) setPrice(500);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
            <textarea 
              placeholder="Tell us the story behind this artwork..."
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] min-h-[100px] resize-y"
            ></textarea>
          </div>

          {priceType === 'Paid' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹1 - ₹100,000)</label>
              <input 
                type="number" 
                min="1"
                max="100000"
                required
                value={price} 
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {user.role === 'owner' && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <label className="block text-sm font-semibold text-red-900 mb-1">Upload on Behalf of (Optional)</label>
              <select 
                value={uploaderId} 
                onChange={e => setUploaderId(e.target.value)}
                className="w-full px-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="">Upload as Myself (Owner)</option>
                {artists.map(artist => (
                  <option key={artist._id} value={artist._id}>{artist.name} ({artist.role})</option>
                ))}
              </select>
              <p className="text-xs text-red-600 mt-2">Selecting an artist will credit them for this artwork.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Artwork Image</label>
            <p className="text-xs text-[#C5A059] mb-2 font-medium">✨ Upload high-res files (3840x2160 or higher) to automatically receive the '4K QUALITY' badge!</p>
            <div className={`border-2 border-dashed ${is4K ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-gray-300'} rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative`}>
              <input 
                type="file" 
                required 
                accept="image/*"
                onChange={e => {
                  const file = e.target.files[0];
                  setImage(file);
                  if (file) {
                    const img = new window.Image();
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                      setIs4K(img.width >= 3840 || img.height >= 2160);
                    };
                  } else {
                    setIs4K(false);
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1A1A1A] file:text-white hover:file:bg-[#2a2a2a] cursor-pointer"
              />
              {is4K && (
                <div className="absolute top-2 right-2 bg-[#C5A059] text-[#1A1A1A] text-xs font-bold px-2 py-1 rounded-lg">
                  4K DETECTED
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white py-4 px-4 rounded-xl font-bold text-lg transition-colors shadow-lg disabled:opacity-50 ${user.role === 'owner' ? 'bg-[#1A1A1A] hover:bg-gray-900 shadow-gray-900/30' : 'bg-[#C5A059] hover:bg-[#b59049] shadow-[#C5A059]/30 text-[#1A1A1A]'}`}
          >
            {loading ? 'Uploading...' : (user.role === 'owner' ? 'Upload & Auto-Approve' : 'Request Owner Permission')}
          </button>
        </form>
      </div>
    </div>
  );
}


