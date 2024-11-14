const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

router.get('/dashboard', adminAuth, (req, res) => {
  res.render('admin/dashboard', { layout: 'layouts/adminLayout' });
});

router.get('/manage-products', adminAuth, (req, res) => {
  res.render('admin/manageProducts', { layout: 'layouts/adminLayout' });
});

module.exports = router;
