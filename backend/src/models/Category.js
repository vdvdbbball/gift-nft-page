const db = require('./connection');

const getAllCategories = () => {
  return db.query(
    'SELECT * FROM categories WHERE is_active = 1 ORDER BY order_position ASC'
  );
};

const getCategoryById = (id) => {
  return db.get('SELECT * FROM categories WHERE id = ?', [id]);
};

const createCategory = (name, description, icon) => {
  return db.query(
    `INSERT INTO categories (name, description, icon)
     VALUES (?, ?, ?)`,
    [name, description, icon]
  );
};

const updateCategory = (id, categoryData) => {
  const updates = [];
  const values = [];

  Object.keys(categoryData).forEach(key => {
    updates.push(`${key} = ?`);
    values.push(categoryData[key]);
  });

  values.push(id);

  return db.query(
    `UPDATE categories SET ${updates.join(', ')}, updated_at = datetime("now") WHERE id = ?`,
    values
  );
};

const deleteCategory = (id) => {
  return db.query('DELETE FROM categories WHERE id = ?', [id]);
};

const toggleCategoryActive = (id, isActive) => {
  return db.query(
    'UPDATE categories SET is_active = ?, updated_at = datetime("now") WHERE id = ?',
    [isActive ? 1 : 0, id]
  );
};

const reorderCategories = (categories) => {
  const promises = categories.map((c, index) =>
    db.query(
      'UPDATE categories SET order_position = ? WHERE id = ?',
      [index, c.id]
    )
  );
  return Promise.all(promises);
};

const getAllCategoriesAdmin = (includeInactive = false) => {
  if (includeInactive) {
    return db.query('SELECT * FROM categories ORDER BY order_position ASC');
  }
  return getAllCategories();
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  reorderCategories,
  getAllCategoriesAdmin
};
