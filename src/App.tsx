import { useEffect, useState } from 'react'
import { courseUnits, units, type CourseId } from './content'
import { findLesson } from './engine/progress'
import { StoreProvider, useStore } from './store'
import { BottomNav, Home, LINE_COLORS, TopBar, type Go } from './ui/Home'
import { AvatarBuilder } from './ui/Avatar'
import { LessonPlayer } from './ui/LessonPlayer'
import { Onboarding } from './ui/Onboarding'
import { Placement } from './ui/Placement'
import { Profile, Settings } from './ui/Profile'

function useRoute(): [string, Go] {
  const read = () => location.hash.replace(/^#/, '').split('#')[0] || '/'
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go: Go = (r) => {
    location.hash = r
    window.scrollTo(0, 0)
  }
  return [route, go]
}

function Screens() {
  const { s, update } = useStore()
  const [route, go] = useRoute()

  if (!s.onboarded && !route.startsWith('/lesson/')) return <Onboarding go={go} />

  const place = route.match(/^\/place\/(cs|dev|ai)$/)
  if (place) {
    const course = place[1] as CourseId
    const start = (placed: number, c: CourseId) => {
      const cu = courseUnits(c)
      update((p) => ({ ...p, course: c, placed: { ...p.placed, [c]: placed } }))
      // Skipping chapters lands on the first lesson not yet finished; otherwise back to the path.
      if (placed > 0) go(`/lesson/${cu[Math.min(placed, cu.length - 1)].lessons[0].id}`)
      else go('/')
    }
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-6">
        <Placement key={course} course={course} onDone={(n) => start(n, course)} onSwitch={(to) => start(0, to)} />
      </div>
    )
  }

  const m = route.match(/^\/lesson\/([^?]+)(?:\?at=(\d+))?$/)
  if (m) {
    const found = findLesson(units, m[1])
    if (found) {
      const color = LINE_COLORS[units.indexOf(found.unit) % LINE_COLORS.length]
      return <LessonPlayer key={m[1]} lesson={found.lesson} unit={found.unit} color={color} startAt={Number(m[2] ?? 0)} onExit={() => go('/')} onAvatar={() => go('/avatar')} />
    }
  }
  return (
    <>
      <TopBar go={go} />
      {route.startsWith('/me') ? <Profile go={go} /> : route === '/settings' ? <Settings go={go} /> : route === '/avatar' ? <AvatarBuilder go={go} /> : <Home go={go} />}
      <BottomNav route={route} go={go} />
    </>
  )
}

export function App() {
  return (
    <StoreProvider>
      <Screens />
    </StoreProvider>
  )
}
