const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post(
  '/register',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username required')
      .isLength({ min: 3, max: 50 }),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email required')
      .isEmail()
      .withMessage('Invalid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password required')
      .isLength({ min: 8 })
      .withMessage('at least 8 characters'),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password required'),
  ],
  authController.login
);

router.get('/me', authMiddleware, authController.getMe);

module.exports = router;