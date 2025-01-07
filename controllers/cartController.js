const db = require('../config/db');
exports.viewCart = (req, res) => {
  if (req.session.userId) {
    const query = `
      SELECT 
        Cart.product_id,
        Products.product_name,
        Products.price,
        Products.image_url,
        Cart.quantity,
        (Products.price * Cart.quantity) AS total_price
      FROM Cart
      JOIN Products ON Cart.product_id = Products.product_id
      WHERE Cart.user_id = ?
    `;
    db.query(query, [req.session.userId], (err, results) => {
      if (err) {
        console.error('Error fetching cart:', err);
        return res.status(500).send('Error fetching cart');
      }

      const totalAmount = results.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
      console.log('Total Amount:', totalAmount);

      res.render('cart/cart', { 
        layout: 'layouts/mainLayout', 
        theme: 'user', 
        cartItems: results, 
        totalAmount: totalAmount.toFixed(2),
      });
    });
  } else {
    const sessionCart = req.session.cart || [];
    const productIds = sessionCart.map((item) => item.product_id);

    if (productIds.length > 0) {
      const query = `SELECT product_id, product_name, price, image_url FROM Products WHERE product_id IN (?)`;
      db.query(query, [productIds], (err, productDetails) => {
        if (err) {
          console.error('Error fetching product details:', err);
          return res.status(500).send('Error fetching cart');
        }

        const cartItems = sessionCart.map((item) => {
          const product = productDetails.find((p) => p.product_id === parseInt(item.product_id));
          return {
            product_id: item.product_id,
            product_name: product ? product.product_name : `Product ID ${item.product_id}`,
            price: product ? parseFloat(product.price) : 0,
            image_url: product ? product.image_url : '',
            quantity: item.quantity,
            total_price: product ? parseFloat(product.price) * item.quantity : 0,
          };
        });

        const totalAmount = cartItems.reduce((sum, item) => sum + item.total_price, 0);
        console.log('Session Cart Total Amount:', totalAmount);

        res.render('cart/cart', { 
          layout: 'layouts/mainLayout', 
          theme: 'user', 
          cartItems, 
          totalAmount: totalAmount.toFixed(2),
        });
      });
    } else {
      res.render('cart/cart', { 
        layout: 'layouts/mainLayout', 
        theme: 'user', 
        cartItems: [], 
        totalAmount: '0.00',
      });
    }
  }
};

/* exports.viewCart = (req, res) => {
  if (req.session.userId) {
    const query = `
      SELECT 
        Cart.product_id,
        Products.product_name,
        Products.price,
        Products.image_url, -- Include image_url
        Cart.quantity,
        (Products.price * Cart.quantity) AS total_price
      FROM Cart
      JOIN Products ON Cart.product_id = Products.product_id
      WHERE Cart.user_id = ?
    `;
    db.query(query, [req.session.userId], (err, results) => {
      if (err) {
        console.error('Error fetching cart:', err);
        return res.status(500).send('Error fetching cart');
      }
      res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems: results });
    });
  } else {
    const sessionCart = req.session.cart || [];
    const productIds = sessionCart.map((item) => item.product_id);

    if (productIds.length > 0) {
      const query = `SELECT product_id, product_name, price, image_url FROM Products WHERE product_id IN (?)`;
      db.query(query, [productIds], (err, productDetails) => {
        if (err) {
          console.error('Error fetching product details:', err);
          return res.status(500).send('Error fetching cart');
        }

        const cartItems = sessionCart.map((item) => {
          const product = productDetails.find((p) => p.product_id === parseInt(item.product_id));
          return {
            product_id: item.product_id,
            product_name: product ? product.product_name : `Product ID ${item.product_id}`,
            price: product ? parseFloat(product.price) : 0,
            image_url: product ? product.image_url : '', // Include image_url here
            quantity: item.quantity,
            total_price: product ? parseFloat(product.price) * item.quantity : 0,
          };
        });

        res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems });
      });
    } else {
      res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems: [] });
    }
  }
};
 */
