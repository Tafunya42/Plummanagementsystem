const PlumProfileCompletion = (() => {
  const { DEFAULT_CURRENCY, getCurrentUser, getUsers, saveUsers, getProfiles, saveProfiles } = window.PlumPlatform;

  function currentUserRecord() {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    return getUsers().find(user => user.id === currentUser.id) || null;
  }

  function checkAndShowProfileCompletion() {
    const user = currentUserRecord();
    if (!user) return;
    const profiles = getProfiles();
    if (profiles[user.id]) return;
    if (Date.now() - new Date(user.createdAt).getTime() < 120000) showProfileCompletionModal();
  }

  function showProfileCompletionModal() {
    const modal = document.getElementById('profileCompletionModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('profCurrency')?.value = DEFAULT_CURRENCY;
    document.getElementById('profRateCurrency')?.value = DEFAULT_CURRENCY;
  }

  function closeProfileCompletion() {
    const modal = document.getElementById('profileCompletionModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  function skipProfileCompletion() {
    closeProfileCompletion();
    showToast('You can complete your profile later from your dashboard.', 'info');
  }

  function submitProfileCompletion(event) {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const personalInfo = {
      firstName: document.getElementById('profFirstName')?.value || '',
      lastName: document.getElementById('profLastName')?.value || '',
      phone: document.getElementById('profPhone')?.value || '',
      address: document.getElementById('profAddress')?.value || '',
      city: document.getElementById('profCity')?.value || '',
      country: document.getElementById('profCountry')?.value || '',
      bio: document.getElementById('profBio')?.value || '',
      profilePhoto: document.getElementById('profPhoto')?.value || ''
    };

    const financialInfo = {
      bankName: document.getElementById('profBankName')?.value || '',
      accountHolderName: document.getElementById('profAccountHolder')?.value || '',
      accountNumber: document.getElementById('profAccountNumber')?.value || '',
      routingNumber: document.getElementById('profRoutingNumber')?.value || '',
      bankCode: document.getElementById('profBankCode')?.value || '',
      paymentMethod: document.getElementById('profPaymentMethod')?.value || 'bank_transfer',
      currency: document.getElementById('profCurrency')?.value || DEFAULT_CURRENCY,
      taxId: document.getElementById('profTaxId')?.value || ''
    };

    const roleSpecificInfo = currentUser.userType === 'artist'
      ? {
          stageName: document.getElementById('profStageName')?.value || '',
          genre: document.getElementById('profGenre')?.value || '',
          experience: document.getElementById('profExperience')?.value || '',
          rateAmount: document.getElementById('profRateAmount')?.value || '',
          rateCurrency: document.getElementById('profRateCurrency')?.value || DEFAULT_CURRENCY,
          portfolio: document.getElementById('profPortfolio')?.value || '',
          equipment: document.getElementById('profEquipment')?.value || ''
        }
      : {
          organizationName: document.getElementById('profOrgName')?.value || '',
          organizationType: document.getElementById('profOrgType')?.value || '',
          website: document.getElementById('profWebsite')?.value || '',
          socialMedia: document.getElementById('profSocialMedia')?.value || '',
          eventsPerYear: document.getElementById('profEventsPerYear')?.value || '',
          budget: document.getElementById('profBudget')?.value || ''
        };

    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.phone) return showToast('Please complete the required personal details.', 'error');
    if (!financialInfo.bankName || !financialInfo.accountHolderName || !financialInfo.accountNumber) return showToast('Please complete the required payment details.', 'error');

    const profiles = getProfiles();
    profiles[currentUser.id] = { userId: currentUser.id, userEmail: currentUser.email, userType: currentUser.userType, createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), profileCompleted: true, personalInfo, financialInfo, roleSpecificInfo };
    saveProfiles(profiles);

    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone,
        city: personalInfo.city || users[userIndex].city,
        bio: personalInfo.bio || users[userIndex].bio,
        genre: roleSpecificInfo.genre || users[userIndex].genre,
        rateAmt: roleSpecificInfo.rateAmount || users[userIndex].rateAmt,
        rateCurr: roleSpecificInfo.rateCurrency || users[userIndex].rateCurr,
        orgName: roleSpecificInfo.organizationName || users[userIndex].orgName,
        orgType: roleSpecificInfo.organizationType || users[userIndex].orgType,
        eventsPerYear: roleSpecificInfo.eventsPerYear || users[userIndex].eventsPerYear,
        profileCompleted: true,
        profileCompletedAt: new Date().toISOString()
      };
      saveUsers(users);
    }

    closeProfileCompletion();
    showToast('Profile completed successfully.', 'success');
    setTimeout(() => window.location.reload(), 900);
  }

  function displayProfileInfo() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const profile = getProfiles()[currentUser.id];
    const profileHeader = document.querySelector('.profile-header');
    if (!profileHeader) return;
    document.querySelector('[data-profile-summary="true"]')?.remove();

    if (!profile) {
      const warning = document.createElement('div');
      warning.setAttribute('data-profile-summary', 'true');
      warning.innerHTML = '<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:12px;padding:16px;margin:16px 0;color:#856404;"><strong>Complete Your Profile</strong><p style="margin:4px 0 0 0;font-size:14px;">Add your banking details, service information, and contact info to unlock the full platform workflow.</p></div>';
      profileHeader.insertAdjacentElement('afterend', warning);
      return;
    }

    const personalInfo = profile.personalInfo || {};
    const financialInfo = profile.financialInfo || {};
    const roleSpecificInfo = profile.roleSpecificInfo || {};
    const summary = document.createElement('div');
    summary.setAttribute('data-profile-summary', 'true');
    summary.style.cssText = 'background:var(--bg3,#180F2C);border:1px solid var(--bd,rgba(139,46,200,.22));border-radius:18px;padding:24px;margin:16px 0;';
    summary.innerHTML = `
      <h2 style="color:var(--iv,#F0EAF8);margin:0 0 16px 0;font-size:1.2rem;">Profile Summary</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
        <div><h3 style="color:var(--l,#AADC00);font-size:1rem;margin:0 0 12px 0;">Personal</h3><p style="color:var(--id,#A898C0);margin:0 0 8px 0;"><strong style="color:var(--iv,#F0EAF8);">Phone:</strong> ${personalInfo.phone || 'Not provided'}</p><p style="color:var(--id,#A898C0);margin:0 0 8px 0;"><strong style="color:var(--iv,#F0EAF8);">Location:</strong> ${personalInfo.city ? `${personalInfo.city}, ${personalInfo.country || 'Zambia'}` : 'Not provided'}</p><p style="color:var(--id,#A898C0);margin:0;"><strong style="color:var(--iv,#F0EAF8);">Bio:</strong> ${personalInfo.bio || 'Not provided'}</p></div>
        <div><h3 style="color:var(--l,#AADC00);font-size:1rem;margin:0 0 12px 0;">Payments</h3><p style="color:var(--id,#A898C0);margin:0 0 8px 0;"><strong style="color:var(--iv,#F0EAF8);">Bank:</strong> ${financialInfo.bankName || 'Not provided'}</p><p style="color:var(--id,#A898C0);margin:0 0 8px 0;"><strong style="color:var(--iv,#F0EAF8);">Account Holder:</strong> ${financialInfo.accountHolderName || 'Not provided'}</p><p style="color:var(--id,#A898C0);margin:0 0 8px 0;"><strong style="color:var(--iv,#F0EAF8);">Currency:</strong> ${financialInfo.currency || DEFAULT_CURRENCY}</p><p style="color:var(--id,#A898C0);margin:0;"><strong style="color:var(--iv,#F0EAF8);">Payment Method:</strong> ${(financialInfo.paymentMethod || 'Not provided').replace(/_/g, ' ')}</p></div>
        <div><h3 style="color:var(--l,#AADC00);font-size:1rem;margin:0 0 12px 0;">Business</h3><p style="color:var(--id,#A898C0);margin:0 0 8px 0;"><strong style="color:var(--iv,#F0EAF8);">Primary Focus:</strong> ${roleSpecificInfo.genre || roleSpecificInfo.organizationType || 'Not provided'}</p><p style="color:var(--id,#A898C0);margin:0 0 8px 0;"><strong style="color:var(--iv,#F0EAF8);">Rate Currency:</strong> ${roleSpecificInfo.rateCurrency || DEFAULT_CURRENCY}</p><p style="color:var(--id,#A898C0);margin:0;"><strong style="color:var(--iv,#F0EAF8);">Website / Portfolio:</strong> ${roleSpecificInfo.website || roleSpecificInfo.portfolio || 'Not provided'}</p></div>
      </div>
    `;
    profileHeader.insertAdjacentElement('afterend', summary);
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};color:white;padding:12px 24px;border-radius:8px;font-size:0.9rem;font-weight:600;z-index:10000;box-shadow:0 8px 24px rgba(0,0,0,0.3)`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  return { checkAndShowProfileCompletion, showProfileCompletionModal, closeProfileCompletion, skipProfileCompletion, submitProfileCompletion, displayProfileInfo };
})();

window.checkAndShowProfileCompletion = PlumProfileCompletion.checkAndShowProfileCompletion; window.showProfileCompletionModal = PlumProfileCompletion.showProfileCompletionModal;
window.closeProfileCompletion = PlumProfileCompletion.closeProfileCompletion;
window.skipProfileCompletion = PlumProfileCompletion.skipProfileCompletion;
window.submitProfileCompletion = PlumProfileCompletion.submitProfileCompletion;
window.displayProfileInfo = PlumProfileCompletion.displayProfileInfo;

document.addEventListener('DOMContentLoaded', () => {
  PlumProfileCompletion.checkAndShowProfileCompletion();
  PlumProfileCompletion.displayProfileInfo();
});
