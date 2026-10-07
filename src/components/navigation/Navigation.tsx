'use client'

import { useEffect } from 'react'
import { INDICATOR, SCENE_TO_INDICATOR } from '@/lib/scenes'
import { subscribeScroll, scrollToScene } from '@/lib/scrollEngine'
import { useExperienceStore } from '@/lib/store'

const LINKS = [
  { label: 'ABOUT', scene: 3 },
  { label: 'WORK', scene: 5 },
  { label: 'TECH', scene: 4 },
  { label: 'JOURNEY', scene: 12 },
]

/** Keep the global active-indicator in sync with scroll (single source of truth) */
export function useIndicatorSync() {
  useEffect(() => {
    return subscribeScroll((s) => {
      const idx = SCENE_TO_INDICATOR[s.sceneIndex] ?? 0
      useExperienceStore.getState().setActiveIndicator(idx)
    })
  }, [])
}

export function Navigation() {
  const active = useExperienceStore((s) => s.activeIndicator)
  useIndicatorSync()

  const go = (scene: number) => scrollToScene(scene)

  return (
    <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 md:px-10">
      {/* left — monogram */}
      <button
        onClick={() => go(0)}
        className="pointer-events-auto flex items-center gap-3"
        data-cursor="open"
        aria-label="Back to intro"
      >
        <span className="flex h-7 w-7 items-center justify-center border border-white/25 font-display text-[11px] font-bold text-white transition-colors duration-300 hover:border-[#bef264] hover:text-[#bef264]">
          W
        </span>
        <span className="hidden font-display text-[10px] font-semibold tracking-[0.34em] text-white/85 sm:inline">
          WESLEY&nbsp;SAMUVEL
        </span>
      </button>

      {/* center — section links */}
      <nav
        className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex"
        aria-label="Sections"
      >
        {LINKS.map((l) => {
          const isActive = (SCENE_TO_INDICATOR[l.scene] ?? 0) === active
          return (
            <button
              key={l.label}
              onClick={() => go(l.scene)}
              data-cursor="open"
              className={`group relative font-display text-[9.5px] font-medium tracking-[0.3em] transition-colors duration-300 ${
                isActive ? 'text-[#bef264]' : 'text-white/50 hover:text-white'
              }`}
            >
              {l.label}
              <span
                className={`absolute -bottom-1.5 left-0 h-px bg-[#bef264] transition-all duration-500 ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>
          )
        })}
      </nav>

      {/* right — contact */}
      <button
        onClick={() => go(13)}
        data-cursor="open"
        className="pointer-events-auto border border-white/20 px-3.5 py-1.5 font-display text-[9.5px] font-medium tracking-[0.3em] text-white/85 transition-all duration-300 hover:border-[#bef264] hover:text-[#bef264] sm:px-4"
      >
        CONTACT
      </button>
    </header>
  )
}

/** Right-side vertical scene indicator — 01..09 */
export function SectionIndicator() {
  const active = useExperienceStore((s) => s.activeIndicator)

  return (
    <nav
      className="pointer-events-auto absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-2.5 sm:right-5 sm:flex md:right-7"
      aria-label="Scene indicator"
    >
      {INDICATOR.map((item, i) => {
        const isActive = active === i
        return (
          <button
            key={item.n}
            onClick={() => scrollToScene(item.scene)}
            data-cursor="open"
            className="group flex items-center gap-2 py-0.5"
            aria-label={`Go to ${item.label}`}
          >
            <span
              className={`hidden font-mono text-[8px] tracking-[0.2em] transition-all duration-300 md:inline ${
                isActive ? 'text-[#bef264] opacity-100' : 'text-white/40 opacity-0 group-hover:opacity-100'
              }`}
            >
              {item.label}
            </span>
            <span
              className={`font-mono text-[9px] tabular-nums transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-white/30 group-hover:text-white/80'
              }`}
            >
              {item.n}
            </span>
            <span
              className={`h-px transition-all duration-500 ${
                isActive
                  ? 'w-6 bg-[#bef264] shadow-[0_0_6px_rgba(190,242,100,0.8)]'
                  : 'w-2.5 bg-white/25 group-hover:bg-white/60'
              }`}
            />
          </button>
        )
      })}
    </nav>
  )
}
