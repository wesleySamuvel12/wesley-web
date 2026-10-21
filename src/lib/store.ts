'use client'

import { create } from 'zustand'

export type CursorType = 'default' | 'view' | 'explore' | 'open' | 'link' | 'drag'
export type QualityTier = 'high' | 'med' | 'low'

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
  setCurrentMilestone: (i: number) => void
  setUnderwater: (v: boolean) => void
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
  setFocusedCreative: (id) => set((s) => (s.focusedCreative === id ? s : { focusedCreative: id })),
  setCurrentMilestone: (i) => set((s) => (s.currentMilestone === i ? s : { currentMilestone: i })),
  setUnderwater: (v) => set((s) => (s.underwater === v ? s : { underwater: v })),
}))
