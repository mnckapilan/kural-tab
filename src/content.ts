interface Kural {
    Line1: string;
    Line2: string;
    explanation: string;
    mv: string;
    Number: number;
}

interface Metadata {
    section: {
        detail: SectionDetail[];
    };
}

interface SectionDetail {
    name: string;
    translation: string;
    chapterGroup: {
        detail: ChapterGroupDetail[];
    };
}

interface ChapterGroupDetail {
    chapters: {
        detail: ChapterDetail[];
    };
}

interface ChapterDetail {
    name: string;
    translation: string;
    number: number;
    start: number;
    end: number;
}

interface KuralMetadata {
    section: {
        name: string;
        tamil: string;
    };
    chapter: {
        name: string;
        tamil: string;
        number: number;
    };
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
    }
    return response.json();
}

async function setKural(): Promise<void> {
    const kuralElement = document.getElementById("kural") as HTMLElement;
    const explanationElement = document.getElementById("explanation") as HTMLElement;
    const mvElement = document.getElementById("mv") as HTMLElement;
    const numberElement = document.getElementById("number") as HTMLElement;
    const metadataElement = document.getElementById("metadata") as HTMLElement;

    try {
        const [kuralData, metadataData] = await Promise.all([
            fetchJson<{ kural: Kural[] }>("data/thirukkural.json"),
            fetchJson<Metadata[]>("data/metadata.json"),
        ]);

        const totalKurals = kuralData.kural.length;
        const randomIndex = Math.floor(Math.random() * totalKurals);
        const kural = kuralData.kural[randomIndex];

        kuralElement.innerHTML = `<div>${kural.Line1}</div><div>${kural.Line2}</div>`;
        explanationElement.innerHTML = kural.explanation;
        mvElement.innerHTML = kural.mv;

        const kuralMetadata = findKuralMetadata(metadataData[0], kural.Number);
        if (kuralMetadata) {
            numberElement.innerHTML = `${kural.Number}`;
            metadataElement.innerHTML = `
                <a href="https://thirukkural.gokulnath.com/#/thirukkuralchapters/${kuralMetadata.chapter.number}/thirukkurals" target="_blank" class="metadata-tree">
                    <div class="section">${kuralMetadata.section.tamil} – ${kuralMetadata.section.name}</div>
                    <div class="chapter">${kuralMetadata.chapter.tamil} – ${kuralMetadata.chapter.name}</div>
                </a>
            `;
        } else {
            metadataElement.innerHTML = "Metadata not found";
        }

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

function findKuralMetadata(metadata: Metadata, kuralNumber: number): KuralMetadata | null {
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

function setInitialTheme(): void {
    document.body.classList.add("no-transition");
    if (chrome?.storage?.sync) {
        chrome.storage.sync.get("theme").then((data) => {
            const theme = data.theme === "light" ? "light-mode" : "dark-mode";
            document.body.classList.add(theme);
            document.body.classList.remove(theme === "light-mode" ? "dark-mode" : "light-mode");
            (document.getElementById("mode-switch") as HTMLInputElement).checked = theme === "light-mode";
            // Force a reflow before removing the class
            void document.body.offsetWidth;
            document.body.classList.remove("no-transition");
        }).catch((error) => {
            console.error("Error getting theme:", error);
            document.body.classList.remove("no-transition");
        });
    } else {
        // Default to dark mode if not in a Chrome extension context
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
        (document.getElementById("mode-switch") as HTMLInputElement).checked = false;
        // Force a reflow before removing the class
        void document.body.offsetWidth;
        document.body.classList.remove("no-transition");
    }
}

function toggleMode(): void {
    const isLightMode = document.body.classList.toggle("light-mode");
    document.body.classList.toggle("dark-mode");

    // Save the theme preference if in a Chrome extension context
    if (chrome?.storage?.sync) {
        chrome.storage.sync.set({ theme: isLightMode ? "light" : "dark" }).catch((error) => {
            console.error("Error saving theme:", error);
        });
    }
}

// Add event listener for mode toggle
(document.getElementById("mode-switch") as HTMLInputElement).addEventListener("change", toggleMode);

// Call setInitialTheme when the page loads
document.addEventListener("DOMContentLoaded", setInitialTheme);

setKural();
