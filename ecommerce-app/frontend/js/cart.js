// Keeps the cart-count badge in the header in sync on every page.
async function refreshCartCount() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;

  if (!Auth.isLoggedIn()) {
    badge.textContent = '0';
    badge.classList.add('hidden');
    return;
  }

  try {
    const cart = await Api.getCart();
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count === 0);
  } catch (err) {
    badge.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', refreshCartCount);
