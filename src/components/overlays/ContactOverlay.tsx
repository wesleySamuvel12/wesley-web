'use client'

import SceneOverlay from './SceneOverlay'
import { MagneticButton } from '@/components/ui/experience-ui'
import { CONTACT } from '@/data/content'
import { scrollToScene } from '@/lib/scrollEngine'

const FOOTER_LINKS = [
  { label: 'ABOUT', scene: 3 },
  { label: 'WORK', scene: 5 },
  { label: 'TECH', scene: 4 },
  { label: 'JOURNEY', scene: 12 },
]

/** FINAL SCENE — CTA + minimal editorial footer with giant ghost branding */
export default function ContactOverlay() {
  return (
    <SceneOverlay index={14} className="flex items-center">
      <div className="w-full px-6 pb-44 pt-6 sm:px-12 sm:pb-36 md:px-16 md:pb-40 lg:px-20">
        <h2 className="font-display font-bold leading-[0.92] tracking-[-0.02em] text-white text-[clamp(2.8rem,8vw,7.8rem)]">
          <span data-reveal className="block">LET&apos;S BUILD</span>
          <span data-reveal className="block">SOMETHING</span>
          <span data-reveal className="block">
            <span className="text-[#bef264]">REAL.</span>
          </span>
        </h2>
        <p data-reveal className="mt-6 max-w-md text-[13px] leading-relaxed text-white/55 sm:text-sm">
          Have an idea, technical problem or product worth building? The
          lab is open — let&apos;s put something on the bench.
        </p>
        <div data-reveal className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3.5">
          <MagneticButton variant="primary" href={`mailto:${CONTACT.email}`} cursorLabel="EMAIL">
            CONTACT ME
          </MagneticButton>
          <MagneticButton href={`tel:${CONTACT.phoneRaw}`} cursorLabel="CALL">
            CALL: {CONTACT.phone}
          </MagneticButton>
          <MagneticButton href={CONTACT.github} external cursorLabel="OPEN">
            GITHUB ↗
          </MagneticButton>
          <MagneticButton href={CONTACT.linkedin} external cursorLabel="OPEN">
            LINKEDIN ↗
          </MagneticButton>
        </div>
      </div>

      {/* ------------------------------- footer ------------------------------- */}
      <footer className="absolute inset-x-0 bottom-0 mt-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* giant faint branding */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-[3vw] select-none text-center font-display font-bold leading-[0.8] tracking-[-0.03em] text-transparent text-[19vw]"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.055)' }}
        >
          WESLEY
        </div>

        <div className="relative border-t border-white/8 bg-gradient-to-t from-black/60 to-transparent px-6 pb-5 pt-5 backdrop-blur-[2px] sm:px-12 md:px-16 lg:px-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-display text-[10px] font-semibold tracking-[0.34em] text-white/85">
              WESLEY SAMUVEL
            </div>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Footer">
              {FOOTER_LINKS.map((l) => (
                <button
                  key={l.label}
                  onClick={() => scrollToScene(l.scene)}
                  data-cursor="open"
                  className="font-mono text-[8px] tracking-[0.3em] text-white/40 transition-colors duration-300 hover:text-white"
                >
                  {l.label}
                </button>
              ))}
              <a
                href={`mailto:${CONTACT.email}`}
                data-cursor="open"
                className="hidden font-mono text-[8px] tracking-[0.3em] text-white/40 transition-colors duration-300 hover:text-[#bef264] sm:inline"
              >
                {CONTACT.email.toUpperCase()}
              </a>
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                data-cursor="call"
                className="hidden font-mono text-[8px] tracking-[0.3em] text-white/40 transition-colors duration-300 hover:text-[#bef264] sm:inline"
              >
                +91 {CONTACT.phone}
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <a
                href={CONTACT.github}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="open"
                aria-label="GitHub"
                className="font-mono text-[8px] tracking-[0.24em] text-white/40 transition-colors hover:text-white"
              >
                GH
              </a>
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="open"
                aria-label="LinkedIn"
                className="font-mono text-[8px] tracking-[0.24em] text-white/40 transition-colors hover:text-white"
              >
                LI
              </a>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono text-[7.5px] tracking-[0.26em] text-white/30">
              © 2025 WESLEY SAMUVEL — ALL SYSTEMS OPERATIONAL
              <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[#bef264] align-middle shadow-[0_0_6px_rgba(190,242,100,0.9)]" />
            </span>
            <span className="font-mono text-[7.5px] tracking-[0.26em] text-white/30">
              DESIGNED &amp; ENGINEERED IN THE DIGITAL LAB
            </span>
          </div>
        </div>
      </footer>
    </SceneOverlay>
  )
}
