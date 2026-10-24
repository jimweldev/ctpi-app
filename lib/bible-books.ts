/** The 66 books in canonical order. */
const BOOKS = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Songs",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
]

/** Other spellings people type, mapped to the names above. */
const ALIASES: Record<string, string> = {
  psalm: "Psalms",
  "song of solomon": "Song of Songs",
  revelations: "Revelation",
}

const normalize = (name: string) =>
  name.toLowerCase().replace(/\s+/g, " ").trim()

const byName = new Map(BOOKS.map((name, index) => [normalize(name), index]))

// "1 John" in "1 John 3:16": an optional 1-3, then everything up to a number.
const BOOK_PREFIX = /^(?:[1-3]\s*)?[^\d]+/

/**
 * The book a reference like "1 John 3:16" or "psalm 23" is from, with its
 * position in the Bible (`order`). Unknown books keep the typed name and
 * sort after Revelation.
 */
export function getBook(reference: string) {
  const typed = (reference.trim().match(BOOK_PREFIX)?.[0] ?? reference).trim()
  const key = normalize(typed).replace(/^([1-3])(?=\S)/, "$1 ")
  const order = byName.get(normalize(ALIASES[key] ?? key))
  return order === undefined
    ? { name: typed, order: BOOKS.length }
    : { name: BOOKS[order], order }
}

/** Chapter and first verse numbers, for sorting within a book. */
export function getChapterVerse(reference: string) {
  const rest = reference.trim().replace(BOOK_PREFIX, "")
  const [, chapter = "0", verse = "0"] = rest.match(/^(\d+)(?::(\d+))?/) ?? []
  return { chapter: Number(chapter), verse: Number(verse) }
}
