const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    // req.user must be populated by the authMiddleware before calling this
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied - Insufficient privileges' });
    }
    next();
  };
};

module.exports = roleAuth;
