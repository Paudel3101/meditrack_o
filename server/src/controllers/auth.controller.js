const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const { validateEmail, validatePassword } = require('../utils/validators');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const staff = await db.queryOne(
      'SELECT * FROM staff WHERE email = $1 AND is_active = true',
      [email]
    );

    if (!staff) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: staff.id, email: staff.email, role: staff.role, first_name: staff.first_name, last_name: staff.last_name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

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
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, phone } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, number, and special character'
      });
    }

    const existingStaff = await db.queryOne('SELECT id FROM staff WHERE email = $1', [email]);
    if (existingStaff) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.insert(
      `INSERT INTO staff (email, password_hash, first_name, last_name, role, phone, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING id`,
      [email, hashedPassword, first_name, last_name, role, phone || null]
    );

    res.status(201).json({
      success: true,
      message: 'Staff registered successfully',
      data: { id: result.insertId, email, first_name, last_name, role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

const getProfile = async (req, res) => {
  try {
    const staff = await db.queryOne(
      'SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM staff WHERE id = $1',
      [req.user.id]
    );

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const staff = await db.queryOne('SELECT password_hash FROM staff WHERE id = $1', [req.user.id]);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, staff.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters with uppercase, number, and special character'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update('UPDATE staff SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

module.exports = { login, register, getProfile, updatePassword, logout };
