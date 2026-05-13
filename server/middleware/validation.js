import { body, validationResult } from 'express-validator';

// Middleware para verificar erros de validação
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validações para registro
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Confirmação de senha é obrigatória')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('As senhas não coincidem')
];

// Validações para login
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
];

// Validações para atualização de perfil
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
];

// Validações para mudança de senha
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Senha atual é obrigatória'),
  
  body('newPassword')
    .notEmpty().withMessage('Nova senha é obrigatória')
    .isLength({ min: 8 }).withMessage('Nova senha deve ter no mínimo 8 caracteres'),
  
  body('confirmNewPassword')
    .notEmpty().withMessage('Confirmação de nova senha é obrigatória')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('As senhas não coincidem')
];

// Validações para esqueceu senha
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
];

// Validações para redefinir senha
export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Token é obrigatório'),
  
  body('password')
    .notEmpty().withMessage('Nova senha é obrigatória')
    .isLength({ min: 8 }).withMessage('Nova senha deve ter no mínimo 8 caracteres'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Confirmação de senha é obrigatória')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('As senhas não coincidem')
];
