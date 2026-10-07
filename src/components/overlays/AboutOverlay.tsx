'use client'

import SceneOverlay from './SceneOverlay'
import { Eyebrow, GlassCard } from '@/components/ui/experience-ui'

/** SCENE 04 — about: headline + support card over the 3D workspace */
export default function AboutOverlay() {
  return (
    <SceneOverlay index={3}>
      <div className="absolute left-6 top-[14%] max-w-2xl sm:left-12 md:left-16 lg:left-20">
        <Eyebrow data-reveal className="!justify-start">
          ABOUT — 04
        </Eyebrow>
        <h2 className="mt-5 font-display font-bold leading-[0.95] tracking-[-0.015em] text-white text-[clamp(2rem,4.6vw,4.2rem)]">
          <span data-reveal className="block">ENGINEERING AT</span>
          <span data-reveal className="block">
            THE EDGE OF <span className="text-[#67e8f9]">SOFTWARE</span>
          </span>
          <span data-reveal className="block">
            AND <span className="text-[#f5c86a]">HARDWARE.</span>
          </span>
        </h2>
      </div>

      <p data-reveal className="absolute bottom-[11%] left-6 max-w-sm text-[12.5px] leading-relaxed text-white/55 sm:left-12 sm:text-[13px] md:left-16">
        From soldering sensor arrays to deploying full-stack platforms — the
        labels floating around this desk are the disciplines I switch between
        daily.
      </p>

      <div data-reveal className="pointer-events-auto absolute bottom-[9%] right-6 hidden sm:right-12 md:block">
        <GlassCard className="w-56 p-5" floatDelay={0.6} glowColor="rgba(103,232,249,0.10)">
          <div className="font-mono text-[8.5px] tracking-[0.3em] text-white/40">STACK SPAN</div>
          <div className="mt-3 space-y-2.5">
            {[
              ['FIRMWARE', 'C · C++ · RTOS'],
              ['CLOUD', 'NEXT.JS · NODE'],
              ['INTELLIGENCE', 'PYTHON · CV'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <span className="font-mono text-[8.5px] tracking-[0.22em] text-white/45">{k}</span>
                <span className="font-mono text-[8.5px] tracking-[0.14em] text-[#67e8f9]">{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </SceneOverlay>
  )
}
