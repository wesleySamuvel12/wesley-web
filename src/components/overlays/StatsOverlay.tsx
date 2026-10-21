'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SceneOverlay from './SceneOverlay'
import { Eyebrow, GlassCard } from '@/components/ui/experience-ui'
import { STATS } from '@/data/content'

/** PERFORMANCE — oversized genuine statistics in translucent glass panels */
export default function StatsOverlay() {
  const root = useRef<HTMLDivElement>(null)

  // count-up when the overlay first reveals
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>('[data-count]') ?? []
    const cleanups: Array<() => void> = []
    els.forEach((el) => {
      const target = el.dataset.count ?? ''
      const numeric = Number(target)
      if (!Number.isFinite(numeric) || target === '') return
      const obj = { v: 0 }
      const tween = gsap.to(obj, {
        v: numeric,
        duration: 1.8,
        ease: 'power3.out',
        paused: true,
        delay: 0.9,
        onUpdate: () => {
          el.textContent = String(Math.round(obj.v))
        },
      })
      // play via opacity of the scene root (set by SceneOverlay's scroll bus)
      const parent = el.closest('[data-scene-root]') as HTMLElement | null
      if (parent) {
        const check = () => {
          if (Number(parent.style.opacity || 0) > 0.6) {
            tween.play()
          } else {
            tween.pause(0)
          }
        }
        const iv = window.setInterval(check, 200)
        cleanups.push(() => window.clearInterval(iv))
      }
      cleanups.push(() => tween.kill())
    })
    return () => cleanups.forEach((c) => c())
  }, [])

  return (
    <SceneOverlay index={11}>
      <div className="absolute left-6 top-[13%] sm:left-12 md:left-16 lg:left-20">
        <Eyebrow data-reveal className="!justify-start">
          PERFORMANCE — TRACK RECORD
        </Eyebrow>
        <h2 data-reveal className="mt-5 font-display font-bold leading-[0.95] tracking-[-0.015em] text-white text-[clamp(1.9rem,4.2vw,3.8rem)]">
          NUMBERS THAT <span className="text-[#bef264]">MATTER.</span>
        </h2>
      </div>

      <div ref={root} className="absolute inset-x-6 bottom-[9%] grid grid-cols-2 gap-3 sm:inset-x-12 sm:gap-4 md:inset-x-16 lg:inset-x-24 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={s.label} data-reveal>
            <GlassCard className="p-4 sm:p-6" floatDelay={i * 0.7} glowColor="rgba(190,242,100,0.08)">
              <div className="font-display font-bold leading-none tracking-[-0.02em] text-white text-[clamp(2.6rem,6vw,5rem)]">
                {Number.isFinite(Number(s.value)) ? (
                  <>
                    <span data-count={s.value}>0</span>
                    <span className="text-[#bef264]">{s.suffix}</span>
                  </>
                ) : (
                  <span className="text-[#bef264]">{s.value}</span>
                )}
              </div>
              <div className="mt-3 font-mono text-[8.5px] tracking-[0.28em] text-white/60">{s.label}</div>
              <div className="mt-1.5 font-mono text-[7.5px] tracking-[0.2em] text-white/30">{s.meta}</div>
            </GlassCard>
          </div>
        ))}
      </div>
    </SceneOverlay>
  )
}
