const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '843186991786-999eit374fq5cpuo9gc59h4pp59q1l13.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Try to find user by googleId OR email
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });
      
      if (!user) {
        // No user found, create new one
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
        });
        await user.save();
      } else if (!user.googleId) {
        // User exists with email but no googleId
        user.googleId = profile.id;
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      console.error('❌ Google auth error:', error);
      return done(error, false);
    }
  }
));

// Serialize only user ID
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Cache with shorter TTL and automatic cleanup
const userCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, cached] of userCache.entries()) {
    if (now - cached.timestamp > CACHE_TTL) {
      userCache.delete(id);
    }
  }
}, 60000); // Clean every minute

passport.deserializeUser(async (id, done) => {
  try {
    // Check cache first
    const cached = userCache.get(id);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return done(null, cached.user);
    }
    
    // Fetch from database
    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      userCache.delete(id);
      return done(null, false);
    }
    
    // Store in cache
    userCache.set(id, {
      user: user,
      timestamp: Date.now()
    });
    
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});