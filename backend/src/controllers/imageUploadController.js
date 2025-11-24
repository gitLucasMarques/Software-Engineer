exports.uploadProductImage = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
};
