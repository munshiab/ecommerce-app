console.log('Loading Product model');

const db = require('../config/db');

const Product = {
  getFeatured: (cb) => {
    console.log('Fetching featured products');
    const query = 'SELECT * FROM Products WHERE is_featured = 1 LIMIT 5';
    db.query(query, cb);
  },
  getNewArrivals: (cb) => {
    console.log('Fetching new arrivals');
    const query = 'SELECT * FROM Products ORDER BY created_at DESC LIMIT 5';
    db.query(query, cb);
  },
  getBestSellers: (cb) => {
    console.log('Fetching best sellers');
    const query = 'SELECT * FROM Products WHERE is_best_seller = 1 LIMIT 5';
    db.query(query, cb);
  }
};

module.exports = Product;
