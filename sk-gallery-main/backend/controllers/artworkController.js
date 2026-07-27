import Artwork from '../models/Artwork.js';
import User from '../models/User.js';

export const uploadArtwork = async (req, res) => {
  try {
    const { title, description, category, priceType, price, uploaderId } = req.body;
    
    // Check artist upload limit (Owner bypasses this)
    let targetUploaderId = req.user._id;

    if (req.user.role === 'artist') {
      const user = await User.findById(req.user._id);
      if (user.artistUploadCount >= 5) {
        return res.status(403).json({ message: 'Upload limit reached. Please purchase more slots.', needsPayment: true });
      }
    } else if (req.user.role === 'owner' && uploaderId) {
      // Owner uploading on behalf of an artist
      targetUploaderId = uploaderId;
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const artwork = await Artwork.create({
      title,
      description,
      category,
      imageUrl: req.file.path,
      priceType,
      price: priceType === 'Free' ? 0 : Number(price),
      is4K: req.body.is4K === 'true' || req.body.is4K === true,
      uploader: targetUploaderId,
      status: req.user.role === 'owner' ? 'Approved' : 'Pending'
    });

    res.status(201).json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArtworks = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { status: 'Approved' };
    
    if (category && category !== 'All') {
      query.category = category;
    }

    let artworks = await Artwork.find(query).populate('uploader', 'name');

    if (search) {
      const lowerSearch = search.toLowerCase();
      artworks = artworks.filter(art => 
        art.title.toLowerCase().includes(lowerSearch) || 
        (art.uploader && art.uploader.name.toLowerCase().includes(lowerSearch)) ||
        art.category.toLowerCase().includes(lowerSearch)
      );
    }

    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllArtworksForOwner = async (req, res) => {
  try {
    const artworks = await Artwork.find().populate('uploader', 'name email').sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    if (artwork.uploader.toString() !== req.user._id.toString() && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized to delete this artwork' });
    }

    await artwork.deleteOne();
    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate('uploader', 'name');
    if (artwork) {
      res.json(artwork);
    } else {
      res.status(404).json({ message: 'Artwork not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (artwork) {
      artwork.status = 'Approved';
      await artwork.save();

      // Increment artist upload count ONLY upon approval
      if (artwork.uploader) {
        const artistUser = await User.findById(artwork.uploader);
        if (artistUser && artistUser.role === 'artist') {
          artistUser.artistUploadCount += 1;
          await artistUser.save();
        }
      }

      res.json({ message: 'Artwork approved' });
    } else {
      res.status(404).json({ message: 'Artwork not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (artwork) {
      artwork.status = 'Rejected';
      await artwork.save();
      res.json({ message: 'Artwork rejected' });
    } else {
      res.status(404).json({ message: 'Artwork not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
