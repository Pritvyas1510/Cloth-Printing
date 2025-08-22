// profileRoutes.js
import express from 'express';
import { createProfile, getAllProfiles, getProfileById, updateProfile, deleteProfile } from '../controllers/profileController.js';
import requireAuth from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js'; // Import from multer.js

const router = express.Router();

router.post('/', requireAuth, upload.single('profileImage'), createProfile);
router.get('/', requireAuth, getAllProfiles);
router.get('/:id', requireAuth, getProfileById);
router.put('/:id', requireAuth, upload.single('profileImage'), updateProfile);
router.delete('/:id', requireAuth, deleteProfile);

export default router;