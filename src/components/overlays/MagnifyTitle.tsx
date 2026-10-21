'use client'

import { useEffect, useMemo, useRef } from 'react'

/**
 * MagnifyTitle — the INTRO headline as a magnetic lens field.
 *
 *  · Every letter magnifies under the pointer with a gaussian falloff, so the
 *    two neighbours swell as well and a wave rolls through the word.
 *  · Magnified letters crossfade into a hot RED gradient (background-clip:text)
 *    with a crimson bloom — the "reveal" the cursor paints across the name.
 *  · Letters BEND while magnified: they lean toward the cursor (rotateZ),
 *    tilt into it in depth (rotateX under perspective), shear slightly
 *    (skewX) and lift — so the word visibly bends around the lens.
 *  · TOUCH — pointermove/pointerdown fire for touch drags too, so the same
 *    lens works under the fingertip on mobile (the reveal the round asked for).
 *    On lift-off the letters relax back smoothly.
 *
 * Perf: one batched rect read + style write per frame on ~14 letters, direct
 * style writes (no react state), transforms on inner nodes so measurement
 * spans stay un-transformed.
 */

interface LetterCell {
  /** un-transformed measuring wrapper */
  host: HTMLSpanElement | null
  /** transform target */
  mover: HTMLSpanElement | null
  /** red-gradient overlay */
  grad: HTMLSpanElement | null
  /** damped state */
  s: number
  rz: number
  rx: number
  sk: number
  ty: number
  g: number
  isDot: boolean
}

const RED_GRADIENT =
  'linear-gradient(168deg, #ffb4a8 0%, #ff5f4e 26%, #f02438 52%, #c81e3c 74%, #6d1024 100%)'

const damp = (cur: number, target: number, lambda: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt))

interface MagnifyTitleProps {
  /** rendered as stacked display lines; trailing '.' gets the lime accent */
  lines: string[]
  className?: string
}

