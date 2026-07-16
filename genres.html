// =========================
// Einstellungen
// =========================

const FREE_LIMIT = 2;

// später aus Datenbank
let isPremium = false;

// =========================
// Start
// =========================

window.addEventListener(
  "load",
  () => {

    initOptionCards();
  }
);

// =========================
// Kacheln initialisieren
// =========================

function initOptionCards() {

  if (
    window.SongCreatorUI &&
    window.SongCreatorUI.handlesSelections
  ) {
    return;
  }

  const groups =
    document.querySelectorAll(
      ".option-grid"
    );

  groups.forEach(group => {

    const cards =
      group.querySelectorAll(
        ".option-card"
      );

    cards.forEach(card => {

      card.addEventListener(
        "click",
        function (e) {

          e.preventDefault();

          if (
            card.classList.contains(
              "locked-card"
            )
          ) {

            alert(
              "Dieses Thema ist für deinen Account gesperrt."
            );

            return;
          }

          if (
            card.classList.contains(
              "premium-card"
            ) &&
            !isPremium
          ) {

            alert(
              "Dieses Thema ist nur für Premium verfügbar."
            );

            return;
          }

          toggleCard(
            card,
            cards
          );

        }
      );

    });

  });

}

// =========================
// Auswahl
// =========================

function toggleCard(
  card,
  cards
) {

  const limit =
    isPremium
      ? 999
      : FREE_LIMIT;

  const selected =
    Array.from(cards)
      .filter(c =>
        c.classList.contains(
          "active"
        )
      );

  const active =
    card.classList.contains(
      "active"
    );

  if (active) {

    card.classList.remove(
      "active"
    );

    return;
  }

  if (
    selected.length >=
    limit
  ) {

    alert(
      `Free-Nutzer dürfen maximal ${FREE_LIMIT} auswählen.`
    );

    return;
  }

  card.classList.add(
    "active"
  );
}

// =========================
// Werte holen
// =========================

function getSelectedValues(
  title
) {

  const cards =
    document.querySelectorAll(
      ".auth-card"
    );

  for (
    const card of cards
  ) {

    const heading =
      card.querySelector(
        "h2"
      );

    if (
      !heading
    ) continue;

    if (
      heading.textContent.includes(
        title
      )
    ) {

      return Array
        .from(
          card.querySelectorAll(
            ".option-card.active"
          )
        )
        .map(item =>
          item.textContent
            .replace(
              "💎 ",
              ""
            )
            .replace(
              "🔒 ",
              ""
            )
            .trim()
        );

    }

  }

  return [];

}

// =========================
// Song erstellen
// =========================

function generateSong() {

  const title =
    document.getElementById(
      "songTitle"
    );

  const text =
    document.getElementById(
      "songText"
    );

  if (
    title.value.trim() === ""
  ) {

    alert(
      "Bitte einen Songtitel eingeben."
    );

    return;
  }

  const themes =
    getSelectedValues(
      "Thema"
    );

  const genres =
    getSelectedValues(
      "Genre"
    );

  const moods =
    getSelectedValues(
      "Stimmung"
    );

  const vocals =
    getSelectedValues(
      "Vocals"
    );

  text.value =
`🎵 ${title.value}

Thema:
${themes.join(", ") || "-"}

Genre:
${genres.join(", ") || "-"}

Stimmung:
${moods.join(", ") || "-"}

Vocals:
${vocals.join(", ") || "-"}

[Intro]

Hier erscheint später dein Songtext.

[Verse 1]

Hier erscheint später dein Songtext.

[Hook]

Hier erscheint später die Hook.

[Verse 2]

Hier erscheint später dein Songtext.

[Outro]

Song Creator by GörnaldoBerlin`;

}

// =========================
// Kopieren
// =========================

function copySong() {

  const text =
    document.getElementById(
      "songText"
    );

  if (
    text.value.trim() === ""
  ) {

    alert(
      "Kein Songtext vorhanden."
    );

    return;
  }

  navigator.clipboard
    .writeText(
      text.value
    );

  alert(
    "Songtext kopiert."
  );

}

// =========================
// Speichern
// =========================

function saveSong() {

  alert(
    "Speichern über Supabase folgt später."
  );

}

// =========================
// Export
// =========================

function exportSong() {

  const text =
    document.getElementById(
      "songText"
    );

  const title =
    document.getElementById(
      "songTitle"
    );

  if (
    text.value.trim() === ""
  ) {

    alert(
      "Kein Songtext vorhanden."
    );

    return;
  }

  const blob =
    new Blob(
      [text.value],
      {
        type:
          "text/plain"
      }
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    URL.createObjectURL(
      blob
    );

  link.download =
    `${title.value || "song"}.txt`;

  link.click();

}

// =========================
// Cover
// =========================

function createCover() {

  alert(
    "Cover-Generator folgt später."
  );

}
