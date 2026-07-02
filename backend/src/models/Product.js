const db = require('./connection');

const getAllProducts = () => {
  return db.query(
    `SELECT p.*, c.name as category_name, c.icon as category_icon
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.is_active = 1
     ORDER BY p.order_position ASC`
  );
};

const getProductById = (id) => {
  return db.get(
    `SELECT p.*, c.name as category_name, c.icon as category_icon
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = ?`,
    [id]
  );
};

const getProductsByCategory = (categoryId) => {
  return db.query(
    `SELECT * FROM products
     WHERE category_id = ? AND is_active = 1
     ORDER BY order_position ASC`,
    [categoryId]
  );
};

const createProduct = (productData) => {
  return db.query(
    `INSERT INTO products (name, description, category_id, price_uah, price_ton, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [productData.name, productData.description, productData.category_id, 
     productData.price_uah, productData.price_ton, productData.image_url, 
     productData.is_active || 1]
  );
};

const updateProduct = (id, productData) => {
  const updates = [];
  const values = [];

  Object.keys(productData).forEach(key => {
    if (key !== 'id') {
      updates.push(`${key} = ?`);
      values.push(productData[key]);
    }
  });

  values.push(id);

  return db.query(
    `UPDATE products SET ${updates.join(', ')}, updated_at = datetime("now") WHERE id = ?`,
    values
  );
};

const deleteProduct = (id) => {
  return db.query('DELETE FROM products WHERE id = ?', [id]);
};

const toggleProductActive = (id, isActive) => {
  return db.query(
    'UPDATE products SET is_active = ?, updated_at = datetime("now") WHERE id = ?',
    [isActive ? 1 : 0, id]
  );
};

const reorderProducts = (products) => {
  const promises = products.map((p, index) =>
    db.query(
      'UPDATE products SET order_position = ? WHERE id = ?',
      [index, p.id]
    )
  );
  return Promise.all(promises);
};

const getAllProductsAdmin = (includeInactive = false) => {
  if (includeInactive) {
    return db.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.order_position ASC`
    );
  }
  return getAllProducts();
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  reorderProducts,
  getAllProductsAdmin
};
