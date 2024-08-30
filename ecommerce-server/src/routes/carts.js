const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');

const cartManager = new CartManager();

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

router.get('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid; // Obtiene el cartId de la URL
    const cartProducts = await cartManager.getCartById(cartId); 
    console.log("El cartId recibido es:", cartId); // Imprime el cartId
    res.render('cart', { cartId: cartId, cartProducts }); // Asegúrate de usar cartId
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
  }
});

router.delete('/:cid/product/:pid', async (req, res, next) => { 
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid
    const updatedCart = await cartManager.deleteProductFromCart(cartId, productId);
    res.json({ status: 'success', payload: updatedCart, message: 'Producto eliminado del carrito' }); // Respuesta JSON
  } catch (error) {
    next(error); 
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const updatedCart = await cartManager.updateCart(req.params.cid, req.body.products);
    res.json({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
  }
});

router.put('/:cid/product/:pid', async (req, res, next) => { 
  try {
    const quantity = req.body.quantity;
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const updatedCart = await cartManager.updateProductQuantity(cartId, productId, quantity);
    res.json({ status: 'success', payload: updatedCart, message: 'Producto modificado' }); // Respuesta JSON
  } catch (error) {
    next(error); 
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const emptyCart = await cartManager.emptyCart(req.params.cid);
    res.json({ status: 'success', payload: emptyCart, message: 'Carrito vaciado' });
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
  }
});

// Middleware para manejar errores y enviar respuestas JSON
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    status: 'error', 
    error: err.message || 'Error interno del servidor' 
  });
});

module.exports = router;
