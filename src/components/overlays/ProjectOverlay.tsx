'use client'

import SceneOverlay from './SceneOverlay'
import { Eyebrow, GlassCard, MagneticButton } from '@/components/ui/experience-ui'
import type { Project } from '@/data/projects'

interface ProjectOverlayProps {
  index: number
  project: Project
}

const STATUS_COLOR: Record<string, string> = {
  live: '#bef264',
  active: '#67e8f9',
  integrated: '#a78bfa',
  beta: '#f5c86a',
}

/**
 * Cinematic product-showcase overlay, shared by all five projects.
 * The 3D environment carries the visuals; this HUD adds typography + data.
 */
export default function ProjectOverlay({ index, project }: ProjectOverlayProps) {
  return (
    <SceneOverlay index={index}>
      {/* headline block */}
      <div className="absolute left-6 top-[13%] sm:left-12 md:left-16 lg:left-20">
        <Eyebrow data-reveal className="!justify-start">
          PROJECT {project.index} / 05 — {project.category}
        </Eyebrow>
        <h2 className="mt-4 font-display font-bold leading-[0.9] tracking-[-0.02em] text-white text-[clamp(2.6rem,7vw,6.4rem)]">
          {project.title.map((line, i) => (
            <span key={i} data-reveal className="block" style={i === project.title.length - 1 ? { color: project.accent } : undefined}>
              {line}
            </span>
          ))}
        </h2>
        <p data-reveal className="mt-4 max-w-md font-mono text-[9.5px] tracking-[0.3em] text-white/50">
          {project.subtitle}
        </p>
        <p data-reveal className="mt-4 hidden max-w-sm text-[12.5px] leading-relaxed text-white/50 md:block">
          {project.description}
        </p>
      </div>

      {/* feature card */}
      <div data-reveal className="pointer-events-auto absolute right-6 top-[17%] hidden w-[min(76vw,300px)] sm:right-12 md:block lg:right-20">
        <GlassCard className="p-5" glowColor={`${project.accent}1a`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8.5px] tracking-[0.3em] text-white/40">SYSTEM CARD</span>
            <span className="font-mono text-[8.5px] tracking-[0.2em]" style={{ color: project.accent }}>
              ● LIVE
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {project.features.map((f) => (
              <div key={f.label} className="flex items-start justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="font-display text-[11.5px] font-semibold tracking-wide text-white">{f.label}</div>
                  <div className="mt-0.5 font-mono text-[8px] tracking-[0.18em] text-white/40">{f.value}</div>
                </div>
                <span
                  className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: STATUS_COLOR[f.status ?? 'active'] ?? '#67e8f9',
                    boxShadow: `0 0 8px ${STATUS_COLOR[f.status ?? 'active'] ?? '#67e8f9'}`,
                  }}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* koottam data-flow chain */}
      {project.flow && (
        <div data-reveal className="absolute bottom-[9%] left-6 sm:left-12 md:left-16 lg:left-20">
          <div className="flex flex-col gap-0">
            {project.flow.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="font-mono text-[9.5px] tracking-[0.34em] text-white/80">{step}</span>
                  {i < project.flow!.length - 1 && (
                    <span className="flow-arrow my-1 block h-4 w-px bg-gradient-to-b from-white/60 to-white/10" />
                  )}
                </div>
                {i === 1 && (
                  <span className="mb-2 font-mono text-[8px] tracking-[0.2em] text-[#f5c86a]">← AI PARSES INTENT</span>
                )}
                {i === 3 && (
                  <span className="mb-2 font-mono text-[8px] tracking-[0.2em] text-[#bef264]">← COMMUNITY BUNDLE</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* stats strip + tech chips */}
      <div className="absolute bottom-[9%] right-6 hidden flex-col items-end gap-3 sm:right-12 md:flex lg:right-20">
        <div data-reveal className="flex gap-5">
          {project.stats.map((s) => (
            <div key={s.label} className="text-right">
              <div className="font-display text-lg font-bold text-white" style={{ color: project.accent }}>
                {s.value}
              </div>
              <div className="mt-0.5 font-mono text-[7.5px] tracking-[0.24em] text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
        <div data-reveal className="flex max-w-xs flex-wrap justify-end gap-1.5">
          {project.technologies.map((t) => (
            <span key={t} className="border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[7.5px] tracking-[0.18em] text-white/50">
              {t}
            </span>
          ))}
        </div>
        <div data-reveal className="pointer-events-auto">
          <MagneticButton href={project.github} external cursorLabel="VIEW" className="!px-4 !py-2 !text-[8.5px]">
            VIEW CASE STUDY ↗
          </MagneticButton>
        </div>
      </div>
    </SceneOverlay>
  )
}
