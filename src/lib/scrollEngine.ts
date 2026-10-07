'use client'

import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCENES, TOTAL_DURATION, clamp01 } from './scenes'

gsap.registerPlugin(ScrollTrigger)

export interface ScrollState {
  /** 0..1 across the whole page */
  progress: number
  sceneIndex: number
  /** index + local progress — used for cross-scene blending */
  sceneFloat: number
  /** 0..1 inside current scene */
  sceneLocal: number
  velocity: number
}

type Listener = (s: ScrollState) => void

const state: ScrollState = { progress: 0, sceneIndex: 0, sceneFloat: 0, sceneLocal: 0, velocity: 0 }
const listeners = new Set<Listener>()

// debug handle (dev convenience)
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__ws = state
}

export function subscribeScroll(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function getScrollState(): ScrollState {
  return state
}

let lenis: Lenis | null = null
let disposed = false

export function getLenis(): Lenis | null {
  return lenis
}

function maxScroll(): number {
  if (typeof document === 'undefined') return 1
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
}

/** Pixel offset of a scene start within the document */
export function sceneStartPx(index: number): number {
  const idx = Math.min(Math.max(0, index), SCENES.length - 1)
  let acc = 0
  for (let i = 0; i < idx; i++) acc += SCENES[i].duration
  return (acc / TOTAL_DURATION) * maxScroll()
}

/** Cinematic camera glide to a scene */
export function scrollToScene(index: number, opts?: { instant?: boolean }) {
  const target = sceneStartPx(index)
  if (opts?.instant) {
    window.scrollTo(0, target)
    return
  }
  if (lenis) {
    const dist = Math.abs(target - lenis.scroll)
    const duration = Math.min(4.2, Math.max(1.6, 1.2 + dist / 2600))
    lenis.scrollTo(target, {
      duration,
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
    })
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
}

function resolveScene(p: number): { index: number; local: number } {
  let acc = 0
  for (let i = 0; i < SCENES.length; i++) {
    const d = SCENES[i].duration / TOTAL_DURATION
    if (p <= acc + d || i === SCENES.length - 1) {
      return { index: i, local: clamp01(d > 0 ? (p - acc) / d : 1) }
    }
    acc += d
  }
  return { index: SCENES.length - 1, local: 1 }
}

function broadcast() {
  const max = maxScroll()
  const p = clamp01((lenis?.scroll ?? window.scrollY) / max)
  const { index, local } = resolveScene(p)
  state.progress = p
  state.sceneIndex = index
  state.sceneLocal = local
  state.sceneFloat = index + local
  listeners.forEach((fn) => {
    try {
      fn(state)
    } catch {
      /* listener errors must never break the loop */
    }
  })
}

export function initScrollEngine(): () => void {
  if (lenis) return () => undefined
  disposed = false

  lenis = new Lenis({
    autoRaf: false,
    duration: 1.35,
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  })

  lenis.on('scroll', (l: Lenis) => {
    ScrollTrigger.update()
    if (disposed) return
    const p = clamp01(l.scroll / maxScroll())
    const { index, local } = resolveScene(p)
    state.progress = p
    state.sceneIndex = index
    state.sceneLocal = local
    state.sceneFloat = index + local
    state.velocity = typeof l.velocity === 'number' ? l.velocity : 0
    listeners.forEach((fn) => {
      try {
        fn(state)
      } catch {
        /* listener errors must never break the loop */
      }
    })
  })

  const tick = (time: number) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // keeps ScrollTrigger measurements in sync with the vh-based scroll track
  const refresh = () => ScrollTrigger.refresh()
  window.addEventListener('load', refresh)
  const refreshT = window.setTimeout(refresh, 600)

  // push initial state (page loads unscrolled — overlays must be visible)
  requestAnimationFrame(() => {
    broadcast()
    window.setTimeout(broadcast, 120)
    window.setTimeout(broadcast, 600)
  })
  window.addEventListener('resize', broadcast)

  return () => {
    disposed = true
    window.removeEventListener('load', refresh)
    window.removeEventListener('resize', broadcast)
    window.clearTimeout(refreshT)
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}
