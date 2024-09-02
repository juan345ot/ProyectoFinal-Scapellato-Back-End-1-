const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const { body, validationResult, param } = require('express-validator'); // Importa 'param'

const cartManager = new CartManager();

// POST /api/carts
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({
      status: 'success',
      payload: {
        cartId: newCart._id
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// GET /api/carts/:cid
router.get('/:cid',
  param('cid').isMongoId().withMessage('El ID del carrito no es válido'),
  async (req, res) => {
    try {
      // Validar el ID del carrito
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const cartId = req.params.cid;
      const cartProducts = await cartManager.getCartById(cartId);
      res.render('cart', { cartId: cartId, cartProducts });
    } catch (error) {
      res.status(404).json({ status: 'error', error: error.message });
    }
  }
);

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid',
  param('cid').isMongoId().withMessage('El ID del carrito no es válido'),
  param('pid').isMongoId().withMessage('El ID del producto no es válido'),
  body('quantity').isNumeric().withMessage('La cantidad debe ser un número').isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor o igual a 1'),
  async (req, res) => {
    try {
      // Validar el ID del carrito, el ID del producto y la cantidad
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const cartId = req.params.cid;
      const productId = req.params.pid;
      const quantity = req.body.quantity;
      const cart = await cartManager.addProductToCart(cartId, productId, quantity);
      res.json({ status: 'success', payload: cart });
    } catch (error) {
      res.status(404).json({ status: 'error', error: error.message });
    }
  }
);

// DELETE /api/carts/:cid/product/:pid
router.delete('/:cid/product/:pid',
  param('cid').isMongoId().withMessage('El ID del carrito no es válido'),
  param('pid').isMongoId().withMessage('El ID del producto no es válido'),
  async (req, res, next) => {
    try {
      // Validar el ID del carrito y el ID del producto
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const cartId = req.params.cid;
      const productId = req.params.pid;
      const updatedCart = await cartManager.deleteProductFromCart(cartId, productId);
      res.json({ status: 'success', payload: updatedCart, message: 'Producto eliminado del carrito' });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/carts/:cid
router.put('/:cid',
  param('cid').isMongoId().withMessage('El ID del carrito no es válido'),
  body('products').isArray().withMessage('El campo "products" debe ser un array').custom((value) => {
    if (!value.every(item => {
      return item.quantity &&
        typeof item.product === 'string' &&
        mongoose.Types.ObjectId.isValid(item.product) &&
        typeof item.quantity === 'number' &&
        item.quantity > 0;
    })) {
      throw new Error('El array "products" debe contener objetos con las propiedades "product" (ObjectId) y "quantity" (número mayor a 0)');
    }
    return true;
  }),
  async (req, res) => {
    try {
      // Validar el ID del carrito y el formato del array de productos
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const cartId = req.params.cid;
      const updatedCart = await cartManager.updateCart(cartId, req.body.products);
      res.json({ status: 'success', payload: updatedCart });
    } catch (error) {
      res.status(404).json({ status: 'error', error: error.message });
    }
  }
);

// PUT /api/carts/:cid/product/:pid
router.put('/:cid/product/:pid',
  param('cid').isMongoId().withMessage('El ID del carrito no es válido'),
  param('pid').isMongoId().withMessage('El ID del producto no es válido'),
  body('quantity').isNumeric().withMessage('La cantidad debe ser un número').isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor o igual a 1'),
  async (req, res, next) => {
    try {
      // Validar el ID del carrito, el ID del producto y la cantidad
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const cartId = req.params.cid;
      const productId = req.params.pid;
      const quantity = req.body.quantity;
      const updatedCart = await cartManager.updateProductQuantity(cartId, productId, quantity);
      res.json({ status: 'success', payload: updatedCart, message: 'Producto modificado' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/carts/:cid
router.delete('/:cid',
  param('cid').isMongoId().withMessage('El ID del carrito no es válido'),
  async (req, res) => {
    try {
      // Validar el ID del carrito
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const cartId = req.params.cid;
      const emptyCart = await cartManager.emptyCart(cartId);
      res.json({ status: 'success', payload: emptyCart, message: 'Carrito vaciado' });
    } catch (error) {
      res.status(404).json({ status: 'error', error: error.message });
    }
  }
);

// Middleware para manejar errores y enviar respuestas JSON
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    error: err.message || 'Error interno del servidor'
  });
});

module.exports = router;

