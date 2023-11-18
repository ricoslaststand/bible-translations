export type Translation = {
    name: string
}

export type Book = {
    translation: Translation
    name: string    
}

export type Verse  = {
    book: string
    chapterNumber: number
    verseNumber: number
    text: string
}


