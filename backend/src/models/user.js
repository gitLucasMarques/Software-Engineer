const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema principal de usuários do sistema:
// armazena dados básicos, senha criptografada,
// permissões e recursos como wishlist.
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100     // Nome curto para evitar registros gigantes
  },
  email: {
    type: String,
    required: true,
    unique: true,      // Garante que não existam 2 usuários com o mesmo e-mail
    lowercase: true,
    trim: true         // Evita problemas com espaços acidentais
  },
  password: {
    type: String,
    required: true     // Senha será sempre criptografada antes de salvar
  },
  role: {
    type: String,
    enum: ['customer', 'admin'], // Controle simples de permissões
    default: 'customer'
  },
  phone: {
    type: String,
    maxlength: 20      // Armazena telefone, mas não força formato
  },
  address: {
    type: String       // Endereço simples — você pode expandir depois
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'     // Lista de produtos que o usuário favoritou
  }],
  isActive: {
    type: Boolean,
    default: true      // Para suspender conta sem deletar
  }
}, {
  timestamps: true     // Cria campos createdAt e updatedAt automaticamente
});


// ---- MIDDLEWARES E MÉTODOS IMPORTANTES ----

// Antes de salvar, caso a senha tenha sido alterada,
// ela é automaticamente criptografada com bcrypt.
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compara a senha enviada no login com o hash salvo no banco.
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Mesma função acima (pode remover uma delas se quiser).
userSchema.methods.isValidPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove o campo password ao transformar o objeto em JSON,
// evitando vazar o hash para o cliente.
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Criação do model final
const User = mongoose.model('User', userSchema);

module.exports = User;
