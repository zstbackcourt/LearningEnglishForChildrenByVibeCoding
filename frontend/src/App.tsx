import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Headphones,
  LockKeyhole,
  Play,
  Sparkles,
  Volume2,
} from 'lucide-react'
import './App.css'

type Lesson = {
  id: string
  unit: string
  title: string
  focus: string
  words: string[]
  durationMinutes: number
  locked: boolean
}

type Course = {
  id: string
  title: string
  subtitle: string
  ageRange: string
  description: string
  lessons: Lesson[]
}

const courseImage =
  'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=bright%20editorial%20educational%20photograph%20for%20a%20children%27s%20English%20learning%20app%2C%20colorful%20classroom%20desk%20with%20alphabet%20cards%2C%20open%20workbook%2C%20headphones%20and%20pencils%2C%20natural%20daylight%2C%20cheerful%20realistic%20scene%2C%20clean%20composition%2C%20no%20text%2C%20no%20logos&image_size=landscape_4_3'

function App() {
  const [course, setCourse] = useState<Course | null>(null)
  const [selectedLessonID, setSelectedLessonID] = useState('')
  const [completedLessonIDs, setCompletedLessonIDs] = useState<string[]>([])
  const [error, setError] = useState('')

  const loadCourse = () => {
    setError('')
    fetch('/api/v1/courses/3l')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`request failed: ${response.status}`)
        }
        return response.json() as Promise<Course>
      })
      .then((data) => {
        setCourse(data)
        setSelectedLessonID((current) => current || data.lessons[0]?.id || '')
      })
      .catch(() => setError('课程暂时无法加载，请稍后重试。'))
  }

  useEffect(loadCourse, [])

  const selectedLesson = useMemo(
    () => course?.lessons.find((lesson) => lesson.id === selectedLessonID),
    [course, selectedLessonID],
  )

  const progress = course
    ? Math.round((completedLessonIDs.length / course.lessons.length) * 100)
    : 0

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.78
    window.speechSynthesis.speak(utterance)
  }

  const completeLesson = () => {
    if (!selectedLesson) {
      return
    }
    setCompletedLessonIDs((current) =>
      current.includes(selectedLesson.id)
        ? current.filter((id) => id !== selectedLesson.id)
        : [...current, selectedLesson.id],
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Little Lingo 首页">
          <span className="brand-mark" aria-hidden="true">
            Ll
          </span>
          <span>Little Lingo</span>
        </a>
        <nav className="topnav" aria-label="主导航">
          <a className="active" href="#course">
            <BookOpen size={18} />
            课程
          </a>
          <a href="#practice">
            <Headphones size={18} />
            练习
          </a>
        </nav>
        <div className="streak" title="连续学习天数">
          <Flame size={18} />
          <strong>3</strong>
          <span>天</span>
        </div>
      </header>

      <main>
        <section className="course-overview" id="course">
          <div className="overview-copy">
            <span className="eyebrow">MY COURSE</span>
            <h1>{course?.title ?? '3L English'}</h1>
            <p>{course?.description ?? '正在准备今天的英语课程…'}</p>
            <div className="course-meta">
              <span>{course?.subtitle ?? '少儿英语启蒙'}</span>
              <span>{course?.ageRange ?? '6-10 岁'}</span>
            </div>
            <div className="progress-block">
              <div className="progress-label">
                <span>学习进度</span>
                <strong>{progress}%</strong>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="课程学习进度"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          <img src={courseImage} alt="摆放着字母卡片、课本和耳机的英语学习桌" />
        </section>

        {error ? (
          <section className="load-state" aria-live="polite">
            <p>{error}</p>
            <button type="button" onClick={loadCourse}>
              重新加载
            </button>
          </section>
        ) : (
          <section className="learning-layout">
            <aside className="lesson-list" aria-label="课程目录">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">COURSE MAP</span>
                  <h2>课程目录</h2>
                </div>
                <span className="lesson-count">{course?.lessons.length ?? 0} 课</span>
              </div>

              <div className="lesson-items">
                {course?.lessons.map((lesson, index) => {
                  const isCompleted = completedLessonIDs.includes(lesson.id)
                  const isSelected = lesson.id === selectedLessonID
                  return (
                    <button
                      className={`lesson-item ${isSelected ? 'selected' : ''}`}
                      key={lesson.id}
                      type="button"
                      disabled={lesson.locked}
                      onClick={() => setSelectedLessonID(lesson.id)}
                    >
                      <span className="lesson-number">
                        {isCompleted ? <Check size={17} /> : String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="lesson-text">
                        <small>{lesson.unit}</small>
                        <strong>{lesson.title}</strong>
                        <span>{lesson.focus}</span>
                      </span>
                      {lesson.locked ? <LockKeyhole size={17} /> : <ChevronRight size={18} />}
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className="lesson-workspace" id="practice">
              {selectedLesson ? (
                <>
                  <div className="workspace-heading">
                    <div>
                      <span className="eyebrow">{selectedLesson.unit}</span>
                      <h2>{selectedLesson.title}</h2>
                      <p>{selectedLesson.focus}</p>
                    </div>
                    <span className="duration">
                      <Clock3 size={16} />
                      {selectedLesson.durationMinutes} 分钟
                    </span>
                  </div>

                  <div className="listen-panel">
                    <div className="activity-icon" aria-hidden="true">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <span>LISTEN &amp; SAY</span>
                      <strong>Hello! I am Mia.</strong>
                      <p>你好！我是 Mia。</p>
                    </div>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="播放示范发音"
                      title="播放示范发音"
                      onClick={() => speak('Hello! I am Mia.')}
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>

                  <div className="word-section">
                    <h3>今日词汇</h3>
                    <div className="word-grid">
                      {selectedLesson.words.map((word) => (
                        <button type="button" key={word} onClick={() => speak(word)}>
                          <span>{word.slice(0, 1).toUpperCase()}</span>
                          <strong>{word}</strong>
                          <Volume2 size={16} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="workspace-actions">
                    <button className="secondary-button" type="button" onClick={() => speak('Hello! I am Mia.')}>
                      <Play size={18} fill="currentColor" />
                      再听一遍
                    </button>
                    <button className="primary-button" type="button" onClick={completeLesson}>
                      {completedLessonIDs.includes(selectedLesson.id) ? (
                        <>
                          <Check size={19} />
                          已完成
                        </>
                      ) : (
                        <>
                          完成本课
                          <ChevronRight size={19} />
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="workspace-empty">正在加载课程…</div>
              )}
            </section>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
