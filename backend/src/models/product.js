const mongoose = require('mongoose');

// Estrutura principal do produto no banco.
// Este schema representa itens de uma loja, com suporte a categoria,
// preço, estoque e até configurações de destaque e slug.
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,              // Nome é obrigatório
    maxlength: 200               // Limita tamanho do nome por segurança
  },
  description: {
    type: String,
    default: ''                  // Descrição opcional
  },
  price: {
    type: Number,
    required: true,
    min: 0                       // Preços negativos são bloqueados
  },
  stock: {
    type: Number,
    required: true,
    default: 0,                  // Estoque padrão é 0
    min: 0                       // Impede estoque negativo
  },
  imageUrl: {
    type: String,
    default: ''                  // URL de imagem opcional
  },
  platform: {
    type: String,
    maxlength: 50                // Ex.: PS5, PC, Switch…
  },
  genre: {
    type: String,
    maxlength: 50                // Ex.: Ação, RPG…
  },
  releaseDate: {
    type: Date                   // Data de lançamento do produto
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100                     // Desconto limitado de 0 a 100%
  },
  isActive: {
    type: Boolean,
    default: true                // Permite desativar produtos sem excluir
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'              // Relaciona produto a uma categoria
  },
  slug: {
    type: String,
    unique: true,                // Permite link SEO-friendly
    sparse: true                 // Permite valores nulos sem quebrar unicidade
  },
  featured: {
    type: Boolean,
    default: false               // Marca como "produto em destaque"
  }
}, {
  timestamps: true,              // Cria createdAt e updatedAt automática
  toJSON: { virtuals: true },    // Inclui virtuals ao converter para JSON
  toObject: { virtuals: true }
});

// Virtual populate para trazer a categoria completa
// sem armazenar diretamente no documento.
// Mongoose utiliza isso para facilitar consultas com populate().
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',      // campo interno do produto
  foreignField: '_id',           // campo correspondente na categoria
  justOne: true                  // retorna um único objeto
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
