const db = require('../config/db');

const Order = {
  create: (userId, totalAmount, addressId, paymentId, cb) => {
    const query = 'INSERT INTO Orders (user_id, total_amount, address_id, payment_id) VALUES (?, ?, ?, ?)';
    db.query(query, [userId, totalAmount, addressId, paymentId], cb);
  },

  getOrderItems: (orderId, cb) => {
    db.query('SELECT * FROM OrderItems WHERE order_id = ?', [orderId], cb);
  }
};

module.exports = Order;
