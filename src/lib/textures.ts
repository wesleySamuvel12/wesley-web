'use client'

import * as THREE from 'three'
import { mulberry32 } from './input'

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')
  return { canvas, ctx }
}

function toTexture(canvas: HTMLCanvasElement, srgb = true): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/* ------------------------------------------------------------------ */
/* PCB                                                                 */
/* ------------------------------------------------------------------ */

export interface PcbTextures {
  map: THREE.CanvasTexture
  emissive: THREE.CanvasTexture
}

/**
 * High-end matte-black PCB: copper traces with 45° routing, via dots,
 * gold pads and silkscreen lettering. Returns color + emissive maps.
 */
export function createPcbTextures(seed = 7): PcbTextures {
  // drawn in a 2048x1408 logical space, rasterized at 0.75 — faster boot, still crisp
  const LW = 2048
  const LH = 1408
  const S = 0.75
  const W = LW
  const H = LH
  const { canvas, ctx } = makeCanvas(Math.round(LW * S), Math.round(LH * S))
  const { canvas: eCanvas, ctx: eCtx } = makeCanvas(Math.round(LW * S), Math.round(LH * S))
  ctx.scale(S, S)
  eCtx.scale(S, S)

  // base — deep matte charcoal
  ctx.fillStyle = '#0d1014'
  ctx.fillRect(0, 0, W, H)
  eCtx.fillStyle = '#000000'
  eCtx.fillRect(0, 0, W, H)

  // subtle substrate noise
  const rnd = mulberry32(seed)
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * W
    const y = rnd() * H
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.012)' : 'rgba(0,0,0,0.05)'
    ctx.fillRect(x, y, 1 + rnd() * 2, 1 + rnd() * 2)
  }

  // keep-out zones (component footprints) — traces avoid these
  const keepOuts = [
    { x: W * 0.5, y: H * 0.48, r: 210 },
    { x: W * 0.22, y: H * 0.3, r: 150 },
    { x: W * 0.78, y: H * 0.3, r: 130 },
    { x: W * 0.8, y: H * 0.72, r: 120 },
    { x: W * 0.18, y: H * 0.74, r: 130 },
  ]
  const blocked = (x: number, y: number) =>
    keepOuts.some((k) => (x - k.x) ** 2 + (y - k.y) ** 2 < k.r * k.r)

  // copper traces — 45° style routing between random nodes
  const hubs = [
    { x: W * 0.06, y: H * 0.12 },
    { x: W * 0.06, y: H * 0.5 },
    { x: W * 0.06, y: H * 0.9 },
    { x: W * 0.94, y: H * 0.1 },
    { x: W * 0.94, y: H * 0.5 },
    { x: W * 0.94, y: H * 0.9 },
    { x: W * 0.3, y: H * 0.06 },
    { x: W * 0.62, y: H * 0.06 },
    { x: W * 0.35, y: H * 0.94 },
    { x: W * 0.68, y: H * 0.94 },
  ]

  const trace = (ctx: CanvasRenderingContext2D, color: string, width: number, glow: number) => {
    for (let t = 0; t < 46; t++) {
      const a = hubs[Math.floor(rnd() * hubs.length)]
      let x = a.x
      let y = a.y
      const steps = 3 + Math.floor(rnd() * 5)
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (glow > 0) {
        ctx.shadowColor = color
        ctx.shadowBlur = glow
      }
      ctx.beginPath()
      ctx.moveTo(x, y)
      for (let s = 0; s < steps; s++) {
        const dir = rnd() > 0.5 ? 1 : -1
        const len = 60 + rnd() * 240
        if (rnd() > 0.5) x += dir * len
        else y += dir * len * 0.55
        x = Math.min(W - 20, Math.max(20, x))
        y = Math.min(H - 20, Math.max(20, y))
        if (blocked(x, y)) break
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0
    }
  }

  trace(ctx, 'rgba(94,113,124,0.85)', 5, 0)
  trace(ctx, 'rgba(140,160,170,0.5)', 2.5, 0)
  trace(eCtx, 'rgba(22,160,178,0.9)', 4, 14)
  trace(eCtx, 'rgba(190,242,100,0.35)', 2.5, 10)

  // vias
  for (let i = 0; i < 320; i++) {
    const x = rnd() * W
    const y = rnd() * H
    if (blocked(x, y)) continue
    ctx.beginPath()
    ctx.arc(x, y, 4.5, 0, Math.PI * 2)
    ctx.fillStyle = '#8a97a0'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, y, 2.2, 0, Math.PI * 2)
    ctx.fillStyle = '#0d1014'
    ctx.fill()
    if (rnd() > 0.72) {
      eCtx.beginPath()
      eCtx.arc(x, y, 2, 0, Math.PI * 2)
      eCtx.fillStyle = 'rgba(40,190,205,0.8)'
      eCtx.fill()
    }
  }

  // gold pads along edges
  ctx.fillStyle = '#c9a86a'
  for (let i = 0; i < 26; i++) {
    const y = 90 + i * ((H - 180) / 26)
    roundRect(ctx, 26, y, 34, 20, 4)
    ctx.fill()
    roundRect(ctx, W - 60, y, 34, 20, 4)
    ctx.fill()
  }

  // silkscreen
  ctx.fillStyle = 'rgba(226,232,236,0.82)'
  ctx.font = '600 30px "Space Grotesk", "Inter", system-ui, sans-serif'
  ctx.fillText('WS-CORE-01', W * 0.42, H * 0.16)
  ctx.font = '500 22px "Space Grotesk", "Inter", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(226,232,236,0.5)'
  ctx.fillText('WESLEY SAMUVEL — DIGITAL ENGINEERING', W * 0.42, H * 0.2)
  ctx.fillText('REV 2.0 · 2025', W * 0.42, H * 0.885)
  ctx.fillText('ESP32-WROOM · 3V3 · I2C', W * 0.42, H * 0.845)

  // corner fiducials
  for (const [fx, fy] of [[80, 80], [W - 80, 80], [80, H - 80], [W - 80, H - 80]]) {
    ctx.beginPath()
    ctx.arc(fx, fy, 14, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(226,232,236,0.5)'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(fx, fy, 4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(226,232,236,0.5)'
    ctx.fill()
  }

  return { map: toTexture(canvas), emissive: toTexture(eCanvas) }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/* ------------------------------------------------------------------ */
/* Chip / silkscreen label                                             */
/* ------------------------------------------------------------------ */

export function createChipTexture(title: string, sub?: string): THREE.CanvasTexture {
  const S = 512
  const { canvas, ctx } = makeCanvas(S, S)
  ctx.fillStyle = '#101318'
  ctx.fillRect(0, 0, S, S)
  // laser-etched grain
  const rnd = mulberry32(title.length * 31 + (sub?.length ?? 0))
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.06)'
    ctx.fillRect(rnd() * S, rnd() * S, 2, 2)
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 3
  ctx.strokeRect(26, 26, S - 52, S - 52)
  // pin-1 dot
  ctx.beginPath()
  ctx.arc(62, 62, 17, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fill()

  ctx.fillStyle = 'rgba(233,238,242,0.92)'
  ctx.font = '700 64px "Space Grotesk", "Inter", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(title, S / 2, S / 2 - (sub ? 8 : -22))
  if (sub) {
    ctx.font = '500 30px "Inter", system-ui, sans-serif'
    ctx.fillStyle = 'rgba(233,238,242,0.5)'
    ctx.fillText(sub, S / 2, S / 2 + 46)
  }
  return toTexture(canvas)
}

/* ------------------------------------------------------------------ */
/* OLED / dashboard screens                                            */
/* ------------------------------------------------------------------ */

export function createScreenTexture(
  lines: string[],
  accent = '#5eead4',
  seed = 3
): THREE.CanvasTexture {
  const W = 512
  const H = 320
  const { canvas, ctx } = makeCanvas(W, H)
  ctx.fillStyle = '#02090b'
  ctx.fillRect(0, 0, W, H)
  // faint scanlines
  const rnd = mulberry32(seed)
  ctx.fillStyle = 'rgba(255,255,255,0.02)'
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1)

  ctx.textAlign = 'left'
  lines.forEach((line, i) => {
    const isHead = i === 0
    ctx.font = isHead
      ? '700 44px "Space Grotesk", "Inter", system-ui, sans-serif'
      : '500 27px "Inter", system-ui, sans-serif'
    ctx.fillStyle = isHead ? accent : i % 2 === 0 ? 'rgba(224,240,244,0.85)' : 'rgba(160,190,200,0.55)'
    ctx.fillText(line, 28, 64 + i * 46)
  })

  // status blocks
  for (let i = 0; i < 5; i++) {
    if (rnd() > 0.45) {
      ctx.fillStyle = accent
      ctx.globalAlpha = 0.65
      ctx.fillRect(W - 150 + rnd() * 60, 48 + i * 44, 40 + rnd() * 40, 10)
      ctx.globalAlpha = 1
    }
  }
  return toTexture(canvas)
}

