const express = require('express');
const multer = require('multer');
const businessController = require('../controllers/businessController');
const router = express.Router();

// Render the business owner's dashboard
router.get('/home', (req, res) => {
  res.render('business/home', { layout: 'layouts/adminLayout', theme: 'admin' });
});

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); // Directory to save uploaded images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique file name
  }
});
const upload = multer({ storage: storage });

// Route to list products
router.get('/products', businessController.getProducts);

// Route to add a new product
router.get('/products/add', businessController.getAddProduct);
router.post('/products/add',upload.single('image_url'), businessController.postAddProduct);

// Route to edit a product
router.get('/products/edit/:id', businessController.getEditProduct);
//router.post('/products/edit/:id', businessController.postEditProduct);
router.post('/products/edit/:id', upload.single('image_url'), businessController.postEditProduct);
// Route to delete a product
router.get('/products/delete/:id', businessController.deleteProduct);

module.exports = router;