/* exports.viewCart = (req, res) => {
  if (req.session.userId) {
    // Fetch cart from database for logged-in users
    const query = `
      SELECT 
        Cart.product_id,
        Products.product_name,
        Products.price,
        Cart.quantity,
        (Products.price * Cart.quantity) AS total_price
      FROM Cart
      JOIN Products ON Cart.product_id = Products.product_id
      WHERE Cart.user_id = ?
    `;
    db.query(query, [req.session.userId], (err, results) => {
      if (err) {
        console.error('Error fetching cart:', err);
        return res.status(500).send('Error fetching cart');
      }
      res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems: results });
    });
  } else {
    console.log('Session cart:', req.session.cart);
    // Fetch cart from session for non-logged-in users
    const sessionCart = req.session.cart || [];
    const productIds = sessionCart.map((item) => item.product_id);
    
    // Fetch product details for session cart
    if (productIds.length > 0) {
      const query = `SELECT product_id, product_name, price FROM Products WHERE product_id IN (?)`;
      db.query(query, [productIds], (err, productDetails) => {
        if (err) {
          console.error('Error fetching product details:', err);
          return res.status(500).send('Error fetching cart');
        }
        console.log('Product details fetched for session cart:', productDetails);
        // Map session cart items with product details
        const cartItems = sessionCart.map((item) => {
          const product = productDetails.find((p) => p.product_id === parseInt(item.product_id));
          return {
            product_id: item.product_id, // Include product_id here
            product_name: product ? product.product_name : `Product ID ${item.product_id}`,
            price: product ? parseFloat(product.price) : 0,
            quantity: item.quantity,
            total_price: product ? parseFloat(product.price) * item.quantity : 0,
          };
        });

        console.log('Final cart items to render:', cartItems); // Debugging log
        res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems });
      });
    } else {
      // Empty cart
      res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems: [] });
    }
  }
}; */

/* exports.viewCart = (req, res) => {
  if (req.session.userId) {
    console.log('Logged-in user ID:', req.session.userId);

    // Fetch cart from database for logged-in users
    const query = `
      SELECT 
        Cart.cart_id,
        Products.product_name,
        Products.price,
        Cart.quantity,
        (Products.price * Cart.quantity) AS total_price
      FROM Cart
      JOIN Products ON Cart.product_id = Products.product_id
      WHERE Cart.user_id = ?
    `;
    db.query(query, [req.session.userId], (err, results) => {
      if (err) {
        console.error('Error fetching cart:', err);
        return res.status(500).send('Error fetching cart');
      }
      console.log('Database cart items:', results);
      res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems: results });
    });
  } else {
    console.log('Session cart:', req.session.cart);

    const sessionCart = req.session.cart || [];

    if (sessionCart.length === 0) {
      return res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems: [] });
    }

    const productIds = sessionCart.map((item) => Number(item.product_id)); // Convert session product_id to numbers

    const query = `
      SELECT 
        Products.product_id,
        Products.product_name,
        Products.price
      FROM Products
      WHERE Products.product_id IN (?)
    `;
    db.query(query, [productIds], (err, products) => {
      if (err) {
        console.error('Error fetching product details:', err);
        return res.status(500).send('Error fetching cart');
      }

      console.log('Product details fetched for session cart:', products);

      const cartItems = products.map((product) => {
        const sessionItem = sessionCart.find((item) => Number(item.product_id) === product.product_id); // Match using Number
        const quantity = sessionItem ? sessionItem.quantity : 0;
        const total_price = (parseFloat(product.price) || 0) * quantity;

        return {
          product_name: product.product_name,
          price: parseFloat(product.price) || 0,
          quantity,
          total_price,
        };
      });

      console.log('Final cart items to render:', cartItems);
      res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems });
    });
  }
};
 */

