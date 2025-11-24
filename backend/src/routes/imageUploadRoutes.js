const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const imageUploadController = require('../controllers/imageUploadController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxSize = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Tipo de arquivo não permitido.'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage,
    limits: { fileSize: maxSize },
    fileFilter
});

router.post('/product', upload.single('image'), imageUploadController.uploadProductImage);

module.exports = router;
