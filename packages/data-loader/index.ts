import fs from 'fs'
import * as readline from 'node:readline/promises';

import { Verse } from '../core/index'

const BIBLE_TRANSLATION_FILE_TYPE = '.txt'
const VERSE_INFO_DELIMITER = '--'
const VERSE_BUFFER_LIMIT = 20
const BIBLE_TRANSLATION_FILE_PATH = './packages/data-loader/bible-translations'

const PARSE_BIBLE_TRANSLATION = (translationFile: string): string => {
  return translationFile.replace(BIBLE_TRANSLATION_FILE_TYPE, "")
}

const parseVerseInfo = (verseInfo: string): { book: string, chapterNumber: number, verseNumber: number } => {
  verseInfo = verseInfo.trim()

  const lastSpaceIndex = verseInfo.lastIndexOf(" ")

  const [chapter, verse] = verseInfo.substring(lastSpaceIndex).split(":")

  return {
    book: verseInfo.substring(0, lastSpaceIndex).trim(),
    chapterNumber: Number(chapter),
    verseNumber: Number(verse)
  }
}

const buildVerse = (text: string): Verse => {
    const [verseText, verseInfo] = text.split('--')
    console.log('verseText =', verseText)
    console.log('verseInfo =', verseInfo)

    const { book, chapterNumber, verseNumber } = parseVerseInfo(verseInfo)

    return {
        book: book,
        chapterNumber,
        verseNumber,
        text: verseText.trim()
    }
}

const parseAndStreamVerses = async (filePath: string, translation: string): Promise<void> => {
    let verses: Verse[] = []

    console.log('translation =', translation)

    const readableStream = fs.createReadStream(filePath, 'utf8')

    const rl = readline.createInterface({
      input: readableStream,
    });
  
    let trueLine = ''

    for await (const line of rl) {
      if (line.length > 1) {
        trueLine = trueLine.concat(line)
        if (!line.includes(VERSE_INFO_DELIMITER)) {
          trueLine.concat(line)
          continue
        }

        console.log('line =', line)
        const builtVerse = buildVerse(trueLine)

        console.log('builtVerse =', builtVerse)
        console.log('translation =', translation)

        verses = verses.concat(builtVerse)
      }

      if (verses.length >= VERSE_BUFFER_LIMIT) {
        // TODO: flush to disk
        console.log("flushing to disk")
        verses = []
      }

      trueLine = ''
    }

    readableStream.on('error', function (error: any) {
        console.log(`error: ${error.message}`);
    })

    readableStream.on('end', () => {
        console.log('finished parsing translation')
    })
}

const findAllBibleTranslations = (dir: string): string[] => {
    const translations = fs.readdirSync(dir) as string[]

    return translations.filter((translation: string) => translation.includes(BIBLE_TRANSLATION_FILE_TYPE))
}


const main = async () : Promise<void> => {
    // TODO: add error catch when looking for files
    const bibleTranslations =  findAllBibleTranslations(BIBLE_TRANSLATION_FILE_PATH)
    // console.log('bibleTranslations =', bibleTranslations)

    for (const translation of bibleTranslations) {
        parseAndStreamVerses(`${BIBLE_TRANSLATION_FILE_PATH}/${translation}`, translation)
    }

    return
}

main()
