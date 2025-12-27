const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const WatchSportsMedia = require('../models/watchSportsMedia');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video and image files are allowed.'));
    }
  }
});

// Upload media (file or URL)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, category, mediaType, description, url } = req.body;
    let mediaUrl;

    if (req.file) {
      console.log('📤 Uploading file to Cloudinary...');
      
      // Upload to Cloudinary
      mediaUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: mediaType === 'video' ? 'video' : 'image',
            folder: 'watch-sports',
            transformation: mediaType === 'video' ? [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ] : [
              { quality: 'auto:best' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('✅ Cloudinary upload successful:', result.secure_url);
              resolve(result.secure_url);
            }
          }
        );
        
        uploadStream.end(req.file.buffer);
      });
    } else if (url) {
      mediaUrl = url;
      console.log('🔗 Using provided URL:', url);
    } else {
      return res.status(400).json({ error: 'No file or URL provided' });
    }

    // Save to database
    const newMedia = new WatchSportsMedia({
      title,
      category,
      mediaType,
      description,
      url: mediaUrl,
      position: category
    });

    await newMedia.save();
    console.log('✅ Media saved to database:', newMedia._id);

    res.status(201).json({
      message: 'Media uploaded successfully',
      media: newMedia
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all media
router.get('/media', async (req, res) => {
  try {
    const media = await WatchSportsMedia.find({ isActive: true })
      .sort({ createdAt: -1 });
    console.log(`✅ Fetched ${media.length} active media items`);
    res.json(media);
  } catch (error) {
    console.error('❌ Error fetching media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get media by category
router.get('/media/category/:category', async (req, res) => {
  try {
    const media = await WatchSportsMedia.find({ 
      category: req.params.category,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Fetched ${media.length} items for category: ${req.params.category}`);
    res.json(media);
  } catch (error) {
    console.error('❌ Error fetching category media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update media
router.put('/media/:id', async (req, res) => {
  try {
    const { title, description, category, isActive } = req.body;
    
    const updateData = {
      updatedAt: Date.now()
    };
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const media = await WatchSportsMedia.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    console.log('✅ Media updated:', media._id);
    res.json(media);
  } catch (error) {
    console.error('❌ Error updating media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete media
router.delete('/media/:id', async (req, res) => {
  try {
    const media = await WatchSportsMedia.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete from Cloudinary if it was uploaded there
    if (media.url.includes('cloudinary')) {
      try {
        const urlParts = media.url.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `watch-sports/${publicIdWithExt.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId, {
          resource_type: media.mediaType === 'video' ? 'video' : 'image'
        });
        
        console.log('✅ Deleted from Cloudinary:', publicId);
      } catch (cloudinaryError) {
        console.error('⚠️ Cloudinary deletion error:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    await WatchSportsMedia.findByIdAndDelete(req.params.id);
    console.log('✅ Media deleted from database:', req.params.id);
    
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting media:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;