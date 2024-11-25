const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const productRoutes = require('./routes/productRoutes');
require('dotenv').config();

const app = express();

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure session management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Set up EJS as the view engine and configure layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to pass theme data based on user roles
app.use((req, res, next) => {
  res.locals.theme = req.session.roleId === 3 ? 'admin' : 'user';
  next();
});

// Authentication routes
app.use('/auth', authRoutes);
app.use('/home', homeRoutes);
app.use('/product',productRoutes);
// Home route for regular users
app.get('/', (req, res) => {
  res.render('index', { layout: 'layouts/mainLayout', theme: 'user' });
});

// Admin dashboard route
app.get('/admin/dashboard', (req, res) => {
  if (req.session.roleId !== 3) return res.status(403).send('Access Denied');
  res.render('admin/dashboard', { layout: 'layouts/adminLayout', theme: 'admin' });
});

// Business owner dashboard route
app.get('/business/home', (req, res) => {
  if (req.session.roleId !== 2) return res.status(403).send('Access Denied');
  res.render('business/home', { layout: 'layouts/adminLayout', theme: 'admin' });
});

// Products page for customers
app.get('/products', (req, res) => {
  res.render('products/list', { layout: 'layouts/mainLayout', theme: 'user' });
});

// Logout route
app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.redirect('/auth/login');
  });
});
const businessRoutes = require('./routes/businessRoutes');
app.use('/business', businessRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
