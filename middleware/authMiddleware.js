// middleware/authMiddleware.js
module.exports = (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/auth/login'); // Redirect to login page if not authenticated
    }
    next();
  };
  