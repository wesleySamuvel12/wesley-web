'use client'

import SceneOverlay from './SceneOverlay'
import { Eyebrow, MagneticButton } from '@/components/ui/experience-ui'
import { scrollToScene } from '@/lib/scrollEngine'

/** SCENE 02 — engineering hero: roles, promise, CTA. The 3D PCB carries the visuals. */
export default function HeroOverlay() {
  return (
    <SceneOverlay index={1}>
      {/* huge ghost name behind the 3D object */}
      <div
        data-reveal
        aria-hidden="true"
        className="ghost-name pointer-events-none absolute left-1/2 top-[13%] -translate-x-1/2 whitespace-nowrap font-display font-bold tracking-[-0.02em] text-transparent text-[clamp(3.4rem,11.5vw,11rem)]"
      >
        WESLEY SAMUVEL
      </div>

      <div className="absolute bottom-[9%] left-6 right-6 sm:bottom-[10%] sm:left-10 md:left-14 md:max-w-xl lg:left-16">
        <Eyebrow data-reveal className="!justify-start" >
          SCENE 02 — ENGINEERING WORLD
        </Eyebrow>
        <h2 data-reveal className="mt-5 font-display font-bold leading-[0.95] tracking-[-0.01em] text-white text-[clamp(2.1rem,5.2vw,4.6rem)]">
          ENGINEER.
          <span className="block text-white/85">DEVELOPER.</span>
          <span className="block">
            BUILDER<span className="text-[#bef264]">.</span>
          </span>
        </h2>
        <p data-reveal className="mt-5 max-w-md text-[13px] leading-relaxed text-white/55 sm:text-sm">
          Building intelligent systems where electronics, software, artificial
          intelligence and design meet.
        </p>
        <div data-reveal className="pointer-events-auto mt-7">
          <MagneticButton variant="primary" onClick={() => scrollToScene(5)} cursorLabel="GO">
            EXPLORE MY WORK
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </MagneticButton>
        </div>
      </div>

      {/* right meta column */}
      <div data-reveal className="absolute right-6 top-[22%] hidden flex-col items-end gap-1.5 font-mono text-[9px] tracking-[0.28em] text-white/35 lg:flex">
        <span>MODULE — WS-CORE-01</span>
        <span>STATUS · <span className="text-[#bef264]">ONLINE</span></span>
        <span>ORBIT — STABILIZED</span>
      </div>
    </SceneOverlay>
  )
}
