const socket = io();

socket.on('products', (products) => {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  if (Array.isArray(products)) { 
    products.forEach(product => {
      const li = document.createElement('li');
      li.textContent = `${product.title} - $${product.price}`;
      productList.appendChild(li);
    });
  } else {
    console.error('Error: Los datos recibidos no son un array:', products);
  }
});