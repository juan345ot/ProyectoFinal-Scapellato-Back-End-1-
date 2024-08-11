const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async getProducts(limit) {
    const products = await this.#readFile();
    return limit ? products.slice(0, limit) : products;
  }

  async getProductById(pid) {
    const products = await this.#readFile();
    return products.find(p => p.id === pid);
  }

  async addProduct(product) {
    const products = await this.#readFile();
    const newProduct = {
      id: uuidv4(),
      ...product,
      status: product.status !== undefined ? product.status : true
    };

    if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || newProduct.status === undefined || !newProduct.stock || !newProduct.category) {
      throw new Error('Todos los campos son obligatorios excepto thumbnails');
    }

    products.push(newProduct);
    await this.#writeFile(products);
    return newProduct;
  }

  async updateProduct(pid, updatedFields) {
    const products = await this.#readFile();
    const productIndex = products.findIndex(p => p.id === pid);

    if (productIndex === -1) {
      throw new Error('Producto no encontrado');
    }

    products[productIndex] = { ...products[productIndex], ...updatedFields };
    await this.#writeFile(products);
    return products[productIndex];
  }

  async deleteProduct(pid) {
    const products = await this.#readFile();
    const newProducts = products.filter(p => p.id !== pid);

    if (products.length === newProducts.length) {
      throw new Error('Producto no encontrado');
    }

    await this.#writeFile(newProducts);
  }
}

module.exports = ProductManager;
