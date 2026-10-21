'use client'

import SceneOverlay from './SceneOverlay'
import { Eyebrow, MagneticButton, AutoReturnBar } from '@/components/ui/experience-ui'
import { CREATIVE_WORKS } from '@/data/content'
import { useExperienceStore } from '@/lib/store'

/** SCENE 09 — creative gallery HUD + focus inspector */
export default function CreativeOverlay() {
  const focusedId = useExperienceStore((s) => s.focusedCreative)
  const focusReturnAt = useExperienceStore((s) => s.focusReturnAt)
  const setFocusedCreative = useExperienceStore((s) => s.setFocusedCreative)
  const work = CREATIVE_WORKS.find((w) => w.id === focusedId) ?? null

  return (
    <SceneOverlay index={12}>
      <div className="absolute left-6 top-[13%] sm:left-12 md:left-16 lg:left-20">
        <Eyebrow data-reveal className="!justify-start">
          CREATIVE WORK — 08
        </Eyebrow>
        <h2 data-reveal className="mt-5 font-display font-bold leading-[0.95] tracking-[-0.015em] text-white text-[clamp(1.9rem,4.2vw,3.8rem)]">
          THE <span className="text-[#bef264]">GALLERY</span>
        </h2>
        <p data-reveal className="mt-4 font-mono text-[9px] tracking-[0.32em] text-white/40">
          {work ? 'INSPECTING —' : 'HOVER A DISPLAY · CLICK TO INSPECT'}
        </p>
        {!work && (
          <p data-reveal className="mt-2 font-mono text-[8px] tracking-[0.26em] text-white/25">
            FOCUS AUTO-RETURNS AFTER 7S
          </p>
        )}
      </div>

      {work && (
        <div className="pointer-events-auto absolute bottom-[10%] right-6 w-[min(86vw,320px)] sm:right-12 md:right-16 lg:right-24">
          <div className="glass-panel p-5" style={{ ['--glow' as string]: 'rgba(190,242,100,0.12)' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8.5px] tracking-[0.3em] text-white/40">{work.category} · {work.year}</span>
              <button
                onClick={() => setFocusedCreative(null)}
                className="border border-white/15 px-2.5 py-1 font-mono text-[8px] tracking-[0.22em] text-white/60 transition-colors hover:border-[#bef264] hover:text-[#bef264]"
                data-cursor="open"
              >
                CLOSE ✕
              </button>
            </div>
            <div className="mt-3 font-display text-xl font-bold text-white">{work.title}</div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-white/55">{work.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-mono text-[8px] tracking-[0.22em] text-white/35">{work.tools}</span>
              <span className="font-mono text-[8px] tracking-[0.22em] text-[#bef264]">WS-ARCHIVE</span>
            </div>
            <div className="mt-3.5">
              <AutoReturnBar returnAt={focusReturnAt} />
            </div>
          </div>
        </div>
      )}

      {/* film-strip index */}
      <div data-reveal className="absolute bottom-[10%] left-6 hidden flex-col gap-1.5 sm:left-12 md:flex">
        {CREATIVE_WORKS.map((w, i) => (
          <div key={w.id} className="flex items-center gap-2.5 font-mono text-[8px] tracking-[0.24em]">
            <span className={w.id === focusedId ? 'text-[#bef264]' : 'text-white/30'}>0{i + 1}</span>
            <span className={w.id === focusedId ? 'text-white/80' : 'text-white/35'}>{w.title.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </SceneOverlay>
  )
}
