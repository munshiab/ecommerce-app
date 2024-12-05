/* console.log('Loading Product model');

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
 */

const db = require('../config/db');

const Product = {
  /* getAllProducts: (cb) => {
    const query = 'SELECT * FROM Products';
    db.query(query, cb);
  }, */
  getAllProducts: (cb) => {
    const query = `
      SELECT 
        product_id, 
        category_id, 
        product_name, 
        description, 
        CAST(price AS DECIMAL(10,2)) AS price, 
        stock_quantity, 
        image_url 
      FROM Products`;
    db.query(query, cb);
  },

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
  },
  // Fetch all products for a specific business owner
  getByOwner: (ownerId, cb) => {
    const query = 'SELECT * FROM Products WHERE business_owner_id = ?';
    db.query(query, [ownerId], cb);
  },

  // Add a new product
  addProduct: (ownerId, categoryId, productName, description, price, imageUrl, cb) => {
    const query = `INSERT INTO Products (business_owner_id, category_id, product_name, description, price, image_url) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [ownerId, categoryId, productName, description, price, imageUrl], cb);
  },

  // Update a product
  updateProduct: (productId, categoryId, productName, description, price, imageUrl, cb) => {
    const query = `UPDATE Products 
                   SET category_id = ?, product_name = ?, description = ?, price = ?, image_url = ? 
                   WHERE product_id = ?`;
                   console.log(query);
    db.query(query, [categoryId, productName, description, price, imageUrl, productId], cb);
  },

  // Delete a product
  deleteProduct: (productId, cb) => {
    const query = 'DELETE FROM Products WHERE product_id = ?';
    db.query(query, [productId], cb);
  },

  // Fetch a single product by its ID
  getById: (productId, cb) => {
    const query = 'SELECT * FROM Products WHERE product_id = ?';
    db.query(query, [productId], cb);
  }
};

module.exports = Product;
