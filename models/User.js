const db = require('../config/db');

const User = {
  create: (username, email, password, roleId, cb) => {
    const query = 'INSERT INTO Users (username, email, password, role_id) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, password, roleId], cb);
  },
  
  findByEmail: (email, cb) => {
    db.query('SELECT * FROM Users WHERE email = ?', [email], cb);
  },

  findById: (userId, cb) => {
    db.query('SELECT * FROM Users WHERE user_id = ?', [userId], cb);
  }
};

module.exports = User;
