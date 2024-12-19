const express = require('express');
const cartController = require('../controllers/cartController');
const router = express.Router();

router.post('/add', cartController.addToCart);
router.get('/count', cartController.getCartCount);
router.get('/', cartController.viewCart);
router.post('/remove', cartController.removeFromCart);
router.post('/update-quantity', cartController.updateCartQuantity);


module.exports = router;
