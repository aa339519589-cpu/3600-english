import express from 'express'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const apiOnly = process.argv.includes('--api-only')
const port = Number(process.env.PORT || (apiOnly ? 8799 : 10000))
const vocabulary = JSON.parse(await readFile(path.join(__dirname, 'src/data/vocabulary.json'), 'utf8'))
const vocabularyByWord = new Map(
  vocabulary
    .filter((entry) => /^[a-z][a-z'-]{4,}$/i.test(entry.word))
    .map((entry) => [entry.word.toLowerCase(), entry]),
)

let dailyCache = null

function chicagoDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function splitIntoParagraphs(extract) {
  const cleaned = extract.replace(/\s+/g, ' ').trim()
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) ?? [cleaned]
  const selected = []
  let totalLength = 0
  for (const sentence of sentences) {
    if (totalLength > 1450) break
    const value = sentence.trim()
    if (value.length < 20) continue
    selected.push(value)
    totalLength += value.length
  }

  const paragraphs = []
  for (let index = 0; index < selected.length; index += 3) {
    paragraphs.push(selected.slice(index, index + 3).join(' '))
  }
  return paragraphs.slice(0, 4)
}

function pickReadingWords(text, title) {
  const titleWords = new Set(title.toLowerCase().match(/[a-z'-]+/g) ?? [])
  const candidates = []
  for (const match of text.toLowerCase().matchAll(/\b[a-z][a-z'-]{5,}\b/g)) {
    const word = match[0]
    const entry = vocabularyByWord.get(word)
    if (!entry || titleWords.has(word) || entry.level === 'basic') continue
    if (candidates.some((candidate) => candidate.word === word)) continue
    candidates.push({ word: entry.word, gloss: entry.gloss })
    if (candidates.length === 5) break
  }
  return candidates
}

function shuffleWithDate(items, dateKey) {
  let seed = [...dateKey].reduce((total, char) => total + char.charCodeAt(0), 0)
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    seed = (seed * 9301 + 49297) % 233280
    const swapIndex = Math.floor((seed / 233280) * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

async function fetchDailyReading(dateKey) {
  const [year, month, day] = dateKey.split('-')
  const response = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`, {
    headers: {
      'Api-User-Agent': 'Stillword/2.0 (https://github.com/aa339519589-cpu/3600-english)',
    },
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Wikimedia returned ${response.status}`)
  const feed = await response.json()
  const featured = feed.tfa
  if (!featured?.extract || !featured?.titles?.normalized) throw new Error('Featured article is incomplete')

  const paragraphs = splitIntoParagraphs(featured.extract)
  const correctDescription = featured.description || paragraphs[0].split('.')[0]
  const distractors = (feed.mostread?.articles ?? [])
    .map((article) => article.description)
    .filter((description) => description && description !== correctDescription)
    .slice(0, 2)
  const choices = shuffleWithDate([correctDescription, ...distractors], dateKey)
  const text = paragraphs.join(' ')

  return {
    id: `wiki-${dateKey}-${featured.pageid}`,
    title: featured.titles.normalized,
    deck: featured.description || 'Wikimedia featured article',
    level: 'middle',
    minutes: Math.max(3, Math.ceil(text.split(/\s+/).length / 180)),
    dateLabel: dateKey,
    paragraphs,
    words: pickReadingWords(text, featured.titles.normalized),
    question: 'Which description best matches today’s article?',
    choices,
    answer: correctDescription,
    reflection: '今天的文本来自 Wikimedia 当日精选。明天会换一篇。',
    source: {
      name: 'Wikimedia Featured Article',
      url: featured.content_urls?.desktop?.page || featured.content_urls?.mobile?.page,
    },
    isLive: true,
    publishedDate: dateKey,
  }
}

const app = express()

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, date: chicagoDate() })
})

app.get('/api/daily-reading', async (_request, response) => {
  const dateKey = chicagoDate()
  try {
    if (!dailyCache || dailyCache.dateKey !== dateKey) {
      dailyCache = { dateKey, article: await fetchDailyReading(dateKey) }
    }
    response.set('Cache-Control', 'public, max-age=900, s-maxage=3600')
    response.json(dailyCache.article)
  } catch (error) {
    console.error('[daily-reading]', error instanceof Error ? error.message : error)
    response.status(503).json({ error: 'Daily reading is temporarily unavailable', date: dateKey })
  }
})

if (!apiOnly) {
  const distPath = path.join(__dirname, 'dist')
  app.use(express.static(distPath, { maxAge: '1h' }))
  app.use((request, response, next) => {
    if (request.method !== 'GET' || request.path.startsWith('/api/')) return next()
    return response.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Stillword ${apiOnly ? 'API' : 'web service'} listening on ${port}`)
})
