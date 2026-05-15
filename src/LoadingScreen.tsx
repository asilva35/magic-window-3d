import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import gsap from 'gsap'

export function LoadingScreen() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const barFillRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { progress, active } = useProgress()
  const [minTimePassed, setMinTimePassed] = useState(false)
  const dismissed = useRef(false)

  // Minimum display time so the screen never flashes away on cached assets
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), 800)
    return () => clearTimeout(t)
  }, [])

  // Animate progress bar fill
  useEffect(() => {
    if (!barFillRef.current) return
    gsap.to(barFillRef.current, {
      width: `${progress}%`,
      duration: 0.5,
      ease: 'power2.out',
    })
  }, [progress])

  // Dismiss when loading is done and minimum time has passed
  useEffect(() => {
    if (dismissed.current) return
    if (!active && progress >= 100 && minTimePassed) {
      dismissed.current = true
      // Snap bar to full, pause, then wipe the curtain up
      gsap.timeline()
        .to(barFillRef.current, { width: '100%', duration: 0.25, ease: 'power2.out' })
        .to(contentRef.current, { opacity: 0, y: -16, duration: 0.35, ease: 'power2.in' }, '+=0.25')
        .to(overlayRef.current, { yPercent: -100, duration: 0.75, ease: 'expo.inOut' }, '-=0.1')
        .set(overlayRef.current, { display: 'none' })
    }
  }, [active, progress, minTimePassed])

  return (
    <div ref={overlayRef} className="loading-screen">
      <div ref={contentRef} className="loading-screen__content">
        <img
          src="/assets/images/logo.png"
          alt="Magic"
          className="loading-screen__logo"
        />
        <div className="loading-screen__track">
          <div ref={barFillRef} className="loading-screen__fill" />
        </div>
        <p className="loading-screen__label">Loading your configuration…</p>
      </div>
    </div>
  )
}
