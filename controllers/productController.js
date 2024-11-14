const Product = require('../models/Product');

exports.listAllProducts = (req, res) => {
  Product.getAll((err, products) => {
    if (err) return res.status(500).send('Failed to fetch products');
    res.status(200).json(products);
  });
};
