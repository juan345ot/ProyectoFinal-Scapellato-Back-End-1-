// ecommerce-server/src/public/js/home.js

const addToCartButtons = document.querySelectorAll('.add-to-cart');
addToCartButtons.forEach(button => {
  button.addEventListener('click', async (event) => {
    const productId = event.target.dataset.productId;
    const quantityInput = document.querySelector(`#quantity-${productId}`);
    const quantity = parseInt(quantityInput.value);

    let cartId = localStorage.getItem('cartId');

    if (!cartId) {
      try {
        const response = await fetch('/api/carts', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          cartId = data.payload.cartId;
          localStorage.setItem('cartId', cartId);
        } else {
          throw new Error('Error al crear el carrito');
        }
      } catch (error) {
        console.error('Error al crear el carrito:', error);
        alert('Error al crear el carrito');
        return;
      }
    }

    try {
      const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: quantity })
      });

      if (response.ok) {
        alert('Producto agregado al carrito');
        updateCartLink(cartId);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar al carrito');
    }
  });
});

const updateCartLink = (cartId) => {
  const cartLinkContainer = document.getElementById('cart-link-container');
  cartLinkContainer.innerHTML = '';

  if (cartId) {
    const cartLink = document.createElement('a');
    cartLink.href = `/carts/${cartId}`;
    cartLink.textContent = 'Ver Carrito';
    cartLinkContainer.appendChild(cartLink);
  
// ecommerce-server/src/public/js/home.js (continuation)

  } else {
    cartLinkContainer.textContent = 'Carrito vacío';
  }
};

const cartId = localStorage.getItem('cartId');
updateCartLink(cartId);

