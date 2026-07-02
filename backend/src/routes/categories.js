const express = require('express');
const { verifyAdmin } = require('../middleware/auth');
const Category = require('../models/Category');
const { categoryValidation } = require('../middleware/validation');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const categories = await Category.getAllCategoriesAdmin(true);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyAdmin, categoryValidation, async (req, res) => {
  try {
    const result = await Category.createCategory(req.body.name, req.body.description, req.body.icon);
    res.status(201).json({
      id: result.id,
      name: req.body.name,
      description: req.body.description,
      icon: req.body.icon
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    await Category.updateCategory(req.params.id, req.body);
    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Category.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/toggle', verifyAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;
    await Category.toggleCategoryActive(req.params.id, is_active);
    res.json({ message: `Category ${is_active ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reorder', verifyAdmin, async (req, res) => {
  try {
    await Category.reorderCategories(req.body.categories);
    res.json({ message: 'Categories reordered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
