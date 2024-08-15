const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');

const productManager = new ProductManager();

router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sort = req.query.sort;
    const query = req.query.query;

    const result = await productManager.getProducts(limit, page, sort, query);
    res.json(result);

  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json({ status: 'success', payload: newProduct });
  } catch (error) {
    res.status(400).json({ status: 'error', error: error.message });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
    res.json({ status: 'success', payload: updatedProduct });
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    await productManager.deleteProduct(req.params.pid);
    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (error) {
    res.status(404).json({ status: 'error', error: error.message });
  }
});

module.exports = router;
