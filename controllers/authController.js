const User = require('../models/User');
const bcrypt = require('bcryptjs');
// Render Registration Page
exports.getRegister = (req, res) => {
  res.render('auth/register', { layout: 'layouts/mainLayout' });
};

// Handle Registration Form Submission
exports.register = (req, res) => {
  const { username, email, password, roleId } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  User.create(username, email, hashedPassword, roleId, (err) => {
    if (err) {
      //console.log(err);
     // console.log(req.body);
      return res.status(500).send('Registration failed');
    }
    res.redirect('/auth/login');
  });
};

// Render Login Page
exports.getLogin = (req, res) => {
  res.render('auth/login', { layout: 'layouts/mainLayout' });
};

// Handle Login Form Submission
exports.login = (req, res) => {
  const { email, password } = req.body;
console.log(email);
console.log(password);
  User.findByEmail(email, (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).render('auth/login', { layout: 'layouts/mainLayout', error: 'User not found' });
    }

    const user = results[0];

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).render('auth/login', { layout: 'layouts/mainLayout', error: 'Incorrect password' });
    }

    // Set session variables
    req.session.userId = user.user_id;
    req.session.roleId = user.role_id;

    // Redirect based on user role
    if (user.role_id === 3) {
      return res.redirect('/admin/dashboard');
    } else if (user.role_id === 2) {
      return res.redirect('/business/home');
    } else {
      //return res.redirect('/products');
      return res.redirect('/home');
    }
  });
};

// Handle Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.redirect('/auth/login');
  });
};
