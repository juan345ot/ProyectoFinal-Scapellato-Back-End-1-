// ecommerce-server/src/managers/CartManager.js
const Cart = require('../models/Cart');
const Product = require('../models/Product'); 

class CartManager {
  constructor() {
    // No se necesita el path ya que se usa MongoDB
  }

  async createCart() {
    try {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      return newCart;
    } catch (error) {
      throw new Error('Error al crear el carrito: ' + error.message);
    }
  }

  async getCartById(cid) {
    try {
      const cart = await Cart.findById(cid).populate('products.product'); 
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }
      return cart.products;
    } catch (error) {
      throw new Error('Error al obtener el carrito: ' + error.message);
    }
  }

  async addProductToCart(cid, pid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const existingProduct = cart.products.find(p => p.product.toString() === pid); 

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        const product = await Product.findById(pid); 
        if (!product) {
          throw new Error('Producto no encontrado'); 
        }
        cart.products.push({ product: pid, quantity: 1 });
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error('Error al agregar el producto al carrito: ' + error.message);
    }
  }

  async deleteProductFromCart(cid, pid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }
      cart.products = cart.products.filter(p => p.product.toString() !== pid); 
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error('Error al eliminar el producto del carrito: ' + error.message);
    }
  }

  async updateCart(cid, products) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }
      cart.products = products; 
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error('Error al actualizar el carrito: ' + error.message);
    }
  }

  async updateProductQuantity(cid, pid, quantity) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const productToUpdate = cart.products.find(p => p.product.toString() === pid);

      if (!productToUpdate) {
        throw new Error('Producto no encontrado en el carrito');
      }

      productToUpdate.quantity = quantity;
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error('Error al actualizar la cantidad del producto en el carrito: ' + error.message);
    }
  }

  async emptyCart(cid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }
      cart.products = [];
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error('Error al vaciar el carrito: ' + error.message);
    }
  }
}

module.exports = CartManager;

