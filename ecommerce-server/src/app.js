const express = require('express');
const app = express();
const exphbs = require('express-handlebars'); 
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');
const CartManager = require('./managers/CartManager');
const ProductManager = require('./managers/ProductManager');
const cartManager = new CartManager('./src/data/carrito.json');
const productManager = new ProductManager('./src/data/productos.json');

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'index', 
  extname: '.handlebars' 
}));
app.set('view engine', 'handlebars'); 
app.set('views', __dirname + '/views'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

io.on('connection', (socket) => {
  console.log('cliente conectado');
  const sendProducts = async () => {
    let products = await productManager.getProducts();
    if (!Array.isArray(products)) {
      products = [products]; 
    }
    socket.emit('products', products);
  };

  sendProducts();
  socket.on('addProduct', async (newProduct) => {
    try {
      await productManager.addProduct(newProduct);
      sendProducts();
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('deleteProduct', async (pid) => {
    try {
      await productManager.deleteProduct(pid);
      sendProducts(); 
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('updateProduct', async (updatedProduct) => {
    try {
      await productManager.updateProduct(updatedProduct.id, updatedProduct);
      sendProducts();
    } catch (error) {
      console.error(error);
    }
  });
});

const PORT = 8080;
http.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});