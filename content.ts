

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