
  /* ── Revenue Chart ── */
  const monthlyData = {
    labels: ['Oct','Nov','Dec','Jan','Feb','Mar','Apr'],
    data: [7200, 9800, 22000, 8400, 7800, 12200, 14800]
  };
  const quarterlyData = {
    labels: ['Q3 2025','Q4 2025','Q1 2026','Q2 2026 (proj)'],
    data: [18500, 34000, 28400, 31200]
  };

  let revenueChart;
  function buildChart(dataset) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dataset.labels,
        datasets: [{
          label: 'Revenue (ZMW)',
          data: dataset.data,
          backgroundColor: dataset.data.map((v, i, arr) => i === arr.length - 1 ? '#7C3AED' : '#EDE9FE'),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: ctx => ' K ' + ctx.raw.toLocaleString() }
        }},
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { family: 'DM Sans', size: 12 } } },
          y: { grid: { color: '#F3F4F6' }, ticks: {
            color: '#9CA3AF', font: { family: 'DM Sans', size: 12 },
            callback: v => 'K ' + (v/1000).toFixed(0) + 'k'
          }, border: { display: false } }
        }
      }
    });
  }
  buildChart(monthlyData);

  function switchChart(type, el) {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    buildChart(type === 'monthly' ? monthlyData : quarterlyData);
  }

  /* ── Booking Request Actions ── */
  function acceptRequest(btn) {
    const item = btn.closest('.request-item');
    item.style.opacity = '0.5';
    item.style.pointerEvents = 'none';
    const name = item.querySelector('.req-name').childNodes[0].textContent.trim();
    showToast('✓ Booking from ' + name + ' accepted!');
    setTimeout(() => item.remove(), 800);
  }
  function declineRequest(btn) {
    const item = btn.closest('.request-item');
    item.style.opacity = '0.5';
    item.style.pointerEvents = 'none';
    showToast('Booking declined.');
    setTimeout(() => item.remove(), 800);
  }

  /* ── Withdrawal Modal ── */
  document.getElementById('withdrawBtn').addEventListener('click', () => {
    document.getElementById('withdrawModal').classList.add('open');
  });
  document.getElementById('withdrawModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('setupBankLink').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('withdrawModal').classList.add('open');
  });
  function closeModal() {
    document.getElementById('withdrawModal').classList.remove('open');
  }
  function confirmWithdrawal() {
    closeModal();
    showToast('✓ Withdrawal of K 18,450 initiated!');
  }

  /* ── Mark notifications read ── */
  function markAllRead() {
    document.querySelectorAll('.notif-dot-unread').forEach(d => d.remove());
    showToast('All notifications marked as read.');
  }

  /* ── Toast ── */
  function showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#111827;color:#fff;padding:12px 22px;border-radius:999px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.25);font-family:DM Sans,sans-serif;opacity:0;transition:all .25s';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
    setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)'; setTimeout(() => t.remove(), 300); }, 2800);
  }

