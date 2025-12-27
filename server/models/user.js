const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() {
            // Password not required for Google OAuth users
            return !this.googleId;
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    // Player profile information
    playerProfile: {
        type: {
            sport: {
                type: String,
                default: null
            },
            team: {
                type: String,
                default: null
            },
            position: {
                type: String,
                default: null
            },
            dominantHand: {
                type: String,
                default: null
            },
            trainingSkills: {
                type: String,
                default: null
            },
            isPlayer: {
                type: Boolean,
                default: false
            }
        },
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);