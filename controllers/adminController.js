/* const db = require('../config/db');

// Admin Dashboard
exports.getDashboard = (req, res) => {
  const analyticsQuery = `
    SELECT 
      Products.business_owner_id, 
      Users.username AS business_owner, 
      COUNT(Orders.order_id) AS total_orders
    FROM Products
    JOIN Users ON Products.business_owner_id = Users.user_id
    LEFT JOIN OrderItems ON Products.product_id = OrderItems.product_id
    LEFT JOIN Orders ON OrderItems.order_id = Orders.order_id
    GROUP BY Products.business_owner_id
  `;

  db.query(analyticsQuery, (err, analytics) => {
    if (err) {
      console.error('Error fetching analytics:', err);
      return res.status(500).send('Error loading admin dashboard.');
    }

    res.render('admin/dashboard', {
      layout: 'layouts/adminLayout',
      theme: 'admin',
      analytics,
    });
  });
}; */
const db = require('../config/db');

exports.getDashboard = (req, res) => {
  // Fetch total businesses
  const businessesQuery = 'SELECT COUNT(*) AS totalBusinesses FROM businesses';

  // Fetch total orders
  const ordersQuery = 'SELECT COUNT(*) AS totalOrders FROM orders';

  db.query(businessesQuery, (err, businessesResult) => {
    if (err) {
      console.error('Error fetching businesses count:', err);
      return res.status(500).send('Error loading dashboard data');
    }

    db.query(ordersQuery, (err, ordersResult) => {
      if (err) {
        console.error('Error fetching orders count:', err);
        return res.status(500).send('Error loading dashboard data');
      }

      const analytics = {
        totalBusinesses: businessesResult[0]?.totalBusinesses || 0,
        totalOrders: ordersResult[0]?.totalOrders || 0,
      };

      console.log('Analytics data:', analytics); // Debugging log

      res.render('admin/dashboard', {
        layout: 'layouts/adminLayout',
        analytics, // Pass analytics to the view
      });
    });
  });
};



// Manage Businesses
exports.getBusinesses = (req, res) => {
  const query = `
    SELECT 
      Businesses.business_id, Businesses.business_name, Businesses.description, 
      Businesses.category_id, BusinessCategories.category_name, 
      Users.username, Users.email
    FROM Businesses
    JOIN Users ON Businesses.user_id = Users.user_id
    JOIN BusinessCategories ON Businesses.category_id = BusinessCategories.category_id
  `;

  db.query(query, (err, businesses) => {
    if (err) {
      console.error('Error fetching businesses:', err);
      return res.status(500).send('Error fetching businesses.');
    }

    res.render('admin/businesses', {
      layout: 'layouts/adminLayout',
      theme: 'admin',
      businesses,
    });
  });
};

