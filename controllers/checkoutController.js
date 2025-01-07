const db = require('../config/db');

exports.getCheckoutPage = (req, res) => {
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
  
        // Calculate total amount
        const totalAmount = results.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  
        res.render('checkout/checkout', {
          layout: 'layouts/mainLayout',
          theme: 'user',
          cartItems: results,
          totalAmount: totalAmount.toFixed(2), // Pass totalAmount to the view
        });
      });
    } else {
      // Fetch cart from session for non-logged-in users
      const sessionCart = req.session.cart || [];
      const productIds = sessionCart.map((item) => item.product_id);
  
      if (productIds.length > 0) {
        const query = `SELECT product_id, product_name, price FROM Products WHERE product_id IN (?)`;
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
              quantity: item.quantity,
              total_price: product ? parseFloat(product.price) * item.quantity : 0,
            };
          });
  
          // Calculate total amount
          const totalAmount = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  
          res.render('checkout/checkout', {
            layout: 'layouts/mainLayout',
            theme: 'user',
            cartItems,
            totalAmount: totalAmount.toFixed(2), // Pass totalAmount to the view
          });
        });
      } else {
        res.render('checkout/checkout', {
          layout: 'layouts/mainLayout',
          theme: 'user',
          cartItems: [],
          totalAmount: '0.00',
        });
      }
    }
  };

