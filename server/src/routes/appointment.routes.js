const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { appointmentValidators } = require('../middleware/validate.middleware');

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkSession);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get all appointments
 *     description: Retrieve a list of appointments (accessible by all staff)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by appointment date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled, no-show]
 *         description: Filter by appointment status
 *     responses:
 *       200:
 *         description: List of appointments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware.isStaff, appointmentController.getAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Get appointment by ID
 *     description: Retrieve a specific appointment's details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware.isStaff, appointmentController.getAppointmentById);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags:
 *       - Appointments
 *     summary: Create new appointment
 *     description: Schedule a new appointment (Admin, Doctor, or Receptionist only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 appointmentId:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/',
  authMiddleware.checkRole(['Admin', 'Doctor', 'Receptionist']),
  appointmentValidators.create,
  appointmentController.createAppointment
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     tags:
 *       - Appointments
 *     summary: Update appointment
 *     description: Update appointment details (Admin, Doctor, or Receptionist only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put('/:id',
  authMiddleware.checkRole(['Admin', 'Doctor', 'Receptionist']),
  appointmentController.updateAppointment
);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   put:
 *     tags:
 *       - Appointments
 *     summary: Update appointment status
 *     description: Change the status of an appointment (Doctor, Nurse, or Receptionist)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, no-show]
 *               cancellation_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status',
  authMiddleware.checkRole(['Admin', 'Doctor', 'Nurse', 'Receptionist']),
  appointmentValidators.updateStatus,
  appointmentController.updateAppointmentStatus
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     tags:
 *       - Appointments
 *     summary: Delete appointment
 *     description: Remove an appointment record (Admin or Receptionist only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.delete('/:id',
  authMiddleware.checkRole(['Admin', 'Receptionist']),
  appointmentController.deleteAppointment
);

module.exports = router;
