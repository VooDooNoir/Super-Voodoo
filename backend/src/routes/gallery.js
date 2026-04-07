const express = require('express');
const router = express.Router();
const {
  saveGalleryImage,
  getGalleryImages,
  deleteGalleryImage,
} = require('../services/storage');
const logger = require('../controllers/logger');

// GET /api/gallery - Fetch all gallery images
router.get('/', async (_req, res) => {
  try {
    const images = await getGalleryImages();
    res.json({ images });
  } catch (error) {
    logger.error('Failed to fetch gallery images', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// POST /api/gallery - Save a generated image to the gallery
router.post('/', async (req, res) => {
  try {
    const { imageUrl, prompt, aspectRatio, upscaled } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }
    const entry = await saveGalleryImage({ imageUrl, prompt, aspectRatio, upscaled });
    res.status(201).json(entry);
  } catch (error) {
    logger.error('Failed to save gallery image', { error: error.message });
    res.status(500).json({ error: 'Failed to save gallery image' });
  }
});

// DELETE /api/gallery/:id - Delete a gallery image
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteGalleryImage(req.params.id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    logger.error('Failed to delete gallery image', { error: error.message });
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

module.exports = router;
