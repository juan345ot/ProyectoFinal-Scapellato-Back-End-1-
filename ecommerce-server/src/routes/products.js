const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');

const productManager = new ProductManager();

router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sort = req.query.sort === 'asc' ? 1 : req.query.sort === 'desc' ? -1 : null;
    const query = req.query.query || {};

    // Filtrar productos
    let matchStage = {};
    if (query.category) {
      matchStage.category = query.category;
    }
    if (query.availability) {
      matchStage.available = query.availability === 'true';
    }

    // Preparar pipeline de agregación
    const pipeline = [{ $match: matchStage }];

    // Ordenar productos
    if (sort) {
      pipeline.push({ $sort: { price: sort } });
    }

    // Paginar productos
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    // Obtener productos con paginación y conteo total
    const [products, totalProducts] = await Promise.all([
      productManager.getProducts(pipeline),
      productManager.countProducts(matchStage)
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    // Crear links de paginación
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage: !!prevPage,
      hasNextPage: !!nextPage,
      prevLink: prevPage ? `/products?limit=${limit}&page=${prevPage}` : null,
      nextLink: nextPage ? `/products?limit=${limit}&page=${nextPage}` : null
    });

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
