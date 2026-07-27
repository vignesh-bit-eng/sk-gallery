import express from 'express';
import { 
  uploadArtwork, 
  getArtworks, 
  getArtworkById, 
  approveArtwork, 
  rejectArtwork,
  getAllArtworksForOwner,
  deleteArtwork
} from '../controllers/artworkController.js';
import { protect, admin, artist } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('image');
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("Cloudinary/Multer Upload Error:", err);
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.error("Cloudinary keys missing in Environment Variables");
      }
      return res.status(500).json({ message: "Failed to upload artwork: " + err.message });
    }
    next();
  });
};

router.route('/')
  .get(getArtworks)
  .post(protect, artist, handleUpload, uploadArtwork);

router.get('/all', protect, admin, getAllArtworksForOwner);

router.route('/:id')
  .get(getArtworkById)
  .delete(protect, admin, deleteArtwork);

router.put('/:id/approve', protect, admin, approveArtwork);
router.put('/:id/reject', protect, admin, rejectArtwork);

export default router;
