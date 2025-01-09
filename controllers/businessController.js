const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const db = require('../config/db');
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
/* exports.getAddProduct = (req, res) => {
  //console.log('inside getAddProduct')
  ProductCategory.getAllCategories((err, categories) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).send('Error fetching categories');
    }
    res.render('business/addProduct', { layout: 'layouts/adminLayout', theme: 'admin', categories });
  });
}; */
exports.getAddProduct = (req, res) => {
  const user_id = req.session.userId;

  if (!user_id) {
    return res.redirect('/auth/login'); // Ensure user is logged in
  }

  // Fetch product categories for the dropdown
  const productCategoriesQuery = `SELECT category_id, category_name FROM ProductCategories`;

  // Fetch business ID associated with the logged-in user
  const businessQuery = `SELECT business_id FROM Businesses WHERE user_id = ?`;

  db.query(productCategoriesQuery, (err, categories) => {
    if (err) {
      console.error('Error fetching product categories:', err);
      return res.status(500).send('Error loading add product page.');
    }

    db.query(businessQuery, [user_id], (err, businessResults) => {
      if (err || businessResults.length === 0) {
        console.error('Error fetching business ID:', err);
        return res.status(403).send('Unauthorized: You must be a business user to add products.');
      }

      const business_id = businessResults[0].business_id;

      // Render the add product page with categories and business ID
      res.render('business/addProduct', {
        layout: 'layouts/adminLayout',
        theme: 'admin',
        categories, // Pass product categories
        business_id, // Pass business ID
      });
    });
  });
};

// Handle adding a new product
exports.postAddProduct = (req, res) => {
  console.log('Multer file object:', req.file); // Log the file object to debug
  console.log('Request body:', req.body); // Log the request body to debug

  const { product_name, description, category_id, price, stock_quantity } = req.body;
  const business_owner_id = req.session.userId; // Use the logged-in user's ID
  const image_url = req.file ? `/images/${req.file.filename}` : null; // Get the uploaded image's URL
  console.log('Image URL to be inserted:', image_url);

  if (!product_name || !description || !category_id || !price || !business_owner_id) {
    console.error('Missing required fields:', { product_name, description, category_id, price, business_owner_id });
    return res.status(400).send('All fields are required.');
  }

  // Fetch the business_id for the logged-in user
  const queryBusiness = `
    SELECT business_id 
    FROM Businesses 
    WHERE user_id = ?
  `;

  db.query(queryBusiness, [business_owner_id], (err, results) => {
    if (err) {
      console.error('Error fetching business ID:', err);
      return res.status(500).send('Error fetching business details.');
    }

    if (results.length === 0) {
      console.error('No business found for the logged-in user.');
      return res.status(400).send('No associated business found.');
    }

    const business_id = results[0].business_id;

    // Insert the product into the database
    const queryInsertProduct = `
      INSERT INTO Products (
        business_owner_id, 
        business_id, 
        category_id, 
        product_name, 
        description, 
        price, 
        stock_quantity, 
        image_url
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      queryInsertProduct,
      [
        business_owner_id,
        business_id,
        category_id,
        product_name,
        description,
        parseFloat(price),
        stock_quantity || 0, // Default to 0 if not provided
        image_url, // Insert the image URL
      ],
      (err) => {
        if (err) {
          console.error('Error adding product:', err);
          return res.status(500).send('Error adding product.');
        }

        res.redirect('/business/products'); // Redirect to the business product management page
      }
    );
  });
};


/* exports.postAddProduct = (req, res) => {
  const user_id = req.session.userId;
  const { product_name, description, price, stock_quantity, category_id } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  // Fetch the business_id associated with the logged-in user
  const businessQuery = 'SELECT business_id FROM Businesses WHERE user_id = ?';
  db.query(businessQuery, [user_id], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error fetching business_id:', err);
      return res.status(500).send('Error fetching business information');
    }

    const business_id = results[0].business_id;

    // Insert the product into the Products table
    const insertProductQuery = `
      INSERT INTO Products (product_name, description, price, stock_quantity, category_id, image_url, business_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertProductQuery,
      [
        product_name,
        description,
        parseFloat(price),
        parseInt(stock_quantity, 10),
        parseInt(category_id, 10),
        image_url,
        business_id,
      ],
      (err) => {
        if (err) {
          console.error('Error inserting product:', err);
          return res.status(500).send('Error adding product');
        }
        res.redirect('/business/products'); // Redirect to the product management page
      }
    );
  });
};
 */
/* exports.postAddProduct = (req, res) => {
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
 */
/* exports.addProduct = (req, res) => {
  const { product_name, description, price, stock_quantity, category_id } = req.body;
  const user_id = req.session.userId;

  // Validate file upload
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  // Fetch the business_id associated with the logged-in user
  const businessQuery = 'SELECT business_id FROM Businesses WHERE user_id = ?';
  db.query(businessQuery, [user_id], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error fetching business_id:', err);
      return res.status(500).send('Error fetching business information');
    }

    const business_id = results[0].business_id;

    // Insert the product into the Products table
    const insertProductQuery = `
      INSERT INTO Products (product_name, description, price, stock_quantity, category_id, image_url, business_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertProductQuery,
      [product_name, description, parseFloat(price), parseInt(stock_quantity, 10), category_id, image_url, business_id],
      (err) => {
        if (err) {
          console.error('Error inserting product:', err);
          return res.status(500).send('Error adding product');
        }
        res.redirect('/business/products'); // Redirect to product management page
      }
    );
  });
};
 */

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
exports.getOrders = (req, res) => {
  const businessOwnerId = req.session.userId; // Logged-in user's ID

  if (!businessOwnerId) {
    return res.status(403).send('Unauthorized access.');
  }

  const query = `
    SELECT 
      Orders.order_id,
      Orders.order_date,
      CAST(Orders.total_amount AS DECIMAL(10,2)) AS total_amount,
      Orders.status AS order_status,
      OrderItems.quantity,
      OrderItems.price AS item_price,
      Products.product_name
    FROM Orders
    JOIN OrderItems ON Orders.order_id = OrderItems.order_id
    JOIN Products ON OrderItems.product_id = Products.product_id
    WHERE Products.business_owner_id = ?
    ORDER BY Orders.order_date DESC
  `;

  db.query(query, [businessOwnerId], (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).send('Error fetching orders.');
    }

    // Group orders by order_id
    const orders = results.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = {
          order_id: item.order_id,
          order_date: item.order_date,
          total_amount: parseFloat(item.total_amount) || 0,
          order_status: item.order_status,
          items: [],
        };
      }
      acc[item.order_id].items.push({
        product_name: item.product_name,
        quantity: item.quantity,
        item_price: parseFloat(item.item_price) || 0,
      });
      return acc;
    }, {});

    res.render('business/orders', {
      layout: 'layouts/adminLayout',
      theme: 'admin',
      orders: Object.values(orders), // Convert object to array
    });
  });
};
