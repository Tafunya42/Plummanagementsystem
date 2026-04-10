/* ═══ PROFILE COMPLETION MODAL ═════════════════════════════════ */

// Check if user just registered and show profile completion modal
function checkAndShowProfileCompletion() {
  const currentUser = JSON.parse(localStorage.getItem('plum_current_user') || 'null');
  if (!currentUser) return;

  const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
  const user = users.find(u => u.id === currentUser.id);
  if (!user) return;

  // Check if profile has been completed already
  const profiles = JSON.parse(localStorage.getItem('plum_profiles') || '{}');
  if (profiles[currentUser.id]) return; // Profile already completed

  // Check if this is a new registration (within last 2 minutes)
  const createdAt = new Date(user.createdAt).getTime();
  const now = Date.now();
  if (now - createdAt < 120000) { // 2 minutes
    showProfileCompletionModal();
  }
}

function showProfileCompletionModal() {
  const modal = document.getElementById('profileCompletionModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeProfileCompletion() {
  const modal = document.getElementById('profileCompletionModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function skipProfileCompletion() {
  closeProfileCompletion();
  // User can complete later
  showToast('You can complete your profile anytime from the settings.', 'info');
}

function submitProfileCompletion(event) {
  event.preventDefault();

  const currentUser = JSON.parse(localStorage.getItem('plum_current_user'));
  const userType = currentUser.userType || 'artist';

  // Collect personal information
  const personalInfo = {
    firstName: document.getElementById('profFirstName')?.value || '',
    lastName: document.getElementById('profLastName')?.value || '',
    phone: document.getElementById('profPhone')?.value || '',
    address: document.getElementById('profAddress')?.value || '',
    city: document.getElementById('profCity')?.value || '',
    country: document.getElementById('profCountry')?.value || '',
    bio: document.getElementById('profBio')?.value || '',
    profilePhoto: document.getElementById('profPhoto')?.value || '',
  };

  // Collect financial information
  const financialInfo = {
    bankName: document.getElementById('profBankName')?.value || '',
    accountHolderName: document.getElementById('profAccountHolder')?.value || '',
    accountNumber: document.getElementById('profAccountNumber')?.value || '',
    routingNumber: document.getElementById('profRoutingNumber')?.value || '',
    bankCode: document.getElementById('profBankCode')?.value || '',
    paymentMethod: document.getElementById('profPaymentMethod')?.value || 'bank_transfer',
    currency: document.getElementById('profCurrency')?.value || 'USD',
    taxId: document.getElementById('profTaxId')?.value || '',
  };

  // Collect role-specific information
  let roleSpecificInfo = {};
  if (userType === 'artist') {
    roleSpecificInfo = {
      stageName: document.getElementById('profStageName')?.value || '',
      genre: document.getElementById('profGenre')?.value || '',
      experience: document.getElementById('profExperience')?.value || '',
      rateAmount: document.getElementById('profRateAmount')?.value || '',
      rateCurrency: document.getElementById('profRateCurrency')?.value || 'USD',
      portfolio: document.getElementById('profPortfolio')?.value || '',
      equipment: document.getElementById('profEquipment')?.value || '',
    };
  } else {
    roleSpecificInfo = {
      organizationName: document.getElementById('profOrgName')?.value || '',
      organizationType: document.getElementById('profOrgType')?.value || '',
      website: document.getElementById('profWebsite')?.value || '',
      socialMedia: document.getElementById('profSocialMedia')?.value || '',
      eventsPerYear: document.getElementById('profEventsPerYear')?.value || '',
      budget: document.getElementById('profBudget')?.value || '',
    };
  }

  // Validate required fields
  if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.phone) {
    showToast('Please fill in all required personal information.', 'error');
    return;
  }

  if (!financialInfo.bankName || !financialInfo.accountHolderName || !financialInfo.accountNumber) {
    showToast('Please fill in all required financial information.', 'error');
    return;
  }

  // Create complete profile object
  const profileData = {
    userId: currentUser.id,
    userEmail: currentUser.email,
    userType: userType,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    profileCompleted: true,
    personalInfo,
    financialInfo,
    roleSpecificInfo,
  };

  // Store profile data
  const profiles = JSON.parse(localStorage.getItem('plum_profiles') || '{}');
  profiles[currentUser.id] = profileData;
  localStorage.setItem('plum_profiles', JSON.stringify(profiles));

  // Update user object with profile completion flag
  const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex].profileCompleted = true;
    users[userIndex].profileCompletedAt = new Date().toISOString();
    localStorage.setItem('plum_users', JSON.stringify(users));
  }

  closeProfileCompletion();
  showToast('🎉 Profile completed successfully!', 'success');

  // Reload page to reflect changes
  setTimeout(() => {
    location.reload();
  }, 1500);
}

