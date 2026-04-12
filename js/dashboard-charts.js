(function() {
  function initArtistCharts() {
    const earningsCtx = document.getElementById('earningsChart');
    if (earningsCtx) {
      new Chart(earningsCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Earnings (K)',
            data: [1200, 1900, 1500, 2500, 2200, 3100],
            borderColor: '#a100d6',
            backgroundColor: 'rgba(161, 0, 214, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#8892b0' } },
            x: { grid: { display: false }, border: { display: false }, ticks: { color: '#8892b0' } }
          }
        }
      });
    }

    const engagementCtx = document.getElementById('engagementChart');
    if (engagementCtx) {
      new Chart(engagementCtx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Profile Views',
            data: [45, 52, 38, 65, 88, 76, 54],
            backgroundColor: '#cbff00',
            borderRadius: 6,
            barThickness: 12
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { display: false } },
            x: { grid: { display: false }, border: { display: false }, ticks: { color: '#8892b0' } }
          }
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initArtistCharts);
})();
