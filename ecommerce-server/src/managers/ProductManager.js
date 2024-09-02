// ecommerce-server/src/managers/ProductManager.js
const Product = require('../models/Product');

class ProductManager {
  constructor() {
    // No se necesita el path ya que se usa MongoDB
  }

  async getProducts(limit = 10, page = 1, sort, query) {
    try {
      const filter = {};

      if (query) {
        if (query.includes('category:')) {
          filter.category = query.replace('category:', '');
        } else if (query.includes('availability:')) {
          filter.status = query.replace('availability:', '') === 'true';
        } else {
          filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ];
        }
      }

      const options = {
        limit: limit !== null ? parseInt(limit) : undefined, // Si limit no es null, lo usa. De lo contrario, undefined (sin límite)
        skip: (parseInt(page) - 1) * (limit !== null ? parseInt(limit) : 1), // Ajusta el skip si no hay límite
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined
      };

      const products = await Product.find(filter, null, options);
      const totalProducts = await Product.countDocuments(filter);

      const totalPages = Math.ceil(totalProducts / limit);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;
      const prevPage = hasPrevPage ? page - 1 : null;
      const nextPage = hasNextPage ? page + 1 : null;
      const prevLink = hasPrevPage 
        ? `/?limit=${limit}&page=${prevPage}&sort=${sort || ''}&query=${query || ''}` 
        : null;
      const nextLink = hasNextPage
        ? `/?limit=${limit}&page=${nextPage}&sort=${sort || ''}&query=${query || ''}`
        : null;

      return {
        status: 'success',
        payload: products,
        totalPages,
        prevPage,
        nextPage,
        page: parseInt(page),
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink
      };

    } catch (error) {
      throw new Error('Error al obtener los productos: ' + error.message);
    }
  }

  async getProductById(pid) {
    try {
      const product = await Product.findById(pid);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      throw new Error('Error al obtener el producto: ' + error.message);
    }
  }

  async addProduct(product) {
    try {
      const newProduct = new Product(product);

      if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
        throw new Error('Todos los campos son obligatorios excepto thumbnails');
      }

      await newProduct.save();
      return newProduct;
    } catch (error) {
      throw new Error('Error al agregar el producto: ' + error.message);
    }
  }

  async updateProduct(pid, updatedFields) {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(pid, updatedFields, { new: true });
      if (!updatedProduct) {
        throw new Error('Producto no encontrado');
      }
      return updatedProduct;
    } catch (error) {
      throw new Error('Error al actualizar el producto: ' + error.message);
    }
  }

  async deleteProduct(pid) {
    try {
      const deletedProduct = await Product.findByIdAndDelete(pid);
      if (!deletedProduct) {
        throw new Error('Producto no encontrado');
      }
    } catch (error) {
      throw new Error('Error al eliminar el producto: ' + error.message);
    }
  }
}

module.exports = ProductManager;

