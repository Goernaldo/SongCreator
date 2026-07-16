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
      shop: { monthlyPrice: 0, yearlyPrice: 0, trialDays: 0, coupons: [], discounts: [], stripePlaceholder: '', paypalPlaceholder: '', invoiceStatus: 'vorbereitet', subscriptionStatus: 'inaktiv' },
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
      role: normalizeRole(user.role), premium: Boolean(user.premium || String(user.role).toLowerCase() === 'premium'),
      banned: Boolean(user.banned || user.blocked), createdAt: user.createdAt || user.memberSince || now(),
      lastLogin: user.lastLogin || null, songs: Number(user.songs || user.songsCreated || 0), covers: Number(user.covers || user.coversCreated || 0),
      requiresPasswordReset: Boolean(user.requiresPasswordReset)
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
    if (existing && existing.version) return Object.assign(defaults(), existing);
    const state = defaults();
    const keys = ['songCreator.admin.v4','themes','premiumSettings','roles','songCreator.history.v1'];
    keys.forEach(key => { const raw = localStorage.getItem(key); if (raw !== null) state.legacySnapshot[key] = raw; });
    state.users = readLegacyUsers(state.legacySnapshot);
    if (!state.users.some(user => user.username.toLocaleLowerCase('de') === OWNER.toLocaleLowerCase('de'))) {
      state.users.unshift(normalizeUser({ username: OWNER, email: 'owner@songcreator.local', role: 'Owner', premium: true }));
    }
    state.users = state.users.filter((user, index, list) => list.findIndex(other => other.username.toLocaleLowerCase('de') === user.username.toLocaleLowerCase('de')) === index);
    state.migratedAt = now();
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
  function currentUser() { return localStorage.getItem('username') || OWNER; }
  function currentRole() { return normalizeRole(localStorage.getItem('role') || 'Owner'); }
  const isOwnerName = username => String(username).toLocaleLowerCase('de') === OWNER.toLocaleLowerCase('de');
  function requireOwnerTarget(username) { if (isOwnerName(username)) throw Error('Der Owner ist geschützt und kann nicht verändert werden.'); }
  function mayAssignOwner(actorRole, role) { if (normalizeRole(role) === 'Owner' && normalizeRole(actorRole) !== 'Owner') throw Error('Nur der Owner darf die Owner-Rolle vergeben.'); }

  function updateUser(username, changes, actorRole = currentRole()) {
    requireOwnerTarget(username); mayAssignOwner(actorRole, changes.role);
    const user = state.users.find(item => item.username === username); if (!user) throw Error('Benutzer nicht gefunden.');
    Object.assign(user, changes); user.role = normalizeRole(user.role); save('user.update', username, Object.keys(changes).join(', ')); return clone(user);
  }
  function deleteUser(username) { requireOwnerTarget(username); state.users = state.users.filter(user => user.username !== username); save('user.delete', username); }
  function createRole(name, permissions = []) {
    name = String(name).trim(); if (!name) throw Error('Rollenname fehlt.'); if (state.roles.some(role => role.name.toLowerCase() === name.toLowerCase())) throw Error('Rolle existiert bereits.');
    const role = { id: id('role'), name, permissions: permissions.filter(p => PERMISSIONS.includes(p)), locked: false }; state.roles.push(role); save('role.create', name); return clone(role);
  }
  function updateRole(roleId, changes) {
    const role = state.roles.find(item => item.id === roleId); if (!role) throw Error('Rolle nicht gefunden.'); if (role.name === 'Owner') throw Error('Owner-Rechte sind unveränderlich.');
    if (changes.name) role.name = String(changes.name).trim(); if (changes.permissions) role.permissions = changes.permissions.filter(p => PERMISSIONS.includes(p)); save('role.update', role.name); return clone(role);
  }
  function removeRole(roleId) { const role = state.roles.find(item => item.id === roleId); if (!role) return; if (role.locked || BASE_ROLES.includes(role.name)) throw Error('Systemrollen können nicht gelöscht werden.'); state.roles = state.roles.filter(item => item.id !== roleId); save('role.delete', role.name); }
  function hasPermission(permission, roleName = currentRole()) { const role = state.roles.find(item => item.name.toLowerCase() === String(roleName).toLowerCase()); return role?.name === 'Owner' || Boolean(role?.permissions.includes(permission)); }
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

  window.AdminCore = Object.freeze({ STORAGE_KEY, OWNER, PERMISSIONS, BASE_ROLES, snapshot, subscribe, currentUser, currentRole, hasPermission, updateUser, deleteUser, createRole, updateRole, removeRole, setSection, addPackage, updatePackage, removePackage, createBackup, restoreBackup, exportData, log: save });
}());