/* exports.addToCart = (req, res) => {
  const { product_id } = req.body;
  const user_id = req.session.userId || null; // Use session userId if available
  const quantity = 1; // Default quantity

  if (!req.session.cart) {
    req.session.cart = [];
  }

  if (user_id) {
    // Logged-in user: save to database
    const queryCheck = 'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?';
    db.query(queryCheck, [user_id, product_id], (err, results) => {
      if (err) {
        console.error('Error checking cart:', err);
        return res.status(500).json({ message: 'Error adding to cart' });
      }

      if (results.length > 0) {
        // Update quantity
        const queryUpdate = 'UPDATE Cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
        db.query(queryUpdate, [quantity, user_id, product_id], (err) => {
          if (err) {
            console.error('Error updating cart:', err);
            return res.status(500).json({ message: 'Error adding to cart' });
          }
          res.json({ message: 'Cart updated', success: true });
        });
      } else {
        // Insert new product
        const queryInsert = 'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
        db.query(queryInsert, [user_id, product_id, quantity], (err) => {
          if (err) {
            console.error('Error inserting into cart:', err);
            return res.status(500).json({ message: 'Error adding to cart' });
          }
          res.json({ message: 'Product added to cart', success: true });
        });
      }
    });
  } else {
    // Non-logged-in user: save to session cart
    const cart = req.session.cart;
    const existingItem = cart.find((item) => item.product_id === product_id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product_id, quantity });
    }

    req.session.cart = cart;
    res.json({ message: 'Product added to session cart', success: true });
  }
}; */
exports.addToCart = (req, res) => {
  const { product_id } = req.body;
  const user_id = req.session.userId || null; // Use session userId if available
  const quantity = 1; // Default quantity

  if (!req.session.cart) {
    req.session.cart = [];
  }

  if (user_id) {
    // Logged-in user: save to database
    const queryCheck = 'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?';
    db.query(queryCheck, [user_id, product_id], (err, results) => {
      if (err) {
        console.error('Error checking cart:', err);
        return res.status(500).json({ message: 'Error adding to cart' });
      }

      if (results.length > 0) {
        // Update quantity
        const queryUpdate = 'UPDATE Cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
        db.query(queryUpdate, [quantity, user_id, product_id], (err) => {
          if (err) {
            console.error('Error updating cart:', err);
            return res.status(500).json({ message: 'Error adding to cart' });
          }
          res.json({ message: 'Cart updated', success: true });
        });
      } else {
        // Insert new product
        const queryInsert = 'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
        db.query(queryInsert, [user_id, product_id, quantity], (err) => {
          if (err) {
            console.error('Error inserting into cart:', err);
            return res.status(500).json({ message: 'Error adding to cart' });
          }
          res.json({ message: 'Product added to cart', success: true });
        });
      }
    });
  } else {
    // Non-logged-in user: save to session cart
    const cart = req.session.cart;

    // Fetch product details for the session cart
    const productDetailsQuery = 'SELECT product_id, price FROM Products WHERE product_id = ?';
    db.query(productDetailsQuery, [product_id], (err, results) => {
      if (err || results.length === 0) {
        console.error('Error fetching product details for session cart:', err);
        return res.status(500).json({ message: 'Error adding to cart' });
      }

      const productDetails = results[0];
      const existingItem = cart.find((item) => String(item.product_id) === String(product_id));

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          product_id: productDetails.product_id,
          price: parseFloat(productDetails.price), // Ensure price is stored
          quantity: quantity,
        });
      }

      req.session.cart = cart; // Update session cart
      res.json({ message: 'Product added to session cart', success: true });
    });
  }
};

exports.getCartCount = (req, res) => {
  if (req.session.userId) {
    // Logged-in user: fetch from database
    const query = 'SELECT SUM(quantity) AS cartItemCount FROM Cart WHERE user_id = ?';
    db.query(query, [req.session.userId], (err, results) => {
      if (err) {
        console.error('Error fetching cart count:', err);
        return res.status(500).json({ cartItemCount: 0 });
      }
      res.json({ cartItemCount: results[0]?.cartItemCount || 0 });
    });
  } else {
    // Non-logged-in user: fetch from session
    const cart = req.session.cart || [];
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    res.json({ cartItemCount });
  }
};
/* exports.getCartCount = (req, res) => {
  if (req.session.userId) {
    // Fetch cart count from the database for logged-in users
    const query = 'SELECT SUM(quantity) AS cartItemCount FROM Cart WHERE user_id = ?';
    db.query(query, [req.session.userId], (err, results) => {
      if (err) {
        console.error('Error fetching cart count:', err);
        return res.status(500).json({ cartItemCount: 0 });
      }
      res.json({ cartItemCount: results[0].cartItemCount || 0 });
    });
  } else {
    // Fetch cart count from session for non-logged-in users
    const cart = req.session.cart || [];
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    res.json({ cartItemCount });
  }
};
 */
