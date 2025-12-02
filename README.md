<div align="center">

# 🎮 Voxel Store

### E-Commerce completo de jogos e hardware gamer

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)

</div>

## 🚀 Stack Tecnológica

**Backend:** Node.js + Express + MongoDB
**Frontend:** React 18 + React Router v6 + Axios + Three.js  
**Pagamentos:** PIX, Boleto, Cartão de Crédito/Débito  
**Testes:** Jest + Supertest (95%+ coverage)

## ⚡ Quick Start

```bash
# Clone e instale
git clone https://github.com/gitLucasMarques/Software-Engineer.git
cd Software-Engineer
npm run install:all

# Configure .env no backend
MONGODB_URI=sua_connection_string
JWT_SECRET=seu_secret_key
PORT=5000

# Popule o banco
cd backend && npm run seed:all

# Execute ambos servidores
npm run dev
```

Acesse: **http://localhost:3000**

## 📁 Estrutura

```
├── backend/         # Node.js + Express API
│   ├── src/
│   │   ├── models/      # Schemas Mongoose
│   │   ├── controllers/ # Lógica de negócio
│   │   ├── routes/      # Endpoints REST
│   │   ├── services/    # Email, pagamentos
│   │   └── middlewares/ # Auth, validação
│   └── tests/           # Testes Jest
└── frontend/        # React SPA
    └── src/
        ├── pages/       # Páginas da aplicação
        ├── components/  # Componentes reutilizáveis
        └── contexts/    # Auth, Cart, Wishlist
```

## 🔒 Segurança & Performance

- JWT stateless com tokens de 7 dias
- Senhas com Bcrypt (salt rounds: 12)
- Cartões criptografados AES-256 (CVV não persistido)
- Rate limiting por IP
- Validação de inputs com express-validator
- Indexação MongoDB para queries otimizadas

## 📄 Licença

MIT © [Lucas Marques](https://github.com/gitLucasMarques)
