const db = require('../utils/db');

const dashboardController = {
  getStats: async (req, res) => {
    try {
      const patientCountResult = await db.query(
        'SELECT COUNT(*) as count FROM patients WHERE is_archived = FALSE'
      );
      const staffCountResult = await db.query(
        'SELECT COUNT(*) as count FROM staff WHERE is_active = TRUE'
      );
      const todayAppointmentsResult = await db.query(`
        SELECT COUNT(*) as count
        FROM appointments
        WHERE appointment_date = CURRENT_DATE
        AND status != 'cancelled'
      `);
      const totalAppointmentsResult = await db.query(
        'SELECT COUNT(*) as count FROM appointments'
      );

      res.status(200).json({
        success: true,
        data: {
          total_patients: parseInt(patientCountResult[0].count, 10),
          total_staff: parseInt(staffCountResult[0].count, 10),
          appointments_today: parseInt(todayAppointmentsResult[0].count, 10),
          total_appointments: parseInt(totalAppointmentsResult[0].count, 10),
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getRecentAppointments: async (req, res) => {
    try {
      const appointments = await db.query(`
        SELECT
          a.id, a.appointment_date, a.appointment_time, a.status, a.notes, a.reason,
          a.patient_id,
          CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
          p.medical_record_number,
          a.doctor_id,
          CONCAT(s.first_name, ' ', s.last_name) AS doctor_name,
          s.role AS staff_role
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        LEFT JOIN staff s ON a.doctor_id = s.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 10
      `);

      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      console.error('Get recent appointments error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getPatientCount: async (req, res) => {
    try {
      const totalResult = await db.query(
        'SELECT COUNT(*) as count FROM patients WHERE is_archived = FALSE'
      );
      const archivedResult = await db.query(
        'SELECT COUNT(*) as count FROM patients WHERE is_archived = TRUE'
      );

      const active = parseInt(totalResult[0].count, 10);
      const archived = parseInt(archivedResult[0].count, 10);

      res.status(200).json({
        success: true,
        data: { active, archived, total: active + archived }
      });
    } catch (error) {
      console.error('Get patient count error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = dashboardController;
