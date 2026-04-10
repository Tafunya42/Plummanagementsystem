const { getCurrentUser, getUserById, getDashboardPath } = window.PlumPlatform;

function personalizePerformerPage() {
  const currentUser = getCurrentUser();
  const navAccount = document.getElementById('navAccount');
  const heroPrimaryAction = document.getElementById('heroPrimaryAction');
  const dashboardShortcut = document.getElementById('dashboardShortcut');
  if (!currentUser) return;

  const user = getUserById(currentUser.id);
  const label = user?.firstName || user?.stageName || currentUser.email?.split('@')[0] || 'Account';
  const dashboardPath = getDashboardPath(currentUser.userType);

  if (navAccount) {
    navAccount.textContent = `Open ${label}'s Dashboard`;
    navAccount.href = dashboardPath;
  }

  if (heroPrimaryAction) {
    heroPrimaryAction.textContent = 'Open Your Dashboard';
    heroPrimaryAction.href = dashboardPath;
  }

  if (dashboardShortcut) {
    dashboardShortcut.href = dashboardPath;
    dashboardShortcut.textContent = currentUser.userType === 'artist' ? 'Open Artist Dashboard' : 'Open Your Dashboard';
  }
}

document.addEventListener('DOMContentLoaded', personalizePerformerPage);
