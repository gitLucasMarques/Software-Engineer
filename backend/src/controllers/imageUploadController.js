/**
 * Este handler recebe uma imagem enviada pelo cliente (via middleware de upload)
 * e simplesmente retorna o caminho público onde o arquivo foi salvo.
 * Ele verifica se um arquivo foi realmente enviado; caso contrário,
 * responde com erro. Quando a imagem existe, monta a URL baseada no nome
 * do arquivo gerado pelo middleware e retorna essa URL para que o frontend
 * possa usá-la (por exemplo, para exibir a imagem ou salvar no produto).
 */

exports.uploadProductImage = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
};
