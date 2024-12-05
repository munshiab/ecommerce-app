//const Product = require('../models/Product');

/* exports.listAllProducts = (req, res) => {
  Product.getAll((err, products) => {
    if (err) return res.status(500).send('Failed to fetch products');
    res.status(200).json(products);
  });
};
 */
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');

/* exports.getProductsPage = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;

  // Fetch all products
  Product.getAllProducts((err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Error fetching products');
    }
  
    console.log('Products:', products); // Debug the product data
  
    // Fetch all categories
    ProductCategory.getAllCategories((err, categories) => {
      console.log(categories);
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).send('Error fetching categories');
      }

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      // Render the index view
      res.render('index', {
        layout: 'layouts/mainLayout',
        products: products.slice(startIndex, endIndex), // Paginate products
        categories, // Pass categories to the view
        totalPages: Math.ceil(products.length / limit),
        currentPage: page,
      });
    });
  });
};
 */
exports.getProductsPage = (req, res) => {
  const user_id = req.session.userId || null; // Get user_id from session if logged in
  const page = parseInt(req.query.page) || 1;
  const limit = 9;

  Product.getAllProducts((err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Error fetching products');
    }

    ProductCategory.getAllCategories((err, categories) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).send('Error fetching categories');
      }

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      res.render('index', {
        layout: 'layouts/mainLayout',
        products: products.slice(startIndex, endIndex),
        categories,
        totalPages: Math.ceil(products.length / limit),
        currentPage: page,
        user_id, // Pass user_id to the view if logged in
      });
    });
  });
};
