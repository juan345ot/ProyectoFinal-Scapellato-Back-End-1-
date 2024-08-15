// ecommerce-server/src/routes/carts.js
const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');

const cartManager = new CartManager();

router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    // Envía el ID del carrito en la respuesta
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
    const products = await cartManager.getCartById(req.params.cid);
    res.json({ status: 'success', payload: products });
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

router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const updatedCart = await cartManager.deleteProductFromCart(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: updatedCart, message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
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

router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const quantity = req.body.quantity;
    const updatedCart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    res.json({ status: 'success', payload: updatedCart });
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
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

module.exports = router;

