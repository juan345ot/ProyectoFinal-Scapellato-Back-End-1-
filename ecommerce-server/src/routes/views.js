const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const CartManager = require('../managers/CartManager');

const productManager = new ProductManager();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sort = req.query.sort;
    const query = req.query.query;

    const { 
      payload: products, 
      totalPages, 
      hasPrevPage, 
      hasNextPage,
      page: currentPage // Renombra "page" a "currentPage" para evitar conflictos
    } = await productManager.getProducts(limit, page, sort, query);

    res.render('home', { 
      products: products, 
      totalPages: totalPages, 
      hasPrevPage: hasPrevPage, 
      hasNextPage: hasNextPage,
      currentPage: currentPage,
      limit: limit, // Pasa "limit" al template
      sort: sort,   // Pasa "sort" al template
      query: query  // Pasa "query" al template 
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

router.get('/realtimeproducts', async (req, res) => {
  try {
    const { 
      payload: products 
    } = await productManager.getProducts(null); // Pasa 'null' como límite para obtener todos los productos
    res.render('realTimeProducts', { products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para la vista individual del producto
router.get('/products/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await productManager.getProductById(productId);

    if (product) {
      res.render('product', { product });
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cartProducts = await cartManager.getCartById(cartId);
    res.render('cart', { cartId: cartId, cartProducts });
  } catch (error) {
    console.error(error);
    res.status(404).send('Carrito no encontrado');
  }
});

module.exports = router;