export function createCodeTexture(seed = 11): THREE.CanvasTexture {
  const W = 640
  const H = 400
  const { canvas, ctx } = makeCanvas(W, H)
  ctx.fillStyle = '#07090d'
  ctx.fillRect(0, 0, W, H)
  // editor chrome
  ctx.fillStyle = '#0b0e13'
  ctx.fillRect(0, 0, W, 34)
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(24 + i * 22, 17, 6, 0, Math.PI * 2)
    ctx.fillStyle = ['#2a2f38', '#2a2f38', '#2a2f38'][i]
    ctx.fill()
  }
  const rnd = mulberry32(seed)
  const palette = ['#5eead4', '#bef264', '#a78bfa', '#e2e8f0', '#64748b', '#94a3b8']
  for (let y = 60; y < H - 14; y += 22) {
    let x = 24 + (y % 3 === 0 ? 0 : 22)
    const tokens = 2 + Math.floor(rnd() * 5)
    for (let t = 0; t < tokens && x < W - 60; t++) {
      const w = 18 + rnd() * 70
      ctx.fillStyle = palette[Math.floor(rnd() * palette.length)]
      ctx.globalAlpha = 0.28 + rnd() * 0.6
      roundRect(ctx, x, y, w, 9, 4)
      ctx.fill()
      x += w + 12
    }
  }
  ctx.globalAlpha = 1
  return toTexture(canvas)
}

