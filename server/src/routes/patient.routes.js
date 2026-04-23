const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { patientValidators } = require('../middleware/validate.middleware');

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkSession);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Get all patients
 *     description: Retrieve a list of all patients (accessible by all staff)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, medical record number, or phone
 *       - in: query
 *         name: is_archived
 *         schema:
 *           type: boolean
 *         description: Filter by archive status
 *     responses:
 *       200:
 *         description: List of patients retrieved
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
 *                     $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware.isStaff, patientController.getPatients);

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Search patients
 *     description: Search for patients by name, MRN, phone, or email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
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
 *                     $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/search', authMiddleware.isStaff, patientController.searchPatients);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Get patient by ID
 *     description: Retrieve a specific patient's details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware.isStaff, patientController.getPatientById);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     tags:
 *       - Patients
 *     summary: Create new patient
 *     description: Create a new patient record (Admin, Doctor, or Receptionist only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 patientId:
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
  patientValidators.create,
  patientController.createPatient
);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     tags:
 *       - Patients
 *     summary: Update patient
 *     description: Update patient information (Admin, Doctor, or Receptionist only)
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
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.put('/:id',
  authMiddleware.checkRole(['Admin', 'Doctor', 'Receptionist']),
  patientValidators.update,
  patientController.updatePatient
);

/**
 * @swagger
 * /api/patients/{id}/archive:
 *   put:
 *     tags:
 *       - Patients
 *     summary: Archive patient
 *     description: Archive a patient record (Admin only)
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
 *         description: Patient archived successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.put('/:id/archive',
  authMiddleware.checkRole(['Admin']),
  patientController.archivePatient
);

/**
 * @swagger
 * /api/patients/{id}/unarchive:
 *   put:
 *     tags:
 *       - Patients
 *     summary: Unarchive patient
 *     description: Restore an archived patient record (Admin only)
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
 *         description: Patient restored successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.put('/:id/unarchive',
  authMiddleware.checkRole(['Admin']),
  patientController.unarchivePatient
);

module.exports = router;