exports.removeFromCart = (req, res) => {
  console.log('Remove from cart called'); // Debugging log
  console.log('Request body:', req.body); // Debugging log

  const { product_id } = req.body;

  if (!product_id) {
    console.error('No product_id provided'); // Debugging log
    return res.status(400).json({ success: false, message: 'No product_id provided' });
  }

  if (req.session.userId) {
    // Remove from database cart
    console.log(`Removing product ${product_id} from database cart for user ${req.session.userId}`);
    const query = 'DELETE FROM Cart WHERE user_id = ? AND product_id = ?';
    db.query(query, [req.session.userId, product_id], (err) => {
      if (err) {
        console.error('Error removing item from cart:', err);
        return res.status(500).json({ success: false, message: 'Error removing item from cart' });
      }
      res.json({ success: true, message: 'Item removed from cart' });
    });
  } else {
    // Remove from session cart
    console.log(`Removing product ${product_id} from session cart`);
    req.session.cart = req.session.cart.filter((item) => String(item.product_id) !== String(product_id));
    console.log('Updated session cart:', req.session.cart);
    res.json({ success: true, message: 'Item removed from session cart' });
  }
};
//04-Jan-2024
/* exports.updateCartQuantity = (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = req.session.userId || null;

  if (user_id) {
    // For logged-in users, update the quantity in the database
    const query = 'UPDATE Cart SET quantity = ? WHERE user_id = ? AND product_id = ?';
    db.query(query, [quantity, user_id, product_id], (err) => {
      if (err) {
        console.error('Error updating cart quantity:', err);
        return res.status(500).json({ message: 'Error updating cart quantity' });
      }

      // Fetch the updated cart to calculate total price
      const fetchQuery = `
        SELECT 
          Cart.quantity, Products.price, 
          (Cart.quantity * Products.price) AS total_price
        FROM Cart
        JOIN Products ON Cart.product_id = Products.product_id
        WHERE Cart.user_id = ?
      `;
      db.query(fetchQuery, [user_id], (err, results) => {
        if (err) {
          console.error('Error fetching updated cart:', err);
          return res.status(500).json({ message: 'Error updating cart quantity' });
        }

        const totalAmount = results.reduce((sum, item) => sum + item.total_price, 0);
        res.json({ message: 'Cart updated', success: true, totalAmount });
      });
    });
  } else {
    // For non-logged-in users, update the session cart
    if (!req.session.cart) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    const cart = req.session.cart;
    const item = cart.find((i) => i.product_id === product_id);

    if (item) {
      item.quantity = parseInt(quantity, 10);
    }

    req.session.cart = cart;

    // Calculate total amount
    const productPrices = {}; // Fetch product prices from database or cache if necessary
    const totalAmount = cart.reduce(
      (sum, item) => sum + (productPrices[item.product_id] || 0) * item.quantity,
      0
    );

    res.json({ message: 'Cart updated', success: true, totalAmount });
  }
};
 */
exports.updateCartQuantity = (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = req.session.userId || null;

  console.log('Request body:', req.body);

  // Validate inputs
  if (!product_id || isNaN(quantity) || quantity <= 0) {
    console.error('Invalid product_id or quantity:', product_id, quantity);
    return res.status(400).json({ success: false, message: 'Invalid product ID or quantity' });
  }

  if (user_id) {
    // For logged-in users: Update the database
    const query = 'UPDATE Cart SET quantity = ? WHERE user_id = ? AND product_id = ?';
    db.query(query, [quantity, user_id, product_id], (err) => {
      if (err) {
        console.error('Error updating cart quantity in database:', err);
        return res.status(500).json({ success: false, message: 'Error updating cart quantity' });
      }

      // Fetch the updated cart for total amount calculation
      const fetchQuery = `
        SELECT 
          Cart.quantity, Products.price, 
          (Cart.quantity * Products.price) AS total_price
        FROM Cart
        JOIN Products ON Cart.product_id = Products.product_id
        WHERE Cart.user_id = ?
      `;
      db.query(fetchQuery, [user_id], (err, results) => {
        if (err) {
          console.error('Error fetching updated cart:', err);
          return res.status(500).json({ success: false, message: 'Error fetching updated cart' });
        }

        // Calculate total amount
        const totalAmount = results.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
        console.log('Updated cart total amount:', totalAmount);

        res.json({ success: true, message: 'Cart updated successfully', totalAmount: totalAmount.toFixed(2) });
      });
    });
  } else {
    // For non-logged-in users: Update the session cart
    const cart = req.session.cart || [];
    const item = cart.find((i) => i.product_id == product_id);

    if (item) {
      item.quantity = parseInt(quantity, 10);
    } else {
      console.error('Product not found in session cart:', product_id);
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    req.session.cart = cart;

    // Fetch product prices for the session cart
    const productIds = cart.map((item) => item.product_id);
    const query = 'SELECT product_id, price FROM Products WHERE product_id IN (?)';
    db.query(query, [productIds], (err, productDetails) => {
      if (err) {
        console.error('Error fetching product prices:', err);
        return res.status(500).json({ success: false, message: 'Error fetching product prices' });
      }

      // Map product IDs to prices
      const productPrices = {};
      productDetails.forEach((product) => {
        productPrices[product.product_id] = parseFloat(product.price);
      });

      // Calculate total amount
      const totalAmount = cart.reduce(
        (sum, item) => sum + (productPrices[item.product_id] || 0) * item.quantity,
        0
      );
      console.log('Updated session cart total amount:', totalAmount);

      res.json({ success: true, message: 'Cart updated successfully', totalAmount: totalAmount.toFixed(2) });
    });
  }
};
