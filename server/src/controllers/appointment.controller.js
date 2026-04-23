const db = require('../utils/db');

/**
 * Appointment Controller
 * All queries use PostgreSQL $N parameterized placeholders.
 * Status values are lowercase to match the status_enum definition.
 */
const appointmentController = {

  /** List appointments, optionally filtered by date and/or status */
  getAppointments: async (req, res) => {
    try {
      const { date, doctor_id, patient_id, status, start_date, end_date } = req.query;
      const params = [];
      let idx = 1;

      let sql = `
        SELECT a.id, a.appointment_date, a.appointment_time,
               a.status, a.reason, a.notes, a.duration_minutes,
               a.patient_id,
               CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
               p.medical_record_number,
               a.doctor_id,
               CONCAT(s.first_name, ' ', s.last_name) AS doctor_name,
               s.role AS staff_role
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        LEFT JOIN staff s ON a.doctor_id = s.id
        WHERE 1=1
      `;

      if (date) {
        sql += ` AND a.appointment_date = $${idx++}`;
        params.push(date);
      }
      if (start_date && end_date) {
        sql += ` AND a.appointment_date BETWEEN $${idx++} AND $${idx++}`;
        params.push(start_date, end_date);
      }
      if (doctor_id) {
        sql += ` AND a.doctor_id = $${idx++}`;
        params.push(doctor_id);
      }
      if (patient_id) {
        sql += ` AND a.patient_id = $${idx++}`;
        params.push(patient_id);
      }
      if (status) {
        sql += ` AND a.status = $${idx++}`;
        params.push(status);
      }

      sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

      const appointments = await db.query(sql, params);
      res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
      console.error('Get all appointments error:', error);
      res.status(500).json({ success: false, message: 'Error fetching appointments' });
    }
  },

  /** Get a single appointment with full patient and doctor details */
  getAppointmentById: async (req, res) => {
    try {
      const { id } = req.params;

      const rows = await db.query(
        `SELECT a.*,
                CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                p.medical_record_number, p.phone AS patient_phone,
                CONCAT(s.first_name, ' ', s.last_name) AS doctor_name,
                s.role AS staff_role, s.specialization
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         LEFT JOIN staff s ON a.doctor_id = s.id
         WHERE a.id = $1`,
        [id]
      );

      if (!rows[0]) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
      console.error('Get appointment by ID error:', error);
      res.status(500).json({ success: false, message: 'Error fetching appointment details' });
    }
  },

  /** Schedule a new appointment */
  createAppointment: async (req, res) => {
    try {
      const {
        patient_id, doctor_id,
        appointment_date, appointment_time,
        reason, notes
      } = req.body;

      // Verify patient exists and is not archived
      const patientRows = await db.query(
        'SELECT id FROM patients WHERE id = $1 AND is_archived = FALSE',
        [patient_id]
      );
      if (!patientRows[0]) {
        return res.status(404).json({ success: false, message: 'Patient not found or is archived' });
      }

      // doctor_id is optional — appointments can exist without a doctor assigned
      if (doctor_id) {
        const doctorRows = await db.query(
          'SELECT id FROM staff WHERE id = $1 AND is_active = TRUE',
          [doctor_id]
        );
        if (!doctorRows[0]) {
          return res.status(404).json({ success: false, message: 'Doctor not found or is inactive' });
        }

        // Check for scheduling conflicts for this doctor
        const conflicts = await db.query(
          `SELECT id FROM appointments
           WHERE doctor_id = $1
             AND appointment_date = $2
             AND appointment_time = $3
             AND status NOT IN ('cancelled')`,
          [doctor_id, appointment_date, appointment_time]
        );
        if (conflicts.length > 0) {
          return res.status(409).json({ success: false, message: 'Time slot already booked for this doctor' });
        }
      }

      const result = await db.insert(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
         VALUES ($1, $2, $3, $4, $5, 'scheduled', $6)
         RETURNING id`,
        [patient_id, doctor_id || null, appointment_date, appointment_time, reason || null, notes || null]
      );

      const rows = await db.query(
        `SELECT a.*,
                CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                CONCAT(s.first_name, ' ', s.last_name) AS doctor_name
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         LEFT JOIN staff s ON a.doctor_id = s.id
         WHERE a.id = $1`,
        [result.insertId]
      );

      res.status(201).json({ success: true, message: 'Appointment scheduled successfully', data: rows[0] });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ success: false, message: 'Error creating appointment' });
    }
  },

  /** Update appointment date, time, reason, or notes */
  updateAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { appointment_date, appointment_time, reason, notes, status } = req.body;

      const existing = await db.query('SELECT id, status FROM appointments WHERE id = $1', [id]);
      if (!existing[0]) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      if (existing[0].status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Cannot update a cancelled appointment' });
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

      addField('appointment_date', appointment_date);
      addField('appointment_time', appointment_time);
      addField('reason', reason);
      addField('notes', notes);
      addField('status', status);

      if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      fields.push(`updated_at = NOW()`);
      vals.push(id);

      await db.query(`UPDATE appointments SET ${fields.join(', ')} WHERE id = $${idx}`, vals);

      const rows = await db.query(
        `SELECT a.*,
                CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                CONCAT(s.first_name, ' ', s.last_name) AS doctor_name
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         LEFT JOIN staff s ON a.doctor_id = s.id
         WHERE a.id = $1`,
        [id]
      );

      res.status(200).json({ success: true, message: 'Appointment updated successfully', data: rows[0] });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ success: false, message: 'Error updating appointment' });
    }
  },

  /** Quick status-only update, with optional cancellation reason */
  updateAppointmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, cancellation_reason } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const existing = await db.query('SELECT id FROM appointments WHERE id = $1', [id]);
      if (!existing[0]) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      await db.query(
        'UPDATE appointments SET status = $1, cancellation_reason = $2, updated_at = NOW() WHERE id = $3',
        [status, cancellation_reason || null, id]
      );

      res.status(200).json({ success: true, message: `Appointment status updated to ${status}` });
    } catch (error) {
      console.error('Update appointment status error:', error);
      res.status(500).json({ success: false, message: 'Error updating appointment status' });
    }
  },

  /** Permanently delete a scheduled or cancelled appointment */
  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;

      const existing = await db.query('SELECT id, status FROM appointments WHERE id = $1', [id]);
      if (!existing[0]) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      if (['completed', 'no-show'].includes(existing[0].status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete a ${existing[0].status} appointment`
        });
      }

      await db.query('DELETE FROM appointments WHERE id = $1', [id]);
      res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({ success: false, message: 'Error deleting appointment' });
    }
  }
};

module.exports = appointmentController;
