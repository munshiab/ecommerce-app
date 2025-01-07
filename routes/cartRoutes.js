const express = require('express');
const cartController = require('../controllers/cartController');
const router = express.Router();
router.post('/remove', cartController.removeFromCart);
router.post('/add', cartController.addToCart);
router.get('/count', cartController.getCartCount);
router.get('/', cartController.viewCart);
//router.post('/remove', cartController.removeFromCart);
/* router.post('/remove', (req, res, next) => {
    console.log('POST /cart/remove triggered');
    next();
  }); */
  
//router.post('/update-quantity', cartController.updateCartQuantity);
router.post('/update-quantity', cartController.updateCartQuantity);

router.post('/update', cartController.updateCartQuantity);


module.exports = router;
