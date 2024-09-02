const Product = require('../models/Product');

class ProductManager {
  constructor() {
  }

  async getProducts(limit = 10, page = 1, sort, query) {
    try {
      const pipeline = [];
      
      if (query) {
        if (query.includes('category:')) {
          pipeline.push({ $match: { category: query.replace('category:', '') } });
        } else if (query.includes('availability:')) {
          pipeline.push({ $match: { status: query.replace('availability:', '') === 'true' } });
        } else {
          pipeline.push({
            $match: {
              $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
              ]
            }
          });
        }
      }
      
      if (sort) {
        pipeline.push({ $sort: { price: sort === 'asc' ? 1 : -1 } });
      }
  
      if (limit) {
        pipeline.push({ $skip: (parseInt(page) - 1) * parseInt(limit) });
        pipeline.push({ $limit: parseInt(limit) });
      }

      if (pipeline.length === 0) {
        pipeline.push({ $match: {} }); 
      }
  
      const products = await Product.aggregate(pipeline);
  

      const totalProducts = await Product.countDocuments(pipeline.length > 0 ? pipeline[0]['$match'] : {});
  
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

