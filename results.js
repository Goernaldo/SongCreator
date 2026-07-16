// =========================
// Passwort anzeigen
// =========================

function togglePassword(inputId) {

  const input =
    document.getElementById(
      inputId
    );

  if (!input) return;

  input.type =
    input.type === "password"
      ? "text"
      : "password";
}

// =========================
// Owner Account
// =========================

const OWNER_ACCOUNT = {

  username:
    "GörnaldoBerlin",

  email:
    "owner@songcreator.local",

  password:
    "BitteSpäterÄndern123",

  role:
    "Owner",

  premium:
    true

};

// =========================
// Registrierung
// =========================

function validateRegister() {

  const username =
    document.getElementById(
      "username"
    );

  const email =
    document.getElementById(
      "email"
    );

  const password =
    document.getElementById(
      "password"
    );

  const password2 =
    document.getElementById(
      "password2"
    );

  const agb =
    document.getElementById(
      "agb"
    );

  if (
    !username.value.trim()
  ) {

    alert(
      "Bitte Benutzername eingeben."
    );

    return;
  }

  if (
    !email.value.includes(
      "@"
    )
  ) {

    alert(
      "Bitte gültige E-Mail eingeben."
    );

    return;
  }

  if (
    password.value.length < 8
  ) {

    alert(
      "Passwort mindestens 8 Zeichen."
    );

    return;
  }

  if (
    password.value !==
    password2.value
  ) {

    alert(
      "Passwörter stimmen nicht überein."
    );

    return;
  }

  if (
    !agb.checked
  ) {

    alert(
      "Bitte AGB akzeptieren."
    );

    return;
  }

  alert(
    "Lokale Registrierung folgt später."
  );

}

// =========================
// Login
// =========================

function validateLogin() {

  const email =
    document.getElementById(
      "email"
    );

  const password =
    document.getElementById(
      "password"
    );

  if (
    email.value.trim() === ""
  ) {

    alert(
      "Bitte Benutzername oder E-Mail eingeben."
    );

    return;
  }

  if (
    password.value.trim() === ""
  ) {

    alert(
      "Bitte Passwort eingeben."
    );

    return;
  }

  // =========================
  // Owner Login
  // =========================

  if (

    (
      email.value.trim() ===
      OWNER_ACCOUNT.username ||

      email.value.trim() ===
      OWNER_ACCOUNT.email

    )

    &&

    password.value ===
    OWNER_ACCOUNT.password

  ) {

    localStorage.setItem(
      "loggedIn",
      "true"
    );

    localStorage.setItem(
      "username",
      OWNER_ACCOUNT.username
    );

    localStorage.setItem(
      "email",
      OWNER_ACCOUNT.email
    );

    localStorage.setItem(
      "role",
      OWNER_ACCOUNT.role
    );

    localStorage.setItem(
      "premium",
      "true"
    );

    alert(
      "Willkommen zurück, Owner!"
    );

    window.location.href =
      "index.html";

    return;
  }

  alert(
    "Benutzername oder Passwort falsch."
  );

}

// =========================
// Logout
// =========================

function logout() {

  localStorage.removeItem(
    "loggedIn"
  );

  localStorage.removeItem(
    "username"
  );

  localStorage.removeItem(
    "email"
  );

  localStorage.removeItem(
    "role"
  );

  localStorage.removeItem(
    "premium"
  );

  window.location.href =
    "login.html";

}

// =========================
// Eingeloggt?
// =========================

function isLoggedIn() {

  return (
    localStorage.getItem(
      "loggedIn"
    ) === "true"
  );

}

// =========================
// Passwort vergessen
// =========================

function sendResetCode() {

  const email =
    document.getElementById(
      "resetEmail"
    );

  if (
    !email.value.includes(
      "@"
    )
  ) {

    alert(
      "Bitte gültige E-Mail eingeben."
    );

    return;
  }

  alert(
    "Reset-Code folgt später über Supabase."
  );

}