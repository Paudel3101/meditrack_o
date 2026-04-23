const jwt = require('jsonwebtoken');
const db = require('../utils/db');

const authMiddleware = {
  verifyToken: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  },

  isAdmin: (req, res, next) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    next();
  },

  isStaff: (req, res, next) => {
    const allowedRoles = ['Doctor', 'Nurse', 'Admin', 'Receptionist'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Staff privileges required.' });
    }
    next();
  },

  checkRole: (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
      }
      next();
    };
  },

  // Validates user still exists and is active — enables immediate logout effect
  checkSession: async (req, res, next) => {
    try {
      const rows = await db.query('SELECT is_active FROM staff WHERE id = $1', [req.user.id]);
      const user = rows[0];

      if (!user || !user.is_active) {
        return res.status(401).json({ success: false, message: 'Session expired or user deactivated.' });
      }

      next();
    } catch (error) {
      console.error('Session check error:', error);
      next(error);
    }
  }
};

module.exports = authMiddleware;
