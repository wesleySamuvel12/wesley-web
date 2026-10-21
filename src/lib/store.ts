'use client'

import { create } from 'zustand'

export type CursorType = 'default' | 'view' | 'explore' | 'open' | 'link' | 'drag'
export type QualityTier = 'high' | 'med' | 'low'

/** How long a focused (clicked) element stays inspected before
 *  the camera automatically returns to the normal scene view. */
export const FOCUS_RETURN_MS = 7000

interface ExperienceState {
  /** loader finished, experience revealed */
  ready: boolean
  canvasReady: boolean
  cursorType: CursorType
  cursorLabel: string
  isTouch: boolean
  reducedMotion: boolean
  activeIndicator: number
  /** adaptive render quality — driven by PerformanceMonitor */
  quality: QualityTier
  /** constellation hover */
  hoveredTech: string | null
  /** creative gallery focused display */
  focusedCreative: string | null
  /** live web product focused window */
  focusedWeb: string | null
  /** embedded bench component focused */
  focusedHardware: string | null
  /** epoch ms at which the active focus auto-returns (drives countdown UI) */
  focusReturnAt: number | null
  /** journey milestone currently nearest the camera */
  currentMilestone: number
  /** hydro scene above/below water */
  underwater: boolean

  setReady: (v: boolean) => void
  setCanvasReady: (v: boolean) => void
  setCursor: (type: CursorType, label?: string) => void
  setIsTouch: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
  setActiveIndicator: (i: number) => void
  setQuality: (q: QualityTier) => void
  setHoveredTech: (id: string | null) => void
  setFocusedCreative: (id: string | null) => void
  setFocusedWeb: (id: string | null) => void
  setFocusedHardware: (id: string | null) => void
  /** drop every focus state immediately (camera returns to normal view) */
  clearFocus: () => void
  setCurrentMilestone: (i: number) => void
  setUnderwater: (v: boolean) => void
}

const FOCUSED_KEYS = ['focusedCreative', 'focusedWeb', 'focusedHardware'] as const

/** Single shared timer — any new focus re-arms it, any release disarms it. */
let focusTimer: ReturnType<typeof setTimeout> | null = null

function disarmFocusTimer() {
  if (focusTimer) {
    clearTimeout(focusTimer)
    focusTimer = null
  }
}

function scheduleAutoReturn() {
  disarmFocusTimer()
  focusTimer = setTimeout(() => {
    focusTimer = null
    useExperienceStore.setState({
      focusedCreative: null,
      focusedWeb: null,
      focusedHardware: null,
      focusReturnAt: null,
    })
  }, FOCUS_RETURN_MS)
}

/** Focus one element; focusing anything else releases the previous one. */
function armFocus(kind: (typeof FOCUSED_KEYS)[number], id: string | null) {
  disarmFocusTimer()
  if (id === null) {
    useExperienceStore.setState({
      focusedCreative: null,
      focusedWeb: null,
      focusedHardware: null,
      focusReturnAt: null,
    })
    return
  }
  const patch: Record<string, unknown> = {
    focusedCreative: null,
    focusedWeb: null,
    focusedHardware: null,
    focusReturnAt: Date.now() + FOCUS_RETURN_MS,
  }
  patch[kind] = id
  useExperienceStore.setState(patch)
  scheduleAutoReturn()
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  ready: false,
  canvasReady: false,
  cursorType: 'default',
  cursorLabel: '',
  isTouch: false,
  reducedMotion: false,
  activeIndicator: 0,
  quality: 'high',
  hoveredTech: null,
  focusedCreative: null,
  focusedWeb: null,
  focusedHardware: null,
  focusReturnAt: null,
  currentMilestone: 0,
  underwater: false,

  setReady: (v) => set({ ready: v }),
  setCanvasReady: (v) => set({ canvasReady: v }),
  setCursor: (type, label = '') => set({ cursorType: type, cursorLabel: label }),
  setIsTouch: (v) => set({ isTouch: v }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setActiveIndicator: (i) => set((s) => (s.activeIndicator === i ? s : { activeIndicator: i })),
  setQuality: (q) => set((s) => (s.quality === q ? s : { quality: q })),
  setHoveredTech: (id) => set((s) => (s.hoveredTech === id ? s : { hoveredTech: id })),
  setFocusedCreative: (id) => armFocus('focusedCreative', id),
  setFocusedWeb: (id) => armFocus('focusedWeb', id),
  setFocusedHardware: (id) => armFocus('focusedHardware', id),
  clearFocus: () => {
    disarmFocusTimer()
    set((s) =>
      s.focusedCreative === null && s.focusedWeb === null && s.focusedHardware === null && s.focusReturnAt === null
        ? s
        : { focusedCreative: null, focusedWeb: null, focusedHardware: null, focusReturnAt: null }
    )
  },
  setCurrentMilestone: (i) => set((s) => (s.currentMilestone === i ? s : { currentMilestone: i })),
  setUnderwater: (v) => set((s) => (s.underwater === v ? s : { underwater: v })),
}))

/** True when any click-focus is currently armed */
export function isFocusActive(s: Pick<ExperienceState, 'focusedCreative' | 'focusedWeb' | 'focusedHardware'>): boolean {
  return s.focusedCreative !== null || s.focusedWeb !== null || s.focusedHardware !== null
}
