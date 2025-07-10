// shared/js/cart.js

document.addEventListener('DOMContentLoaded', () => {
  const selected = sessionStorage.getItem('selectedService');
  if (selected) {
    document.getElementById('selectedService').textContent = selected;
  }
});