const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const authValidators = {
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    handleValidationErrors
  ],
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('first_name')
      .trim()
      .notEmpty()
      .withMessage('First name is required'),
    body('last_name')
      .trim()
      .notEmpty()
      .withMessage('Last name is required'),
    body('role')
      .isIn(['Admin', 'Doctor', 'Nurse', 'Receptionist'])
      .withMessage('Invalid role'),
    handleValidationErrors
  ]
};

const patientValidators = {
  create: [
    body('medical_record_number')
      .trim()
      .notEmpty()
      .withMessage('Medical record number is required'),
    body('first_name')
      .trim()
      .notEmpty()
      .withMessage('First name is required'),
    body('last_name')
      .trim()
      .notEmpty()
      .withMessage('Last name is required'),
    body('date_of_birth')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('gender')
      .isIn(['Male', 'Female', 'Other'])
      .withMessage('Invalid gender'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Invalid phone number'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    handleValidationErrors
  ],
  update: [
    body('first_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('last_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty'),
    body('date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('gender')
      .optional()
      .isIn(['Male', 'Female', 'Other'])
      .withMessage('Invalid gender'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Invalid phone number'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    handleValidationErrors
  ]
};

const appointmentValidators = {
  create: [
    body('patient_id')
      .isInt()
      .withMessage('Invalid patient ID'),
    body('doctor_id')
      .isInt()
      .withMessage('Invalid doctor ID'),
    body('appointment_date')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('appointment_time')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format (HH:MM)'),
    body('notes')
      .optional()
      .trim(),
    handleValidationErrors
  ],
  updateStatus: [
    body('status')
      .isIn(['Scheduled', 'Completed', 'Cancelled', 'No-show'])
      .withMessage('Invalid status'),
    handleValidationErrors
  ]
};

const staffValidators = {
  create: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('first_name')
      .trim()
      .notEmpty()
      .withMessage('First name is required'),
    body('last_name')
      .trim()
      .notEmpty()
      .withMessage('Last name is required'),
    body('role')
      .isIn(['Admin', 'Doctor', 'Nurse', 'Receptionist'])
      .withMessage('Invalid role'),
    handleValidationErrors
  ],
  update: [
    body('first_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),
    body('last_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty'),
    body('role')
      .optional()
      .isIn(['Admin', 'Doctor', 'Nurse', 'Receptionist'])
      .withMessage('Invalid role'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  authValidators,
  patientValidators,
  appointmentValidators,
  staffValidators
};
