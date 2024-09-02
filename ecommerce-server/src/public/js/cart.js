// ecommerce-server/src/public/js/cart.js

const cartProductList = document.getElementById('cart-product-list');
const emptyCartButton = document.getElementById('empty-cart-button');
const cartTotalContainer = document.getElementById('cart-total-container'); 

cartProductList.addEventListener('click', async (event) => {
  const listItem = event.target.closest('li'); 
  const productId = listItem.dataset.productId; 
  const cartId = cartProductList.dataset.cartId;

  if (event.target.classList.contains('delete-product')) {
    try {
      const response = await fetch(`/api/carts/${cartId}/product/${productId}`, { 
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          listItem.remove(); 
          alert('Producto eliminado del carrito'); 
          updateCartTotal(); 
        } else {
          alert(`Error: ${data.error}`); 
        }
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`); 
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      alert('Error al comunicarse con el servidor'); 
    }

  } else if (event.target.classList.contains('quantity-input')) {
    const newQuantity = parseInt(event.target.value);

    try {
      const response = await fetch(`/api/carts/${cartId}/product/${productId}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity }) 
      });

      if (response.ok) {
        const data = await response.json(); 
        if (data.status === 'success') { 
          listItem.querySelector('.quantity-input').value = newQuantity; 
          listItem.querySelector('.subtotal').textContent = `Subtotal: $${(newQuantity * parseFloat(listItem.querySelector('.unit-price').textContent.replace('Precio unitario: $', ''))).toFixed(2)}`; 
          alert('Cantidad actualizada'); 
          updateCartTotal(); 
        } else {
          alert(`Error: ${data.error}`); 
        }
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`); 
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      alert('Error al comunicarse con el servidor'); 
    }
  }
});
    
emptyCartButton.addEventListener('click', async () => {
  const cartId = emptyCartButton.dataset.cartId;
  try {
    const response = await fetch(`/api/carts/${cartId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        alert('Carrito vaciado');
        cartProductList.innerHTML = ''; 
        localStorage.removeItem('cartId'); 
        window.location.href = '/'; 
      } else {
        alert(`Error: ${data.error}`);
     }
    } else {
      const data = await response.json();
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    alert('Error al comunicarse con el servidor');
  }
});

// Función para actualizar el total del carrito
const updateCartTotal = () => {
  const cartProducts = cartProductList.querySelectorAll('li');
  let total = 0;

  cartProducts.forEach(item => {
    const quantity = parseInt(item.querySelector('.quantity-input').value); 
    const price = parseFloat(item.querySelector('.unit-price').textContent.replace('Precio unitario: $', '')); 
    total += quantity * price; 
  });

  cartTotalContainer.innerHTML = ''; 

  if (cartProducts.length > 0) {
    const totalElement = document.createElement('p'); 
    totalElement.textContent = `Total del Carrito: $${total.toFixed(2)}`; 
    cartTotalContainer.appendChild(totalElement);
  }
};

// Actualiza el total del carrito al cargar la página
updateCartTotal(); 

