const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { upload } = require('../config/cloudinary');

// Image upload endpoint - MUST be before other routes
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('✅ Image uploaded to Cloudinary:', req.file.path);
    
    res.json({ 
      url: req.file.path,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`✅ Fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
router.get('/products/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    console.log(`✅ Fetched ${products.length} products in category: ${req.params.category}`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('✅ Fetched product:', product._id);
    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new product
router.post('/products', async (req, res) => {
  try {
    const { name, category, subtitle, price, image, details } = req.body;

    // Validate required fields
    if (!name || !category || !price || !image) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, category, price, or image' 
      });
    }

    // Validate price
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const newProduct = new Product({
      name: name.trim(),
      category,
      subtitle: subtitle ? subtitle.trim() : '',
      price: parseFloat(price),
      image: image.trim(),
      details: details ? details.trim() : ''
    });

    await newProduct.save();
    console.log('✅ Product created:', newProduct._id, '-', newProduct.name);
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      product: newProduct 
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { name, category, subtitle, price, image, details, inStock } = req.body;

    const updateData = {
      updatedAt: Date.now()
    };

    if (name) updateData.name = name.trim();
    if (category) updateData.category = category;
    if (subtitle !== undefined) updateData.subtitle = subtitle.trim();
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Invalid price' });
      }
      updateData.price = parsedPrice;
    }
    if (image) updateData.image = image.trim();
    if (details !== undefined) updateData.details = details.trim();
    if (inStock !== undefined) updateData.inStock = inStock;

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('✅ Product updated:', product._id, '-', product.name);
    res.json({ 
      message: 'Product updated successfully', 
      product 
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('✅ Product deleted:', product._id, '-', product.name);
    res.json({ 
      message: 'Product deleted successfully', 
      deletedProduct: { id: product._id, name: product.name } 
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;