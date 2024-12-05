// routes/productRoutes.js
const express = require('express');
const productController= require('../controllers/productController')
const router = express.Router();

router.get('/', productController.getProductsPage );

module.exports = router;
