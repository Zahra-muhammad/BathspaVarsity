const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware required for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || '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',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Load Passport configuration (AFTER session middleware)
require('./passport-config');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Serve static files
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// API Routes
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const watchSportsRoutes = require('./routes/watch-sports');

app.use('/users', userRoutes);
app.use('/shop', productRoutes);
app.use('/api/watch-sports', watchSportsRoutes);

// Serve pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.get('/team', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'team.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'profile.html'));
});

// Shop page routes (handles both player and student)
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'shop.html'));
});

app.get('/student/shop', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'student', 'shop.html'));
});

app.get('/player/shop', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'player', 'shop.html'));
});

// Watch Sports routes
app.get('/student/watch-sports', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'student', 'watch-sports.html'));
});

app.get('/player/watch-sports', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'player', 'watch-sports.html'));
});

// Admin panel routes
app.get('/admin/users', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'manage-users.html'));
});

app.get('/admin/shop', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'manage-shop.html'));
});

app.get('/admin/watch-sports', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'manage-watch-sports.html'));
});

app.get('/admin/adminhome', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'dashboard.html'));
});

app.get('/admin/manage-player', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'manage-player.html'));
});

app.get('/admin/manage-events', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin', 'manage-events.html'));
});


// Google OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Set userId in session for Google OAuth users
    if (req.user && req.user._id) {
      req.session.userId = req.user._id;
    }
    console.log('✅ Google auth successful, redirecting to /team');
    res.redirect('/team');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

// Only start server if not in Vercel (Vercel handles this)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📊 Admin Panel: http://localhost:${port}/admin/adminhome`);
  });
}

// Export the Express app for Vercel
module.exports = app;