/*  exports.processOrder = (req, res) => {
  const userId = req.session.userId || null; // Use session userId for logged-in users
  let { address, payment_method, total_amount } = req.body;

  // Normalize payment_method to match ENUM values in the database
  const validMethods = {
    'Credit Card': 'CreditCard',
    PayPal: 'PayPal',
    'Bank Transfer': 'BankTransfer',
  };

  payment_method = validMethods[payment_method] || null;

  if (!payment_method) {
    console.error('Error: Invalid payment method');
    return res.status(400).send('Invalid payment method selected');
  }

  // Debugging: Check received data
  console.log('Address Submitted:', address);
  console.log('Normalized Payment Method:', payment_method);
  console.log('Total Amount Submitted:', total_amount);

  if (!userId && (!req.session.cart || req.session.cart.length === 0)) {
    console.error('Error: No items in cart');
    return res.status(400).send('No items in cart to process order');
  }

  // Helper function: Create Order
  const createOrder = (orderDetails, callback) => {
    const query = `
      INSERT INTO orders (user_id, order_date, total_amount, status, address_id, payment_id)
      VALUES (?, NOW(), ?, 'Pending', NULL, NULL)
    `;
    db.query(query, [orderDetails.userId, orderDetails.totalAmount], callback);
  };

  // Helper function: Insert Order Items
  const insertOrderItems = (orderId, items, callback) => {
    const orderItems = items.map(item => [orderId, item.product_id, item.quantity, item.price]);
    const query = `
      INSERT INTO orderitems (order_id, product_id, quantity, price)
      VALUES ?
    `;
    db.query(query, [orderItems], callback);
  };

  // Helper function: Insert Payment
  const insertPayment = (paymentDetails, callback) => {
    const query = `
      INSERT INTO payments (user_id, order_id, payment_method, amount, payment_date, status)
      VALUES (?, ?, ?, ?, NOW(), 'Completed')
    `;
    console.log('Payment Query:', query);
    console.log('Payment Details:', paymentDetails);
    db.query(query, [
      paymentDetails.userId,
      paymentDetails.orderId,
      paymentDetails.method,
      paymentDetails.amount,
    ], callback);
  };

  // Helper function: Clear Cart
  const clearCart = (userId, callback) => {
    const query = 'DELETE FROM Cart WHERE user_id = ?';
    db.query(query, [userId], callback);
  };

  
    // Handle Non-Logged-In Users (Session Cart)
    if (!userId) {
      const sessionCart = req.session.cart || [];
      const productIds = sessionCart.map(item => item.product_id);
  
      // Fetch product details for session cart
      const query = `SELECT product_id, price FROM Products WHERE product_id IN (?)`;
      db.query(query, [productIds], (err, products) => {
        if (err) {
          console.error('Error fetching product details:', err);
          return res.status(500).send('Error processing order');
        }
  
        const orderItems = sessionCart.map(item => {
          const product = products.find(p => p.product_id === parseInt(item.product_id));
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            price: product ? parseFloat(product.price) : 0,
          };
        });
  
        const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
        // Create order
        createOrder({ userId: null, totalAmount }, (err, orderResult) => {
          if (err) {
            console.error('Error creating order:', err);
            return res.status(500).send('Error processing order');
          }
  
          const orderId = orderResult.insertId;
          insertOrderItems(orderId, orderItems, (err) => {
            if (err) {
              console.error('Error inserting order items:', err);
              return res.status(500).send('Error processing order');
            }
  
            // Insert payment details
            insertPayment(
              { userId: null, orderId, method: payment_method, amount: totalAmount },
              (err) => {
                if (err) {
                  console.error('Error processing payment:', err);
                  return res.status(500).send('Error processing payment');
                }
  
                // Clear session cart
                req.session.cart = [];
                res.render('checkout/success', {
                  layout: 'layouts/mainLayout',
                  theme: 'user',
                  message: 'Your order has been placed successfully!',
                });
              }
            );
          });
        });
      });
      return;
    }
  
    // Handle Logged-In Users (Database Cart)
    const query = `
      SELECT Cart.product_id, Cart.quantity, Products.price
      FROM Cart
      JOIN Products ON Cart.product_id = Products.product_id
      WHERE Cart.user_id = ?
    `;
    db.query(query, [userId], (err, cartItems) => {
      if (err) {
        console.error('Error fetching cart items:', err);
        return res.status(500).send('Error processing order');
      }
  
      const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
      // Create order
      createOrder({ userId, totalAmount }, (err, orderResult) => {
        if (err) {
          console.error('Error creating order:', err);
          return res.status(500).send('Error processing order');
        }
  
        const orderId = orderResult.insertId;
        insertOrderItems(orderId, cartItems, (err) => {
          if (err) {
            console.error('Error inserting order items:', err);
            return res.status(500).send('Error processing order');
          }
  
          // Insert payment details
          insertPayment(
            { userId, orderId, method: payment_method, amount: totalAmount },
            (err) => {
              if (err) {
                console.error('Error processing payment:', err);
                return res.status(500).send('Error processing payment');
              }
  
              // Clear cart in database
              clearCart(userId, (err) => {
                if (err) {
                  console.error('Error clearing cart:', err);
                  return res.status(500).send('Error completing transaction');
                }
  
                res.render('checkout/success', {
                  layout: 'layouts/mainLayout',
                  theme: 'user',
                  message: 'Your order has been placed successfully!',
                });
              });
            }
          );
        });
      });
    });
  }; */
  exports.processOrder = (req, res) => {
    const userId = req.session.userId || null;
    const {
      address,
      city,
      state,
      postal_code,
      country,
      payment_method,
      total_amount,
    } = req.body;
  
    // Parse and validate total_amount
    const parsedTotalAmount = parseFloat(total_amount.replace('$', '').trim());
    if (isNaN(parsedTotalAmount) || parsedTotalAmount <= 0) {
      console.error('Invalid total amount:', total_amount);
      return res.status(400).send('Invalid total amount');
    }
  
    if (userId) {
      const cartQuery = `
        SELECT Cart.product_id, Products.price, Cart.quantity
        FROM Cart
        JOIN Products ON Cart.product_id = Products.product_id
        WHERE Cart.user_id = ?
      `;
  
      db.query(cartQuery, [userId], (err, cartItems) => {
        if (err) {
          console.error('Error fetching cart:', err);
          return res.status(500).send('Error processing order');
        }
  
        if (cartItems.length === 0) {
          return res.status(400).send('No items in cart to process order');
        }
  
        saveOrder(userId, cartItems, req.body, parsedTotalAmount, res);
      });
    } else {
      const sessionCart = req.session.cart || [];
      if (sessionCart.length === 0) {
        return res.status(400).send('No items in cart to process order');
      }
  
      const productIds = sessionCart.map((item) => item.product_id);
      const productQuery = `SELECT product_id, price FROM Products WHERE product_id IN (?)`;
  
      db.query(productQuery, [productIds], (err, productDetails) => {
        if (err) {
          console.error('Error fetching product details:', err);
          return res.status(500).send('Error processing order');
        }
  
        const cartItems = sessionCart.map((item) => {
          const product = productDetails.find((p) => p.product_id === parseInt(item.product_id, 10));
          return {
            product_id: item.product_id,
            price: product ? parseFloat(product.price) : 0,
            quantity: item.quantity,
          };
        });
  
        saveOrder(null, cartItems, req.body, parsedTotalAmount, res);
      });
    }
  };
  
  function saveOrder(userId, cartItems, body, totalAmount, res) {
    const { address, city, state, postal_code, country, payment_method } = body;
  
    const addressQuery = `
      INSERT INTO address (user_id, street, city, state, postal_code, country, address_type)
      VALUES (?, ?, ?, ?, ?, ?, 'Shipping')
    `;
  
    db.query(addressQuery, [userId, address, city, state, postal_code, country], (err, addressResult) => {
      if (err) {
        console.error('Error saving address:', err);
        return res.status(500).send('Error saving address');
      }
  
      const addressId = addressResult.insertId;
  
      const orderQuery = `
        INSERT INTO orders (user_id, order_date, total_amount, status, address_id)
        VALUES (?, NOW(), ?, 'Pending', ?)
      `;
  
      db.query(orderQuery, [userId, totalAmount, addressId], (err, orderResult) => {
        if (err) {
          console.error('Error saving order:', err);
          return res.status(500).send('Error saving order');
        }
  
        const orderId = orderResult.insertId;
  
        const orderItemsQuery = `
          INSERT INTO orderitems (order_id, product_id, quantity, price)
          VALUES ?
        `;
        const orderItemsValues = cartItems.map((item) => [orderId, item.product_id, item.quantity, item.price]);
  
        db.query(orderItemsQuery, [orderItemsValues], (err) => {
          if (err) {
            console.error('Error saving order items:', err);
            return res.status(500).send('Error saving order items');
          }
  
          const paymentQuery = `
            INSERT INTO payments (user_id, order_id, payment_method, amount, payment_date, status)
            VALUES (?, ?, ?, ?, NOW(), 'Completed')
          `;
  
          // Map frontend payment method to enum-compatible values
          const paymentMethodMap = {
            'Credit Card': 'CreditCard',
            'PayPal': 'PayPal',
            'Bank Transfer': 'BankTransfer',
          };
          const paymentMethod = paymentMethodMap[payment_method] || null;
  
          if (!paymentMethod) {
            console.error('Invalid payment method:', payment_method);
            return res.status(400).send('Invalid payment method');
          }
  
          db.query(paymentQuery, [userId, orderId, paymentMethod, totalAmount], (err) => {
            if (err) {
              console.error('Error saving payment:', err);
              return res.status(500).send('Error saving payment');
            }
  
            if (userId) {
              const clearCartQuery = 'DELETE FROM Cart WHERE user_id = ?';
              db.query(clearCartQuery, [userId], (err) => {
                if (err) console.error('Error clearing cart:', err);
              });
            } else {
              req.session.cart = [];
            }
  
            res.render('checkout/success', {
              layout: 'layouts/mainLayout',
              theme: 'user',
              orderId,
              message: `Your order (ID: ${orderId}) has been placed successfully!`,
            });
          });
        });
      });
    });
  }
  