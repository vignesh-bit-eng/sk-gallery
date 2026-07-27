import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Download, CheckCircle, ArrowLeft } from 'lucide-react';

export default function DownloadArt() {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArt = async () => {
      try {
        const { data } = await axios.get(`https://sk-gallery-1.onrender.com/api/artworks/${id}`);
        setArtwork(data);
      } catch (err) {
        setError('Artwork not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchArt();
  }, [id]);

  const handleDownload = () => {
    if (!artwork) return;
    const link = document.createElement('a');
    link.href = `https://sk-gallery-1.onrender.com${artwork.imageUrl}`;
    link.download = `${artwork.title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <Link to="/" className="text-red-600 hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 text-center p-8"
      >
        <div className="mx-auto bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Verified!</h1>
        <p className="text-gray-600 mb-8">Thank you for your purchase. You can now download your high-resolution artwork.</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8">
          <img 
            src={`https://sk-gallery-1.onrender.com${artwork.imageUrl}`} 
            alt={artwork.title} 
            className="w-full h-48 object-cover rounded-lg shadow-sm mb-4"
          />
          <h3 className="font-bold text-gray-900">{artwork.title}</h3>
          <p className="text-sm text-gray-500">by {artwork.uploader?.name}</p>
        </div>

        <button 
          onClick={handleDownload}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 mb-4"
        >
          <Download className="w-6 h-6" /> Download Now
        </button>

        <Link to="/" className="text-gray-500 hover:text-red-600 flex items-center justify-center gap-2 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>
      </motion.div>
    </div>
  );
}


