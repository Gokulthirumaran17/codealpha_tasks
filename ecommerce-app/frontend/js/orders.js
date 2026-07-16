function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function orderCardHtml(order, justPlacedId) {
  const date = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const linesHtml = order.items
    .map(
      (item) => `
      <div class="order-line">
        <span>${escapeHtml(item.name)} × ${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>`
    )
    .join('');

  const banner =
    order._id === justPlacedId
      ? `<div class="alert alert-success">Order placed successfully — thank you!</div>`
      : '';

  return `
    <div class="order-card">
      ${banner}
      <div class="top-row">
        <div>
          <div class="order-id">Order #${order._id.slice(-8).toUpperCase()} · ${date}</div>
        </div>
        <span class="status-pill ${order.status}">${order.status}</span>
      </div>
      ${linesHtml}
      <div class="order-line" style="border-top:1px solid var(--color-line);margin-top:8px;padding-top:10px;font-weight:700;color:var(--color-ink);">
        <span>Total</span>
        <span class="price-tag">$${order.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  `;
}

async function loadOrders() {
  const slot = document.getElementById('orders-slot');

  if (!Auth.requireLogin()) return;

  const params = new URLSearchParams(window.location.search);
  const justPlacedId = params.get('justPlaced');

  try {
    const { orders } = await Api.myOrders();

    if (orders.length === 0) {
      slot.innerHTML = `
        <div class="empty-state">
          <p>You haven't placed any orders yet.</p>
          <a href="index.html" class="btn btn-primary">Start shopping</a>
        </div>
      `;
      return;
    }

    slot.innerHTML = orders.map((o) => orderCardHtml(o, justPlacedId)).join('');
  } catch (err) {
    slot.innerHTML = `<p class="error-text">Could not load orders: ${err.message}</p>`;
  }
}

loadOrders();
