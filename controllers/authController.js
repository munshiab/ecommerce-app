const User = require('../models/User');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
// Render Registration Page
exports.getRegister = (req, res) => {
  res.render('auth/register', { layout: 'layouts/mainLayout' });
};

// Handle Registration Form Submission
exports.register = (req, res) => {
  const { username, email, password, role, business_name, description, category_id } = req.body;

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Determine role_id based on the selected role
  const role_id = role === 'business' ? 2 : 1;

  // Insert user into the users table
  const userQuery = `
    INSERT INTO users (username, email, password, role_id) 
    VALUES (?, ?, ?, ?)
  `;
  db.query(userQuery, [username, email, hashedPassword, role_id], (err, userResult) => {
    if (err) {
      console.error('Error registering user:', err);
      return res.status(500).send('Error registering user');
    }

    if (role_id === 2) {
      // If the user is a business, save business details
      const user_id = userResult.insertId;
      const businessQuery = `
        INSERT INTO businesses (user_id, business_name, description, category_id) 
        VALUES (?, ?, ?, ?)
      `;
      db.query(businessQuery, [user_id, business_name, description, category_id], (err) => {
        if (err) {
          console.error('Error registering business:', err);
          return res.status(500).send('Error registering business');
        }
        res.redirect('/auth/login');
      });
    } else {
      // Redirect customer to login after successful registration
      res.redirect('/auth/login');
    }
  });
};
/* exports.register = (req, res) => {
  const { username, email, password, roleId } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  User.create(username, email, hashedPassword, roleId, (err) => {
    if (err) {
      //console.log(err);
     // console.log(req.body);
      return res.status(500).send('Registration failed');
    }
    res.redirect('/auth/login');
  });
}; */

// Render Login Page
exports.getLogin = (req, res) => {
  res.render('auth/login', { layout: 'layouts/mainLayout' });
};

// Handle Login Form Submission
exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).render('auth/login', { layout: 'layouts/mainLayout', error: 'User not found' });
    }

    const user = results[0];

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).render('auth/login', { layout: 'layouts/mainLayout', error: 'Incorrect password' });
    }

    // Set session variables
    req.session.userId = user.user_id;
    req.session.roleId = user.role_id;
    req.session.isAdmin = user.role_id === 3;
    // Merge session cart into database cart
    const sessionCart = req.session.cart || [];
    if (sessionCart.length > 0) {
      const mergeCartQuery = `
        INSERT INTO Cart (user_id, product_id, quantity)
        VALUES ? 
        ON DUPLICATE KEY UPDATE 
        quantity = quantity + VALUES(quantity)
      `;

      const cartData = sessionCart.map((item) => [user.user_id, item.product_id, item.quantity]);

      db.query(mergeCartQuery, [cartData], (err) => {
        if (err) {
          console.error('Error merging session cart into database:', err);
          return res.status(500).send('Error merging cart');
        }

        // Clear session cart after merging
        req.session.cart = [];

        // Recalculate total price in the database
        const recalculateQuery = `
          SELECT SUM(Products.price * Cart.quantity) AS total_price
          FROM Cart
          JOIN Products ON Cart.product_id = Products.product_id
          WHERE Cart.user_id = ?
        `;

        db.query(recalculateQuery, [user.user_id], (err, totalResult) => {
          if (err) {
            console.error('Error recalculating cart total:', err);
            return res.status(500).send('Error recalculating cart total');
          }

          console.log('Cart Total After Merge:', totalResult[0]?.total_price || 0);

          // Redirect based on user role
          if (user.role_id === 3) {
            return res.redirect('/admin/dashboard');
          } else if (user.role_id === 2) {
            return res.redirect('/business/home');
          } else {
            return res.redirect('/cart'); // Redirect to the cart page to view the merged cart
          }
        });
      });
    } else {
      // No session cart to merge; redirect directly
      if (user.role_id === 3) {
        return res.redirect('/admin/dashboard');
      } else if (user.role_id === 2) {
        return res.redirect('/business/home');
      } else {
        return res.redirect('/cart');
      }
    }
  });
};
/* exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).render('auth/login', { layout: 'layouts/mainLayout', error: 'User not found' });
    }

    const user = results[0];

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).render('auth/login', { layout: 'layouts/mainLayout', error: 'Incorrect password' });
    }

    // Set session variables
    req.session.userId = user.user_id;
    req.session.roleId = user.role_id;

    // Merge session cart with database cart if cart exists in session
    if (req.session.cart) {
      const sessionCart = req.session.cart;

      sessionCart.forEach((item) => {
        const queryCheck = 'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?';
        db.query(queryCheck, [user.user_id, item.product_id], (err, results) => {
          if (err) {
            console.error('Error checking cart:', err);
          }

          if (results.length > 0) {
            // Update quantity in database cart
            const queryUpdate = 'UPDATE Cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
            db.query(queryUpdate, [item.quantity, user.user_id, item.product_id], (err) => {
              if (err) {
                console.error('Error updating cart:', err);
              }
            });
          } else {
            // Insert new item into database cart
            const queryInsert = 'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
            db.query(queryInsert, [user.user_id, item.product_id, item.quantity], (err) => {
              if (err) {
                console.error('Error inserting into cart:', err);
              }
            });
          }
        });
      });

      req.session.cart = null; // Clear session cart after merging
    }

    // Redirect based on user role
    if (user.role_id === 3) {
      // Admin
      return res.redirect('/admin/dashboard');
    } else if (user.role_id === 2) {
      // Business Owner
      return res.redirect('/business/home');
    } else {
      // Regular User
      return res.redirect('/home');
    }
  });
};
 */
/* // Handle Login Form Submission - 03-12-2024
exports.login = (req, res) => {
  const { email, password } = req.body;
console.log(email);
console.log(password);
  User.findByEmail(email, (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).render('auth/login', { layout: 'layouts/mainLayout', error: 'User not found' });
    }

    const user = results[0];

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).render('auth/login', { layout: 'layouts/mainLayout', error: 'Incorrect password' });
    }

    // Set session variables
    req.session.userId = user.user_id;
    req.session.roleId = user.role_id;

    // Redirect based on user role
    if (user.role_id === 3) {
      return res.redirect('/admin/dashboard');
    } else if (user.role_id === 2) {
      return res.redirect('/business/home');
    } else {
      //return res.redirect('/products');
      return res.redirect('/home');
    }
  });
}; */

// Handle Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.redirect('/auth/login');
  });
};
