const { verifyToken } = require('../utils/authUtils');
const UserModel = require('../models/userModel');

/**
 * Middleware to require JWT authentication
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    const user = await UserModel.findById(payload.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error: ' + err.message
    });
  }
}

module.exports = { requireAuth };
