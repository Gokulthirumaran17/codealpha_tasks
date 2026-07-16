document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const alertSlot = document.getElementById('login-alert');
  const originalText = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'Logging in…';
  alertSlot.innerHTML = '';

  try {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { token, user } = await Api.login({ email, password });
    Auth.setSession(token, user);

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    window.location.href = redirect ? decodeURIComponent(redirect) : 'index.html';
  } catch (err) {
    alertSlot.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
