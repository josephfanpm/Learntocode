import { useEffect, useState } from 'react'
import { units } from './content'
import { findLesson } from './engine/progress'
import { StoreProvider, useStore } from './store'
import { Home, LINE_COLORS, TopBar, type Go } from './ui/Home'
import { AvatarBuilder } from './ui/Avatar'
import { LessonPlayer } from './ui/LessonPlayer'
import { Onboarding } from './ui/Onboarding'
import { Profile } from './ui/Profile'

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
  const { s } = useStore()
  const [route, go] = useRoute()

  if (!s.onboarded && !route.startsWith('/lesson/')) return <Onboarding go={go} />

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
      {route.startsWith('/me') ? <Profile go={go} /> : route === '/avatar' ? <AvatarBuilder go={go} /> : <Home go={go} />}
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
