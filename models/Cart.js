const db = require('../config/db');

const Cart = {
  addItem: (userId, productId, quantity, cb) => {
    const query = 'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?';
    db.query(query, [userId, productId, quantity, quantity], cb);
  },

  getItems: (userId, cb) => {
    db.query('SELECT * FROM Cart WHERE user_id = ?', [userId], cb);
  },

  removeItem: (cartId, cb) => {
    db.query('DELETE FROM Cart WHERE cart_id = ?', [cartId], cb);
  }
};

module.exports = Cart;
