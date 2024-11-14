const db = require('../config/db');

const Review = {
  addReview: (userId, productId, rating, comment, cb) => {
    const query = 'INSERT INTO Reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)';
    db.query(query, [userId, productId, rating, comment], cb);
  },

  getReviewsByProduct: (productId, cb) => {
    db.query('SELECT * FROM Reviews WHERE product_id = ?', [productId], cb);
  }
};

module.exports = Review;
