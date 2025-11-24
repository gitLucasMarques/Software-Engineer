const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    maxlength: 50
  },
  genre: {
    type: String,
    maxlength: 50
  },
  releaseDate: {
    type: Date
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para popular categoria
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;