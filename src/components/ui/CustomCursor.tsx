'use client'

import { useEffect, useRef, useState } from 'react'
import { useExperienceStore } from '@/lib/store'

/**
 * Custom cursor — small dot + interpolated ring with contextual labels.
 * Automatically disabled on touch devices.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const store = useExperienceStore.getState()
    store.setIsTouch(isTouch)
    store.setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    if (isTouch) return
    setEnabled(true)
    document.documentElement.classList.add('has-custom-cursor')

    const pos = { x: -100, y: -100, rx: -100, ry: -100 }
    let raf = 0

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
    }

    const tick = () => {
      pos.rx += (pos.x - pos.rx) * 0.16
      pos.ry += (pos.y - pos.ry) * 0.16
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%,-50%)`
      if (ring.current) ring.current.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0) translate(-50%,-50%)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', onMove, { passive: true })

    // contextual hover states via event delegation
    const onOver = (e: Event) => {
      const target = (e.target as HTMLElement | null)?.closest?.('[data-cursor]') as HTMLElement | null
      if (target) {
        const type = (target.dataset.cursor || 'open') as 'view' | 'explore' | 'open' | 'link'
        const text = target.dataset.cursorLabel || ''
        useExperienceStore.getState().setCursor(type, text)
      }
    }
    const onOut = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (target?.closest?.('[data-cursor]')) {
        useExperienceStore.getState().setCursor('default')
      }
    }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  const cursorType = useExperienceStore((s) => s.cursorType)
  const cursorLabel = useExperienceStore((s) => s.cursorLabel)

  if (!enabled) return null

  const big = cursorType !== 'default'

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[200] h-[5px] w-[5px] rounded-full bg-white mix-blend-difference transition-opacity duration-300"
        style={{ opacity: big ? 0 : 1 }}
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[199] flex items-center justify-center rounded-full border border-white/70 mix-blend-difference transition-[width,height,background-color,border-color] duration-300 ease-out"
        style={{
          width: big ? 64 : 30,
          height: big ? 64 : 30,
          backgroundColor: big ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)',
        }}
      >
        <span
          ref={label}
          className="select-none font-mono text-[9px] font-semibold tracking-[0.18em] text-black transition-opacity duration-200"
          style={{ opacity: big && cursorLabel ? 1 : 0 }}
        >
          {cursorLabel}
        </span>
      </div>
    </>
  )
}
