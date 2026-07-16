(function () {
  'use strict';

  const ADMIN_ROLES = ['moderator', 'administrator', 'superadmin', 'owner'];
  const SESSION_KEYS = ['loggedIn', 'username', 'email', 'role', 'premium'];
  const ADMIN_STATE_KEY = 'songCreator.adminControl.v1';

  function loggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
  }

  function account() {
    return {
      loggedIn: loggedIn(),
      username: localStorage.getItem('username') || 'Gast',
      email: localStorage.getItem('email') || '',
      role: localStorage.getItem('role') || 'Gast',
      premium: localStorage.getItem('premium') === 'true'
    };
  }

  function adminState() {
    try {
      const value = JSON.parse(localStorage.getItem(ADMIN_STATE_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function canAccessAdmin() {
    const current = account();
    if (!current.loggedIn) return false;
    if (ADMIN_ROLES.includes(current.role.toLocaleLowerCase('de'))) return true;

    const state = adminState();
    const user = Array.isArray(state.users)
      ? state.users.find(item => String(item.username || '').toLocaleLowerCase('de') === current.username.toLocaleLowerCase('de'))
      : null;
    const roleName = String(user?.role || current.role).toLocaleLowerCase('de');
    const role = Array.isArray(state.roles)
      ? state.roles.find(item => String(item.name || '').toLocaleLowerCase('de') === roleName)
      : null;

    return Boolean(
      user?.customPermissions?.includes('admin_access') ||
      role?.permissions?.includes('admin_access')
    );
  }

  function openAccountArea() {
    window.location.href = loggedIn() ? 'profile.html' : 'login.html';
  }

  function logout() {
    SESSION_KEYS.forEach(key => localStorage.removeItem(key));
    window.location.href = 'index.html';
  }

  function guardAdminPage() {
    if (canAccessAdmin()) return true;
    const destination = loggedIn() ? 'profile.html' : 'index.html';
    const showDenied = function () {
      document.body.innerHTML = '<main class="access-denied"><div><span>🔒</span><h1>Zugriff verweigert</h1><p>Du hast keine Berechtigung für das Admin Center.</p><a href="' + destination + '">Zurück</a></div></main>';
      window.setTimeout(function () { window.location.replace(destination); }, 1600);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showDenied, { once: true });
    else showDenied();
    return false;
  }

  function redirectLoggedInFromLogin() {
    if (loggedIn()) {
      window.location.replace('profile.html');
      return true;
    }
    return false;
  }

  window.AccountNavigation = Object.freeze({ account, canAccessAdmin, openAccountArea, logout, guardAdminPage, redirectLoggedInFromLogin });
  window.openAccountArea = openAccountArea;
  window.canAccessAdmin = canAccessAdmin;
})();
