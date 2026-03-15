
/* ============================================
   PLUM — Booking JavaScript
   ============================================ */

// ---- Multi-step booking form ----
let currentStep = 1;
const totalSteps = 3;

function updateSteps() {
  document.querySelectorAll('.step-circle').forEach((circle, i) => {
    circle.classList.remove('active', 'done');
    if (i + 1 < currentStep) circle.classList.add('done');
    else if (i + 1 === currentStep) circle.classList.add('active');
  });

  document.querySelectorAll('.step-line').forEach((line, i) => {
    line.classList.toggle('done', i + 1 < currentStep);
  });

  document.querySelectorAll('.step-label').forEach((label, i) => {
    label.classList.toggle('active', i + 1 === currentStep);
  });

  document.querySelectorAll('.booking-step').forEach((step, i) => {
    step.style.display = i + 1 === currentStep ? 'block' : 'none';
  });

  // Update buttons
  const backBtn  = document.getElementById('booking-back');
  const nextBtn  = document.getElementById('booking-next');
  const submitBtn = document.getElementById('booking-submit');

  if (backBtn)  backBtn.style.display  = currentStep > 1 ? 'inline-flex' : 'none';
  if (nextBtn)  nextBtn.style.display  = currentStep < totalSteps ? 'inline-flex' : 'none';
  if (submitBtn) submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
}

const nextBtn = document.getElementById('booking-next');
const backBtn = document.getElementById('booking-back');
const submitBtn = document.getElementById('booking-submit');

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (currentStep < totalSteps) { currentStep++; updateSteps(); window.scrollTo({top: 0, behavior: 'smooth'}); }
  });
}
if (backBtn) {
  backBtn.addEventListener('click', () => {
    if (currentStep > 1) { currentStep--; updateSteps(); }
  });
}
if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    window.showToast && showToast('Booking confirmed! Check your email.', 'success');
    setTimeout(() => { window.location.href = '../pages/dashboard-client.html'; }, 1500);
  });
}

// ---- Date picker interactions ----
const dateInput = document.getElementById('event-date');
if (dateInput) {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  dateInput.min = today.toISOString().split('T')[0];
}

// ---- Package selector ----
document.querySelectorAll('.package-option').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.package-option').forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');
    const price = option.dataset.price;
    const summaryPrice = document.getElementById('summary-price');
    if (summaryPrice && price) summaryPrice.textContent = `$${price}`;
    updateTotal();
  });
});

function updateTotal() {
  const pkg = document.querySelector('.package-option.selected');
  const addons = document.querySelectorAll('.addon-check:checked');
  let total = pkg ? parseInt(pkg.dataset.price || 0) : 0;
  addons.forEach(a => total += parseInt(a.dataset.price || 0));
  const totalEl = document.getElementById('booking-total');
  if (totalEl) totalEl.textContent = `$${total}`;
}

document.querySelectorAll('.addon-check').forEach(cb => {
  cb.addEventListener('change', updateTotal);
});

// ---- Init ----
updateSteps();
updateTotal();