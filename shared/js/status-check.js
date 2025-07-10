document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/status')
    .then(res => res.json())
    .then(data => {
      const light = document.getElementById('dbStatus');
      const text = document.getElementById('dbStatusText');
      if (data.redis) {
        light.classList.remove('red');
        light.classList.add('green');
        text.textContent = 'Database connected';
      } else {
        light.classList.add('red');
        text.textContent = 'Database disconnected';
      }
    })
    .catch(() => {
      const light = document.getElementById('dbStatus');
      const text = document.getElementById('dbStatusText');
      light.classList.add('red');
      text.textContent = 'Connection error';
    });
});