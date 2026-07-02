const db = require('./connection');

const getPaymentByOrderId = (orderId) => {
  return db.get('SELECT * FROM payments WHERE order_id = ?', [orderId]);
};

const getPaymentById = (id) => {
  return db.get('SELECT * FROM payments WHERE id = ?', [id]);
};

const createPayment = (orderId, userId, amount, currency, paymentMethod) => {
  return db.query(
    `INSERT INTO payments (order_id, user_id, amount, currency, payment_method, expires_at)
     VALUES (?, ?, ?, ?, ?, datetime("now", "+1 hour"))`,
    [orderId, userId, amount, currency, paymentMethod]
  );
};

const updatePaymentStatus = (paymentId, status, transactionId = null, details = null) => {
  if (status === 'completed') {
    return db.query(
      `UPDATE payments SET status = ?, transaction_id = ?, payment_details = ?, 
       completed_at = datetime("now"), updated_at = datetime("now") WHERE id = ?`,
      [status, transactionId, details, paymentId]
    );
  }
  return db.query(
    `UPDATE payments SET status = ?, updated_at = datetime("now") WHERE id = ?`,
    [status, paymentId]
  );
};

const getPaymentsByUser = (userId) => {
  return db.query(
    'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
};

const getPendingPayments = () => {
  return db.query(
    'SELECT * FROM payments WHERE status = "pending" AND expires_at > datetime("now")'
  );
};

const getExpiredPayments = () => {
  return db.query(
    'SELECT * FROM payments WHERE status = "pending" AND expires_at <= datetime("now")'
  );
};

const getPaymentStats = () => {
  return db.get(
    `SELECT COUNT(*) as total_payments,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
            SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount
     FROM payments`
  );
};

module.exports = {
  getPaymentByOrderId,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getPaymentsByUser,
  getPendingPayments,
  getExpiredPayments,
  getPaymentStats
};
