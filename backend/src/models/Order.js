const db = require('./connection');

const getAllOrders = (limit = 100, offset = 0) => {
  return db.query(
    `SELECT o.*, p.name as product_name, u.username, u.telegram_id
     FROM orders o
     LEFT JOIN products p ON o.product_id = p.id
     LEFT JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
};

const getOrdersByUser = (userId) => {
  return db.query(
    `SELECT o.*, p.name as product_name, c.name as category_name
     FROM orders o
     LEFT JOIN products p ON o.product_id = p.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [userId]
  );
};

const getOrderById = (id) => {
  return db.get(
    `SELECT o.*, p.name as product_name, u.username, u.telegram_id
     FROM orders o
     LEFT JOIN products p ON o.product_id = p.id
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.id = ?`,
    [id]
  );
};

const createOrder = (userId, productId, orderData) => {
  return db.query(
    `INSERT INTO orders (user_id, product_id, quantity, price_uah, price_ton, currency, payment_method)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, productId, orderData.quantity || 1, orderData.price_uah, 
     orderData.price_ton, orderData.currency || 'UAH', orderData.payment_method]
  );
};

const updateOrderStatus = (orderId, status, notes = null) => {
  return db.query(
    `UPDATE orders SET status = ?, notes = ?, updated_at = datetime("now") WHERE id = ?`,
    [status, notes, orderId]
  );
};

const getOrderStats = () => {
  return db.get(
    `SELECT COUNT(*) as total_orders,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
            SUM(CASE WHEN status = 'completed' THEN price_uah ELSE 0 END) as total_revenue_uah
     FROM orders`
  );
};

const getOrdersByStatus = (status, limit = 100, offset = 0) => {
  return db.query(
    `SELECT o.*, p.name as product_name, u.username
     FROM orders o
     LEFT JOIN products p ON o.product_id = p.id
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.status = ?
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [status, limit, offset]
  );
};

module.exports = {
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getOrderStats,
  getOrdersByStatus
};
