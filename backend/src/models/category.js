const mongoose = require('mongoose');
/**
 * Modelo de Categoria usando Mongoose.
 * Representa categorias de produtos/jogos, podendo ser categorias principais
 * ou subcategorias (via parentCategory).
 * Inclui nome, descrição, slug, controle de ativação e suporte a hierarquia.
 * Timestamps registram criação e atualização automaticamente.
 */

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