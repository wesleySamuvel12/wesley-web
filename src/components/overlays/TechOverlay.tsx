'use client'

import SceneOverlay from './SceneOverlay'
import { Eyebrow, GlassCard } from '@/components/ui/experience-ui'
import { TECH_NODES, CATEGORY_COLORS } from '@/data/skills'
import { useExperienceStore } from '@/lib/store'

/** SCENE 05 — technology constellation HUD */
export default function TechOverlay() {
  const hoveredTech = useExperienceStore((s) => s.hoveredTech)
  const node = TECH_NODES.find((n) => n.id === hoveredTech) ?? null

  return (
    <SceneOverlay index={4}>
      <div className="absolute left-6 top-[15%] sm:left-12 md:left-16 lg:left-20">
        <Eyebrow data-reveal className="!justify-start">
          TECHNOLOGY — 05
        </Eyebrow>
        <h2 data-reveal className="mt-5 font-display font-bold leading-[0.95] tracking-[-0.015em] text-white text-[clamp(1.9rem,4.2vw,3.8rem)]">
          TECH<span className="text-[#67e8f9]">NOLOGY</span> CONSTELLATION
        </h2>
        <p data-reveal className="mt-4 font-mono text-[9px] tracking-[0.32em] text-white/40">
          HOVER A NODE TO SCAN · SIGNALS TRAVEL THE LINKS
        </p>
      </div>

      {/* legend */}
      <div data-reveal className="absolute bottom-[9%] left-6 hidden flex-col gap-2 sm:left-12 md:flex">
        {(['LANGUAGE', 'WEB', 'AI', 'HARDWARE', 'DATA', 'CRAFT'] as const).map((cat) => (
          <div key={cat} className="flex items-center gap-2.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[cat], boxShadow: `0 0 6px ${CATEGORY_COLORS[cat]}` }}
            />
            <span className="font-mono text-[8.5px] tracking-[0.26em] text-white/40">{cat}</span>
          </div>
        ))}
      </div>

      {/* hover scan panel */}
      <div data-reveal className="pointer-events-auto absolute right-6 top-[20%] w-[min(78vw,300px)] sm:right-12 md:right-16 lg:right-24">
        {node ? (
          <GlassCard className="p-5" glowColor="rgba(103,232,249,0.12)">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8.5px] tracking-[0.3em]" style={{ color: CATEGORY_COLORS[node.category] }}>
                {node.category}
              </span>
              <span className="font-mono text-[8.5px] tracking-[0.2em] text-white/35">SCANNING</span>
            </div>
            <div className="mt-2.5 font-display text-xl font-bold tracking-wide text-white">{node.label}</div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-white/55">{node.blurb}</p>
            <div className="mt-4">
              <div className="flex items-center justify-between font-mono text-[8.5px] tracking-[0.24em] text-white/40">
                <span>PROFICIENCY</span>
                <span className="text-white/70">{Math.round(node.level * 100)}%</span>
              </div>
              <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${node.level * 100}%`, backgroundColor: CATEGORY_COLORS[node.category] }}
                />
              </div>
            </div>
          </GlassCard>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center font-mono text-[9px] tracking-[0.3em] text-white/30">
            AWAITING TARGET
          </div>
        )}
      </div>
    </SceneOverlay>
  )
}
