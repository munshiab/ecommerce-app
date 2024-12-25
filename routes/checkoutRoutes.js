const express = require('express');
const checkoutController = require('../controllers/checkoutController');
const router = express.Router();

router.get('/', checkoutController.getCheckoutPage);
router.post('/confirm', checkoutController.processOrder);

module.exports = router;
