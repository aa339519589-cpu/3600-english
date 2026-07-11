export type Section = 'today' | 'grammar' | 'vocabulary' | 'reading'

export type Level = 'basic' | 'middle' | 'advanced'

export interface GrammarChallenge {
  scene: string
  prompt: string
  options: string[]
  answer: string
  nudge: string
  insight: string
  transfer: {
    prompt: string
    options: string[]
    answer: string
  }
  takeaway: string
}

export interface GrammarLesson {
  id: string
  number: string
  level: Level
  title: string
  englishTitle: string
  duration: number
  description: string
  challenge?: GrammarChallenge
}

export interface VocabularyWord {
  id: string
  word: string
  phonetic: string
  partOfSpeech: string
  gloss: string
  level: Level
  sourceIndex: number
}

export interface FeaturedWord {
  word: string
  level: Level
  sentence: string
  translation: string
  choices: string[]
  answer: string
  collocations: string[]
  family: string[]
}

export interface ReadingWord {
  word: string
  gloss: string
}

export interface ReadingArticle {
  id: string
  title: string
  deck: string
  level: Level
  minutes: number
  dateLabel: string
  paragraphs: string[]
  words: ReadingWord[]
  question: string
  choices: string[]
  answer: string
  reflection: string
}

export interface VocabularyProgress {
  stage: number
  seen: number
  correct: number
  dueAt: string
  saved: boolean
  lastSeenAt: string
}

export interface AppProgress {
  version: 1
  preferences: {
    grammarLevel: Level
    vocabularyLevel: Level
    dailyMinutes: number
  }
  activityDates: string[]
  grammar: Record<string, { completed: boolean; attempts: number; correct: number }>
  vocabulary: Record<string, VocabularyProgress>
  reading: Record<string, { completed: boolean; answer: string; savedWords: string[] }>
  resume: { section: Section; itemId?: string }
}
