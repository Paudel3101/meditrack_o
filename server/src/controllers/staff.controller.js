const bcrypt = require('bcrypt');
const db = require('../utils/db');

/** Get all staff, optionally filtered by role or is_active */
const getStaff = async (req, res) => {
  try {
    const { role, is_active } = req.query;
    const params = [];
    let idx = 1;

    let query = `SELECT id, email, first_name, last_name, role, phone,
                        is_active, created_at, updated_at
                 FROM staff WHERE 1=1`;

    if (role) {
      query += ` AND role = $${idx++}`;
      params.push(role);
    }
    if (is_active !== undefined) {
      query += ` AND is_active = $${idx++}`;
      params.push(is_active === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const staff = await db.query(query, params);
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching staff' });
  }
};

/** Get a single staff member by ID */
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await db.queryOne(
      `SELECT id, email, first_name, last_name, role, phone,
              specialization, is_active, created_at, updated_at
       FROM staff WHERE id = $1`,
      [id]
    );

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching staff' });
  }
};

/** Create a new staff member (Admin only) */
const createStaff = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, phone } = req.body;

    const existing = await db.queryOne('SELECT id FROM staff WHERE email = $1', [email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.insert(
      `INSERT INTO staff (email, password_hash, first_name, last_name, role, phone, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
       RETURNING id`,
      [email, hashedPassword, first_name, last_name, role, phone || null]
    );

    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: { id: result.insertId, email, first_name, last_name, role }
    });
  } catch (error) {
    console.error('Create staff error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    res.status(500).json({ success: false, message: 'Server error creating staff' });
  }
};

/** Update staff fields (Admin only) */
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, role, specialization } = req.body;

    const existing = await db.queryOne('SELECT id FROM staff WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const updates = [];
    const params = [];
    let idx = 1;

    const addField = (col, val) => {
      if (val !== undefined) { updates.push(`${col} = $${idx++}`); params.push(val); }
    };
    addField('first_name', first_name);
    addField('last_name', last_name);
    addField('phone', phone);
    addField('role', role);
    addField('specialization', specialization);

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    await db.update(`UPDATE staff SET ${updates.join(', ')} WHERE id = $${idx}`, params);
    res.status(200).json({ success: true, message: 'Staff updated successfully' });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Server error updating staff' });
  }
};

/** Soft-deactivate a staff member (Admin only) */
const deactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.queryOne('SELECT id FROM staff WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    await db.update('UPDATE staff SET is_active = FALSE, updated_at = NOW() WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Staff deactivated successfully' });
  } catch (error) {
    console.error('Deactivate staff error:', error);
    res.status(500).json({ success: false, message: 'Server error deactivating staff' });
  }
};

/** Re-activate a deactivated staff member (Admin only) */
const reactivateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.queryOne('SELECT id FROM staff WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    await db.update('UPDATE staff SET is_active = TRUE, updated_at = NOW() WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Staff reactivated successfully' });
  } catch (error) {
    console.error('Reactivate staff error:', error);
    res.status(500).json({ success: false, message: 'Server error reactivating staff' });
  }
};

module.exports = { getStaff, getStaffById, createStaff, updateStaff, deactivateStaff, reactivateStaff };
