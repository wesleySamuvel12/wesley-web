'use client'

import SceneOverlay from './SceneOverlay'
import { useExperienceStore } from '@/lib/store'

/** SCENE 01 — welcome + enormous name reveal */
export default function IntroOverlay() {
  const isTouch = useExperienceStore((s) => s.isTouch)

  return (
    <SceneOverlay index={0} revealOn="ready" className="flex items-center justify-center">
      <div className="flex flex-col items-center text-center">
        <p data-reveal className="font-mono text-[10px] tracking-[0.5em] text-white/50 sm:text-[11px]">
          WELCOME TO MY DIGITAL WORLD
        </p>
        <h1 data-reveal className="mt-6 font-display font-bold leading-[0.88] tracking-[-0.02em] text-white text-[clamp(4.2rem,16.5vw,15rem)]">
          WESLEY
          <span className="block text-white/95">
            SAMUVEL<span className="text-[#bef264]">.</span>
          </span>
        </h1>
        <div data-reveal className="mt-10 flex flex-col items-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <p className="font-mono text-[9px] tracking-[0.4em] text-white/40">
            ECE · FULL-STACK · AI/ML · IOT
          </p>
        </div>
      </div>

      {/* scroll hint — wording follows the input device */}
      <div data-reveal className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5">
        <span className="font-mono text-[8.5px] tracking-[0.42em] text-white/40">
          {isTouch ? 'SWIPE TO ENTER' : 'SCROLL TO ENTER'}
        </span>
        <span className="scroll-hint block h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </SceneOverlay>
  )
}
