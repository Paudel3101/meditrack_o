const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { staffValidators } = require('../middleware/validate.middleware');

router.use(authMiddleware.verifyToken);

/**
 * @swagger
 * /api/staff:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get all staff members
 *     description: Retrieve a list of all staff members (Admin or Receptionist only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff members retrieved
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
 *                     $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.get(
  '/',
  authMiddleware.checkRole(['Admin', 'Receptionist']),
  staffController.getStaff
);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get staff member by ID
 *     description: Retrieve a specific staff member's details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  authMiddleware.checkRole(['Admin', 'Receptionist']),
  staffController.getStaffById
);

/**
 * @swagger
 * /api/staff:
 *   post:
 *     tags:
 *       - Staff
 *     summary: Create new staff member
 *     description: Register a new staff member (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 staffId:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authMiddleware.isAdmin,
  staffValidators.create,
  staffController.createStaff
);

/**
 * @swagger
 * /api/staff/{id}:
 *   put:
 *     tags:
 *       - Staff
 *     summary: Update staff member
 *     description: Update staff member information (Admin only)
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
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authMiddleware.isAdmin,
  staffValidators.update,
  staffController.updateStaff
);

/**
 * @swagger
 * /api/staff/{id}/deactivate:
 *   put:
 *     tags:
 *       - Staff
 *     summary: Deactivate staff member
 *     description: Mark a staff member as inactive (Admin only)
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
 *         description: Staff deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id/deactivate',
  authMiddleware.isAdmin,
  staffController.deactivateStaff
);

/**
 * @swagger
 * /api/staff/{id}/reactivate:
 *   put:
 *     tags:
 *       - Staff
 *     summary: Reactivate staff member
 *     description: Mark a staff member as active again (Admin only)
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
 *         description: Staff reactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id/reactivate',
  authMiddleware.isAdmin,
  staffController.reactivateStaff
);

module.exports = router;
