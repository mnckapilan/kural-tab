// A script that generates a static list of thirukkurals with english translation with them

function hydrateHtml(kural: Kural) {

  const kuralElement: HTMLElement | null = document.getElementById("kural");
  const explanationElement: HTMLElement | null = document.getElementById("explanation");
  const mvElement: HTMLElement | null = document.getElementById("mv");
  const numberElement: HTMLElement | null = document.getElementById("number");
  const metadataElement: HTMLElement | null = document.getElementById("metadata");

  kuralElement.innerHTML = `<div>${kural.line1}</div><div>${kural.line2}</div>`;
  mvElement.innerHTML = kural.explanation_tamil;
  explanationElement.innerHTML = kural.explanation_en;

  numberElement.innerHTML = `${kural.metadata.number}`;
  metadataElement.innerHTML = `
  <a href=${kural.metadata.chapterLink} target="_blank" class="metadata-tree">
    <div class="section">${kural.metadata.section_tamil} – ${kural.metadata.section_en}</div>
    <div class="chapter">${kural.metadata.chapter_tamil} – ${kural.metadata.chapter_en}</div>
  </a>
`;
}

function getRandomKural(): Kural {


  let value = {
    line1L: "string",
    line2: "string",
    explanation_tamil: "string",
    explanation_en: "string",
    metadata: ;
  }

}

async function setKural() {
  const [kuralResponse, metadataResponse] = await Promise.all([
    fetch("content/thirukkural.json"),
    fetch("content/metadata.json"),
  ]);
  const kuralData = await kuralResponse.json();
  const metadataData = await metadataResponse.json();
  const totalKurals = kuralData.kural.length;
  const randomIndex = Math.floor(Math.random() * totalKurals);
  const kural = kuralData.kural[randomIndex];
  // Find the metadata for this kural
  const kuralMetadata = findKuralMetadata(metadataData[0], kural.Number);



  function setWidthStuff() {
    // Set the width of explanation and MV based on the widest Kural line
    setTimeout(() => {
      const kuralLines = kuralElement.getElementsByTagName("div");
      const maxWidth = Math.max(
        kuralLines[0].offsetWidth,
        kuralLines[1].offsetWidth
      );
      explanationElement.style.width = `${maxWidth}px`;
      mvElement.style.width = `${maxWidth}px`;
    }, 0);
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
