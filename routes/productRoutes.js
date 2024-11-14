// routes/productRoutes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('products/productList', { layout: 'layouts/mainLayout' });
});

module.exports = router;
