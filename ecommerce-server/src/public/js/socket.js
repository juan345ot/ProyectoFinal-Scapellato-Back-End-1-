const socket = io();

socket.on('products', (products) => {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  if (products.payload && Array.isArray(products.payload)) { 
    products.payload.forEach(product => {
      const li = document.createElement('li');
      li.textContent = `${product.title} - $${product.price}`;
      productList.appendChild(li);
    });
  } else {
    console.error('Error: Los datos recibidos no son un array o no tienen la propiedad "payload":', products);
  }
});

socket.on('error', (errorMessage) => {
  console.error('Error del servidor:', errorMessage);
  alert('Ocurrió un error en el servidor. Por favor, inténtalo de nuevo más tarde.');
});
