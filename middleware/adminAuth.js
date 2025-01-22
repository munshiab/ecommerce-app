/* module.exports = (req, res, next) => {
    // Check if the user is logged in and is an admin
    if (req.session.userId && req.session.isAdmin) {
      return next(); // Allow access to the admin route
    }
    // Redirect to login if not authenticated as an admin
    res.redirect('/auth/login');
  }; */
  
  module.exports = (req, res, next) => {
    if (req.session.userId && req.session.roleId === 3) {
      return next(); // Allow access to the admin route
    }
    res.redirect('/auth/login'); // Redirect to login if not authenticated as an admin
  };
  