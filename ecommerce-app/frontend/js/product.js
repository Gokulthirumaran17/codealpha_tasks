function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadProduct() {
  const slot = document.getElementById('product-slot');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    slot.innerHTML = `<p class="error-text">No product specified.</p>`;
    return;
  }

  try {
    const { product } = await Api.getProduct(id);
    document.title = `${product.name} — Trailmark`;

    const stockLabel =
      product.stockQuantity === 0
        ? '<span class="stock-badge out-stock">Sold out</span>'
        : product.stockQuantity <= 5
        ? `<span class="stock-badge low-stock">Only ${product.stockQuantity} left</span>`
        : '<span class="stock-badge in-stock">In stock</span>';

    const img = product.imageUrl || 'https://placehold.co/800x800?text=Trailmark';

    slot.innerHTML = `
      <div class="product-detail">
        <div class="gallery">
          <img src="${img}" alt="${escapeHtml(product.name)}" />
        </div>
        <div>
          <span class="eyebrow">${escapeHtml(product.category)}</span>
          <h1>${escapeHtml(product.name)}</h1>
          <div class="price-row">
            <span class="price-tag">$${product.price.toFixed(2)}</span>
            ${stockLabel}
          </div>
          <p>${escapeHtml(product.description)}</p>

          <div class="qty-row">
            <div class="qty-stepper">
              <button type="button" id="qty-minus">−</button>
              <input type="number" id="qty-input" value="1" min="1" max="${Math.max(product.stockQuantity, 1)}" />
              <button type="button" id="qty-plus">+</button>
            </div>
            <button class="btn btn-primary" id="add-to-cart-btn" ${product.stockQuantity === 0 ? 'disabled' : ''}>
              Add to cart
            </button>
          </div>

          <div id="add-alert"></div>

          <div class="divider"></div>

          <ul class="spec-list">
            <li><span>Category</span><span>${escapeHtml(product.category)}</span></li>
            <li><span>Availability</span><span>${product.stockQuantity} units</span></li>
            <li><span>SKU</span><span>${product._id.slice(-8).toUpperCase()}</span></li>
          </ul>
        </div>
      </div>
    `;

    const qtyInput = document.getElementById('qty-input');
    document.getElementById('qty-minus').addEventListener('click', () => {
      qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
    });
    document.getElementById('qty-plus').addEventListener('click', () => {
      qtyInput.value = Math.min(product.stockQuantity, Number(qtyInput.value) + 1);
    });

    document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
      if (!Auth.isLoggedIn()) {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }
      const btn = document.getElementById('add-to-cart-btn');
      const alertSlot = document.getElementById('add-alert');
      btn.disabled = true;
      btn.textContent = 'Adding…';
      try {
        await Api.addToCart(product._id, Number(qtyInput.value));
        alertSlot.innerHTML = `<div class="alert alert-success">Added to cart.</div>`;
        refreshCartCount();
      } catch (err) {
        alertSlot.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Add to cart';
      }
    });
  } catch (err) {
    slot.innerHTML = `<p class="error-text">Could not load product: ${err.message}</p>`;
  }
}

loadProduct();