/* ------------------------------------------------------------------ */
/* QR-like pattern                                                     */
/* ------------------------------------------------------------------ */

export function createQrTexture(seed = 42): THREE.CanvasTexture {
  const S = 512
  const { canvas, ctx } = makeCanvas(S, S)
  ctx.fillStyle = '#04070a'
  ctx.fillRect(0, 0, S, S)
  const rnd = mulberry32(seed)
  const cell = S / 25
  ctx.fillStyle = '#bffcf4'
  for (let x = 0; x < 25; x++) {
    for (let y = 0; y < 25; y++) {
      const inFinder =
        (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17)
      if (inFinder) continue
      if (rnd() > 0.52) ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2)
    }
  }
  const finder = (fx: number, fy: number) => {
    ctx.strokeStyle = '#bffcf4'
    ctx.lineWidth = 6
    ctx.strokeRect(fx * cell + 4, fy * cell + 4, cell * 7 - 8, cell * 7 - 8)
    ctx.fillStyle = '#bffcf4'
    ctx.fillRect(fx * cell + cell * 2, fy * cell + cell * 2, cell * 3, cell * 3)
  }
  finder(0, 0)
  finder(18, 0)
  finder(0, 18)
  return toTexture(canvas)
}

/* ------------------------------------------------------------------ */
/* Text labels (3D sprites)                                            */
/* ------------------------------------------------------------------ */

export interface LabelOptions {
  color?: string
  accent?: string
  sub?: string
  size?: number
  mono?: boolean
  align?: 'center' | 'left'
}

