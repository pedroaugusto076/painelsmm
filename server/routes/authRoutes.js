import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  validate
} from '../middleware/validation.js';

const router = express.Router();

// Rotas públicas
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Rotas protegidas (requerem autenticação)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, validate, updateProfile);
router.post('/change-password', authenticateToken, changePasswordValidation, validate, changePassword);
router.get('/verify', authenticateToken, verifyToken);

export default router;
