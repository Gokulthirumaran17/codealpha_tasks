// Homepage: product grid, category chips, search.

function productCardHtml(product) {
  const stockLabel =
    product.stockQuantity === 0
      ? '<span class="stock-badge out-stock">Sold out</span>'
      : product.stockQuantity <= 5
      ? '<span class="stock-badge low-stock">Low stock</span>'
      : '<span class="stock-badge in-stock">In stock</span>';

  const img = product.imageUrl || 'https://placehold.co/600x450?text=Trailmark';

  return `
    <article class="product-card">
      <a href="product.html?id=${product._id}" class="thumb">
        <img src="${img}" alt="${escapeHtml(product.name)}" loading="lazy" />
      </a>
      <div class="body">
        <span class="cat">${escapeHtml(product.category)}</span>
        <h3><a href="product.html?id=${product._id}">${escapeHtml(product.name)}</a></h3>
        <p class="desc">${escapeHtml(product.description)}</p>
        <div class="foot">
          <span class="price-tag">$${product.price.toFixed(2)}</span>
          ${stockLabel}
        </div>
        <button class="add-btn" data-id="${product._id}" ${product.stockQuantity === 0 ? 'disabled' : ''}>
          Add to cart
        </button>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadCategories(activeCategory) {
  const row = document.getElementById('filter-row');
  try {
    const { categories } = await Api.getCategories();
    categories.forEach((cat) => {
      const chip = document.createElement('button');
      chip.className = 'chip' + (cat === activeCategory ? ' active' : '');
      chip.textContent = cat;
      chip.dataset.category = cat;
      row.appendChild(chip);
    });
  } catch (err) {
    // Non-fatal — the "All" chip still works without categories loaded.
  }

  row.querySelectorAll('.chip').forEach((chip) => {
    if (chip.dataset.category === (activeCategory || '')) chip.classList.add('active');
    else chip.classList.remove('active');

    chip.addEventListener('click', () => {
      const params = new URLSearchParams(window.location.search);
      if (chip.dataset.category) params.set('category', chip.dataset.category);
      else params.delete('category');
      params.delete('search');
      window.location.search = params.toString();
    });
  });
}

async function loadProducts() {
  const slot = document.getElementById('product-grid-slot');
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || '';
  const search = params.get('search') || '';

  if (search) {
    document.getElementById('search-input').value = search;
  }

  try {
    const query = {};
    if (category) query.category = category;
    if (search) query.search = search;

    const { items } = await Api.listProducts(query);

    if (items.length === 0) {
      slot.innerHTML = `<p class="empty-state">No products match that search. Try a different term or category.</p>`;
      return;
    }

    slot.innerHTML = `<div class="product-grid">${items.map(productCardHtml).join('')}</div>`;

    slot.querySelectorAll('.add-btn').forEach((btn) => {
      btn.addEventListener('click', () => handleAddToCart(btn));
    });
  } catch (err) {
    slot.innerHTML = `<p class="error-text">Could not load products: ${err.message}</p>`;
  }

  loadCategories(category);
}

async function handleAddToCart(btn) {
  if (!Auth.isLoggedIn()) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }

  const productId = btn.dataset.id;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Adding…';

  try {
    await Api.addToCart(productId, 1);
    btn.textContent = 'Added ✓';
    refreshCartCount();
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 1200);
  } catch (err) {
    alert(err.message);
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const value = document.getElementById('search-input').value.trim();
  const params = new URLSearchParams(window.location.search);
  if (value) params.set('search', value);
  else params.delete('search');
  params.delete('category');
  window.location.search = params.toString();
});

loadProducts();
