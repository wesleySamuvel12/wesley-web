'use client'

import { useEffect, useRef, useState } from 'react'
import { useExperienceStore } from '@/lib/store'
import { getScrollState } from '@/lib/scrollEngine'

/**
 * Custom cursor — a glowing star that drags a glowing comet tail.
 *
 *  · star     — a 4-point sparkle with a layered white/lime/cyan bloom,
 *               slowly spinning + twinkling; compresses on press
 *  · tail     — a canvas comet ribbon (glow pass + bright core) that fades
 *               white → lime → cyan and sheds tiny sparkles with speed
 *  · scroll   — while the page is scrolling the comet IGNITES into a fire
 *               shooting star: white-hot → gold → amber → ember ramp, a
 *               longer brighter streak that shoots along the scroll gesture,
 *               ember sparks and a hot halo around the star; it cools back
 *               to the lime comet shortly after the scroll settles
 *  · burst    — clicks explode a small radial firework of sparks
 *  · ring     — contextual label rig (VIEW / INSPECT / OPEN) on interactive
 *               targets; the star tucks inside it
 *  · name     — during the INTRO the "WESLEY SAMUVEL" plate glides behind
 *               the cursor with its own heavier lag
 *
 * TOUCH REVEAL — the same star + tail + sparkles follow the fingertip with
 * fast springs, materialise on touch and dissolve after lift-off (the rig
 * holds on while a scroll is in flight so mobile gets the same shooting
 * star during fling scrolls).
 */

const damp = (cur: number, target: number, lambda: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt))

type Mode = 'none' | 'mouse' | 'touch'

/* comet colour ramp: k=1 head (white) → k≈0.6 (lime) → k=0 tail (cyan) */
function tailColor(k: number): [number, number, number] {
  if (k > 0.62) {
    const t = (k - 0.62) / 0.38
    return [Math.round(190 + 65 * t), Math.round(242 + 13 * t), Math.round(100 + 155 * t)]
  }
  const t = k / 0.62
  return [Math.round(103 + 87 * t), Math.round(232 + 10 * t), Math.round(249 - 149 * t)]
}

/* shooting-star fire ramp: k=1 head (white-hot) → gold → amber → ember red */
function fireColor(k: number): [number, number, number] {
  if (k > 0.75) {
    const t = (k - 0.75) / 0.25
    return [255, Math.round(209 + 46 * t), Math.round(102 + 130 * t)]
  }
  if (k > 0.4) {
    const t = (k - 0.4) / 0.35
    return [255, Math.round(138 + 71 * t), Math.round(60 + 42 * t)]
  }
  const t = k / 0.4
  return [Math.round(226 + 29 * t), Math.round(69 + 69 * t), Math.round(47 + 13 * t)]
}

const mix3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]

const SPARK_COLORS: [number, number, number][] = [
  [255, 255, 255],
  [190, 242, 100],
  [103, 232, 249],
]

/* ember palette the sparks take while the comet is burning (scrolling) */
const EMBER_COLORS: [number, number, number][] = [
  [255, 214, 120],
  [255, 138, 60],
  [255, 255, 255],
]

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  c: [number, number, number]
}

interface TailPt {
  x: number
  y: number
  t: number
  /** ms this point stays alive (boosted points live longer) */
  exp: number
  /** scroll boost 0..1 frozen at spawn — old segments keep their fire */
  b: number
}

