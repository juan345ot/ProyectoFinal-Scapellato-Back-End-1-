const express = require('express');
const app = express();
const hbs = require('./helpers'); // Configuración de Handlebars con helpers
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

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

const handleSocketError = (socket, error, message) => {
  console.error(message, error);
  socket.emit('error', message);
};

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  const sendProducts = async () => {
    try {
      const products = await productManager.getProducts();
      socket.emit('products', products);
    } catch (error) {
      handleSocketError(socket, error, 'Error al obtener productos');
    }
  };

  sendProducts();

  const handleProductOperation = async (operation, args, successMessage) => {
    try {
      await operation(...args);
      sendProducts();
      console.log(successMessage);
    } catch (error) {
      handleSocketError(socket, error, `Error al ${successMessage.toLowerCase()}`);
    }
  };

  socket.on('addProduct', (newProduct) => handleProductOperation(productManager.addProduct.bind(productManager), [newProduct], 'Producto agregado'));
  socket.on('deleteProduct', (pid) => handleProductOperation(productManager.deleteProduct.bind(productManager), [pid], 'Producto eliminado'));
  socket.on('updateProduct', (updatedProduct) => handleProductOperation(productManager.updateProduct.bind(productManager), [updatedProduct.id, updatedProduct], 'Producto actualizado'));
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conexión exitosa a MongoDB');

    const PORT = 8080;
    http.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  }
};

startServer();
