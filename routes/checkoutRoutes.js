const express = require('express');
const checkoutController = require('../controllers/checkoutController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, checkoutController.getCheckoutPage);
router.post('/confirm', authMiddleware, checkoutController.processOrder);

module.exports = router;
