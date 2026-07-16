async function renderCheckout() {
  const slot = document.getElementById('checkout-slot');

  if (!Auth.requireLogin()) return;

  try {
    const cart = await Api.getCart();

    if (cart.items.length === 0) {
      slot.innerHTML = `
        <div class="empty-state">
          <p>Your cart is empty — nothing to check out yet.</p>
          <a href="index.html" class="btn btn-primary">Browse products</a>
        </div>
      `;
      return;
    }

    const linesHtml = cart.items
      .map(
        (item) => `
        <div class="summary-row">
          <span>${item.product.name} × ${item.quantity}</span>
          <span>$${item.lineTotal.toFixed(2)}</span>
        </div>`
      )
      .join('');

    slot.innerHTML = `
      <div class="checkout-layout">
        <form id="checkout-form" class="form-card">
          <div id="checkout-alert"></div>
          <h3 style="margin-bottom:18px;">Shipping address</h3>
          <div class="field">
            <label for="fullName">Full name</label>
            <input id="fullName" name="fullName" required />
          </div>
          <div class="field">
            <label for="line1">Address</label>
            <input id="line1" name="line1" required />
          </div>
          <div class="field-row">
            <div class="field">
              <label for="city">City</label>
              <input id="city" name="city" required />
            </div>
            <div class="field">
              <label for="state">State / Province</label>
              <input id="state" name="state" required />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="postalCode">Postal code</label>
              <input id="postalCode" name="postalCode" required />
            </div>
            <div class="field">
              <label for="country">Country</label>
              <input id="country" name="country" required />
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="place-order-btn">
            Place order — $${cart.total.toFixed(2)}
          </button>
        </form>

        <aside class="summary-card">
          <h3>Order summary</h3>
          ${linesHtml}
          <div class="summary-row total"><span>Total</span><span>$${cart.total.toFixed(2)}</span></div>
        </aside>
      </div>
    `;

    document.getElementById('checkout-form').addEventListener('submit', handlePlaceOrder);
  } catch (err) {
    slot.innerHTML = `<p class="error-text">Could not load checkout: ${err.message}</p>`;
  }
}

async function handlePlaceOrder(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('place-order-btn');
  const alertSlot = document.getElementById('checkout-alert');
  const originalText = btn.textContent;

  const shippingAddress = {
    fullName: form.fullName.value.trim(),
    line1: form.line1.value.trim(),
    city: form.city.value.trim(),
    state: form.state.value.trim(),
    postalCode: form.postalCode.value.trim(),
    country: form.country.value.trim(),
  };

  btn.disabled = true;
  btn.textContent = 'Placing order…';
  alertSlot.innerHTML = '';

  try {
    const { order } = await Api.createOrder(shippingAddress);
    window.location.href = `orders.html?justPlaced=${order._id}`;
  } catch (err) {
    alertSlot.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

renderCheckout();
