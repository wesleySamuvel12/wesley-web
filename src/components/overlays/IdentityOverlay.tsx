'use client'

import SceneOverlay from './SceneOverlay'
import { Eyebrow, GlassCard } from '@/components/ui/experience-ui'

/** SCENE 03 — editorial identity statement */
export default function IdentityOverlay() {
  return (
    <SceneOverlay index={2} className="flex items-center">
      <div className="w-full px-6 sm:px-12 md:px-16 lg:px-20">
        <Eyebrow data-reveal className="!justify-start">
          IDENTITY — 03
        </Eyebrow>
        <h2 className="mt-6 font-display font-bold leading-[0.92] tracking-[-0.02em] text-white text-[clamp(2.6rem,7.6vw,7.2rem)]">
          <span data-reveal className="block">I BUILD</span>
          <span data-reveal className="block">
            <span className="text-[#bef264]">SYSTEMS</span> THAT
          </span>
          <span data-reveal className="block">MOVE FROM</span>
          <span data-reveal className="block">
            IDEA TO <span className="text-[#bef264]">REALITY.</span>
          </span>
        </h2>
        <p data-reveal className="mt-8 max-w-md text-[13px] leading-relaxed text-white/55 sm:text-sm">
          I work across software, artificial intelligence, electronics, IoT and
          interactive design — one pipeline, from schematic to shipped product.
        </p>
      </div>

      {/* floating information card */}
      <div data-reveal className="pointer-events-auto absolute bottom-[10%] right-6 hidden sm:right-12 md:block lg:right-20">
        <GlassCard className="w-60 p-5" floatDelay={1.2}>
          <div className="font-mono text-[8.5px] tracking-[0.3em] text-white/40">CURRENTLY</div>
          <div className="mt-2.5 font-display text-sm font-semibold text-white">ECE ENGINEERING — FINAL YEAR</div>
          <div className="mt-3 flex items-center gap-2 font-mono text-[8.5px] tracking-[0.22em] text-white/45">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#bef264] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#bef264]" />
            </span>
            OPEN TO COLLABORATION
          </div>
          <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[8.5px] tracking-[0.22em] text-white/35">
            STATUS · BUILDING HYDROFLOAT V2
          </div>
        </GlassCard>
      </div>
    </SceneOverlay>
  )
}
