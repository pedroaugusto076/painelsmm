import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  validate
} from '../middleware/validation.js';

const router = express.Router();

// Rotas públicas
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

// Rotas protegidas (requerem autenticação)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, validate, updateProfile);
router.post('/change-password', authenticateToken, changePasswordValidation, validate, changePassword);
router.get('/verify', authenticateToken, verifyToken);

export default router;
