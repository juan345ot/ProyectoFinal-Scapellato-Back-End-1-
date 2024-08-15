// ecommerce-server/src/app.js
const express = require('express');
const app = express();
const hbs = require('./helpers'); // Importar la configuración de Handlebars con helpers
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');
const CartManager = require('./managers/CartManager');
const ProductManager = require('./managers/ProductManager');
const mongoose = require('mongoose');
require('dotenv').config();

const cartManager = new CartManager();
const productManager = new ProductManager();

app.engine('handlebars', hbs.engine); // Usar el motor de Handlebars con helpers
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  const sendProducts = async () => {
    try {
      const products = await productManager.getProducts();
      socket.emit('products', products);
    } catch (error) {
      console.error('Error al obtener productos para Socket.IO:', error);
      socket.emit('error', 'Error al obtener productos');
    }
  };

  sendProducts();

  socket.on('addProduct', async (newProduct) => {
    try {
      await productManager.addProduct(newProduct);
      sendProducts();
    } catch (error) {
      console.error('Error al agregar producto desde Socket.IO:', error);
      socket.emit('error', 'Error al agregar producto');
    }
  });

  socket.on('deleteProduct', async (pid) => {
    try {
      await productManager.deleteProduct(pid);
      sendProducts();
    } catch (error) {
      console.error('Error al eliminar producto desde Socket.IO:', error);
      socket.emit('error', 'Error al eliminar producto');
    }
  });

  socket.on('updateProduct', async (updatedProduct) => {
    try {
      await productManager.updateProduct(updatedProduct.id, updatedProduct);
      sendProducts();
    } catch (error) {
      console.error('Error al actualizar producto desde Socket.IO:', error);
      socket.emit('error', 'Error al actualizar producto');
    }
  });
});

const PORT = 8080;

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conexión exitosa a MongoDB');

    http.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  }
})();
