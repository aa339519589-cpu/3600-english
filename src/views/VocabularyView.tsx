import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Volume2,
  X,
} from 'lucide-react'
import vocabularyData from '../data/vocabulary.json'
import { featuredWords } from '../data/featuredWords'
import { toDateKey, toggleSavedWord, updateVocabularyProgress } from '../lib/progress'
import type { AppProgress, FeaturedWord, Level, VocabularyWord } from '../types'

const vocabulary = vocabularyData as VocabularyWord[]
const levels: Level[] = ['basic', 'middle', 'advanced']
const PAGE_SIZE = 24
const levelMeta: Record<Level, { label: string; english: string; description: string }> = {
  basic: { label: '基础', english: 'FOUNDATION', description: '日常表达里最常遇见的 1200 词' },
  middle: { label: '中阶', english: 'INTERMEDIATE', description: '叙事与说明文中常见的 1200 词' },
  advanced: { label: '拔高', english: 'STRETCH', description: '深入阅读与表达所需的 1200 词' },
}

function speak(word: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-US'
  utterance.rate = 0.86
  window.speechSynthesis.speak(utterance)
}

function WordDetailDialog({
  word,
  progress,
  setProgress,
  onClose,
}: {
  word: VocabularyWord
  progress: AppProgress
  setProgress: React.Dispatch<React.SetStateAction<AppProgress>>
  onClose: () => void
}) {
  const state = progress.vocabulary[word.id]
  const saved = Boolean(state?.saved)

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="word-dialog" role="dialog" aria-modal="true" aria-labelledby="word-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-heading">
          <span className="word-tier">{levelMeta[word.level].label}</span>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭词条" title="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="word-title-row">
          <div>
            <h2 id="word-detail-title">{word.word}</h2>
            <p>{word.phonetic || '暂无音标'} <span>{word.partOfSpeech}</span></p>
          </div>
          <button className="round-audio-button" type="button" onClick={() => speak(word.word)} aria-label={`朗读 ${word.word}`} title="朗读单词">
            <Volume2 size={20} />
          </button>
        </div>
        <div className="word-meaning">
          <p className="eyebrow">词义</p>
          <p>{word.gloss}</p>
        </div>
        {state && (
          <div className="memory-state">
            <span>遇见 {state.seen} 次</span>
            <span>记忆阶段 {state.stage}/5</span>
            <span>{state.dueAt <= toDateKey() ? '今日可复习' : `${state.dueAt} 再见`}</span>
          </div>
        )}
        <div className="dialog-actions two-up">
          <button className={`secondary-button ${saved ? 'saved' : ''}`} type="button" onClick={() => setProgress((current) => toggleSavedWord(current, word.id))}>
            <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
            {saved ? '已在词本' : '收进词本'}
          </button>
          <button className="primary-button" type="button" onClick={() => setProgress((current) => updateVocabularyProgress(current, word.id, true))}>
            <Check size={17} /> 已经认识
          </button>
        </div>
      </section>
    </div>
  )
}

