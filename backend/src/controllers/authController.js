const UserModel = require('../models/userModel');
const { hashPassword, verifyPassword, generateToken } = require('../utils/authUtils');

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      const { name, email, password, phone, address, city, state, pincode } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Full name is required.'
        });
      }

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required.'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      const existingUser = await UserModel.findByEmail(email.trim());
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in instead.'
        });
      }

      const password_hash = hashPassword(password);

      const newUser = await UserModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash,
        phone: (phone || '').trim(),
        address: (address || '').trim(),
        city: (city || '').trim(),
        state: (state || '').trim(),
        pincode: (pincode || '').trim()
      });

      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to ShopEasy.',
        data: {
          user: newUser,
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Registration failed due to server error: ' + error.message
      });
    }
  }

  /**
   * Log in an existing user
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required.'
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required.'
        });
      }

      const user = await UserModel.findByEmail(email.trim());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please try again.'
        });
      }

      const isPasswordValid = verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please try again.'
        });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name
      });

      const { password_hash, ...safeUser } = user;

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully! Welcome back.',
        data: {
          user: safeUser,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Login failed due to server error: ' + error.message
      });
    }
  }

  /**
   * Get authenticated user profile
   * GET /api/auth/profile
   */
  static async getProfile(req, res) {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  }

  /**
   * Update authenticated user profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res) {
    try {
      const { name, phone, address, city, state, pincode } = req.body;
      const updatedUser = await UserModel.update(req.user.id, {
        name,
        phone,
        address,
        city,
        state,
        pincode
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updatedUser
      });
    } catch (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile: ' + error.message
      });
    }
  }

  /**
   * User logout
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
}

module.exports = AuthController;