export function createLabelTexture(text: string, opts: LabelOptions = {}): THREE.CanvasTexture {
  const {
    color = 'rgba(232,238,242,0.95)',
    accent,
    sub,
    size = 44,
    mono = false,
  } = opts
  const pad = 56
  const spacing = size * 0.14
  const family = mono
    ? '"JetBrains Mono", "Courier New", monospace'
    : '"Space Grotesk", "Inter", system-ui, sans-serif'
  const probe = makeCanvas(10, 10)
  probe.ctx.font = `600 ${size}px ${family}`
  const mainW = Math.min(1500, probe.ctx.measureText(text).width)
  // reserve room for letter-spacing, the accent tick and safety margin
  const contentW = mainW + spacing * Math.max(0, text.length - 1) + (accent ? 26 : 0)
  const W = Math.ceil(contentW + pad * 2)
  const H = Math.ceil(size * (sub ? 2.35 : 1.7))
  const { canvas, ctx } = makeCanvas(W, H)

  ctx.font = `600 ${size}px ${family}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  let x = pad
  const y = sub ? H * 0.34 : H * 0.5

  if (accent) {
    ctx.fillStyle = accent
    ctx.fillRect(x, y - size * 0.5, 6, size)
    x += 26
  }
  // letter-spaced manual draw
  let cx = x
  for (const ch of text) {
    ctx.fillStyle = color
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + spacing
  }

  if (sub) {
    ctx.font = `500 ${Math.round(size * 0.52)}px "Inter", system-ui, sans-serif`
    ctx.fillStyle = 'rgba(160,180,190,0.75)'
    ctx.fillText(sub.toUpperCase(), x, y + size * 0.95)
  }

  const tex = toTexture(canvas)
  return tex
}

/* ------------------------------------------------------------------ */
/* Glows & gradients                                                   */
/* ------------------------------------------------------------------ */

export function createGlowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)'): THREE.CanvasTexture {
  const S = 256
  const { canvas, ctx } = makeCanvas(S, S)
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, inner)
  g.addColorStop(0.35, inner.replace(/,1\)$/, ',0.55)'))
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  return toTexture(canvas)
}

export function createBeamTexture(color = 'rgba(140,220,255,0.5)'): THREE.CanvasTexture {
  const W = 256
  const H = 512
  const { canvas, ctx } = makeCanvas(W, H)
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // horizontal falloff
  const gx = ctx.createLinearGradient(0, 0, W, 0)
  gx.addColorStop(0, 'rgba(0,0,0,1)')
  gx.addColorStop(0.5, 'rgba(0,0,0,0)')
  gx.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = gx
  ctx.fillRect(0, 0, W, H)
  return toTexture(canvas)
}

export function createGridTexture(size = 1024, fade = true): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(size, size)
  ctx.fillStyle = '#05070a'
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(120,160,180,0.16)'
  ctx.lineWidth = 1.5
  const step = size / 32
  for (let i = 0; i <= 32; i++) {
    ctx.beginPath()
    ctx.moveTo(i * step, 0)
    ctx.lineTo(i * step, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * step)
    ctx.lineTo(size, i * step)
    ctx.stroke()
  }
  if (fade) {
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.52)
    g.addColorStop(0, 'rgba(5,7,10,0)')
    g.addColorStop(1, 'rgba(5,7,10,1)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  return toTexture(canvas)
}

export function createSchematicTexture(seed = 5): THREE.CanvasTexture {
  const W = 512
  const H = 320
  const { canvas, ctx } = makeCanvas(W, H)
  ctx.clearRect(0, 0, W, H)
  const rnd = mulberry32(seed)
  ctx.strokeStyle = 'rgba(120,230,240,0.9)'
  ctx.fillStyle = 'rgba(120,230,240,0.9)'
  ctx.lineWidth = 2.5
  // chip boxes + routes
  const boxes = [
    { x: 40, y: 60, w: 90, h: 70 },
    { x: 200, y: 40, w: 110, h: 90 },
    { x: 380, y: 90, w: 80, h: 110 },
    { x: 90, y: 200, w: 120, h: 60 },
    { x: 290, y: 210, w: 90, h: 70 },
  ]
  boxes.forEach((b) => {
    ctx.strokeRect(b.x, b.y, b.w, b.h)
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(b.x - 12, b.y + 14 + i * 18)
      ctx.lineTo(b.x, b.y + 14 + i * 18)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(b.x + b.w, b.y + 14 + i * 18)
      ctx.lineTo(b.x + b.w + 12, b.y + 14 + i * 18)
      ctx.stroke()
    }
  })
  for (let i = 0; i < 8; i++) {
    const a = boxes[Math.floor(rnd() * boxes.length)]
    const b = boxes[Math.floor(rnd() * boxes.length)]
    if (a === b) continue
    ctx.beginPath()
    const mx = (a.x + b.x) / 2 + (rnd() - 0.5) * 60
    ctx.moveTo(a.x + a.w / 2, a.y + a.h)
    ctx.lineTo(mx, a.y + a.h + 26)
    ctx.lineTo(mx, b.y + b.h + 26)
    ctx.lineTo(b.x + b.w / 2, b.y + b.h)
    ctx.stroke()
  }
  ctx.font = '500 20px "JetBrains Mono", monospace'
  ctx.fillText('WS-SCHEM v2', 16, 28)
  return toTexture(canvas)
}
