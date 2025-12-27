const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    console.log('🔐 Auth check - Session:', req.session);
    console.log('🔐 User ID in session:', req.session?.userId);
    
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Not authenticated' });
}

// ✅ Get current logged-in user with player profile
router.get('/current-user', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture || null,
            playerProfile: user.playerProfile || null
        });
    } catch (error) {
        console.error('❌ Error getting current user:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Save/Update player profile
router.post('/player-profile', isAuthenticated, async (req, res) => {
    try {
        console.log('📝 Saving player profile...');
        console.log('User ID:', req.session.userId);
        console.log('Request body:', req.body);
        
        const { sport, team, position, dominantHand, trainingSkills } = req.body;
        
        // Validate required fields
        if (!sport || !team || !position) {
            return res.status(400).json({ 
                error: 'Missing required fields: sport, team, or position' 
            });
        }
        
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            {
                playerProfile: {
                    sport,
                    team,
                    position,
                    dominantHand,
                    trainingSkills,
                    isPlayer: true
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            console.error('❌ User not found:', req.session.userId);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('✅ Player profile saved successfully:', user.playerProfile);
        res.json({
            message: 'Player profile saved successfully',
            playerProfile: user.playerProfile
        });
    } catch (error) {
        console.error('❌ Error saving player profile:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Create new user (signup) - UPDATED with session
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        // Create session for the new user
        req.session.userId = newUser._id;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
            }
        });

        console.log('✅ User created and session set:', newUser._id);
        res.status(201).json({ 
            message: 'User registered successfully', 
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(400).json({ error: error.message });
    }
});

// ✅ Login route - UPDATED with session
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Create session for the logged-in user
        req.session.userId = user._id;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
            }
        });

        console.log('✅ User logged in and session set:', user._id);
        res.status(200).json({ 
            message: 'Login successful', 
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('❌ Error logging in:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// ✅ Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Update user
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Delete user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;