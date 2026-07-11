import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Clock3, Feather, Lightbulb, X } from 'lucide-react'
import { grammarLessons, grammarLevelMeta } from '../data/grammar'
import { markGrammarCompleted } from '../lib/progress'
import type { AppProgress, GrammarLesson, Level } from '../types'

const levels: Level[] = ['basic', 'middle', 'advanced']

function GrammarStudyDialog({
  lesson,
  onClose,
  onComplete,
}: {
  lesson: GrammarLesson
  onClose: () => void
  onComplete: (correct: boolean) => void
}) {
  const [phase, setPhase] = useState(0)
  const [selected, setSelected] = useState('')
  const [transferSelected, setTransferSelected] = useState('')
  const [hadWrongAnswer, setHadWrongAnswer] = useState(false)
  const challenge = lesson.challenge!
  const firstCorrect = selected === challenge.answer
  const transferCorrect = transferSelected === challenge.transfer.answer

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const chooseFirst = (option: string) => {
    setSelected(option)
    if (option !== challenge.answer) setHadWrongAnswer(true)
  }

  const chooseTransfer = (option: string) => {
    setTransferSelected(option)
    if (option !== challenge.transfer.answer) setHadWrongAnswer(true)
  }

  const finish = () => {
    onComplete(!hadWrongAnswer)
    setPhase(3)
  }

  return (
    <div className="study-overlay" role="presentation">
      <section className="study-dialog" role="dialog" aria-modal="true" aria-labelledby="grammar-study-title">
        <header className="study-header">
          <button className="icon-button" type="button" onClick={onClose} aria-label="退出课程" title="退出课程">
            <X size={19} />
          </button>
          <div className="study-progress" aria-label={`学习进度，第 ${phase + 1} 步，共 4 步`}>
            <span style={{ width: `${((phase + 1) / 4) * 100}%` }} />
          </div>
          <span className="study-count">{phase + 1} / 4</span>
        </header>

        <div className="study-body">
          {phase === 0 && (
            <div className="study-step">
              <p className="eyebrow">先听感觉</p>
              <h2 id="grammar-study-title">{lesson.title}</h2>
              <p className="scene-copy">{challenge.scene}</p>
              <h3>{challenge.prompt}</h3>
              <div className="choice-list">
                {challenge.options.map((option) => {
                  const isSelected = selected === option
                  const state = isSelected ? (option === challenge.answer ? 'correct' : 'wrong') : ''
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`choice-button ${state}`}
                      onClick={() => chooseFirst(option)}
                    >
                      <span>{option}</span>
                      {state === 'correct' && <Check size={18} />}
                    </button>
                  )
                })}
              </div>
              {selected && (
                <p className={`answer-note ${firstCorrect ? 'correct' : 'wrong'}`} aria-live="polite">
                  {firstCorrect ? '对。现在看差异。' : challenge.nudge}
                </p>
              )}
              <div className="study-actions">
                <button className="primary-button" type="button" disabled={!firstCorrect} onClick={() => setPhase(1)}>
                  看见差异 <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {phase === 1 && (
            <div className="study-step insight-step">
              <p className="eyebrow">再看为什么</p>
              <div className="insight-mark"><Lightbulb size={24} /></div>
              <h2 id="grammar-study-title">为什么</h2>
              <p className="large-reading-copy">{challenge.insight}</p>
              <div className="study-actions split">
                <button className="text-button" type="button" onClick={() => setPhase(0)}>
                  <ArrowLeft size={16} /> 回看情境
                </button>
                <button className="primary-button" type="button" onClick={() => setPhase(2)}>
                  换一个情境 <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {phase === 2 && (
            <div className="study-step">
              <p className="eyebrow">让感觉迁移</p>
              <h2 id="grammar-study-title">不照抄，再走一次</h2>
              <h3>{challenge.transfer.prompt}</h3>
              <div className="choice-list">
                {challenge.transfer.options.map((option) => {
                  const isSelected = transferSelected === option
                  const state = isSelected ? (option === challenge.transfer.answer ? 'correct' : 'wrong') : ''
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`choice-button ${state}`}
                      onClick={() => chooseTransfer(option)}
                    >
                      <span>{option}</span>
                      {state === 'correct' && <Check size={18} />}
                    </button>
                  )
                })}
              </div>
              {transferSelected && (
                <p className={`answer-note ${transferCorrect ? 'correct' : 'wrong'}`} aria-live="polite">
                  {transferCorrect ? '这一次，你是在新的句子里认出了同一种感觉。' : '先回到刚才的差异，再看谁是句子的主角、时间停在哪里。'}
                </p>
              )}
              <div className="study-actions split">
                <button className="text-button" type="button" onClick={() => setPhase(1)}>
                  <ArrowLeft size={16} /> 再看差异
                </button>
                <button className="primary-button" type="button" disabled={!transferCorrect} onClick={finish}>
                  收下这份感觉 <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {phase === 3 && (
            <div className="study-step completion-step">
              <div className="completion-mark"><Feather size={28} /></div>
              <p className="eyebrow">这一小节完成了</p>
              <h2 id="grammar-study-title">{challenge.takeaway}</h2>
              <button className="primary-button" type="button" onClick={onClose}>
                回到课程 <Check size={17} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export function GrammarView({
  progress,
  setProgress,
}: {
  progress: AppProgress
  setProgress: React.Dispatch<React.SetStateAction<AppProgress>>
}) {
  const [level, setLevel] = useState<Level>(progress.preferences.grammarLevel)
  const [activeLesson, setActiveLesson] = useState<GrammarLesson | null>(null)
  const lessons = useMemo(() => grammarLessons.filter((lesson) => lesson.level === level), [level])
  const completed = lessons.filter((lesson) => progress.grammar[lesson.id]?.completed).length
  const meta = grammarLevelMeta[level]

  const chooseLevel = (nextLevel: Level) => {
    setLevel(nextLevel)
    setProgress((current) => ({
      ...current,
      preferences: { ...current.preferences, grammarLevel: nextLevel },
    }))
  }

  return (
    <div className="page grammar-page">
      <section className="page-hero page-band">
        <div className="page-inner hero-row">
          <div>
            <p className="eyebrow">GRAMMAR · 语法</p>
            <h1>听见句子怎么走。</h1>
          </div>
        </div>
      </section>

      <section className="level-band page-band">
        <div className="page-inner">
          <div className="segmented-control level-control" aria-label="语法难度">
            {levels.map((item) => (
              <button key={item} type="button" className={level === item ? 'active' : ''} onClick={() => chooseLevel(item)}>
                <span>{grammarLevelMeta[item].label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grammar-curriculum page-band">
        <div className="page-inner">
          <div className="curriculum-main">
            <div className="section-heading curriculum-heading">
              <div>
                <p className="eyebrow">{meta.label} · {completed}/{lessons.length} 完成</p>
                <h2>{meta.title}</h2>
              </div>
              <div className="linear-progress" aria-label={`${lessons.length} 节中已完成 ${completed} 节`}>
                <span style={{ width: `${(completed / lessons.length) * 100}%` }} />
              </div>
            </div>

            <div className="lesson-list">
              {lessons.map((lesson) => {
                const isDone = Boolean(progress.grammar[lesson.id]?.completed)
                return (
                  <button className="lesson-row" type="button" key={lesson.id} onClick={() => setActiveLesson(lesson)}>
                    <span className="lesson-number">{lesson.number}</span>
                    <span className="lesson-copy">
                      <strong>{lesson.title}</strong>
                    </span>
                    <span className="lesson-meta">
                      <span><Clock3 size={14} /> {lesson.duration} 分钟</span>
                      {isDone ? <CheckCircle2 className="lesson-done" size={21} /> : <Circle size={21} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </section>

      {activeLesson?.challenge && (
        <GrammarStudyDialog
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onComplete={(correct) => setProgress((current) => markGrammarCompleted(current, activeLesson.id, correct))}
        />
      )}
    </div>
  )
}
