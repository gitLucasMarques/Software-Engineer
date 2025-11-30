const { Category } = require('../models');
const slugify = require('../utils/slugify');

exports.getAllCategories = async (req, res) => {
    try {
        // Se onlyMain=true, retorna apenas categorias principais
        const query = req.query.onlyMain === 'true' 
            ? { isMainCategory: true, isActive: true }
            : { isActive: true };
            
        const categories = await Category.find(query).sort({ name: 1 });
        
        res.status(200).json({
            status: 'success',
            results: categories.length,
            data: {
                categories
            }
        });
    } catch (error) {
        console.error('Erro em getAllCategories:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar categorias.'
        });
    }
};

exports.getSubcategories = async (req, res) => {
    try {
        const { id } = req.params;
        
        const subcategories = await Category.find({ 
            parentCategory: id,
            isActive: true 
        }).sort({ name: 1 });
        
        res.status(200).json({
            status: 'success',
            results: subcategories.length,
            data: {
                categories: subcategories
            }
        });
    } catch (error) {
        console.error('Erro em getSubcategories:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar subcategorias.'
        });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'Categoria não encontrada.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar a categoria.'
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                status: 'fail',
                message: 'O nome da categoria é obrigatório.'
            });
        }

        const slug = slugify(name);
        const newCategory = await Category.create({ ...req.body, slug });

        res.status(201).json({
            status: 'success',
            data: {
                category: newCategory
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                status: 'fail',
                message: 'Uma categoria com este nome já existe.'
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erro ao criar a categoria.'
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 'fail',
                message: 'O nome da categoria é obrigatório.'
            });
        }

        if (req.body.name) req.body.slug = slugify(req.body.name);
        
        const category = await Category.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'Categoria não encontrada.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                status: 'fail',
                message: 'Uma categoria com este nome já existe.'
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erro ao atualizar a categoria.'
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                status: 'fail',
                message: 'Categoria não encontrada.'
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao deletar a categoria.'
        });
    }
};