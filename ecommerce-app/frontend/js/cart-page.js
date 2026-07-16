function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function renderCart() {
  const slot = document.getElementById('cart-slot');

  if (!Auth.requireLogin()) return;

  try {
    const cart = await Api.getCart();

    if (cart.items.length === 0) {
      slot.innerHTML = `
        <div class="empty-state">
          <p>Your cart is empty.</p>
          <a href="index.html" class="btn btn-primary">Browse products</a>
        </div>
      `;
      return;
    }

    const itemsHtml = cart.items
      .map((item) => {
        const p = item.product;
        const img = p.imageUrl || 'https://placehold.co/200x200?text=Trailmark';
        return `
          <div class="cart-item" data-id="${p._id}">
            <a href="product.html?id=${p._id}" class="thumb">
              <img src="${img}" alt="${escapeHtml(p.name)}" />
            </a>
            <div>
              <h4><a href="product.html?id=${p._id}">${escapeHtml(p.name)}</a></h4>
              <span class="price-tag">$${item.priceAtAdd.toFixed(2)}</span>
              <div class="line-controls">
                <div class="qty-stepper">
                  <button type="button" class="qty-minus">−</button>
                  <input type="number" class="qty-input" value="${item.quantity}" min="1" max="${p.stockQuantity}" />
                  <button type="button" class="qty-plus">+</button>
                </div>
                <button class="btn-danger remove-btn">Remove</button>
              </div>
            </div>
            <div class="line-total">$${item.lineTotal.toFixed(2)}</div>
          </div>
        `;
      })
      .join('');

    slot.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items">${itemsHtml}</div>
        <aside class="summary-card">
          <h3>Order summary</h3>
          <div class="summary-row"><span>Items</span><span>${cart.items.reduce((s, i) => s + i.quantity, 0)}</span></div>
          <div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
          <div class="summary-row total"><span>Subtotal</span><span>$${cart.total.toFixed(2)}</span></div>
          <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:16px;">Proceed to checkout</a>
        </aside>
      </div>
    `;

    attachRowHandlers();
  } catch (err) {
    slot.innerHTML = `<p class="error-text">Could not load cart: ${err.message}</p>`;
  }
}

function attachRowHandlers() {
  document.querySelectorAll('.cart-item').forEach((row) => {
    const productId = row.dataset.id;
    const input = row.querySelector('.qty-input');

    row.querySelector('.qty-minus').addEventListener('click', () => {
      input.value = Math.max(1, Number(input.value) - 1);
      updateQuantity(productId, Number(input.value));
    });
    row.querySelector('.qty-plus').addEventListener('click', () => {
      const max = Number(input.max) || 999;
      input.value = Math.min(max, Number(input.value) + 1);
      updateQuantity(productId, Number(input.value));
    });
    input.addEventListener('change', () => {
      updateQuantity(productId, Math.max(1, Number(input.value)));
    });
    row.querySelector('.remove-btn').addEventListener('click', () => removeItem(productId));
  });
}

async function updateQuantity(productId, quantity) {
  try {
    await Api.updateCartItem(productId, quantity);
    refreshCartCount();
    renderCart();
  } catch (err) {
    alert(err.message);
    renderCart();
  }
}

async function removeItem(productId) {
  try {
    await Api.removeCartItem(productId);
    refreshCartCount();
    renderCart();
  } catch (err) {
    alert(err.message);
  }
}

renderCart();
