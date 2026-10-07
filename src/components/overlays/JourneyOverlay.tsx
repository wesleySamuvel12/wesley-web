'use client'

import SceneOverlay from './SceneOverlay'
import { Eyebrow } from '@/components/ui/experience-ui'
import { TIMELINE } from '@/data/content'
import { useExperienceStore } from '@/lib/store'

/** SCENE 09 — journey: textual context synced to the 3D timeline camera */
export default function JourneyOverlay() {
  const current = useExperienceStore((s) => s.currentMilestone)
  const milestone = TIMELINE[current] ?? TIMELINE[0]
  const total = TIMELINE.length

  return (
    <SceneOverlay index={12}>
      <div className="absolute left-6 top-[13%] sm:left-12 md:left-16 lg:left-20">
        <Eyebrow data-reveal className="!justify-start">
          JOURNEY — 09 · SCROLL TO TRAVEL
        </Eyebrow>
      </div>

      {/* current chapter */}
      <div className="absolute bottom-[10%] left-6 max-w-lg sm:left-12 md:left-16 lg:left-20">
        <div key={milestone.id} className="milestone-swap">
          <div className="font-mono text-[10px] tracking-[0.4em]" style={{ color: milestone.accent }}>
            {milestone.year}
          </div>
          <h2 className="mt-3 font-display font-bold leading-[0.95] tracking-[-0.015em] text-white text-[clamp(2rem,5vw,4.4rem)]">
            {milestone.title}
          </h2>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/55">{milestone.description}</p>
        </div>
        <div className="mt-6 flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                i === current ? 'w-7 bg-[#bef264]' : i < current ? 'w-3 bg-white/50' : 'w-3 bg-white/15'
              }`}
            />
          ))}
        </div>
      </div>
    </SceneOverlay>
  )
}
