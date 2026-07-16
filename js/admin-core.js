(function () {
  'use strict';

  const STORAGE_KEY = 'songCreator.adminControl.v1';
  const OWNER = 'GörnaldoBerlin';
  const PERMISSIONS = [
    'admin_access','view_users','edit_users','delete_users','ban_users',
    'assign_roles','assign_premium','manage_content','manage_packages','manage_shop',
    'view_statistics','view_logs','manage_settings','create_backup','restore_backup'
  ];
  const BASE_ROLES = ['Gast','Benutzer','Premium','Moderator','Administrator','Superadmin','Owner'];
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const id = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch (_) { return fallback; } };

  function defaultRoles() {
    const limited = {
      Gast: [], Benutzer: [], Premium: [],
      Moderator: ['admin_access','view_users','manage_content','view_statistics'],
      Administrator: PERMISSIONS.filter(p => !['delete_users','restore_backup'].includes(p)),
      Superadmin: PERMISSIONS.filter(p => p !== 'restore_backup'), Owner: [...PERMISSIONS]
    };
    return BASE_ROLES.map(name => ({ id: name.toLowerCase(), name, permissions: limited[name], locked: name === 'Owner' }));
  }

  function defaults() {
    return {
      version: 1, migratedAt: null, legacySnapshot: {},
      users: [], roles: defaultRoles(), packages: [], logs: [], backups: [],
      premium: { freeLimits: { themes: 2, default: 2 }, premiumLimits: { themes: -1, default: 5 }, trialDays: 0, monthlyPrice: 0, yearlyPrice: 0, benefits: [] },
      exclusive: { users: [], groups: [], events: [], collections: [] },
      songCreator: { defaultLength: 'mittel', selectionLimit: 5, activeCategories: [], promptRules: '', lyricsRules: '', templates: [], mode: 'standard' },
      coverCreator: { styles: [], resolution: '1024x1024', promptRules: '', colors: [], logos: [], watermark: '', templates: [] },
      ai: { enabled: false, provider: '', model: '', temperature: 0.7, tokenLimit: 2000, systemPrompt: '' },
      shop: { currency: 'EUR', monthlyPrice: 4.99, yearlyPrice: 49.99, trialDays: 29, yearlySavingsText: true, shopEnabled: false, monthlyEnabled: true, yearlyEnabled: true, benefits: ['Unbegrenzte Themen','Bis zu 5 Genres','Bis zu 5 Vocals','Bis zu 5 Stimmungen','Premium Prompt-Pakete','Zukünftige KI-Funktionen','Premium Cover'], description: 'Mehr Freiheit für deine Musik.', promotionalPrice: null, discountPercent: 0, promotionStart: '', promotionEnd: '', coupons: [], discounts: [], stripePlaceholder: '', paypalPlaceholder: '', invoiceStatus: 'vorbereitet', subscriptionStatus: 'inaktiv' },
      settings: { title: 'Song Creator', logo: '', favicon: '', primaryColor: '#21e6ff', accentColor: '#ff3cac', font: 'system-ui', footer: '', contact: '', social: '', language: 'de', appVersion: '1.0.0' },
      counters: { songs: 0, covers: 0 }, activity: { popularThemes: [], popularGenres: [], lastLogins: [] }
    };
  }

  function normalizeRole(role) {
    const match = BASE_ROLES.find(item => item.toLowerCase() === String(role || '').toLowerCase());
    return match || String(role || 'Benutzer');
  }

  function normalizeUser(user) {
    const username = String(user.username || user.name || user.email || '').trim();
    return {
      id: user.id || id('user'), username, email: String(user.email || ''),
      role: normalizeRole(user.role), premium: typeof user.premium === 'boolean' ? user.premium : String(user.role).toLowerCase() === 'premium',
      banned: Boolean(user.banned || user.blocked), createdAt: user.createdAt || user.memberSince || now(),
      lastLogin: user.lastLogin || null, songs: Number(user.songs || user.songsCreated || 0), covers: Number(user.covers || user.coversCreated || 0),
      requiresPasswordReset: Boolean(user.requiresPasswordReset), avatar: String(user.avatar || ''),
      premiumSource: user.premiumSource || null, premiumGrantedBy: user.premiumGrantedBy || null,
      premiumStart: user.premiumStart || null, premiumEnd: user.premiumEnd || null,
      customPermissions: Array.isArray(user.customPermissions) ? [...new Set(user.customPermissions.filter(p => PERMISSIONS.includes(p)))] : [],
      exclusiveAccess: Array.isArray(user.exclusiveAccess) ? user.exclusiveAccess : [], adminNote: String(user.adminNote || '')
    };
  }

  function readLegacyUsers(snapshot) {
    const candidates = ['users','songCreator.users','registeredUsers','appUsers'];
    const result = [];
    candidates.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw !== null) snapshot[key] = raw;
      const value = parse(raw, null);
      const list = Array.isArray(value) ? value : Array.isArray(value?.users) ? value.users : [];
      list.forEach(user => { if (user && typeof user === 'object') result.push(normalizeUser(user)); });
    });
    return result;
  }

  function migrate() {
    const existing = parse(localStorage.getItem(STORAGE_KEY), null);
    if (existing && existing.version) {
      const base = defaults(), merged = Object.assign(base, existing);
      merged.shop = Object.assign(base.shop, existing.shop || {});
      merged.premium = Object.assign(base.premium, existing.premium || {});
      const migrationBackupKey = 'songCreator.adminControl.userSchemaBackup.v1';
      if (localStorage.getItem(migrationBackupKey) === null) localStorage.setItem(migrationBackupKey, JSON.stringify({ timestamp: now(), source: existing }));
      merged.users = (existing.users || []).map(normalizeUser);
      merged.version = 2;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    const state = defaults();
    const keys = ['songCreator.admin.v4','themes','premiumSettings','roles','songCreator.history.v1'];
    keys.forEach(key => { const raw = localStorage.getItem(key); if (raw !== null) state.legacySnapshot[key] = raw; });
    state.users = readLegacyUsers(state.legacySnapshot);
    if (!state.users.some(user => user.username.toLocaleLowerCase('de') === OWNER.toLocaleLowerCase('de'))) {
      state.users.unshift(normalizeUser({ username: OWNER, email: 'owner@songcreator.local', role: 'Owner', premium: true }));
    }
    state.users = state.users.filter((user, index, list) => list.findIndex(other => other.username.toLocaleLowerCase('de') === user.username.toLocaleLowerCase('de')) === index);
    state.migratedAt = now();
    if (localStorage.getItem('songCreator.adminControl.preMigrationBackup.v1') === null) localStorage.setItem('songCreator.adminControl.preMigrationBackup.v1', JSON.stringify({ timestamp: state.migratedAt, legacySnapshot: state.legacySnapshot }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  let state = migrate();
  const listeners = new Set();
  function save(action, target, details) {
    if (action) state.logs.unshift({ id: id('log'), timestamp: now(), user: currentUser(), action, target: target || '', details: details || '' });
    state.logs = state.logs.slice(0, 1000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    listeners.forEach(fn => fn(clone(state)));
  }
  function currentUser() { return localStorage.getItem('username') || 'System'; }
  function currentRole() { return normalizeRole(localStorage.getItem('role') || 'Gast'); }
  const isOwnerName = username => String(username).toLocaleLowerCase('de') === OWNER.toLocaleLowerCase('de');
  function requireOwnerTarget(username) { if (isOwnerName(username)) throw Error('Das geschützte Owner-Konto kann nicht auf diese Weise verändert werden.'); }
  function requirePermission(permission, actorRole = currentRole()) { if (!hasPermission(permission, actorRole)) throw Error('Für diese Aktion fehlt die Berechtigung: ' + permission); }
  function mayAssignOwner(role) { if (String(role || '').toLowerCase() === 'owner') throw Error('Die Owner-Rolle kann nicht über die Benutzerverwaltung vergeben werden.'); }

  function updateUser(username, changes, actorRole = currentRole()) {
    requireOwnerTarget(username); if ('role' in changes) { requirePermission('assign_roles', actorRole); mayAssignOwner(changes.role); }
    if ('premium' in changes || 'premiumStart' in changes || 'premiumEnd' in changes) requirePermission('assign_premium', actorRole);
    if ('banned' in changes) requirePermission('ban_users', actorRole);
    if (Object.keys(changes).some(key => !['role','premium','premiumStart','premiumEnd','premiumSource','premiumGrantedBy','banned'].includes(key))) requirePermission('edit_users', actorRole);
    const user = state.users.find(item => item.username === username); if (!user) throw Error('Benutzer nicht gefunden.');
    if (changes.username && state.users.some(item => item !== user && item.username.toLocaleLowerCase('de') === String(changes.username).trim().toLocaleLowerCase('de'))) throw Error('Dieser Benutzername ist bereits vergeben.');
    const before = Object.fromEntries(Object.keys(changes).map(key => [key, user[key]]));
    Object.assign(user, changes); user.role = normalizeRole(user.role); user.customPermissions = (user.customPermissions || []).filter(p => PERMISSIONS.includes(p));
    save('user.update', username, JSON.stringify({ before, after: Object.fromEntries(Object.keys(changes).map(key => [key, user[key]])) })); return clone(user);
  }
  function deleteUser(username, actorRole = currentRole()) { requireOwnerTarget(username); requirePermission('delete_users', actorRole); state.users = state.users.filter(user => user.username !== username); save('user.delete', username); }
  function grantPremium(username, duration = 'permanent', customEnd = null, actorRole = currentRole()) {
    requireOwnerTarget(username); requirePermission('assign_premium', actorRole); const start = new Date(), durations = { '7d':7,'30d':30,'90d':90,'1y':365 };
    let end = null; if (duration === 'custom') { if (!customEnd) throw Error('Ein Enddatum fehlt.'); end = new Date(customEnd); } else if (durations[duration]) { end = new Date(start); end.setDate(end.getDate() + durations[duration]); }
    return updateUser(username,{ premium:true, premiumSource:'admin', premiumGrantedBy:currentUser(), premiumStart:start.toISOString(), premiumEnd:end ? end.toISOString() : null },actorRole);
  }
  function removePremium(username, actorRole = currentRole()) { requireOwnerTarget(username); requirePermission('assign_premium', actorRole); return updateUser(username,{ premium:false, premiumSource:null, premiumGrantedBy:null, premiumEnd:now() },actorRole); }
  function createRole(name, permissions = []) {
    name = String(name).trim(); if (!name) throw Error('Rollenname fehlt.'); if (state.roles.some(role => role.name.toLowerCase() === name.toLowerCase())) throw Error('Rolle existiert bereits.');
    const role = { id: id('role'), name, permissions: permissions.filter(p => PERMISSIONS.includes(p)), locked: false }; state.roles.push(role); save('role.create', name); return clone(role);
  }
  function updateRole(roleId, changes) {
    const role = state.roles.find(item => item.id === roleId); if (!role) throw Error('Rolle nicht gefunden.'); if (role.name === 'Owner') throw Error('Owner-Rechte sind unveränderlich.');
    if (changes.name) role.name = String(changes.name).trim(); if (changes.permissions) role.permissions = changes.permissions.filter(p => PERMISSIONS.includes(p)); save('role.update', role.name); return clone(role);
  }
  function removeRole(roleId) { const role = state.roles.find(item => item.id === roleId); if (!role) return; if (role.locked || BASE_ROLES.includes(role.name)) throw Error('Systemrollen können nicht gelöscht werden.'); state.roles = state.roles.filter(item => item.id !== roleId); save('role.delete', role.name); }
  function hasPermission(permission, roleName = currentRole(), username = currentUser()) { if (isOwnerName(username) && normalizeRole(roleName) === 'Owner') return true; const role = state.roles.find(item => item.name.toLowerCase() === String(roleName).toLowerCase()); const user = state.users.find(item => item.username === username); return Boolean(role?.permissions.includes(permission) || user?.customPermissions?.includes(permission)); }
  function setSection(section, value) { if (!(section in state)) throw Error('Unbekannter Bereich.'); state[section] = Object.assign(Array.isArray(state[section]) ? [] : {}, state[section], value); save(`${section}.update`, section); }
  function addPackage(pkg) { const item = Object.assign({ id: id('package'), name: 'Neues Paket', premium: false, exclusive: false, users: [], categories: [], preview: '' }, pkg); state.packages.push(item); save('package.create', item.name); return clone(item); }
  function updatePackage(packageId, changes) { const item = state.packages.find(pkg => pkg.id === packageId); if (!item) throw Error('Paket nicht gefunden.'); Object.assign(item, changes); save('package.update', item.name); }
  function removePackage(packageId) { const item = state.packages.find(pkg => pkg.id === packageId); state.packages = state.packages.filter(pkg => pkg.id !== packageId); save('package.delete', item?.name || packageId); }
  function createBackup() { const backup = { id: id('backup'), timestamp: now(), data: clone(state) }; state.backups.unshift({ id: backup.id, timestamp: backup.timestamp }); save('backup.create', backup.id); return backup; }
  function restoreBackup(payload) {
    const incoming = payload?.data || payload; if (!incoming || typeof incoming !== 'object') throw Error('Ungültiges Backup.');
    const owner = state.users.find(user => isOwnerName(user.username)); const next = Object.assign(defaults(), clone(incoming));
    next.users = (next.users || []).filter(user => !isOwnerName(user.username)); next.users.unshift(owner || normalizeUser({ username: OWNER, role: 'Owner', premium: true }));
    next.roles = next.roles || defaultRoles(); const ownerRole = next.roles.find(role => role.name === 'Owner'); if (ownerRole) ownerRole.permissions = [...PERMISSIONS]; else next.roles.push(defaultRoles().find(role => role.name === 'Owner'));
    state = next; save('backup.restore', payload.id || 'Import');
  }
  function exportData() { save('data.export', 'adminControl'); return JSON.stringify({ exportedAt: now(), data: state }, null, 2); }
  function snapshot() { return clone(state); }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  window.AdminCore = Object.freeze({ STORAGE_KEY, OWNER, PERMISSIONS, BASE_ROLES, snapshot, subscribe, currentUser, currentRole, hasPermission, updateUser, deleteUser, grantPremium, removePremium, createRole, updateRole, removeRole, setSection, addPackage, updatePackage, removePackage, createBackup, restoreBackup, exportData, log: save });
}());
