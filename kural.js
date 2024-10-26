// A script that generates a static list of thirukkurals with english translation with them

async function setKural() {
  const kuralElement = document.getElementById("kural");
  const explanationElement = document.getElementById("explanation");
  const mvElement = document.getElementById("mv");
  const numberElement = document.getElementById("number");
  const metadataElement = document.getElementById("metadata");

  try {
    const [kuralResponse, metadataResponse] = await Promise.all([
      fetch("thirukkural.json"),
      fetch("metadata.json"),
    ]);
    const kuralData = await kuralResponse.json();
    const metadataData = await metadataResponse.json();
    const totalKurals = kuralData.kural.length;
    const randomIndex = Math.floor(Math.random() * totalKurals);
    const kural = kuralData.kural[randomIndex];

    kuralElement.innerHTML = `<div>${kural.Line1}</div><div>${kural.Line2}</div>`;
    explanationElement.innerHTML = kural.explanation;
    mvElement.innerHTML = kural.mv;

    // Find the metadata for this kural
    const kuralMetadata = findKuralMetadata(metadataData[0], kural.Number);

    // Display kural number and metadata
    numberElement.innerHTML = `${kural.Number}`;
    metadataElement.innerHTML = `
      <div>${kuralMetadata.section.name} – ${kuralMetadata.section.tamil}</div>
      <div><a href="https://thirukkural.gokulnath.com/#/thirukkuralchapters/${kuralMetadata.chapter.number}/thirukkurals" target="_blank">${kuralMetadata.chapter.name} – ${kuralMetadata.chapter.tamil}</a></div>
    `;

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

setKural();
