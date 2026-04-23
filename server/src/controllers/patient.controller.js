const db = require('../utils/db');

/**
 * Patient Controller
 * All queries use PostgreSQL $N parameterized placeholders.
 * Frontend sends blood_group; the column is also named blood_group
 * (renamed from blood_type in the schema update).
 */
const patientController = {

  /** List all (non-archived) patients, with optional search */
  getPatients: async (req, res) => {
    try {
      const { search, is_archived, gender } = req.query;
      const params = [];
      let idx = 1;

      let sql = `
        SELECT id, medical_record_number, first_name, last_name,
               date_of_birth, gender, phone, email,
               allergies, blood_group, is_archived, created_at
        FROM patients
        WHERE 1=1
      `;

      if (is_archived !== undefined) {
        sql += ` AND is_archived = $${idx++}`;
        params.push(is_archived === 'true');
      } else {
        sql += ' AND is_archived = FALSE';
      }

      if (gender) {
        sql += ` AND gender = $${idx++}`;
        params.push(gender);
      }

      if (search) {
        const term = `%${search}%`;
        sql += ` AND (first_name ILIKE $${idx} OR last_name ILIKE $${idx + 1}
                 OR medical_record_number ILIKE $${idx + 2} OR phone ILIKE $${idx + 3})`;
        idx += 4;
        params.push(term, term, term, term);
      }

      sql += ' ORDER BY created_at DESC';

      const patients = await db.query(sql, params);
      res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (error) {
      console.error('Get all patients error:', error);
      res.status(500).json({ success: false, message: 'Error fetching patients' });
    }
  },

  /** Get a single patient by primary key */
  getPatientById: async (req, res) => {
    try {
      const { id } = req.params;

      const patients = await db.query(
        `SELECT id, medical_record_number, first_name, last_name,
                date_of_birth, gender, phone, email, address,
                allergies, blood_group, medical_notes, is_archived, created_at
         FROM patients WHERE id = $1`,
        [id]
      );

      const patient = patients[0];
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      res.status(200).json({ success: true, data: patient });
    } catch (error) {
      console.error('Get patient by ID error:', error);
      res.status(500).json({ success: false, message: 'Error fetching patient details' });
    }
  },

  /** Create a new patient record — auto-generates MRN if not provided */
  createPatient: async (req, res) => {
    try {
      const {
        first_name, last_name, date_of_birth, gender,
        phone, email, address, allergies,
        blood_group, medical_notes
      } = req.body;

      // Auto-generate a unique MRN (timestamp-based)
      const mrn = `MRN-${Date.now()}`;

      const result = await db.insert(
        `INSERT INTO patients (
          medical_record_number, first_name, last_name,
          date_of_birth, gender, phone, email, address,
          allergies, blood_group, medical_notes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING id`,
        [
          mrn, first_name, last_name,
          date_of_birth, gender, phone || null, email || null, address || null,
          allergies || null, blood_group || null, medical_notes || null
        ]
      );

      const rows = await db.query(
        `SELECT id, medical_record_number, first_name, last_name,
                date_of_birth, gender, phone, email, address,
                allergies, blood_group, medical_notes, is_archived
         FROM patients WHERE id = $1`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: rows[0]
      });
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({ success: false, message: 'Error creating patient' });
    }
  },

  /** Update one or more patient fields */
  updatePatient: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        first_name, last_name, date_of_birth, gender,
        phone, email, address, city, state, zip_code,
        allergies, blood_group, medical_notes,
        emergency_contact_name, emergency_contact_phone
      } = req.body;

      const existing = await db.query('SELECT id FROM patients WHERE id = $1', [id]);
      if (!existing[0]) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const fields = [];
      const vals = [];
      let idx = 1;

      const addField = (col, val) => {
        if (val !== undefined) {
          fields.push(`${col} = $${idx++}`);
          vals.push(val);
        }
      };

      addField('first_name', first_name);
      addField('last_name', last_name);
      addField('date_of_birth', date_of_birth);
      addField('gender', gender);
      addField('phone', phone);
      addField('email', email);
      addField('address', address);
      addField('city', city);
      addField('state', state);
      addField('zip_code', zip_code);
      addField('allergies', allergies);
      addField('blood_group', blood_group);
      addField('medical_notes', medical_notes);
      addField('emergency_contact_name', emergency_contact_name);
      addField('emergency_contact_phone', emergency_contact_phone);

      if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      fields.push(`updated_at = NOW()`);
      vals.push(id);

      await db.query(
        `UPDATE patients SET ${fields.join(', ')} WHERE id = $${idx}`,
        vals
      );

      const rows = await db.query(
        `SELECT id, medical_record_number, first_name, last_name,
                date_of_birth, gender, phone, email, address,
                allergies, blood_group, medical_notes, is_archived
         FROM patients WHERE id = $1`,
        [id]
      );

      res.status(200).json({ success: true, message: 'Patient updated successfully', data: rows[0] });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({ success: false, message: 'Error updating patient' });
    }
  },

  /** Soft-delete: mark patient as archived (preserves history) */
  archivePatient: async (req, res) => {
    try {
      const { id } = req.params;

      const rows = await db.query('SELECT id, is_archived FROM patients WHERE id = $1', [id]);
      if (!rows[0]) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      if (rows[0].is_archived) {
        return res.status(400).json({ success: false, message: 'Patient is already archived' });
      }

      await db.query('UPDATE patients SET is_archived = TRUE, updated_at = NOW() WHERE id = $1', [id]);
      res.status(200).json({ success: true, message: 'Patient archived successfully' });
    } catch (error) {
      console.error('Archive patient error:', error);
      res.status(500).json({ success: false, message: 'Error archiving patient' });
    }
  },

  /** Restore an archived patient to active status */
  unarchivePatient: async (req, res) => {
    try {
      const { id } = req.params;

      const rows = await db.query('SELECT id, is_archived FROM patients WHERE id = $1', [id]);
      if (!rows[0]) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      if (!rows[0].is_archived) {
        return res.status(400).json({ success: false, message: 'Patient is not archived' });
      }

      await db.query('UPDATE patients SET is_archived = FALSE, updated_at = NOW() WHERE id = $1', [id]);
      res.status(200).json({ success: true, message: 'Patient unarchived successfully' });
    } catch (error) {
      console.error('Unarchive patient error:', error);
      res.status(500).json({ success: false, message: 'Error unarchiving patient' });
    }
  },

  /** Full-text search across name, MRN, and phone */
  searchPatients: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }

      const term = `%${q}%`;
      const patients = await db.query(
        `SELECT id, medical_record_number, first_name, last_name,
                date_of_birth, gender, phone, email, blood_group, is_archived
         FROM patients
         WHERE is_archived = FALSE
           AND (first_name ILIKE $1 OR last_name ILIKE $2
                OR medical_record_number ILIKE $3 OR phone ILIKE $4)
         ORDER BY last_name, first_name
         LIMIT 30`,
        [term, term, term, term]
      );

      res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (error) {
      console.error('Search patients error:', error);
      res.status(500).json({ success: false, message: 'Error searching patients' });
    }
  }
};

module.exports = patientController;
