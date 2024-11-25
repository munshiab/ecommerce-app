/* const Product = require('../models/Product');

// Show the list of products for the business owner
exports.getProducts = (req, res) => {
  const ownerId = req.session.userId;
  
  Product.getByOwner(ownerId, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Error fetching products');
    }
    res.render('business/products', { layout: 'layouts/adminLayout', theme: 'admin', products });
  });
};

// Render the add product page
exports.getAddProduct = (req, res) => {
  res.render('business/addProduct', { layout: 'layouts/adminLayout', theme: 'admin' });
};

// Handle adding a new product
exports.postAddProduct = (req, res) => {
  const { categoryId, productName, description, price, imageUrl } = req.body;
  const ownerId = req.session.userId;

  Product.addProduct(ownerId, categoryId, productName, description, price, imageUrl, (err) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).send('Error adding product');
    }
    res.redirect('/business/products');
  });
};

// Render the edit product page
exports.getEditProduct = (req, res) => {
  const productId = req.params.id;

  Product.getById(productId, (err, product) => {
    if (err || !product) {
      console.error('Error fetching product:', err);
      return res.status(404).send('Product not found');
    }
    res.render('business/editProduct', { layout: 'layouts/adminLayout', theme: 'admin', product });
  });
};

// Handle updating a product
exports.postEditProduct = (req, res) => {
  const { categoryId, productName, description, price, imageUrl } = req.body;
  const productId = req.params.id;

  Product.updateProduct(productId, categoryId, productName, description, price, imageUrl, (err) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).send('Error updating product');
    }
    res.redirect('/business/products');
  });
};

// Handle deleting a product
exports.deleteProduct = (req, res) => {
  const productId = req.params.id;

  Product.deleteProduct(productId, (err) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).send('Error deleting product');
    }
    res.redirect('/business/products');
  });
};
 */
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');

// Show all products for the logged-in business owner
exports.getProducts = (req, res) => {
  const ownerId = req.session.userId; // Get logged-in user's ID

  Product.getByOwner(ownerId, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Error fetching products');
    }
    res.render('business/products', { layout: 'layouts/adminLayout', theme: 'admin', products });
  });
};

// Render the add product page
exports.getAddProduct = (req, res) => {
  //console.log('inside getAddProduct')
  ProductCategory.getAllCategories((err, categories) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).send('Error fetching categories');
    }
    res.render('business/addProduct', { layout: 'layouts/adminLayout', theme: 'admin', categories });
  });
};


// Handle adding a new product
exports.postAddProduct = (req, res) => {
  //const { categoryId, productName, description, price, imageUrl } = req.body;
  const { categoryId, productName, description, price } = req.body;
  console.log("Request Body:=",req.body);
  const ownerId = req.session.userId;
  const imageUrl = req.file ? `/images/${req.file.filename}` : null;
  console.log("ImageURL=",imageUrl);
  Product.addProduct(ownerId, categoryId, productName, description, price, imageUrl, (err) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).send('Error adding product');
    }
    res.redirect('/business/products');
  });
};

// Render the edit product page
/* exports.getEditProduct = (req, res) => {
  const productId = req.params.id;

  Product.getById(productId, (err, product) => {
    if (err || !product) {
      console.error('Error fetching product:', err);
      return res.status(404).send('Product not found');
    }

    ProductCategory.getAllCategories((err, categories) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).send('Error fetching categories');
      }
      res.render('business/editProduct', { layout: 'layouts/adminLayout', theme: 'admin', product, categories });
    });
  });
}; */

exports.getEditProduct = (req, res) => {
  const productId = req.params.id;

  Product.getById(productId, (err, results) => {
    if (err || results.length === 0) {
      console.error('Error fetching product:', err);
      return res.status(404).send('Product not found');
    }

    const product = results[0]; // Extract the product data from the results

    ProductCategory.getAllCategories((err, categories) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).send('Error fetching categories');
      }

      // Render the editProduct view with the product and categories
      res.render('business/editProduct', { layout: 'layouts/adminLayout', theme: 'admin', product, categories });
    });
  });
};

// Handle updating a product
exports.postEditProduct = (req, res) => {
  //const { categoryId, productName, description, price, imageUrl } = req.body;
  const { categoryId, productName, description, price } = req.body;
  console.log("REQ BODY=",req.body);
  const productId = req.params.id;
  // Use the new uploaded file if provided, otherwise keep the existing image URL
  const imageUrl = req.file ? `/images/${req.file.filename}` : req.body.existingImageUrl;
  console.log("Image URL",imageUrl);
  Product.updateProduct(productId, categoryId, productName, description, price, imageUrl, (err) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).send('Error updating product');
    }
    res.redirect('/business/products');
  });
};

// Handle deleting a product
exports.deleteProduct = (req, res) => {
  const productId = req.params.id;

  Product.deleteProduct(productId, (err) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).send('Error deleting product');
    }
    res.redirect('/business/products');
  });
};