export default function MagnifyTitle({ lines, className }: MagnifyTitleProps) {
  const cells = useRef<LetterCell[]>([])
  const raf = useRef(0)

  /** flat char list — keeps ref indices stable across renders */
  const chars = useMemo(() => {
    const out: { ch: string; line: number; isDot: boolean }[] = []
    lines.forEach((line, li) => {
      for (const ch of line) out.push({ ch, line: li, isDot: ch === '.' })
    })
    return out
  }, [lines])

  useEffect(() => {
    // collect the freshly-rendered cells in DOM order
    const cellsList = cells.current
    if (cellsList.length === 0) return

    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const strength = isCoarse ? 0.95 : 1.28 // magnification ceiling
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const pointer = { x: -9999, y: -9999, on: false }

    const setPointer = (x: number, y: number) => {
      pointer.x = x
      pointer.y = y
      pointer.on = true
    }
    const release = () => {
      pointer.on = false
      pointer.x = -9999
      pointer.y = -9999
    }

    const onMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY)
    const onDown = (e: PointerEvent) => setPointer(e.clientX, e.clientY)
    const onTouchEnd = () => release()
    const onMouseLeave = () => release()

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onTouchEnd, { passive: true })
    window.addEventListener('pointercancel', onTouchEnd, { passive: true })
    document.documentElement.addEventListener('mouseleave', onMouseLeave)

    let last = performance.now()
    let alive = true

    const tick = (now: number) => {
      if (!alive) return
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now

      // ---- batched reads (single layout flush) ----
      const rects: (DOMRect | null)[] = cellsList.map((c) =>
        c.host ? c.host.getBoundingClientRect() : null
      )

      // the lens radius follows the letter size — a tight bead on phones,
      // the full cinematic wave on desktop
      let meanH = 0
      let hN = 0
      for (const r of rects) {
        if (r && r.height > 2) {
          meanH += r.height
          hN++
        }
      }
      const sigma = hN > 0 ? Math.min(122, Math.max(42, (meanH / hN) * 0.55)) : 118

      // ---- batched writes ----
      for (let i = 0; i < cellsList.length; i++) {
        const c = cellsList[i]
        const r = rects[i]
        const mover = c.mover
        if (!r || !mover) continue

        let inf = 0
        if (pointer.on) {
          const dx = pointer.x - (r.left + r.width / 2)
          const dy = pointer.y - (r.top + r.height / 2)
          const d2 = dx * dx + dy * dy
          inf = Math.exp(-d2 / (2 * sigma * sigma))
        }

        // damped per-letter state — fast attack, smooth relax
        c.s = damp(c.s, 1 + strength * inf, 20, dt)
        c.rz = damp(c.rz, (dxOf(pointer.x, r) / sigma) * 9.5 * inf, 18, dt)
        c.rx = damp(c.rx, (dyOf(pointer.y, r) / sigma) * 7.5 * inf, 18, dt)
        c.sk = damp(c.sk, (dxOf(pointer.x, r) / sigma) * -4.5 * inf, 18, dt)
        c.ty = damp(c.ty, -r.height * 0.16 * inf, 18, dt)
        c.g = damp(c.g, smooth01((inf - 0.06) / 0.42), 16, dt)

        if (reduced) {
          mover.style.transform = ''
          if (c.grad) c.grad.style.opacity = '0'
          continue
        }

        mover.style.transform =
          `translateY(${c.ty.toFixed(2)}px) ` +
          `rotateX(${c.rx.toFixed(2)}deg) rotateZ(${c.rz.toFixed(2)}deg) ` +
          `skewX(${c.sk.toFixed(2)}deg) scale(${c.s.toFixed(4)})`
        mover.style.zIndex = inf > 0.12 ? String(10 + Math.round(inf * 20)) : ''

        if (c.grad && !c.isDot) {
          c.grad.style.opacity = c.g.toFixed(3)
          if (c.g > 0.04) {
            c.grad.style.filter = `drop-shadow(0 0 ${(14 + c.g * 16).toFixed(1)}px rgba(244, 24, 56, ${(c.g * 0.55).toFixed(3)}))`
          } else if (c.grad.style.filter) {
            c.grad.style.filter = ''
          }
        }
      }

      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      alive = false
      cancelAnimationFrame(raf.current)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onTouchEnd)
      window.removeEventListener('pointercancel', onTouchEnd)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [chars])

  const ensureCell = (idx: number, isDot: boolean) => {
    if (!cells.current[idx]) {
      cells.current[idx] = { host: null, mover: null, grad: null, s: 1, rz: 0, rx: 0, sk: 0, ty: 0, g: 0, isDot }
    }
    return cells.current[idx]
  }

  let cellIndex = -1

  return (
    <h1 aria-label={lines.join(' ')} className={className}>
      {lines.map((line, li) => (
        <span
          key={li}
          aria-hidden="true"
          className="block"
          style={{ perspective: '950px' }}
        >
          {line.split('').map((ch, ci) => {
            cellIndex++
            const idx = cellIndex
            const isDot = ch === '.'
            return (
              <span
                key={ci}
                ref={(el) => {
                  ensureCell(idx, isDot).host = el
                }}
                className="relative inline-block"
              >
                <span
                  ref={(el) => {
                    ensureCell(idx, isDot).mover = el
                  }}
                  className="inline-block will-change-transform"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <span className={isDot ? 'text-[#bef264]' : li === 0 ? 'text-white' : 'text-white/95'}>
                    {ch}
                  </span>
                  <span
                    ref={(el) => {
                      ensureCell(idx, isDot).grad = el
                    }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 text-transparent"
                    style={{
                      backgroundImage: RED_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      opacity: 0,
                    }}
                  >
                    {ch}
                  </span>
                </span>
              </span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}

/** horizontal offset of the pointer from a letter's centre (0 when released) */
function dxOf(px: number, r: DOMRect) {
  if (px < -9000) return 0
  return px - (r.left + r.width / 2)
}
function dyOf(py: number, r: DOMRect) {
  if (py < -9000) return 0
  return py - (r.top + r.height / 2)
}
/** clamp+smoothstep a normalized value into 0..1 */
function smooth01(v: number) {
  const t = Math.min(1, Math.max(0, v))
  return t * t * (3 - 2 * t)
}