// Display profile information on user profile pages
function displayProfileInfo() {
  const currentUser = JSON.parse(localStorage.getItem('plum_current_user') || 'null');
  if (!currentUser) return;

  const profiles = JSON.parse(localStorage.getItem('plum_profiles') || '{}');
  const profile = profiles[currentUser.id];

  if (!profile) {
    // Show incomplete profile warning
    const warning = document.createElement('div');
    warning.innerHTML = `
      <div style="background: #FFF3CD; border: 1px solid #FFC107; border-radius: 8px; padding: 16px; margin: 16px 0; color: #856404; display: flex; align-items: center; gap: 12px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2v2m0-4h-2V7h2v6z"/>
        </svg>
        <div>
          <strong>Complete Your Profile</strong>
          <p style="margin: 4px 0 0 0; font-size: 14px;">Your profile is incomplete. Complete it to unlock full access to features.</p>
        </div>
      </div>
    `;
    const profileHeaderEl = document.querySelector('.profile-header');
    if (profileHeaderEl) {
      profileHeaderEl.insertAdjacentElement('afterend', warning);
    }
    return;
  }

  // Display profile sections
  const personalInfo = profile.personalInfo;
  const financialInfo = profile.financialInfo;
  const roleSpecificInfo = profile.roleSpecificInfo;

  // Create and display profile data
  const profileDataDiv = document.createElement('div');
  profileDataDiv.style.cssText = `
    background: var(--bg3, #180F2C);
    border: 1px solid var(--bd, rgba(139,46,200,.22));
    border-radius: 16px;
    padding: 24px;
    margin: 16px 0;
  `;

  profileDataDiv.innerHTML = `
    <div>
      <h2 style="color: var(--iv, #F0EAF8); margin: 0 0 16px 0; font-size: 1.3rem;">Profile Information</h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
        <div>
          <h3 style="color: var(--l, #AADC00); font-size: 1rem; margin: 0 0 12px 0; border-bottom: 1px solid var(--bd, rgba(139,46,200,.22)); padding-bottom: 8px;">Personal Information</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 6px 0; color: var(--id, #A898C0);"><strong style="color: var(--iv, #F0EAF8);">Phone:</strong> ${personalInfo.phone || 'Not provided'}</li>
            <li style="padding: 6px 0; color: var(--id, #A898C0);"><strong style="color: var(--iv, #F0EAF8);">Location:</strong> ${personalInfo.city ? personalInfo.city + ', ' + personalInfo.country : 'Not provided'}</li>
            ${personalInfo.bio ? `<li style="padding: 6px 0; color: var(--id, #A898C0);"><strong style="color: var(--iv, #F0EAF8);">Bio:</strong> ${personalInfo.bio}</li>` : ''}
          </ul>
        </div>
        
        <div>
          <h3 style="color: var(--l, #AADC00); font-size: 1rem; margin: 0 0 12px 0; border-bottom: 1px solid var(--bd, rgba(139,46,200,.22)); padding-bottom: 8px;">Payment Details</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 6px 0; color: var(--id, #A898C0);"><strong style="color: var(--iv, #F0EAF8);">Bank:</strong> ${financialInfo.bankName || 'Not provided'}</li>
            <li style="padding: 6px 0; color: var(--id, #A898C0);"><strong style="color: var(--iv, #F0EAF8);">Account Holder:</strong> ${financialInfo.accountHolderName || 'Not provided'}</li>
            <li style="padding: 6px 0; color: var(--id, #A898C0);"><strong style="color: var(--iv, #F0EAF8);">Country:</strong> ${financialInfo.currency || 'Not provided'}</li>
            <li style="padding: 6px 0; color: var(--id, #A898C0);"><strong style="color: var(--iv, #F0EAF8);">Payment Method:</strong> ${financialInfo.paymentMethod ? financialInfo.paymentMethod.replace(/_/g, ' ').toUpperCase() : 'Not provided'}</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  const profileHeaderEl = document.querySelector('.profile-header');
  if (profileHeaderEl) {
    profileHeaderEl.insertAdjacentElement('afterend', profileDataDiv);
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animation styles if not present
if (!document.querySelector('style[data-profile-completion]')) {
  const style = document.createElement('style');
  style.setAttribute('data-profile-completion', 'true');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: var(--bg2, #0F0A1C);
      border: 1px solid var(--bd, rgba(139,46,200,.22));
      border-radius: 20px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 32px;
      box-shadow: 0 24px 64px rgba(0,0,0,.6);
    }

    .modal-header {
      margin-bottom: 28px;
      text-align: center;
    }

    .modal-header h2 {
      font-size: 1.8rem;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      color: var(--iv, #F0EAF8);
      margin-bottom: 8px;
    }

    .modal-header p {
      color: var(--id, #A898C0);
      font-size: 0.95rem;
    }

    .form-section {
      margin-bottom: 28px;
    }

    .form-section h3 {
      font-size: 1.1rem;
      color: var(--iv, #F0EAF8);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--bd, rgba(139,46,200,.22));
      font-family: 'Syne', sans-serif;
      font-weight: 700;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row.full {
      grid-template-columns: 1fr;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--iv, #F0EAF8);
      margin-bottom: 6px;
      display: flex;
      gap: 4px;
    }

    .form-group label .required {
      color: #EF4444;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 10px 14px;
      border: 1px solid var(--bd, rgba(139,46,200,.22));
      border-radius: 8px;
      background: var(--bg3, #180F2C);
      color: var(--iv, #F0EAF8);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--l, #AADC00);
      box-shadow: 0 0 0 3px rgba(170,220,0,.15);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 28px;
    }

    .btn-submit {
      flex: 1;
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--p, #8B2EC8), var(--p2, #B06CE6));
      color: #fff;
      border: none;
      border-radius: 100px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 6px 22px rgba(139,46,200,.38);
    }

    .btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(139,46,200,.5);
    }

    .btn-skip {
      padding: 12px 24px;
      background: transparent;
      color: var(--id, #A898C0);
      border: 1px solid var(--bd, rgba(139,46,200,.22));
      border-radius: 100px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-skip:hover {
      border-color: var(--id, #A898C0);
      color: var(--iv, #F0EAF8);
    }

    @media (max-width: 600px) {
      .modal-content {
        width: 95%;
        padding: 24px;
        margin: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-header h2 {
        font-size: 1.4rem;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  checkAndShowProfileCompletion();
  displayProfileInfo();
});
