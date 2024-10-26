// A script that generates a static list of thirukkurals with english translation with them

async function setKural() {
  const kuralElement = document.getElementById("kural");
  const explanationElement = document.getElementById("explanation");
  const mvElement = document.getElementById("mv");
  const numberElement = document.getElementById("number");

  try {
    const response = await fetch("thirukkural.json");
    const data = await response.json();
    const totalKurals = data.kural.length;
    const randomIndex = Math.floor(Math.random() * totalKurals);
    const kural = data.kural[randomIndex];

    kuralElement.innerHTML = `${kural.Line1}<br>${kural.Line2}`;
    explanationElement.innerHTML = kural.explanation;
    mvElement.innerHTML = kural.mv;
    numberElement.innerHTML = `${kural.Number}`;
  } catch (error) {
    console.error("Error loading Thirukkural:", error);
    kuralElement.innerHTML = "Failed to load Thirukkural";
    explanationElement.innerHTML = "";
    mvElement.innerHTML = "";
    numberElement.innerHTML = "";
  }
}

setKural();