function WordStudyDialog({
  level,
  setProgress,
  onClose,
}: {
  level: Level
  setProgress: React.Dispatch<React.SetStateAction<AppProgress>>
  onClose: () => void
}) {
  const items = featuredWords.filter((word) => word.level === level)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const item: FeaturedWord | undefined = items[index]
  const isCorrect = selected === item?.answer

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  if (!item) return null

  const goNext = () => {
    const vocabularyWord = vocabulary.find((entry) => entry.word.toLowerCase() === item.word.toLowerCase())
    if (vocabularyWord) {
      setProgress((current) => updateVocabularyProgress(current, vocabularyWord.id, isCorrect))
    }
    if (isCorrect) setCorrectCount((count) => count + 1)
    if (index === items.length - 1) {
      setFinished(true)
    } else {
      setIndex((current) => current + 1)
      setSelected('')
    }
  }

  return (
    <div className="study-overlay" role="presentation">
      <section className="study-dialog word-study-dialog" role="dialog" aria-modal="true" aria-labelledby="word-study-title">
        <header className="study-header">
          <button className="icon-button" type="button" onClick={onClose} aria-label="退出词汇练习" title="退出练习">
            <X size={19} />
          </button>
          <div className="study-progress" aria-label={`词汇进度，第 ${index + 1} 个，共 ${items.length} 个`}>
            <span style={{ width: `${((index + Number(Boolean(selected))) / items.length) * 100}%` }} />
          </div>
          <span className="study-count">{finished ? items.length : index + 1} / {items.length}</span>
        </header>

        {!finished ? (
          <div className="study-body">
            <div className="study-step word-study-step">
              <div className="word-study-kicker">
                <span>{levelMeta[level].label}</span>
                <button className="icon-button" type="button" onClick={() => speak(item.word)} aria-label={`朗读 ${item.word}`} title="朗读单词">
                  <Volume2 size={18} />
                </button>
              </div>
              <p className="eyebrow">先在句子里遇见</p>
              <h2 id="word-study-title" className="context-sentence">
                {item.sentence.split(new RegExp(`(${item.word})`, 'i')).map((part, partIndex) =>
                  part.toLowerCase() === item.word.toLowerCase() ? <mark key={partIndex}>{part}</mark> : part,
                )}
              </h2>
              <p className="sentence-translation">{selected ? item.translation : '先不看翻译，从句境里猜一猜。'}</p>

              <div className="choice-grid three-choices">
                {item.choices.map((choice) => {
                  const state = selected === choice ? (choice === item.answer ? 'correct' : 'wrong') : selected && choice === item.answer ? 'correct quiet' : ''
                  return (
                    <button key={choice} type="button" className={`choice-button ${state}`} disabled={Boolean(selected)} onClick={() => setSelected(choice)}>
                      {choice}
                    </button>
                  )
                })}
              </div>

              {selected && (
                <div className="word-reveal" aria-live="polite">
                  <div>
                    <p className="eyebrow">{isCorrect ? '你读对了这个语境' : `这里更接近“${item.answer}”`}</p>
                    <h3>{item.word}</h3>
                  </div>
                  <div>
                    <span>常见搭配</span>
                    <p>{item.collocations.join(' · ')}</p>
                  </div>
                  <div>
                    <span>词族</span>
                    <p>{item.family.join(' · ')}</p>
                  </div>
                </div>
              )}

              <div className="study-actions">
                <button className="primary-button" type="button" disabled={!selected} onClick={goNext}>
                  {index === items.length - 1 ? '完成这组词' : '去下一个语境'} <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="study-body">
            <div className="study-step completion-step">
              <div className="completion-mark"><CheckCircle2 size={28} /></div>
              <p className="eyebrow">今日 6 词完成</p>
              <h2 id="word-study-title">你在句子里认出了 {correctCount} 个词。</h2>
              <button className="primary-button" type="button" onClick={onClose}>回到词库 <Check size={17} /></button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export function VocabularyView({
  progress,
  setProgress,
}: {
  progress: AppProgress
  setProgress: React.Dispatch<React.SetStateAction<AppProgress>>
}) {
  const [level, setLevel] = useState<Level>(progress.preferences.vocabularyLevel)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [savedOnly, setSavedOnly] = useState(false)
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null)
  const [studying, setStudying] = useState(false)

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return vocabulary.filter((word) => {
      if (savedOnly && !progress.vocabulary[word.id]?.saved) return false
      if (!savedOnly && !normalizedQuery && word.level !== level) return false
      if (!normalizedQuery) return true
      return word.word.toLowerCase().includes(normalizedQuery) || word.gloss.includes(normalizedQuery)
    })
  }, [level, progress.vocabulary, query, savedOnly])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const levelWords = vocabulary.filter((word) => word.level === level)
  const seenCount = levelWords.filter((word) => (progress.vocabulary[word.id]?.seen ?? 0) > 0).length
  const reviewCount = levelWords.filter((word) => {
    const state = progress.vocabulary[word.id]
    return state && state.seen > 0 && state.dueAt <= toDateKey()
  }).length
  const savedCount = Object.values(progress.vocabulary).filter((word) => word.saved).length

  const chooseLevel = (nextLevel: Level) => {
    setLevel(nextLevel)
    setSavedOnly(false)
    setPage(1)
    setProgress((current) => ({
      ...current,
      preferences: { ...current.preferences, vocabularyLevel: nextLevel },
    }))
  }

  return (
    <div className="page vocabulary-page">
      <section className="page-hero vocabulary-hero page-band">
        <div className="page-inner vocabulary-hero-grid">
          <div>
            <p className="eyebrow">3600 WORDS · 词汇</p>
            <h1>在句子里，<br />认出 3600 词。</h1>
          </div>
          <button className="start-session-button" type="button" onClick={() => setStudying(true)}>
            <span><small>今日 · {levelMeta[level].label}</small><strong>开始 6 词</strong></span>
            <ArrowRight size={21} />
          </button>
        </div>
      </section>

      <section className="vocab-controls page-band">
        <div className="page-inner">
          <div className="segmented-control level-control" aria-label="词汇难度">
            {levels.map((item) => (
              <button key={item} type="button" className={!savedOnly && level === item ? 'active' : ''} onClick={() => chooseLevel(item)}>
                <span>{levelMeta[item].label} 1200</span>
              </button>
            ))}
            <button type="button" className={savedOnly ? 'active saved-tab' : 'saved-tab'} onClick={() => { setSavedOnly(true); setPage(1) }}>
              <span>我的词本 {savedCount}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="vocabulary-library page-band">
        <div className="page-inner">
          <div className="vocab-toolbar">
            <div>
              <h2>{query ? `“${query}”的词库结果` : savedOnly ? '留下来，再慢慢读' : levelMeta[level].description}</h2>
            </div>
            <label className="search-field">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(1) }}
                placeholder="搜索英文或中文释义"
                aria-label="搜索词汇"
              />
              {query && <button type="button" onClick={() => { setQuery(''); setPage(1) }} aria-label="清除搜索"><X size={15} /></button>}
            </label>
          </div>

          {!savedOnly && (
            <div className="vocab-stats" aria-label="词汇学习统计">
              <span><strong>{seenCount}</strong> 已遇见</span>
              <span><strong>{reviewCount}</strong> 今日复习</span>
            </div>
          )}

          {visible.length ? (
            <div className="word-grid">
              {visible.map((word) => {
                const state = progress.vocabulary[word.id]
                return (
                  <button className="word-card" type="button" key={word.id} onClick={() => setSelectedWord(word)}>
                    <span className="word-card-topline">
                      <small>{word.partOfSpeech || levelMeta[word.level].label}</small>
                      {state?.saved && <Bookmark size={14} fill="currentColor" aria-label="已收藏" />}
                    </span>
                    <strong>{word.word}</strong>
                    <span className="phonetic">{word.phonetic || ' '}</span>
                    <p>{word.gloss}</p>
                    {state?.seen ? <span className="met-label"><Check size={12} /> 遇见 {state.seen} 次</span> : null}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Bookmark size={24} />
              <h3>{savedOnly ? '词本还是空的' : '没有找到这个词'}</h3>
              <p>{savedOnly ? '在词条或阅读中点一下书签，词会留在这里。' : '试试英文词形，或更短的中文释义。'}</p>
            </div>
          )}

          {filtered.length > PAGE_SIZE && (
            <div className="pagination" aria-label="词汇分页">
              <button className="icon-button" type="button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)} aria-label="上一页" title="上一页">
                <ChevronLeft size={18} />
              </button>
              <span>{safePage} / {pageCount} · 共 {filtered.length} 词</span>
              <button className="icon-button" type="button" disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)} aria-label="下一页" title="下一页">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedWord && (
        <WordDetailDialog word={selectedWord} progress={progress} setProgress={setProgress} onClose={() => setSelectedWord(null)} />
      )}
      {studying && <WordStudyDialog level={level} setProgress={setProgress} onClose={() => setStudying(false)} />}
    </div>
  )
}
