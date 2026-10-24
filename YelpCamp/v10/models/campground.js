const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  image: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => !v || /^https?:\/\//i.test(v),
      message: 'Image must be an http(s) URL',
    },
  },
  description: { type: String, trim: true, maxlength: 5000 },
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

module.exports = mongoose.models.Campground || mongoose.model('Campground', campgroundSchema);
