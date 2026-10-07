/**
 * Central cinematic configuration.
 * Every scene is a camera "beat" on one continuous film strip.
 * Tune `duration` (vh units) to change scroll pacing per scene.
 */

export type Vec3 = [number, number, number]

export interface CamKey {
  pos: Vec3
  look: Vec3
  fov: number
}

export interface SceneConfig {
  id: string
  label: string
  duration: number
  cam: { from: CamKey; to: CamKey }
  bg: string
  fog: number
  overlay: {
    /** local t (0-1) at which the overlay reaches full opacity */
    fadeIn: number
    /** local t at which fade out begins (1 = never fades out) */
    fadeOut: number
    /** vertical parallax drift in px across the scene */
    parallax: number
  }
}

export const SCENES: SceneConfig[] = [
  {
    id: 'intro',
    label: 'INTRO',
    duration: 150,
    cam: {
      from: { pos: [0, 0.15, 9], look: [0, 0, 0], fov: 42 },
      to: { pos: [0, 0.05, 7.4], look: [0, 0.1, 0], fov: 41 },
    },
    bg: '#050505',
    fog: 0.04,
    overlay: { fadeIn: 0, fadeOut: 0.62, parallax: 55 },
  },
  {
    id: 'hero',
    label: 'ENGINEERING WORLD',
    duration: 280,
    cam: {
      from: { pos: [4.0, 2.3, 5.0], look: [0, 0.15, 0], fov: 42 },
      to: { pos: [0.12, 0.3, 0.62], look: [0, -0.05, -1.6], fov: 50 },
    },
    bg: '#0a0c11',
    fog: 0.035,
    overlay: { fadeIn: 0.06, fadeOut: 0.78, parallax: 80 },
  },
  {
    id: 'identity',
    label: 'IDENTITY',
    duration: 170,
    cam: {
      from: { pos: [0, 0.1, 6.6], look: [0, 0, 0], fov: 40 },
      to: { pos: [0.5, 0.05, 5.7], look: [0, 0, 0], fov: 40 },
    },
    bg: '#050505',
    fog: 0.05,
    overlay: { fadeIn: 0.08, fadeOut: 0.86, parallax: 70 },
  },
  {
    id: 'about',
    label: 'ABOUT',
    duration: 250,
    cam: {
      from: { pos: [-3.5, 1.7, 4.2], look: [0, 0.25, 0], fov: 42 },
      to: { pos: [2.3, 1.05, 3.2], look: [0.2, 0.15, 0], fov: 42 },
    },
    bg: '#0a0c12',
    fog: 0.04,
    overlay: { fadeIn: 0.07, fadeOut: 0.85, parallax: 70 },
  },
  {
    id: 'tech',
    label: 'TECHNOLOGY',
    duration: 260,
    cam: {
      from: { pos: [0, 0.8, 7.8], look: [0, 0, 0], fov: 44 },
      to: { pos: [0.5, 0.2, 5.5], look: [0, 0.05, 0], fov: 44 },
    },
    bg: '#070810',
    fog: 0.04,
    overlay: { fadeIn: 0.07, fadeOut: 0.85, parallax: 60 },
  },
  {
    id: 'koottam',
    label: 'KOOTTAM CART',
    duration: 240,
    cam: {
      from: { pos: [3.2, 0.8, 5.8], look: [0, 0.2, 0], fov: 42 },
      to: { pos: [0, 0.15, 4.4], look: [0, 0.05, 0], fov: 42 },
    },
    bg: '#090b0a',
    fog: 0.042,
    overlay: { fadeIn: 0.06, fadeOut: 0.82, parallax: 70 },
  },
  {
    id: 'attendance',
    label: 'SMART ATTENDANCE',
    duration: 210,
    cam: {
      from: { pos: [-3.0, 1.4, 5.0], look: [0, 0.5, 0], fov: 42 },
      to: { pos: [0.7, 0.85, 3.5], look: [0, 0.4, -0.2], fov: 42 },
    },
    bg: '#070a0e',
    fog: 0.04,
    overlay: { fadeIn: 0.06, fadeOut: 0.83, parallax: 65 },
  },
  {
    id: 'hydro',
    label: 'HYDROFLOAT',
    duration: 320,
    cam: {
      from: { pos: [0, 2.7, 6.4], look: [0, 0.4, 0], fov: 44 },
      to: { pos: [0, -1.2, 2.8], look: [0, -0.75, -0.3], fov: 44 },
    },
    bg: '#0a161d',
    fog: 0.028,
    overlay: { fadeIn: 0.05, fadeOut: 0.8, parallax: 60 },
  },
  {
    id: 'embedded',
    label: 'ENGINEERING LAB',
    duration: 210,
    cam: {
      from: { pos: [2.9, 1.7, 4.8], look: [0, 0.35, 0], fov: 42 },
      to: { pos: [-0.5, 0.95, 2.8], look: [0, 0.25, 0], fov: 42 },
    },
    bg: '#090a0f',
    fog: 0.038,
    overlay: { fadeIn: 0.06, fadeOut: 0.85, parallax: 65 },
  },
  {
    id: 'data',
    label: 'AI / DATA',
    duration: 210,
    cam: {
      from: { pos: [-3.3, 1.1, 6.0], look: [0, 0.15, 0], fov: 44 },
      to: { pos: [0.2, 0.3, 3.0], look: [0, 0.1, 0], fov: 44 },
    },
    bg: '#060709',
    fog: 0.045,
    overlay: { fadeIn: 0.06, fadeOut: 0.85, parallax: 65 },
  },
  {
    id: 'stats',
    label: 'PERFORMANCE',
    duration: 170,
    cam: {
      from: { pos: [0, 0.15, 7.4], look: [0, 0.1, 0], fov: 40 },
      to: { pos: [0, 0.05, 6.3], look: [0, 0.1, 0], fov: 40 },
    },
    bg: '#050506',
    fog: 0.05,
    overlay: { fadeIn: 0.07, fadeOut: 0.85, parallax: 50 },
  },
  {
    id: 'creative',
    label: 'CREATIVE WORK',
    duration: 270,
    cam: {
      from: { pos: [-3.0, 0.3, 5.0], look: [-1.4, 0.15, 0], fov: 42 },
      to: { pos: [3.0, 0.25, 4.5], look: [1.4, 0.1, 0], fov: 42 },
    },
    bg: '#08080a',
    fog: 0.045,
    overlay: { fadeIn: 0.06, fadeOut: 0.85, parallax: 50 },
  },
  {
    id: 'journey',
    label: 'JOURNEY',
    duration: 260,
    cam: {
      from: { pos: [0, 0.75, 8.6], look: [0.6, 0.45, 1], fov: 44 },
      to: { pos: [0, 0.5, -9.4], look: [0.6, 0.35, -15.5], fov: 44 },
    },
    bg: '#06070b',
    fog: 0.035,
    overlay: { fadeIn: 0.07, fadeOut: 0.88, parallax: 55 },
  },
  {
    id: 'contact',
    label: 'CONTACT',
    duration: 230,
    cam: {
      from: { pos: [0, 0.5, 3.8], look: [0, 0.5, 0], fov: 40 },
      to: { pos: [0, 0.75, 7.2], look: [0, 0.55, 0], fov: 46 },
    },
    bg: '#030303',
    fog: 0.055,
    overlay: { fadeIn: 0.05, fadeOut: 1, parallax: 30 },
  },
]

