// A script that generates a static list of thirukkurals with english translation with them

async function setKural() {
  const kuralElement = document.getElementById("kural");
  const explanationElement = document.getElementById("explanation");
  const mvElement = document.getElementById("mv");
  const numberElement = document.getElementById("number");
  const metadataElement = document.getElementById("metadata");

  try {
    const [kuralResponse, metadataResponse] = await Promise.all([
      fetch("data/thirukkural.json"),
      fetch("data/metadata.json"),
    ]);
    const kuralData = await kuralResponse.json();
    const metadataData = await metadataResponse.json();
    const totalKurals = kuralData.kural.length;
    const randomIndex = Math.floor(Math.random() * totalKurals);
    const kural = kuralData.kural[randomIndex];

    kuralElement.innerHTML = `<div>${kural.Line1}</div><div>${kural.Line2}</div>`;
    explanationElement.innerHTML = kural.explanation;
    mvElement.innerHTML = kural.mv;

    const kuralMetadata = findKuralMetadata(metadataData[0], kural.Number);

    numberElement.innerHTML = `${kural.Number}`;
    metadataElement.innerHTML = `
      <a href="https://thirukkural.gokulnath.com/#/thirukkuralchapters/${kuralMetadata.chapter.number}/thirukkurals" target="_blank" class="metadata-tree">
        <div class="section">${kuralMetadata.section.tamil} – ${kuralMetadata.section.name}</div>
        <div class="chapter">${kuralMetadata.chapter.tamil} – ${kuralMetadata.chapter.name}</div>
      </a>
    `;

    // Set the width of explanation and MV based on the widest Kural line
    setTimeout(() => {
      const kuralLines = kuralElement.getElementsByTagName("div");
      const maxWidth = Math.max(
        kuralLines[0].offsetWidth,
        kuralLines[1].offsetWidth
      );
      explanationElement.style.idth = `${maxWidth}px`;
      mvElement.style.width = `${maxWidth}px`;
    }, 0);
  } catch (error) {
    console.error("Error loading Thirukkural:", error);
    kuralElement.innerHTML = "Failed to load Thirukkural";
    explanationElement.innerHTML = "";
    mvElement.innerHTML = "";
    numberElement.innerHTML = "";
    metadataElement.innerHTML = "";
  }
}

function findKuralMetadata(metadata, kuralNumber) {
  for (const section of metadata.section.detail) {
    for (const chapterGroup of section.chapterGroup.detail) {
      for (const chapter of chapterGroup.chapters.detail) {
        if (kuralNumber >= chapter.start && kuralNumber <= chapter.end) {
          return {
            section: {
              name: section.translation,
              tamil: section.name,
            },
            chapter: {
              name: chapter.translation,
              tamil: chapter.name,
              number: chapter.number,
            },
          };
        }
      }
    }
  }
  return null;
}

// Function to set the initial theme
function setInitialTheme() {
  document.body.classList.add("no-transition");
  if (chrome && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync
      .get("theme")
      .then((data) => {
        if (data.theme === "light") {
          document.body.classList.add("light-mode");
          document.body.classList.remove("dark-mode");
          document.getElementById("mode-switch").checked = true;
        } else {
          document.body.classList.add("dark-mode");
          document.body.classList.remove("light-mode");
          document.getElementById("mode-switch").checked = false;
        }
        // Force a reflow before removing the class
        void document.body.offsetWidth;
        document.body.classList.remove("no-transition");
      })
      .catch((error) => {
        console.error("Error getting theme:", error);
        document.body.classList.remove("no-transition");
      });
  } else {
    // Default to dark mode if not in a Chrome extension context
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    document.getElementById("mode-switch").checked = false;
    // Force a reflow before removing the class
    void document.body.offsetWidth;
    document.body.classList.remove("no-transition");
  }
}

// Modified toggleMode function
function toggleMode() {
  const isLightMode = document.body.classList.toggle("light-mode");
  document.body.classList.toggle("dark-mode");

  // Save the theme preference if in a Chrome extension context
  if (chrome && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync
      .set({ theme: isLightMode ? "light" : "dark" })
      .catch((error) => {
        console.error("Error saving theme:", error);
      });
  }
}

// Add event listener for mode toggle
document.getElementById("mode-switch").addEventListener("change", toggleMode);

// Call setInitialTheme when the page loads
document.addEventListener("DOMContentLoaded", setInitialTheme);

setKural();
