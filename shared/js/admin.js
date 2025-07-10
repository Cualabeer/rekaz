document.addEventListener('DOMContentLoaded', () => {
  // Example mock values
  document.getElementById('bookingCount').textContent = 42;
  document.getElementById('pendingJobs').textContent = 7;
  document.getElementById('completedJobs').textContent = 35;

  const bookings = [
    {
      email: 'john@example.com',
      service: 'Recovery',
      status: 'Completed',
      date: '2025-07-10'
    },
    {
      email: 'amy@example.com',
      service: 'Battery Fitting',
      status: 'Pending',
      date: '2025-07-11'
    }
  ];

  const tbody = document.getElementById('bookingTableBody');
  tbody.innerHTML = '';

  bookings.forEach((b, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${b.email}</td>
      <td>${b.service}</td>
      <td>${b.status}</td>
      <td>${b.date}</td>
      <td><button class="reschedule-btn">Reschedule</button></td>
    `;
    tbody.appendChild(row);
  });
});