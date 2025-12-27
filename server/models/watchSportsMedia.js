const mongoose = require('mongoose');

const watchSportsMediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['live', 'highlights', 'old-matches', 'profiles'],
    index: true
  },
  mediaType: {
    type: String,
    required: true,
    enum: ['video', 'image']
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'center'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
watchSportsMediaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WatchSportsMedia', watchSportsMediaSchema);