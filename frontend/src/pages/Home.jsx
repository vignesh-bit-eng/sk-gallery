import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UpiPayment from '../components/UpiPayment';
import { Search, Download, ShoppingBag, Palette } from 'lucide-react';

export default function Home() {
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Payment state
  const [selectedArt, setSelectedArt] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(import.meta.env.PROD ? '/api/categories' : 'http://localhost:5000/api/categories');
      setCategories([{ name: 'All' }, ...data]);
    } catch (error) {
      console.error('Error fetching categories', error);
      // Fallback
      setCategories([{ name: 'All' }, { name: 'Cartoon' }, { name: 'God' }, { name: 'Fighters' }]);
    }
  };

  const fetchArtworks = async (search = '') => {
    setLoading(true);
    try {
      let url = import.meta.env.PROD ? '/api/artworks?' : 'http://localhost:5000/api/artworks?';
      if (activeCategory !== 'All') url += `category=${activeCategory}&`;
      if (search) url += `search=${search}`;
      
      const { data } = await axios.get(url);
      setArtworks(data);
    } catch (error) {
      console.error('Error fetching artworks', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArtworks(searchQuery);
  };

  const handleDownload = async (art) => {
    if (!user) {
      navigate('/register');
      return;
    }
    
    // Log stat in background
    const statsUrl = import.meta.env.PROD ? '/api/stats/download' : 'http://localhost:5000/api/stats/download';
    axios.post(statsUrl).catch(() => {});

    try {
      const imgUrl = art.imageUrl.startsWith('http') 
        ? art.imageUrl 
        : (import.meta.env.PROD ? art.imageUrl : `http://localhost:5000${art.imageUrl}`);
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${art.title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download image.');
    }
  };

  const handlePurchase = (art) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedArt(art);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#1A1A1A] text-white pt-24 pb-32 px-4 relative overflow-hidden -mt-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop" alt="Hero Art" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/80 via-[#1A1A1A]/60 to-[#1A1A1A]"></div>
        </div>
        
        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 text-[#C5A059] font-medium text-sm tracking-widest uppercase"
          >
            Curated Collections &bull; Discover Unique Pieces &bull; Meet the Artists
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-light mb-6 tracking-tight text-[#FDFBF7]"
          >
            Elevate Your <span className="font-semibold text-[#C5A059]">Space</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12 font-light"
          >
            Discover and acquire extraordinary pencil masterpieces directly from world-class artists. A curated selection of modern, classic, and abstract creations.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            onSubmit={handleSearch} 
            className="w-full max-w-2xl relative"
          >
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search artists, collections, or styles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-36 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-lg transition-all"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-[#C5A059] hover:bg-[#b08d4b] text-[#1A1A1A] px-8 rounded-full font-bold transition-colors"
            >
              Explore
            </button>
          </motion.form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat, idx) => (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={cat._id || cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat.name 
                  ? 'bg-gray-900 text-white shadow-md scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-sm border border-gray-200'
              }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : artworks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Artworks Found</h3>
            <p className="text-gray-500">Try a different category or search term.</p>
          </motion.div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {artworks.map((art, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 4) * 0.1 }}
                key={art._id} 
                className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img 
                  src={art.imageUrl.startsWith('http') ? art.imageUrl : (import.meta.env.PROD ? art.imageUrl : `http://localhost:5000${art.imageUrl}`)} 
                  alt={art.title} 
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {art.is4K && (
                  <div className="absolute top-4 left-4 bg-[#1A1A1A]/80 backdrop-blur-md text-[#C5A059] text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-[4px] border border-[#C5A059]/30 shadow-lg z-10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
                    4K QUALITY
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold text-xl mb-1">{art.title}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white backdrop-blur-sm">
                        {art.uploader?.name?.charAt(0) || '?'}
                      </div>
                      <p className="text-gray-300 text-sm font-medium">{art.uploader?.name || 'Unknown Artist'}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${art.priceType === 'Free' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                        {art.priceType === 'Free' ? 'Free' : `₹${art.price}`}
                      </span>
                      
                      {art.priceType === 'Free' ? (
                        <button 
                          onClick={() => handleDownload(art)}
                          className="bg-white/20 hover:bg-white text-white hover:text-gray-900 px-4 py-2 rounded-xl backdrop-blur-md text-sm font-bold transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDownload(art)}
                            className="bg-white/20 hover:bg-white text-white hover:text-gray-900 px-3 py-2 rounded-xl backdrop-blur-md text-sm font-bold transition-colors flex items-center gap-1"
                            title="Download Preview"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handlePurchase(art)}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg flex items-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4" /> Buy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedArt && (
        <UpiPayment 
          amount={selectedArt.price} 
          purpose="ArtworkPurchase" 
          artworkId={selectedArt._id}
          onSuccess={() => setSelectedArt(null)}
          onCancel={() => setSelectedArt(null)}
        />
      )}
    </div>
  );
}


