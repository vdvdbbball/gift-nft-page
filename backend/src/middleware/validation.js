const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 255 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price_uah').isFloat({ min: 0 }).withMessage('Price in UAH must be a positive number'),
  body('price_ton').isFloat({ min: 0 }).withMessage('Price in TON must be a positive number'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  validateRequest
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 }),
  body('description').trim().optional(),
  validateRequest
];

module.exports = {
  validateRequest,
  productValidation,
  loginValidation,
  categoryValidation
};
