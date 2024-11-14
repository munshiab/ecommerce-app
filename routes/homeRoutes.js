const express = require('express');
const homeController = require('../controllers/homeController');
const router = express.Router();

// Route to render the home page
router.get('/', homeController.getHomePage);

module.exports = router;