/** glowing comet tail — shared by the mouse and touch rigs */
function createTail(canvas: HTMLCanvasElement, reduced: boolean) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(1.5, window.devicePixelRatio || 1)

  const resize = () => {
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
  }
  resize()
  window.addEventListener('resize', resize)

  const LIFE = 0.8 // seconds a tail segment stays alive (rest)
  const LIFE_HOT = 1.3 // a burning (scrolling) streak lingers much longer
  const pts: TailPt[] = []
  const sparks: Spark[] = []

  const spawnSpark = (x: number, y: number, b: number) => {
    if (reduced || sparks.length > 90) return
    const a = Math.random() * Math.PI * 2
    const sp = 18 + Math.random() * 70
    const hot = b > 0.45
    const pal = hot ? EMBER_COLORS : SPARK_COLORS
    sparks.push({
      x: x + (Math.random() - 0.5) * 5,
      y: y + (Math.random() - 0.5) * 5,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 22,
      life: 0,
      max: (hot ? 0.55 : 0.4) + Math.random() * 0.55,
      size: 0.7 + Math.random() * 1.7,
      c: pal[Math.random() < 0.45 ? 0 : Math.random() < 0.6 ? 1 : 2],
    })
  }

  const push = (x: number, y: number, speed: number, now: number, b = 0) => {
    pts.push({ x, y, t: now, exp: (LIFE + b * (LIFE_HOT - LIFE)) * 1000, b })
    if (pts.length > 64) pts.shift()
    if (speed > 1.4 && Math.random() < Math.min(0.9, speed * (0.032 + b * 0.03)))
      spawnSpark(x, y, b)
  }

  const burst = (x: number, y: number) => {
    if (reduced) return
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4
      const sp = 60 + Math.random() * 110
      sparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        max: 0.45 + Math.random() * 0.4,
        size: 0.9 + Math.random() * 1.6,
        c: SPARK_COLORS[i % 3],
      })
    }
  }

  const draw = (now: number, dt: number, alpha: number) => {
    if (!ctx) return
    const w = window.innerWidth
    const h = window.innerHeight
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    if (alpha <= 0.01 || reduced) return

    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'

    // comet ribbon — glow pass + bright core per segment; scroll-boosted
    // points burn in the fire ramp, wider + brighter, and live longer
    while (pts.length && now - pts[0].t > pts[0].exp) pts.shift()
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1]
      const p1 = pts[i]
      const k = 1 - (now - p1.t) / p1.exp
      if (k <= 0) continue
      const seg = Math.hypot(p1.x - p0.x, p1.y - p0.y)
      if (seg > 150 || seg < 0.01) continue
      const bb = (p0.b + p1.b) / 2
      const [r, g, b] = mix3(tailColor(k), fireColor(k), bb)
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.24 * k * alpha * (1 + 0.4 * bb)).toFixed(3)})`
      ctx.lineWidth = (10 * k + 2) * (1 + 0.5 * bb)
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.stroke()
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.66 * k * alpha * (1 + 0.45 * bb)).toFixed(3)})`
      ctx.lineWidth = (2.3 * k + 0.3) * (1 + 0.5 * bb)
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.stroke()
    }

    // shed sparkles
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]
      s.life += dt
      if (s.life >= s.max) {
        sparks.splice(i, 1)
        continue
      }
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.vx *= 0.955
      s.vy = s.vy * 0.955 - 16 * dt // sparks drift upward as they die
      const k = 1 - s.life / s.max
      const [r, g, b] = s.c
      ctx.fillStyle = `rgba(${r},${g},${b},${(0.4 * k * alpha).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * 2.3 * k + 0.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgba(255,255,255,${(0.85 * k * alpha).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * k * 0.9 + 0.2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalCompositeOperation = 'source-over'
  }

  const destroy = () => {
    window.removeEventListener('resize', resize)
    pts.length = 0
    sparks.length = 0
  }

  return { push, burst, draw, destroy }
}

export default function CustomCursor() {
  const star = useRef<HTMLDivElement>(null)
  const halo = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const plate = useRef<HTMLDivElement>(null)
  const tailCanvas = useRef<HTMLCanvasElement>(null)
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
    const reduced = store.reducedMotion

    const tail = tailCanvas.current ? createTail(tailCanvas.current, reduced) : null

    const pos = { x: -100, y: -100, rx: -100, ry: -100, px: -100, py: -100 }
    const vel = { sv: 0, ang: 0, sx: 0 } // smoothed speed, motion angle, stretch
    const state = { pop: 0, pressed: false, hidden: true, last: 0, sy: window.scrollY, dvs: 0, boost: 0 }
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

    const onClick = (e: MouseEvent) => {
      spawnPing(e.clientX, e.clientY)
      tail?.burst(e.clientX, e.clientY)
    }

    const onLeave = () => {
      state.hidden = true
    }
    const onEnter = () => {
      state.hidden = false
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, state.last ? (now - state.last) / 1000 : 0.016)
      state.last = now

      // SCROLL BOOST — page motion ignites the comet into a fire shooting star
      let dv = window.scrollY - state.sy
      state.sy = window.scrollY
      if (Math.abs(dv) > 400) dv = 0 // teleport guard (instant jumps)
      state.dvs = damp(state.dvs, dv, 10, dt)
      const rawBoost = Math.max(0, Math.min(1, (Math.abs(state.dvs) - 2.5) / 20))
      state.boost = damp(state.boost, rawBoost, rawBoost > state.boost ? 16 : 4.2, dt)
      const fire = state.boost

      // raw pointer velocity (px/frame → smoothed)
      const dx = pos.x - pos.rx
      const dy = pos.y - pos.ry
      const v = (Math.hypot(dx, dy) / Math.max(dt, 0.001)) * 0.016
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
      const vis = state.hidden ? 0 : 1

      if (star.current) {
        const s = (big ? 0.74 : 1) * pressK
        star.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%,-50%) scale(${s.toFixed(3)})`
        star.current.style.opacity = vis ? '1' : '0'
      }
      if (ring.current) {
        // stretch along the motion vector; keep the label upright when "big"
        const stretch = big || state.pressed ? 0 : vel.sx
        const rot = stretch > 0.02 ? (vel.ang * 180) / Math.PI : 0
        const sx = (1 + stretch) * pressK
        const sy = (1 - stretch * 0.45) * pressK
        ring.current.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0) translate(-50%,-50%) rotate(${rot}deg) scale(${sx}, ${sy})`
        ring.current.style.opacity = vis ? '1' : '0'
      }
      if (plate.current) {
        // the plate lags behind with its own heavier inertia + speed tilt
        const tilt = Math.max(-8, Math.min(8, dx * 0.22))
        plate.current.style.transform = `translate3d(${pos.px + 26}px, ${pos.py + 30}px, 0) rotate(${tilt}deg) scale(${0.92 + state.pop * 0.08})`
        plate.current.style.opacity = state.pop.toFixed(3)
      }

      // comet tail feeds off the smoothed star position; while the page
      // scrolls a vertical fire streak shoots opposite the gesture so the
      // star reads as a shooting star tearing through the page motion
      const off = Math.max(-110, Math.min(110, -state.dvs * 3.4))
      if (fire > 0.05 && Math.abs(off) > 3)
        tail?.push(pos.x, pos.y + off, Math.abs(state.dvs) * 1.7, now, Math.max(0.85, fire))
      tail?.push(pos.x, pos.y, v, now, fire)
      tail?.draw(now, dt, vis)

      // hot halo — the star itself ignites while burning
      if (halo.current) {
        halo.current.style.opacity = (fire * 0.95).toFixed(3)
        halo.current.style.transform = `translate(-50%,-50%) scale(${(0.7 + fire * 0.75).toFixed(3)})`
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
      tail?.destroy()
    }
  }, [mode])

  /* ------------------------------- touch ------------------------------- */
  useEffect(() => {
    if (mode !== 'touch') return
    const store = useExperienceStore.getState()
    store.setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const reduced = store.reducedMotion

    const tail = tailCanvas.current ? createTail(tailCanvas.current, reduced) : null

    const pos = { x: -100, y: -100, rx: -100, ry: -100, px: -100, py: -100 }
    const vel = { sx: 0, ang: 0 }
    const state = { pop: 0, active: false, fade: 0, last: 0, init: false, sy: window.scrollY, dvs: 0, boost: 0 }

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
      tail?.burst(pos.x, pos.y)

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

      // fade countdown once the finger has lifted — but hold the rig on
      // while a scroll fling is still in flight (mobile shooting star)
      if (!state.active && state.fade > 0) {
        if (state.boost > 0.04) state.fade = 0.7
        else state.fade = Math.max(0, state.fade - dt)
      }
      const visible = state.active || state.fade > 0
      const vis = state.active ? 1 : state.fade / 0.7

      // SCROLL BOOST — same ignition as the mouse rig
      let dv = window.scrollY - state.sy
      state.sy = window.scrollY
      if (Math.abs(dv) > 400) dv = 0
      state.dvs = damp(state.dvs, dv, 10, dt)
      const rawBoost = Math.max(0, Math.min(1, (Math.abs(state.dvs) - 2.5) / 20))
      state.boost = damp(state.boost, rawBoost, rawBoost > state.boost ? 16 : 4.2, dt)
      const fire = state.boost

      const dx = pos.x - pos.rx
      const dy = pos.y - pos.ry
      const v = (Math.hypot(dx, dy) / Math.max(dt, 0.001)) * 0.016
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

      if (star.current) {
        star.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%,-50%) scale(${big ? 0.74 : 1})`
        star.current.style.opacity = visible ? String(vis) : '0'
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

      // comet tail follows the fingertip (+ fire streak while scrolling)
      if (visible) {
        const off = Math.max(-110, Math.min(110, -state.dvs * 3.4))
        if (fire > 0.05 && Math.abs(off) > 3)
          tail?.push(pos.x, pos.y + off, Math.abs(state.dvs) * 1.7, now, Math.max(0.85, fire))
        tail?.push(pos.x, pos.y, v, now, fire)
        tail?.draw(now, dt, vis)
      } else {
        tail?.draw(now, dt, 0)
      }

      // hot halo — the star itself ignites while burning
      if (halo.current) {
        halo.current.style.opacity = (fire * 0.95 * vis).toFixed(3)
        halo.current.style.transform = `translate(-50%,-50%) scale(${(0.7 + fire * 0.75).toFixed(3)})`
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
      tail?.destroy()
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
      {/* glowing comet tail */}
      <canvas
        ref={tailCanvas}
        className="pointer-events-none fixed inset-0 z-[195] h-full w-full"
        aria-hidden="true"
      />

      <div ref={pingHost} className="pointer-events-none fixed inset-0 z-[198]" aria-hidden="true" />

      {/* the glowing star */}
      <div
        ref={star}
        className="pointer-events-none fixed left-0 top-0 z-[200]"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <div ref={halo} className="cursor-star-halo" style={{ opacity: 0 }} aria-hidden="true" />
        <div className="cursor-star-spin">
          <svg className="cursor-star-svg" width="21" height="21" viewBox="0 0 24 24" fill="none">
            <defs>
              <radialGradient id="cursorStarCore" cx="50%" cy="50%" r="52%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#f2ffd9" />
                <stop offset="100%" stopColor="#bef264" />
              </radialGradient>
            </defs>
            <path
              d="M12 0C12.9 6.6 17.4 11.1 24 12C17.4 12.9 12.9 17.4 12 24C11.1 17.4 6.6 12.9 0 12C6.6 11.1 11.1 6.6 12 0Z"
              fill="url(#cursorStarCore)"
            />
          </svg>
        </div>
      </div>

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