exports.addBusiness = (req, res) => {
  const { user_id, business_name, description, category_id } = req.body;

  const query = `
    INSERT INTO Businesses (user_id, business_name, description, category_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [user_id, business_name, description, category_id], (err) => {
    if (err) {
      console.error('Error adding business:', err);
      return res.status(500).send('Error adding business.');
    }

    res.redirect('/admin/businesses');
  });
};
exports.getEditBusiness = (req, res) => {
    const businessId = req.params.id;
  
    const query = `
      SELECT b.business_id, b.business_name, b.description, b.category_id, c.category_name
      FROM Businesses b
      LEFT JOIN BusinessCategories c ON b.category_id = c.category_id
      WHERE b.business_id = ?
    `;
  
    db.query(query, [businessId], (err, results) => {
      if (err) {
        console.error('Error fetching business details:', err);
        return res.status(500).send('Error fetching business details');
      }
  
      if (results.length === 0) {
        return res.status(404).send('Business not found');
      }
  
      const business = results[0];
  
      // Fetch categories for the dropdown
      const categoryQuery = 'SELECT category_id, category_name FROM BusinessCategories';
      db.query(categoryQuery, (err, categories) => {
        if (err) {
          console.error('Error fetching categories:', err);
          return res.status(500).send('Error fetching categories');
        }
  
        res.render('admin/editBusiness', {
          layout: 'layouts/adminLayout',
          theme: 'admin',
          business,
          categories,
        });
      });
    });
  };
  
exports.updateBusiness = (req, res) => {
    const businessId = req.params.id;
    const { business_name, description, category_id } = req.body;
  
    const query = `
      UPDATE Businesses
      SET business_name = ?, description = ?, category_id = ?
      WHERE business_id = ?
    `;
  
    db.query(query, [business_name, description, category_id, businessId], (err) => {
      if (err) {
        console.error('Error updating business:', err);
        return res.status(500).send('Error updating business');
      }
      res.redirect('/admin/businesses');
    });
  };
  
  exports.deleteBusiness = (req, res) => {
    const businessId = req.params.id;
  
    const query = 'DELETE FROM Businesses WHERE business_id = ?';
    db.query(query, [businessId], (err) => {
      if (err) {
        console.error('Error deleting business:', err);
        return res.status(500).send('Error deleting business');
      }
      res.redirect('/admin/businesses');
    });
  };
  
// Manage Customers
exports.getCustomers = (req, res) => {
  const query = `
    SELECT user_id, username, email 
    FROM Users 
    WHERE role_id = 1
  `;

  db.query(query, (err, customers) => {
    if (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).send('Error fetching customers.');
    }

    res.render('admin/customers', {
      layout: 'layouts/adminLayout',
      theme: 'admin',
      customers,
    });
  });
};

// Manage Business Categories
exports.getBusinessCategories = (req, res) => {
  const query = 'SELECT * FROM BusinessCategories';

  db.query(query, (err, categories) => {
    if (err) {
      console.error('Error fetching business categories:', err);
      return res.status(500).send('Error fetching business categories.');
    }

    res.render('admin/businessCategories', {
      layout: 'layouts/adminLayout',
      theme: 'admin',
      categories,
    });
  });
};

exports.addBusinessCategory = (req, res) => {
  const { category_name } = req.body;

  const query = 'INSERT INTO BusinessCategories (category_name) VALUES (?)';

  db.query(query, [category_name], (err) => {
    if (err) {
      console.error('Error adding business category:', err);
      return res.status(500).send('Error adding business category.');
    }

    res.redirect('/admin/business-categories');
  });
};

exports.updateBusinessCategory = (req, res) => {
  const { category_name } = req.body;
  const { id } = req.params;

  const query = `
    UPDATE BusinessCategories 
    SET category_name = ? 
    WHERE category_id = ?
  `;

  db.query(query, [category_name, id], (err) => {
    if (err) {
      console.error('Error updating business category:', err);
      return res.status(500).send('Error updating business category.');
    }

    res.redirect('/admin/business-categories');
  });
};

exports.deleteBusinessCategory = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM BusinessCategories WHERE category_id = ?';

  db.query(query, [id], (err) => {
    if (err) {
      console.error('Error deleting business category:', err);
      return res.status(500).send('Error deleting business category.');
    }

    res.redirect('/admin/business-categories');
  });
};

// Manage Product Categories
exports.getProductCategories = (req, res) => {
  const query = 'SELECT * FROM ProductCategories';

  db.query(query, (err, categories) => {
    if (err) {
      console.error('Error fetching product categories:', err);
      return res.status(500).send('Error fetching product categories.');
    }

    res.render('admin/productCategories', {
      layout: 'layouts/adminLayout',
      theme: 'admin',
      categories,
    });
  });
};

exports.addProductCategory = (req, res) => {
  const { category_name } = req.body;

  const query = 'INSERT INTO ProductCategories (category_name) VALUES (?)';

  db.query(query, [category_name], (err) => {
    if (err) {
      console.error('Error adding product category:', err);
      return res.status(500).send('Error adding product category.');
    }

    res.redirect('/admin/product-categories');
  });
};

exports.updateProductCategory = (req, res) => {
  const { category_name } = req.body;
  const { id } = req.params;

  const query = `
    UPDATE ProductCategories 
    SET category_name = ? 
    WHERE category_id = ?
  `;

  db.query(query, [category_name, id], (err) => {
    if (err) {
      console.error('Error updating product category:', err);
      return res.status(500).send('Error updating product category.');
    }

    res.redirect('/admin/product-categories');
  });
};

exports.deleteProductCategory = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM ProductCategories WHERE category_id = ?';

  db.query(query, [id], (err) => {
    if (err) {
      console.error('Error deleting product category:', err);
      return res.status(500).send('Error deleting product category.');
    }

    res.redirect('/admin/product-categories');
  });
};
