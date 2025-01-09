/* const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/login", (req, res) =>
  res.render("auth/login", { layout: "layouts/mainLayout" })
);
router.post("/login", authController.login);

router.get("/register", (req, res) =>
  res.render("auth/register", { layout: "layouts/mainLayout" })
);
router.post("/register", authController.register);

module.exports = router;
 */
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const db = require('../config/db');
// Render Registration Page
//router.get('/register', authController.getRegister);
// Registration page
router.get('/register', (req, res) => {
  const categoryQuery = 'SELECT category_id, category_name FROM Businesscategories';
  db.query(categoryQuery, (err, categories) => {
    if (err) {
      console.error('Error fetching business categories:', err);
      return res.status(500).send('Error loading registration page');
    }
    res.render('auth/register', {
      layout: 'layouts/mainLayout',
      theme: 'user',
      businessCategories: categories,
    });
  });
});
// Handle Registration Form Submission
router.post('/register', authController.register);

// Render Login Page
router.get('/login', authController.getLogin);

// Handle Login Form Submission
router.post('/login', authController.login);

// Logout Route
router.get('/logout', authController.logout);

module.exports = router;
