(() => {
  const serviceButtons = document.querySelectorAll('.service-card');
  const authModal = document.getElementById('authModal');
  const authForm = document.getElementById('authForm');
  const authTitle = document.getElementById('authTitle');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authSwitchText = document.getElementById('authSwitchText');
  const authSwitchBtn = document.getElementById('authSwitchBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const toast = document.getElementById('toast');
  const emailInput = document.getElementById('emailInput');

  let selectedService = null;
  let isRegistering = false;

  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    setTimeout(() => {
      toast.hidden = true;
      toast.textContent = '';
    }, 4000);
  }

  function openModal() {
    authModal.hidden = false;
    document.body.style.overflow = 'hidden';
    authTitle.textContent = isRegistering ? 'Register' : 'Login';
    authSubmitBtn.textContent = isRegistering ? 'Register & Send Code' : 'Send Code';
    authSwitchText.textContent = isRegistering
      ? 'Already have an account?'
      : "Don't have an account?";
    authSwitchBtn.textContent = isRegistering ? 'Login' : 'Register';
    emailInput.value = '';
    emailInput.focus();
  }

  function closeModal() {
    authModal.hidden = true;
    document.body.style.overflow = '';
    authForm.reset();
  }

  serviceButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedService = button.dataset.service;
      openModal();
    });
  });

  closeModalBtn.addEventListener('click', closeModal);

  authSwitchBtn.addEventListener('click', () => {
    isRegistering = !isRegistering;
    openModal();
  });

  authForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) {
      showToast('Please enter a valid email address.');
      return;
    }
    try {
      const response = await fetch('https://your-backend-domain.com/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, service: selectedService, register: isRegistering }),
      });
      if (response.ok) {
        showToast(`Verification code sent to ${email}. Check your email.`);
        closeModal();
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('selectedService', selectedService);
        window.location.href = 'booking.html';
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to send verification code.');
      }
    } catch {
      showToast('Network error. Please try again later.');
    }
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !authModal.hidden) {
      closeModal();
    }
  });
})();