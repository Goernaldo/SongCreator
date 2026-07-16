(function () {
  'use strict';
  const nav = window.AccountNavigation;
  if (!nav) return;
  const current = nav.account();
  const card = document.querySelector('#loginCard');
  if (!card) return;

  card.style.display = '';
  card.querySelector('.icon').textContent = current.loggedIn ? '👤' : '🔐';
  card.querySelector('.text').textContent = current.loggedIn ? 'Mein Profil' : 'Login';
  card.querySelector('.account-summary').textContent = current.loggedIn
    ? current.username + ' · ' + current.role + ' · ' + (current.premium ? 'Premium' : 'Free')
    : 'Anmelden oder Account öffnen';

  const logoutCard = document.querySelector('#logoutCard');
  if (logoutCard) {
    logoutCard.style.display = current.loggedIn ? '' : 'none';
    logoutCard.onclick = nav.logout;
  }
})();