export const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0)

/** Cumulative normalized start of each scene (0..1) */
export const SCENE_STARTS: number[] = (() => {
  const starts: number[] = []
  let acc = 0
  for (const s of SCENES) {
    starts.push(acc / TOTAL_DURATION)
    acc += s.duration
  }
  return starts
})()

export interface IndicatorItem {
  n: string
  label: string
  scene: number
}

/** Right-side vertical scene indicator — 9 major beats */
export const INDICATOR: IndicatorItem[] = [
  { n: '01', label: 'INTRO', scene: 0 },
  { n: '02', label: 'IDENTITY', scene: 2 },
  { n: '03', label: 'ABOUT', scene: 3 },
  { n: '04', label: 'TECH', scene: 4 },
  { n: '05', label: 'WORK', scene: 5 },
  { n: '06', label: 'LAB', scene: 8 },
  { n: '07', label: 'GALLERY', scene: 11 },
  { n: '08', label: 'JOURNEY', scene: 12 },
  { n: '09', label: 'CONTACT', scene: 13 },
]

/** Which indicator entry a given scene index belongs to */
export const SCENE_TO_INDICATOR: number[] = (() => {
  const map: number[] = SCENES.map(() => 0)
  INDICATOR.forEach((item, i) => {
    map[item.scene] = i
  })
  // fill gaps — every scene inherits the nearest previous indicator
  let last = 0
  for (let i = 0; i < map.length; i++) {
    if (INDICATOR.some((it) => it.scene === i)) last = INDICATOR.findIndex((it) => it.scene === i)
    map[i] = last
  }
  return map
})()

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/** Overlay opacity window for a scene's local progress */
export function overlayOpacity(cfg: SceneConfig, local: number, isLast: boolean): number {
  const t = clamp01(local)
  const fi = cfg.overlay.fadeIn
  if (fi > 0 && t < fi) return easeOutCubic(t / fi)
  const fo = cfg.overlay.fadeOut
  if (!isLast && fo < 1 && t > fo) return easeOutCubic(clamp01((1 - t) / (1 - fo)))
  return 1
}

/** Inverse mapping: global progress → local progress of scene `index` */
export function sceneLocalFromProgress(progress: number, index: number): number {
  const start = SCENE_STARTS[index] ?? 0
  const dur = (SCENES[index]?.duration ?? 1) / TOTAL_DURATION
  return clamp01(dur > 0 ? (progress - start) / dur : 1)
}
