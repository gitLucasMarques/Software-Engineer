const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  description: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isMainCategory: {
    type: Boolean,
    default: false
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;