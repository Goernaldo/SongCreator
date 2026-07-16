(function () {
  'use strict';
  const nav = window.AccountNavigation;
  if (!nav || !nav.account().loggedIn) {
    window.location.replace('login.html');
    return;
  }

  const current = nav.account();
  const settings = window.SettingsStore ? SettingsStore.load() : { profile: {} };
  let managed = null;
  let shop = {};
  try {
    const state = JSON.parse(localStorage.getItem('songCreator.adminControl.v1') || '{}');
    managed = state.users?.find(user => String(user.username || '').toLocaleLowerCase('de') === current.username.toLocaleLowerCase('de')) || null;
    shop = state.shop || {};
  } catch (_) {}

  const profile = settings.profile || {};
  const value = (id, text) => { const element = document.getElementById(id); if (element) element.textContent = text || '–'; };
  const date = raw => raw ? new Date(raw).toLocaleDateString('de-DE') : 'Nicht verfügbar';
  const premium = current.premium || Boolean(managed?.premium);

  value('profileUsername', current.username);
  value('profileDisplayName', profile.displayName || current.username);
  value('profileEmail', profile.email || current.email || managed?.email || 'Nicht hinterlegt');
  value('profileRole', managed?.role || current.role);
  value('profilePremium', premium ? 'Premium aktiv' : 'Free Account');
  value('profilePremiumStart', premium ? date(managed?.premiumStart) : '–');
  value('profilePremiumEnd', premium ? (managed?.premiumEnd ? date(managed.premiumEnd) : 'Kein Ablaufdatum') : '–');
  value('profileSince', date(managed?.createdAt || localStorage.getItem('memberSince') || localStorage.getItem('createdAt')));
  value('profileSongs', String(managed?.songs ?? countSongs()));
  value('profileCovers', String(managed?.covers ?? Number(localStorage.getItem('coverCount') || 0)));
  value('profilePlan', premium ? (managed?.premiumEnd ? 'Zeitlich begrenzt' : 'Dauerhaft') : 'Free');
  value('profileRenewal', premium && managed?.premiumEnd ? date(managed.premiumEnd) : 'Keine Verlängerung');
  value('profileBenefits', premium ? ((shop.benefits || []).slice(0, 3).join(' · ') || 'Premium-Inhalte · Premium Cover') : 'Basisfunktionen');

  const avatar = document.getElementById('profileAvatar');
  if (profile.avatar || managed?.avatar) avatar.innerHTML = '<img src="' + escapeAttribute(profile.avatar || managed.avatar) + '" alt="Profilbild">';
  else avatar.textContent = (profile.displayName || current.username || 'G')[0].toUpperCase();

  const adminButton = document.getElementById('profileAdmin');
  adminButton.hidden = !nav.canAccessAdmin();
  document.getElementById('profileLogout').addEventListener('click', nav.logout);
  document.getElementById('profileExport').addEventListener('click', exportData);

  function countSongs() {
    for (const key of ['songCreator.results.v1', 'songCreator.generatedSongs.v2', 'songs']) {
      try { const list = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(list)) return list.length; } catch (_) {}
    }
    return 0;
  }

  function exportData() {
    const data = { exportedAt: new Date().toISOString(), profile: { username: current.username, displayName: profile.displayName || '', email: profile.email || current.email, role: managed?.role || current.role, premium }, settings: { ...settings, credential: null }, creatorData: {} };
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (/^songCreator\.(draft|templates|history|favorites|generatedSongs|lastGenerated)/.test(key)) data.creatorData[key] = localStorage.getItem(key);
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    link.download = 'song-creator-profil-' + Date.now() + '.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function escapeAttribute(value) {
    return String(value).replace(/[&"<>]/g, char => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[char]));
  }
})();
