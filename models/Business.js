const db = require('../config/db');

const Business = {
  create: (userId, businessName, description, categoryId, cb) => {
    const query = 'INSERT INTO Businesses (user_id, business_name, description, category_id) VALUES (?, ?, ?, ?)';
    db.query(query, [userId, businessName, description, categoryId], cb);
  },

  getAll: (cb) => {
    db.query('SELECT * FROM Businesses', cb);
  }
};

module.exports = Business;
