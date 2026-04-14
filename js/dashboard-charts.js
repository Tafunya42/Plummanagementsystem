(function() {
  function chartData(path, fallback) {
    const dashboard = window.PlumArtistDashboard || {};
    return path.reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), dashboard) || fallback;
  }

  function initArtistCharts() {
    if (typeof Chart === 'undefined') return;

    const earnings = chartData(['charts', 'earnings'], { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: [0, 0, 0, 0, 0, 0] });
    const earningsCtx = document.getElementById('earningsChart');
    if (earningsCtx) {
      new Chart(earningsCtx, {
        type: 'line',
        data: {
          labels: earnings.labels,
          datasets: [{
            label: 'Earnings (K)',
            data: earnings.values,
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
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#8892b0' } },
            x: { grid: { display: false }, border: { display: false }, ticks: { color: '#8892b0' } }
          }
        }
      });
    }

    const engagement = chartData(['charts', 'engagement'], { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [0, 0, 0, 0, 0, 0, 0] });
    const engagementCtx = document.getElementById('engagementChart');
    if (engagementCtx) {
      new Chart(engagementCtx, {
        type: 'bar',
        data: {
          labels: engagement.labels,
          datasets: [{
            label: 'Profile Views',
            data: engagement.values,
            backgroundColor: '#cbff00',
            borderRadius: 6,
            barThickness: 12
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
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
