module.exports = (req, res, next) => {
    // Check if the user is logged in and is an admin
    if (req.session.userId && req.session.isAdmin) {
      return next(); // Allow access to the admin route
    }
    // Redirect to login if not authenticated as an admin
    res.redirect('/auth/login');
  };
  