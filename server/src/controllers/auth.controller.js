/**
 * Authentication Controller
 * 
 * Handles all authentication-related operations including:
 * - User login and registration
 * - JWT token generation and validation
 * - Password hashing using bcrypt
 * - Profile management and password updates
 * 
 * Security Features:
 * - Passwords are never stored or returned in plain text
 * - Uses bcrypt with salt rounds for secure password hashing
 * - JWT tokens have configurable expiration times
 * - All passwords are compared using bcrypt.compare() to prevent timing attacks
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const { validateEmail, validatePassword } = require('../utils/validators');

/**
 * Staff member login
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.email - Staff email address
 * @param {string} req.body.password - Staff password (plain text)
 * @returns {Object} JWT token and staff information
 * @throws {400} Invalid email format
 * @throws {401} Invalid email or password
 * @throws {500} Server error during login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format to prevent malformed requests
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Query database for active staff member with matching email
    // Using parameterized query to prevent SQL injection
    const query = 'SELECT * FROM staff WHERE email = $1 AND is_active = true';
    const staff = await db.queryOne(query, [email]);

    // Return generic error message to prevent user enumeration attacks
    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Use bcrypt.compare() for secure password verification
    // This prevents timing attacks by using constant-time comparison
    const isPasswordValid = await bcrypt.compare(password, staff.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token with staff information as payload
    // Token includes only non-sensitive information (id, email, role)
    // Password and other sensitive fields are never included in token
    const token = jwt.sign(
      {
        id: staff.id,
        email: staff.email,
        role: staff.role,
        first_name: staff.first_name,
        last_name: staff.last_name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Return successful login response with token
    // Always exclude password_hash from response data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        staff: {
          id: staff.id,
          email: staff.email,
          first_name: staff.first_name,
          last_name: staff.last_name,
          role: staff.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * Register new staff member
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.email - Staff email address (must be unique)
 * @param {string} req.body.password - Staff password (min 8 chars, must include uppercase, number, special char)
 * @param {string} req.body.first_name - Staff first name
 * @param {string} req.body.last_name - Staff last name
 * @param {string} req.body.role - Staff role (Admin, Doctor, Nurse, Receptionist)
 * @returns {Object} Created staff member information
 * @throws {400} Invalid input or validation error
 * @throws {409} Email already registered
 * @throws {500} Server error during registration
 */
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Enforce strong password requirements
    // Requires: minimum 8 characters, uppercase letter, number, special character
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, number, and special character'
      });
    }

    // Check if email already registered to prevent duplicate accounts
    const checkQuery = 'SELECT id FROM staff WHERE email = $1';
    const existingStaff = await db.queryOne(checkQuery, [email]);

    if (existingStaff) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password using bcrypt with 10 salt rounds
    // This provides secure password storage and is computationally expensive
    // to prevent brute force attacks
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new staff member with hashed password
    const insertQuery = `
      INSERT INTO staff (email, password_hash, first_name, last_name, role, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, true, NOW())
    `;

    const result = await db.insert(insertQuery, [
      email,
      hashedPassword,
      first_name,
      last_name,
      role
    ]);

    // Return successful registration with new staff ID
    // Return 201 Created status code as per REST conventions
    res.status(201).json({
      success: true,
      message: 'Staff registered successfully',
      data: {
        id: result.insertId,
        email,
        first_name,
        last_name,
        role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * Get current authenticated user profile
 * 
 * @param {Object} req - Express request object with authenticated user info
 * @param {Object} req.user - Authenticated user from JWT token
 * @returns {Object} Current user profile information
 * @throws {401} Unauthorized - invalid or missing token
 * @throws {404} User profile not found
 * @throws {500} Server error fetching profile
 */
const getProfile = async (req, res) => {
  try {
    // Extract user ID from JWT token payload (set by auth middleware)
    const staffId = req.user.id;

    // Query database for user information
    // Only select non-sensitive fields (password excluded)
    const query = `
      SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at
      FROM staff
      WHERE id = $1
    `;

    const staff = await db.queryOne(query, [staffId]);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

/**
 * Update authenticated user password
 * 
 * @param {Object} req - Express request object with authenticated user info
 * @param {string} req.body.currentPassword - Current password for verification
 * @param {string} req.body.newPassword - New password (must meet strength requirements)
 * @returns {Object} Success message
 * @throws {400} Invalid password or validation error
 * @throws {401} Unauthorized - incorrect current password
 * @throws {404} User not found
 * @throws {500} Server error updating password
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const staffId = req.user.id;

    // Retrieve current password hash from database
    const query = 'SELECT password_hash FROM staff WHERE id = $1';
    const staff = await db.queryOne(query, [staffId]);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Verify current password using bcrypt comparison
    // This ensures user can only change password if they know current password
    const isPasswordValid = await bcrypt.compare(currentPassword, staff.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password meets strength requirements
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters with uppercase, number, and special character'
      });
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const updateQuery = 'UPDATE staff SET password_hash = $1 WHERE id = $2';
    await db.update(updateQuery, [hashedPassword, staffId]);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating password'
    });
  }
};

/**
 * Logout authenticated user
 * 
 * Note: Logout in JWT-based systems typically involves client-side token removal
 * For this implementation, the endpoint returns success response
 * In production, consider implementing token blacklisting for immediate invalidation
 * 
 * @param {Object} req - Express request object with authenticated user info
 * @returns {Object} Logout success message
 * @throws {401} Unauthorized - invalid or missing token
 * @throws {500} Server error during logout
 */
const logout = async (req, res) => {
  try {
    // In a JWT-based system, logout is primarily handled on the client
    // The client removes the token from local storage/cookies
    // For enhanced security, consider implementing token blacklisting:
    // - Maintain a blacklist of revoked tokens
    // - Check token against blacklist in auth middleware
    // - Set cache expiration to match token expiration time
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updatePassword,
  logout
};
