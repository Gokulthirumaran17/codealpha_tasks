// Handles storing the JWT and current user in the browser, plus the
// login-state parts of the shared header.
const Auth = {
  TOKEN_KEY: 'trailmark_token',
  USER_KEY: 'trailmark_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  setSession(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  requireLogin(redirectTo = 'login.html') {
    if (!this.isLoggedIn()) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${redirectTo}?redirect=${returnUrl}`;
      return false;
    }
    return true;
  },
};

// Renders the login/account area in the shared header. Called on every page.
function renderAuthNav() {
  const slot = document.getElementById('auth-nav-slot');
  if (!slot) return;

  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    slot.innerHTML = `
      <a href="orders.html" class="btn-ghost">Orders</a>
      <span style="font-size:13px;color:var(--color-ink-soft);">Hi, ${user?.name?.split(' ')[0] || 'there'}</span>
      <button id="logout-btn" class="btn btn-secondary" style="padding:8px 14px;font-size:13px;">Log out</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
      Auth.clearSession();
      window.location.href = 'index.html';
    });
  } else {
    slot.innerHTML = `<a href="login.html" class="btn btn-secondary" style="padding:8px 16px;font-size:13px;">Log in</a>`;
  }
}

document.addEventListener('DOMContentLoaded', renderAuthNav);
