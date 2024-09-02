const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const { body, validationResult, param } = require('express-validator'); // Importa 'param'

const productManager = new ProductManager();

// Reglas de validación para el POST /api/products
const productValidationRules = [
  body('title').notEmpty().withMessage('El título es obligatorio'),
  body('description').notEmpty().withMessage('La descripción es obligatoria'),
  body('code').notEmpty().withMessage('El código es obligatorio').custom(async (value) => {
    const existingProduct = await ProductManager.findOne({ code: value });
    if (existingProduct) {
      throw new Error('Ya existe un producto con este código');
    }
  }),
  body('price').isNumeric().withMessage('El precio debe ser un número').isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a cero'),
  body('stock').isNumeric().withMessage('El stock debe ser un número').isInt({ min: 0 }).withMessage('El stock debe ser un entero mayor o igual a cero'),
  body('category').notEmpty().withMessage('La categoría es obligatoria')
];

// POST /api/products
router.post('/', productValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json({ status: 'success', payload: newProduct });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// GET /api/products/:pid
router.get('/:pid', 
  param('pid').isMongoId().withMessage('El ID del producto no es válido'), 
  async (req, res) => {
  try {
    // Validar el ID del producto
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const product = await productManager.getProductById(req.params.pid);
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
  }
});

// PUT /api/products/:pid
router.put('/:pid', 
  param('pid').isMongoId().withMessage('El ID del producto no es válido'), 
  productValidationRules,
  async (req, res) => {
    try {
      // Validar el ID del producto y los datos del producto
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
      res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
      res.status(404).json({ status: 'error', error: error.message });
    }
  }
);

// DELETE /api/products/:pid
router.delete('/:pid', 
  param('pid').isMongoId().withMessage('El ID del producto no es válido'), 
  async (req, res) => {
  try {
    // Validar el ID del producto
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    await productManager.deleteProduct(req.params.pid);
    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (error)
{
    res.status(404).json({ status: 'error', error: error.message });
  }
});

module.exports = router;
