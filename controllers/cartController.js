const db = require('../config/db');
exports.viewCart = (req, res) => {
  if (req.session.user_id) {
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
    db.query(query, [req.session.user_id], (err, results) => {
      if (err) {
        console.error('Error fetching cart:', err);
        return res.status(500).send('Error fetching cart');
      }
      res.render('cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems: results });
    });
  } else {
    // Fetch cart from session for non-logged-in users
    const sessionCart = req.session.cart || [];
    const cartItems = sessionCart.map((item) => ({
      product_name: `Product ID ${item.product_id}`, // Placeholder for product name
      price: 0, // Placeholder for price
      quantity: item.quantity,
      total_price: 0, // Placeholder for total price
    }));
    res.render('cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems });
  }
};

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
    const existingItem = cart.find((item) => item.product_id === product_id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product_id, quantity });
    }

    req.session.cart = cart;
    res.json({ message: 'Product added to session cart', success: true });
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


/* exports.addToCart = (req, res) => {
  const { product_id, user_id } = req.body; // Assuming user_id is available in req.body (e.g., from session)
  
  // Check if the product is already in the cart
  const queryCheck = 'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?';
  db.query(queryCheck, [user_id, product_id], (err, results) => {
    if (err) {
      console.error('Error checking cart:', err);
      return res.status(500).send('Error adding to cart');
    }

    if (results.length > 0) {
      // Update quantity if the product already exists in the cart
      const queryUpdate = 'UPDATE Cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?';
      db.query(queryUpdate, [user_id, product_id], (err) => {
        if (err) {
          console.error('Error updating cart:', err);
          return res.status(500).send('Error adding to cart');
        }
        res.json({ message: 'Product quantity updated in cart' });
      });
    } else {
      // Insert a new item into the cart
      const queryInsert = 'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, 1)';
      db.query(queryInsert, [user_id, product_id], (err) => {
        if (err) {
          console.error('Error inserting into cart:', err);
          return res.status(500).send('Error adding to cart');
        }
        res.json({ message: 'Product added to cart' });
      });
    }
  });
}; */

exports.viewCart = (req, res) => {
  const { user_id } = req.body; // Assuming user_id is available (e.g., from session)

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

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching cart:', err);
      return res.status(500).send('Error fetching cart');
    }

    res.render('cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems: results });
  });
};
exports.getCartCount = (req, res) => {
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

exports.viewCart = (req, res) => {
  if (req.session.userId) {
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
      res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems: results });
    });
  } else {
    // Fetch cart from session for non-logged-in users
    const sessionCart = req.session.cart || [];
    const cartItems = sessionCart.map((item) => ({
      product_name: `Product ID ${item.product_id}`, // Placeholder name
      price: 0, // Placeholder price
      quantity: item.quantity,
      total_price: 0, // Placeholder total
    }));
    res.render('cart/cart', { layout: 'layouts/mainLayout', theme: 'user', cartItems });
  }
};
