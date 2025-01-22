/* const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

router.get('/dashboard', adminAuth, (req, res) => {
  res.render('admin/dashboard', { layout: 'layouts/adminLayout' });
});

router.get('/manage-products', adminAuth, (req, res) => {
  res.render('admin/manageProducts', { layout: 'layouts/adminLayout' });
});

module.exports = router;
 */
const express = require('express');
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Admin Dashboard
router.get('/dashboard', adminAuth, adminController.getDashboard);

// Manage Businesses
router.get('/businesses', adminAuth, adminController.getBusinesses);
router.post('/businesses/add', adminAuth, adminController.addBusiness);
router.post('/businesses/update/:id', adminAuth, adminController.updateBusiness);
router.post('/businesses/delete/:id', adminAuth, adminController.deleteBusiness);

// Manage Customers
router.get('/customers', adminAuth, adminController.getCustomers);

// Manage Business Categories
router.get('/business-categories', adminAuth, adminController.getBusinessCategories);
router.post('/business-categories/add', adminAuth, adminController.addBusinessCategory);
router.post('/business-categories/update/:id', adminAuth, adminController.updateBusinessCategory);
router.post('/business-categories/delete/:id', adminAuth, adminController.deleteBusinessCategory);
// Route to get the edit business page
router.get('/businesses/edit/:id', adminAuth, adminController.getEditBusiness);

// Update the business information
router.post('/businesses/update/:id', adminAuth, adminController.updateBusiness);

// Manage Product Categories
router.get('/product-categories', adminAuth, adminController.getProductCategories);
router.post('/product-categories/add', adminAuth, adminController.addProductCategory);
router.post('/product-categories/update/:id', adminAuth, adminController.updateProductCategory);
router.post('/product-categories/delete/:id', adminAuth, adminController.deleteProductCategory);

module.exports = router;
