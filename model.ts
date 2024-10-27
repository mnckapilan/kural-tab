type Kural = {
    line1: string;
    line2: string;
    explanation_tamil: string;
    explanation_en: string;
    metadata: KuralMetadata;
}

type KuralMetadata = {
    number: number;
    section_tamil: string
    section_en: string;
    chapter_tamil: string;
    chapter_en: string
    chapterLink: URL;
}