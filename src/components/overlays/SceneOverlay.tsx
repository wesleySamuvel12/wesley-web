'use client'

import { useEffect, useRef, ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCENES, overlayOpacity, sceneLocalFromProgress } from '@/lib/scenes'
import { subscribeScroll } from '@/lib/scrollEngine'
import { useExperienceStore } from '@/lib/store'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

interface SceneOverlayProps {
  index: number
  children: ReactNode
  className?: string
  /** 'ready' reveals the timeline after the loader instead of via scroll sentinel */
  revealOn?: 'scroll' | 'ready'
}

/**
 * Fixed-position overlay bound to one scene:
 * - opacity + parallax drift driven by the scroll engine (direct style, 60fps)
 * - children marked [data-reveal] animate in via GSAP when the scene enters
 */
export default function SceneOverlay({ index, children, className, revealOn = 'scroll' }: SceneOverlayProps) {
  const root = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const cfg = SCENES[index]
    const el = root.current
    if (!cfg || !el) return
    const isLast = index === SCENES.length - 1
    const unsub = subscribeScroll((s) => {
      const local = sceneLocalFromProgress(s.progress, index)
      const op = overlayOpacity(cfg, local, isLast)
      el.style.opacity = op.toFixed(3)
      el.style.visibility = op < 0.02 ? 'hidden' : 'visible'
      const y = (0.5 - local) * cfg.overlay.parallax
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`
    })
    return unsub
  }, [index])

  useEffect(() => {
    const el = root.current
    if (!el) return

    const ctx = gsap.context(() => {
      const targets = el.querySelectorAll('[data-reveal]')
      if (targets.length > 0) {
        tl.current = gsap
          .timeline({ paused: true })
          .fromTo(
            targets,
            { y: 48, opacity: 0, filter: 'blur(14px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out', stagger: 0.085 }
          )
      }

      if (revealOn === 'ready') return

      const sentinel = document.getElementById(`sentinel-${index}`)
      if (sentinel && tl.current) {
        ScrollTrigger.create({
          trigger: sentinel,
          start: 'top 74%',
          end: 'bottom 26%',
          onEnter: () => tl.current?.play(),
          onEnterBack: () => tl.current?.play(),
          onLeave: () => tl.current?.reverse(),
          onLeaveBack: () => tl.current?.reverse(),
        })
      }
    }, el)

    return () => ctx.revert()
  }, [index, revealOn])

  const ready = useExperienceStore((s) => s.ready)

  useEffect(() => {
    if (revealOn === 'ready' && ready) {
      const t = window.setTimeout(() => tl.current?.play(), 120)
      return () => window.clearTimeout(t)
    }
  }, [ready, revealOn])

  return (
    <div
      ref={root}
      data-scene-root=""
      className={cn('absolute inset-0 pointer-events-none select-none', className)}
      style={{ opacity: 0 }}
    >
      {children}
    </div>
  )
}
