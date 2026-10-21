'use client'

import { useEffect, useRef, useState } from 'react'
import { useExperienceStore } from '@/lib/store'
import { getScrollState } from '@/lib/scrollEngine'

/**
 * Custom cursor — a small physical rig, not a static sprite:
 *  · dot      — follows the pointer 1:1, breathes while idle
 *  · ring     — trails on a spring, stretches along its motion vector and
 *               banks into direction changes (velocity-driven rotate/scale)
 *  · name     — during the INTRO the signature "WESLEY SAMUVEL" plate glides
 *               behind the cursor with its own heavier lag, tilting with speed
 *  · press    — pressing compresses the rig; release fires a one-shot ripple
 * Contextual labels (VIEW / INSPECT / OPEN) still take over on interactive
 * targets.
 *
 * TOUCH REVEAL — on phones/tablets the same rig is reused as a touch reveal:
 * the rig materialises under the fingertip, follows it with a fast spring
 * (snappy, never sluggish), grows + reveals its label over [data-cursor]
 * targets, and dissolves a beat after lift-off. The intro name plate glides
 * behind the finger exactly like the desktop cursor.
 */

const damp = (cur: number, target: number, lambda: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt))

type Mode = 'none' | 'mouse' | 'touch'

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const pingHost = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>('none')

  const spawnPing = (x: number, y: number) => {
    const host = pingHost.current
    if (!host) return
    const p = document.createElement('span')
    p.className = 'cursor-ping pointer-events-none fixed left-0 top-0 z-[198] h-10 w-10 rounded-full border border-white/60'
    p.style.left = `${x}px`
    p.style.top = `${y}px`
    p.style.transform = 'translate(-50%, -50%)'
    host.appendChild(p)
    p.addEventListener('animationend', () => p.remove(), { once: true })
  }

  /* ------------------------------ desktop ------------------------------ */
  useEffect(() => {
    if (mode !== 'mouse') return
    const store = useExperienceStore.getState()
    store.setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    const pos = { x: -100, y: -100, rx: -100, ry: -100, px: -100, py: -100 }
    const vel = { sv: 0, ang: 0, sx: 0 } // smoothed speed, motion angle, stretch
    const state = { op: 0, pop: 0, pressed: false, hidden: true, last: 0 }
    let raf = 0

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (state.hidden) {
        state.hidden = false
        pos.rx = pos.x
        pos.ry = pos.y
        pos.px = pos.x
        pos.py = pos.y
      }
    }

    const onDown = () => {
      state.pressed = true
    }
    const onUp = () => {
      state.pressed = false
    }

    const onClick = (e: MouseEvent) => spawnPing(e.clientX, e.clientY)

    const onLeave = () => {
      state.hidden = true
    }
    const onEnter = () => {
      state.hidden = false
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, state.last ? (now - state.last) / 1000 : 0.016)
      state.last = now

      // raw pointer velocity (px/frame → smoothed)
      const dx = pos.x - pos.rx
      const dy = pos.y - pos.ry
      const v = Math.hypot(dx, dy) / Math.max(dt, 0.001) * 0.016
      vel.sv = damp(vel.sv, v, 12, dt)
      if (v > 1.2) {
        const targetAng = Math.atan2(dy, dx)
        // take the shortest angular path
        let da = targetAng - vel.ang
        while (da > Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        vel.ang = vel.ang + da * 0.35
      }
      vel.sx = damp(vel.sx, Math.min(vel.sv * 0.012, 0.34), 10, dt)

      pos.rx += dx * 0.16
      pos.ry += dy * 0.16
      pos.px = damp(pos.px, pos.x, 9, dt)
      pos.py = damp(pos.py, pos.y, 9, dt)

      const big = useExperienceStore.getState().cursorType !== 'default'

      // INTRO name plate — visible only inside the intro beat
      const sf = getScrollState().sceneFloat
      const ready = useExperienceStore.getState().ready
      const wantPlate = ready && sf < 0.62 && !big && !state.hidden
      state.pop = damp(state.pop, wantPlate ? 1 : 0, wantPlate ? 7 : 5, dt)

      const pressK = state.pressed ? 0.78 : 1

      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%,-50%) scale(${(big ? 0 : 1) * pressK})`
        dot.current.style.opacity = state.hidden ? '0' : big ? '0' : '1'
      }
      if (ring.current) {
        // stretch along the motion vector; keep the label upright when "big"
        const stretch = big || state.pressed ? 0 : vel.sx
        const rot = stretch > 0.02 ? (vel.ang * 180) / Math.PI : 0
        const sx = (1 + stretch) * pressK
        const sy = (1 - stretch * 0.45) * pressK
        ring.current.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0) translate(-50%,-50%) rotate(${rot}deg) scale(${sx}, ${sy})`
        ring.current.style.opacity = state.hidden ? '0' : '1'
      }
      if (plate.current) {
        // the plate lags behind with its own heavier inertia + speed tilt
        const tilt = Math.max(-8, Math.min(8, dx * 0.22))
        plate.current.style.transform = `translate3d(${pos.px + 26}px, ${pos.py + 30}px, 0) rotate(${tilt}deg) scale(${0.92 + state.pop * 0.08})`
        plate.current.style.opacity = state.pop.toFixed(3)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('click', onClick, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

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
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('click', onClick)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [mode])

  /* ------------------------------- touch ------------------------------- */
  useEffect(() => {
    if (mode !== 'touch') return
    const store = useExperienceStore.getState()
    store.setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    const pos = { x: -100, y: -100, rx: -100, ry: -100, px: -100, py: -100 }
    const vel = { sx: 0, ang: 0 }
    const state = { pop: 0, active: false, fade: 0, last: 0, init: false }

    let raf = 0

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      pos.x = e.clientX
      pos.y = e.clientY
      if (!state.init) {
        state.init = true
        pos.rx = pos.x
        pos.ry = pos.y
        pos.px = pos.x
        pos.py = pos.y
      }
      state.active = true
      state.fade = 0
      spawnPing(pos.x, pos.y)

      // reveal the contextual label straight from the touch target.
      // canvas touches are left alone — the 3D scene sets its own cursor
      // label (SCAN / INSPECT) through its r3f handlers.
      const target = e.target as HTMLElement | null
      const labelled = target?.closest?.('[data-cursor]') as HTMLElement | null
      if (labelled) {
        const type = (labelled.dataset.cursor || 'open') as 'view' | 'explore' | 'open' | 'link'
        useExperienceStore.getState().setCursor(type, labelled.dataset.cursorLabel || '')
      } else if (!(target instanceof HTMLCanvasElement)) {
        useExperienceStore.getState().setCursor('default')
      }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      pos.x = e.clientX
      pos.y = e.clientY
      if (!state.init) {
        state.init = true
        pos.rx = pos.x
        pos.ry = pos.y
        pos.px = pos.x
        pos.py = pos.y
      }
      state.active = true
    }

    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      // keep the rig visible for a beat after lift-off, then dissolve
      state.active = false
      state.fade = 0.7
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, state.last ? (now - state.last) / 1000 : 0.016)
      state.last = now

      if (!state.init) {
        raf = requestAnimationFrame(tick)
        return
      }

      // fade countdown once the finger has lifted
      if (!state.active && state.fade > 0) {
        state.fade = Math.max(0, state.fade - dt)
      }
      const visible = state.active || state.fade > 0
      const vis = state.active ? 1 : state.fade / 0.7

      const dx = pos.x - pos.rx
      const dy = pos.y - pos.ry
      const v = Math.hypot(dx, dy) / Math.max(dt, 0.001) * 0.016
      if (v > 1.2) {
        const targetAng = Math.atan2(dy, dx)
        let da = targetAng - vel.ang
        while (da > Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        vel.ang = vel.ang + da * 0.4
      }
      // fast, responsive springs — touch must never feel sluggish
      vel.sx = damp(vel.sx, Math.min(v * 0.012, 0.34), 14, dt)
      pos.rx += dx * 0.3
      pos.ry += dy * 0.3
      pos.px = damp(pos.px, pos.x, 12, dt)
      pos.py = damp(pos.py, pos.y, 12, dt)

      const big = useExperienceStore.getState().cursorType !== 'default'

      // INTRO name plate — follows the fingertip inside the intro beat
      const sf = getScrollState().sceneFloat
      const ready = useExperienceStore.getState().ready
      const wantPlate = ready && sf < 0.62 && visible && !big
      state.pop = damp(state.pop, wantPlate ? 1 : 0, wantPlate ? 9 : 6, dt)

      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%,-50%) scale(${big ? 0 : 1})`
        dot.current.style.opacity = visible ? (big ? '0' : String(vis)) : '0'
      }
      if (ring.current) {
        const stretch = big ? 0 : vel.sx
        const rot = stretch > 0.02 ? (vel.ang * 180) / Math.PI : 0
        const sx = 1 + stretch
        const sy = 1 - stretch * 0.45
        ring.current.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0) translate(-50%,-50%) rotate(${rot}deg) scale(${sx}, ${sy})`
        ring.current.style.opacity = visible ? String(vis) : '0'
      }
      if (plate.current) {
        const tilt = Math.max(-8, Math.min(8, dx * 0.22))
        plate.current.style.transform = `translate3d(${pos.px + 26}px, ${pos.py + 34}px, 0) rotate(${tilt}deg) scale(${0.92 + state.pop * 0.08})`
        plate.current.style.opacity = state.pop.toFixed(3)
      }

      // release the revealed label once the rig has dissolved
      if (!visible && big) {
        useExperienceStore.getState().setCursor('default')
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })

    // dev probe — live access to the touch rig's internal state
    ;(window as unknown as Record<string, unknown>).__touchRig = { state, pos }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      useExperienceStore.getState().setCursor('default')
    }
  }, [mode])

  /* --------------------------- mode detection --------------------------- */
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    useExperienceStore.getState().setIsTouch(isTouch)
    setMode(isTouch ? 'touch' : 'mouse')
    if (!isTouch) document.documentElement.classList.add('has-custom-cursor')
    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  const cursorLabel = useExperienceStore((s) => s.cursorLabel)
  const cursorType = useExperienceStore((s) => s.cursorType)

  if (mode === 'none') return null

  const big = cursorType !== 'default'

  return (
    <>
      <div ref={pingHost} className="pointer-events-none fixed inset-0 z-[198]" aria-hidden="true" />

      <div
        ref={dot}
        className="cursor-dot-idle pointer-events-none fixed left-0 top-0 z-[200] h-[5px] w-[5px] rounded-full bg-white mix-blend-difference"
        style={{ opacity: 0 }}
        aria-hidden="true"
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[199] flex items-center justify-center rounded-full border border-white/70 mix-blend-difference transition-[width,height,background-color,border-color] duration-300 ease-out"
        style={{ width: big ? 64 : 30, height: big ? 64 : 30, backgroundColor: big ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)', opacity: 0 }}
        aria-hidden="true"
      >
        <span className="select-none font-mono text-[9px] font-semibold tracking-[0.18em] text-black transition-opacity duration-200" style={{ opacity: big && cursorLabel ? 1 : 0 }}>
          {cursorLabel}
        </span>
      </div>

      {/* the name cursor — intro signature (desktop cursor + touch reveal) */}
      <div ref={plate} className="cursor-plate pointer-events-none fixed left-0 top-0 z-[197]" style={{ opacity: 0 }} aria-hidden="true">
        <div className="cursor-plate-inner flex items-center gap-2 rounded-full border border-white/15 bg-white/95 py-1.5 pl-2.5 pr-3.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#bef264] shadow-[0_0_8px_#bef264]" />
          <span className="font-mono text-[9px] font-semibold tracking-[0.3em] text-black">WESLEY SAMUVEL</span>
        </div>
      </div>
    </>
  )
}
