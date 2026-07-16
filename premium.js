// =========================
// Navigation
// =========================

function goTo(page) {
  window.location.href = page;
}

// =========================
// Zurück
// =========================

function goBack() {
  window.history.back();
}

// =========================
// Loginstatus
// =========================

function isLoggedIn() {
  return localStorage.getItem("loggedIn") === "true";
}

// =========================
// Benutzername
// =========================

function getUsername() {
  return localStorage.getItem("username") || "Gast";
}

// =========================
// Premium
// =========================

function isPremium() {
  return localStorage.getItem("premium") === "true";
}

// =========================
// Rolle
// =========================

function getRole() {
  return localStorage.getItem("role") || "Gast";
}