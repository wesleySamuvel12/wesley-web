'use client'

/**
 * Global pointer input — smoothed mouse position used for camera parallax,
 * card tilt and label reactions. Never triggers React re-renders.
 */
export const input = {
  /** raw target, -1..1 */
  tx: 0,
  ty: 0,
  /** smoothed value */
  mx: 0,
  my: 0,
  /** pixel position */
  px: 0,
  py: 0,
  moved: false,
}

export function initInput(): () => void {
  const onMove = (e: PointerEvent) => {
    input.tx = (e.clientX / window.innerWidth) * 2 - 1
    input.ty = (e.clientY / window.innerHeight) * 2 - 1
    input.px = e.clientX
    input.py = e.clientY
    input.moved = true
  }
  const onLeave = () => {
    input.tx = 0
    input.ty = 0
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerleave', onLeave)
  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerleave', onLeave)
  }
}

/** Call once per frame */
export function updateInput(delta: number) {
  const k = 1 - Math.exp(-6 * delta)
  input.mx += (input.tx - input.mx) * k
  input.my += (input.ty - input.my) * k
}

/** Deterministic PRNG so visuals are stable across renders */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
