document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('register-btn');
  const alertSlot = document.getElementById('register-alert');
  const originalText = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'Creating account…';
  alertSlot.innerHTML = '';

  try {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { token, user } = await Api.register({ name, email, password });
    Auth.setSession(token, user);
    window.location.href = 'index.html';
  } catch (err) {
    alertSlot.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
