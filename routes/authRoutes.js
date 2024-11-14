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

// Render Registration Page
router.get('/register', authController.getRegister);

// Handle Registration Form Submission
router.post('/register', authController.register);

// Render Login Page
router.get('/login', authController.getLogin);

// Handle Login Form Submission
router.post('/login', authController.login);

// Logout Route
router.get('/logout', authController.logout);

module.exports = router;
