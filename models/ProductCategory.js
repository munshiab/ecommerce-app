const db = require('../config/db');

const ProductCategory = {
  // Fetch all product categories
  getAllCategories: (cb) => {
    const query = 'SELECT * FROM ProductCategories';
    db.query(query, cb);
  },
};

module.exports = ProductCategory;
