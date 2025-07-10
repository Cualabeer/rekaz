// shared/js/auth-modal.js

const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authSwitchBtn = document.getElementById('authSwitchBtn');
const authSubmit = document.getElementById('authSubmit');
const authTitle = document.getElementById('authTitle');
const authSwitchText = document.getElementById('authSwitchText');
const closeModalBtn = document.getElementById('closeModalBtn');
const emailInput = document.getElementById('emailInput');
let isRegistering = false;

// Open modal when service is selected
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    const service = card.dataset.service;
    sessionStorage.setItem('selectedService', service);
    authModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  });
});

// Close modal
closeModalBtn.addEventListener('click', () => {
  authModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
});

// Toggle between login/register
authSwitchBtn.addEventListener('click', () => {
  isRegistering = !isRegistering;
  authTitle.textContent = isRegistering ? 'Register' : 'Login';
  authSubmit.textContent = isRegistering ? 'Register & Send Code' : 'Send Code';
  authSwitchText.textContent = isRegistering
    ? 'Already have an account?'
    : "Don't have an account?";
  authSwitchBtn.textContent = isRegistering ? 'Login' : 'Register';
});

// Submit form
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return showToast('Enter a valid email');

  const response = await fetch('/api/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, register: isRegistering }),
  });

  if (response.ok) {
    sessionStorage.setItem('userEmail', email);
    showToast(`Code sent to ${email}`);
    authModal.classList.add('hidden');
    setTimeout(() => window.location.href = 'profile.html', 1200);
  } else {
    const { error } = await response.json();
    showToast(error || 'Something went wrong');
  }
});