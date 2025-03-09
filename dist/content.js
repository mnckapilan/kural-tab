/******/ (() => { // webpackBootstrap
/*!************************!*\
  !*** ./src/content.js ***!
  \************************/
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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHFDQUFxQyxZQUFZLGFBQWEsWUFBWTtBQUMxRTtBQUNBOztBQUVBOztBQUVBLGlDQUFpQyxhQUFhO0FBQzlDO0FBQ0EseUVBQXlFLDZCQUE2QjtBQUN0RywrQkFBK0IsNkJBQTZCLElBQUksMkJBQTJCO0FBQzNGLCtCQUErQiw2QkFBNkIsSUFBSSwyQkFBMkI7QUFDM0Y7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxTQUFTO0FBQ2xELGlDQUFpQyxTQUFTO0FBQzFDLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLHVDQUF1QztBQUNwRDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8va3VyYWwtdGFiLy4vc3JjL2NvbnRlbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQSBzY3JpcHQgdGhhdCBnZW5lcmF0ZXMgYSBzdGF0aWMgbGlzdCBvZiB0aGlydWtrdXJhbHMgd2l0aCBlbmdsaXNoIHRyYW5zbGF0aW9uIHdpdGggdGhlbVxuXG5hc3luYyBmdW5jdGlvbiBzZXRLdXJhbCgpIHtcbiAgY29uc3Qga3VyYWxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJrdXJhbFwiKTtcbiAgY29uc3QgZXhwbGFuYXRpb25FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJleHBsYW5hdGlvblwiKTtcbiAgY29uc3QgbXZFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtdlwiKTtcbiAgY29uc3QgbnVtYmVyRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibnVtYmVyXCIpO1xuICBjb25zdCBtZXRhZGF0YUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1ldGFkYXRhXCIpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgW2t1cmFsUmVzcG9uc2UsIG1ldGFkYXRhUmVzcG9uc2VdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgZmV0Y2goXCJkYXRhL3RoaXJ1a2t1cmFsLmpzb25cIiksXG4gICAgICBmZXRjaChcImRhdGEvbWV0YWRhdGEuanNvblwiKSxcbiAgICBdKTtcbiAgICBjb25zdCBrdXJhbERhdGEgPSBhd2FpdCBrdXJhbFJlc3BvbnNlLmpzb24oKTtcbiAgICBjb25zdCBtZXRhZGF0YURhdGEgPSBhd2FpdCBtZXRhZGF0YVJlc3BvbnNlLmpzb24oKTtcbiAgICBjb25zdCB0b3RhbEt1cmFscyA9IGt1cmFsRGF0YS5rdXJhbC5sZW5ndGg7XG4gICAgY29uc3QgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0b3RhbEt1cmFscyk7XG4gICAgY29uc3Qga3VyYWwgPSBrdXJhbERhdGEua3VyYWxbcmFuZG9tSW5kZXhdO1xuXG4gICAga3VyYWxFbGVtZW50LmlubmVySFRNTCA9IGA8ZGl2PiR7a3VyYWwuTGluZTF9PC9kaXY+PGRpdj4ke2t1cmFsLkxpbmUyfTwvZGl2PmA7XG4gICAgZXhwbGFuYXRpb25FbGVtZW50LmlubmVySFRNTCA9IGt1cmFsLmV4cGxhbmF0aW9uO1xuICAgIG12RWxlbWVudC5pbm5lckhUTUwgPSBrdXJhbC5tdjtcblxuICAgIGNvbnN0IGt1cmFsTWV0YWRhdGEgPSBmaW5kS3VyYWxNZXRhZGF0YShtZXRhZGF0YURhdGFbMF0sIGt1cmFsLk51bWJlcik7XG5cbiAgICBudW1iZXJFbGVtZW50LmlubmVySFRNTCA9IGAke2t1cmFsLk51bWJlcn1gO1xuICAgIG1ldGFkYXRhRWxlbWVudC5pbm5lckhUTUwgPSBgXG4gICAgICA8YSBocmVmPVwiaHR0cHM6Ly90aGlydWtrdXJhbC5nb2t1bG5hdGguY29tLyMvdGhpcnVra3VyYWxjaGFwdGVycy8ke2t1cmFsTWV0YWRhdGEuY2hhcHRlci5udW1iZXJ9L3RoaXJ1a2t1cmFsc1wiIHRhcmdldD1cIl9ibGFua1wiIGNsYXNzPVwibWV0YWRhdGEtdHJlZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvblwiPiR7a3VyYWxNZXRhZGF0YS5zZWN0aW9uLnRhbWlsfSDigJMgJHtrdXJhbE1ldGFkYXRhLnNlY3Rpb24ubmFtZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNoYXB0ZXJcIj4ke2t1cmFsTWV0YWRhdGEuY2hhcHRlci50YW1pbH0g4oCTICR7a3VyYWxNZXRhZGF0YS5jaGFwdGVyLm5hbWV9PC9kaXY+XG4gICAgICA8L2E+XG4gICAgYDtcblxuICAgIC8vIFNldCB0aGUgd2lkdGggb2YgZXhwbGFuYXRpb24gYW5kIE1WIGJhc2VkIG9uIHRoZSB3aWRlc3QgS3VyYWwgbGluZVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3Qga3VyYWxMaW5lcyA9IGt1cmFsRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKTtcbiAgICAgIGNvbnN0IG1heFdpZHRoID0gTWF0aC5tYXgoXG4gICAgICAgIGt1cmFsTGluZXNbMF0ub2Zmc2V0V2lkdGgsXG4gICAgICAgIGt1cmFsTGluZXNbMV0ub2Zmc2V0V2lkdGhcbiAgICAgICk7XG4gICAgICBleHBsYW5hdGlvbkVsZW1lbnQuc3R5bGUuaWR0aCA9IGAke21heFdpZHRofXB4YDtcbiAgICAgIG12RWxlbWVudC5zdHlsZS53aWR0aCA9IGAke21heFdpZHRofXB4YDtcbiAgICB9LCAwKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9hZGluZyBUaGlydWtrdXJhbDpcIiwgZXJyb3IpO1xuICAgIGt1cmFsRWxlbWVudC5pbm5lckhUTUwgPSBcIkZhaWxlZCB0byBsb2FkIFRoaXJ1a2t1cmFsXCI7XG4gICAgZXhwbGFuYXRpb25FbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XG4gICAgbXZFbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XG4gICAgbnVtYmVyRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xuICAgIG1ldGFkYXRhRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRLdXJhbE1ldGFkYXRhKG1ldGFkYXRhLCBrdXJhbE51bWJlcikge1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgbWV0YWRhdGEuc2VjdGlvbi5kZXRhaWwpIHtcbiAgICBmb3IgKGNvbnN0IGNoYXB0ZXJHcm91cCBvZiBzZWN0aW9uLmNoYXB0ZXJHcm91cC5kZXRhaWwpIHtcbiAgICAgIGZvciAoY29uc3QgY2hhcHRlciBvZiBjaGFwdGVyR3JvdXAuY2hhcHRlcnMuZGV0YWlsKSB7XG4gICAgICAgIGlmIChrdXJhbE51bWJlciA+PSBjaGFwdGVyLnN0YXJ0ICYmIGt1cmFsTnVtYmVyIDw9IGNoYXB0ZXIuZW5kKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlY3Rpb246IHtcbiAgICAgICAgICAgICAgbmFtZTogc2VjdGlvbi50cmFuc2xhdGlvbixcbiAgICAgICAgICAgICAgdGFtaWw6IHNlY3Rpb24ubmFtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGFwdGVyOiB7XG4gICAgICAgICAgICAgIG5hbWU6IGNoYXB0ZXIudHJhbnNsYXRpb24sXG4gICAgICAgICAgICAgIHRhbWlsOiBjaGFwdGVyLm5hbWUsXG4gICAgICAgICAgICAgIG51bWJlcjogY2hhcHRlci5udW1iZXIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIHNldCB0aGUgaW5pdGlhbCB0aGVtZVxuZnVuY3Rpb24gc2V0SW5pdGlhbFRoZW1lKCkge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJuby10cmFuc2l0aW9uXCIpO1xuICBpZiAoY2hyb21lICYmIGNocm9tZS5zdG9yYWdlICYmIGNocm9tZS5zdG9yYWdlLnN5bmMpIHtcbiAgICBjaHJvbWUuc3RvcmFnZS5zeW5jXG4gICAgICAuZ2V0KFwidGhlbWVcIilcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGlmIChkYXRhLnRoZW1lID09PSBcImxpZ2h0XCIpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJsaWdodC1tb2RlXCIpO1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImRhcmstbW9kZVwiKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGUtc3dpdGNoXCIpLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChcImRhcmstbW9kZVwiKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJsaWdodC1tb2RlXCIpO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kZS1zd2l0Y2hcIikuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZvcmNlIGEgcmVmbG93IGJlZm9yZSByZW1vdmluZyB0aGUgY2xhc3NcbiAgICAgICAgdm9pZCBkb2N1bWVudC5ib2R5Lm9mZnNldFdpZHRoO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJuby10cmFuc2l0aW9uXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGdldHRpbmcgdGhlbWU6XCIsIGVycm9yKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwibm8tdHJhbnNpdGlvblwiKTtcbiAgICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIERlZmF1bHQgdG8gZGFyayBtb2RlIGlmIG5vdCBpbiBhIENocm9tZSBleHRlbnNpb24gY29udGV4dFxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChcImRhcmstbW9kZVwiKTtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJsaWdodC1tb2RlXCIpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kZS1zd2l0Y2hcIikuY2hlY2tlZCA9IGZhbHNlO1xuICAgIC8vIEZvcmNlIGEgcmVmbG93IGJlZm9yZSByZW1vdmluZyB0aGUgY2xhc3NcbiAgICB2b2lkIGRvY3VtZW50LmJvZHkub2Zmc2V0V2lkdGg7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwibm8tdHJhbnNpdGlvblwiKTtcbiAgfVxufVxuXG4vLyBNb2RpZmllZCB0b2dnbGVNb2RlIGZ1bmN0aW9uXG5mdW5jdGlvbiB0b2dnbGVNb2RlKCkge1xuICBjb25zdCBpc0xpZ2h0TW9kZSA9IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImxpZ2h0LW1vZGVcIik7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImRhcmstbW9kZVwiKTtcblxuICAvLyBTYXZlIHRoZSB0aGVtZSBwcmVmZXJlbmNlIGlmIGluIGEgQ2hyb21lIGV4dGVuc2lvbiBjb250ZXh0XG4gIGlmIChjaHJvbWUgJiYgY2hyb21lLnN0b3JhZ2UgJiYgY2hyb21lLnN0b3JhZ2Uuc3luYykge1xuICAgIGNocm9tZS5zdG9yYWdlLnN5bmNcbiAgICAgIC5zZXQoeyB0aGVtZTogaXNMaWdodE1vZGUgPyBcImxpZ2h0XCIgOiBcImRhcmtcIiB9KVxuICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igc2F2aW5nIHRoZW1lOlwiLCBlcnJvcik7XG4gICAgICB9KTtcbiAgfVxufVxuXG4vLyBBZGQgZXZlbnQgbGlzdGVuZXIgZm9yIG1vZGUgdG9nZ2xlXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGUtc3dpdGNoXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdG9nZ2xlTW9kZSk7XG5cbi8vIENhbGwgc2V0SW5pdGlhbFRoZW1lIHdoZW4gdGhlIHBhZ2UgbG9hZHNcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNldEluaXRpYWxUaGVtZSk7XG5cbnNldEt1cmFsKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=