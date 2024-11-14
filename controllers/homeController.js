const Product = require('../models/Product');

exports.getHomePage = (req, res) => {
  // Fetch featured, new arrivals, and best sellers
  Product.getFeatured((err, featured) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching featured products');
    }

    Product.getNewArrivals((err, newArrivals) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching new arrivals');
      }

      Product.getBestSellers((err, bestSellers) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error fetching best sellers');
        }

        // Render the home page with the fetched products
        res.render('home', {
          layout: 'layouts/mainLayout',
          theme: 'user',
          featured,
          newArrivals,
          bestSellers
        });
      });
    });
  });
};
