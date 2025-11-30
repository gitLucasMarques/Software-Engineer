const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const imageUploadController = require('../controllers/imageUploadController');

/**
 * ==============================
 *  CONFIGURAÇÃO DO STORAGE
 * ==============================
 * Define onde os arquivos serão salvos fisicamente e como serão nomeados.
 * Aqui, colocamos dentro de /uploads e colocamos timestamp no nome
 * para evitar colisões de arquivos.
 */
const storage = multer.diskStorage({
    // Pasta de destino
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },

    // Nome do arquivo salvo
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

/**
 * ==============================
 *  VALIDAÇÃO DO ARQUIVO
 * ==============================
 * Limitamos tipos de imagem permitidos e tamanho máximo.
 */
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxSize = 5 * 1024 * 1024; // 5MB

// Função que valida o tipo do arquivo
const fileFilter = (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Tipo de arquivo não permitido.'), false);
    }
    cb(null, true);
};

/**
 * ==============================
 *  CONFIGURAÇÃO DO MULTER
 * ==============================
 * Junta storage + filtro + limite de tamanho.
 */
const upload = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter
});

/**
 * ==============================
 *  ROTA DE UPLOAD DE IMAGEM
 * ==============================
 * A rota recebe um campo "image" via multipart/form-data.
 * A imagem já estará disponível em req.file no controller.
 */
router.post(
    '/product',
    upload.single('image'),
    imageUploadController.uploadProductImage
);

module.exports = router;
