'use client'

import SceneOverlay from './SceneOverlay'
import { Eyebrow, MagneticButton, AutoReturnBar } from '@/components/ui/experience-ui'
import { WEB_PRODUCTS } from '@/data/web'
import { useExperienceStore } from '@/lib/store'

/** SCENE 07 — live web products HUD + focus inspector */
export default function WebOverlay() {
  const focusedId = useExperienceStore((s) => s.focusedWeb)
  const focusReturnAt = useExperienceStore((s) => s.focusReturnAt)
  const setFocusedWeb = useExperienceStore((s) => s.setFocusedWeb)
  const product = WEB_PRODUCTS.find((w) => w.id === focusedId) ?? null

  return (
    <SceneOverlay index={10}>
      <div className="absolute left-6 top-[13%] sm:left-12 md:left-16 lg:left-20">
        <Eyebrow data-reveal className="!justify-start">
          DEPLOYED WEB — 07
        </Eyebrow>
        <h2 data-reveal className="mt-5 font-display font-bold leading-[0.95] tracking-[-0.015em] text-white text-[clamp(1.9rem,4.2vw,3.8rem)]">
          LIVE <span className="text-[#bef264]">PRODUCTS</span>
        </h2>
        <p data-reveal className="mt-4 font-mono text-[9px] tracking-[0.32em] text-white/40">
          {product ? 'INSPECTING —' : 'REAL SITES · CLICK A WINDOW TO INSPECT'}
        </p>
      </div>

      {/* product index (bottom-left) */}
      <div data-reveal className="absolute bottom-[10%] left-6 hidden flex-col gap-1.5 sm:left-12 md:flex">
        {WEB_PRODUCTS.map((w, i) => (
          <div key={w.id} className="flex items-center gap-2.5 font-mono text-[8px] tracking-[0.24em]">
            <span className={w.id === focusedId ? 'text-[#bef264]' : 'text-white/30'}>0{i + 1}</span>
            <span className={w.id === focusedId ? 'text-white/80' : 'text-white/35'}>{w.title}</span>
          </div>
        ))}
      </div>

      {/* inspect card */}
      {product && (
        <div className="pointer-events-auto absolute bottom-[10%] right-6 w-[min(88vw,340px)] sm:right-12 md:right-16 lg:right-24">
          <div className="glass-panel p-5" style={{ ['--glow' as string]: `${product.accent}1f` }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8.5px] tracking-[0.3em]" style={{ color: product.accent }}>
                ● DEPLOYED · {product.category}
              </span>
              <button
                onClick={() => setFocusedWeb(null)}
                className="border border-white/15 px-2.5 py-1 font-mono text-[8px] tracking-[0.22em] text-white/60 transition-colors hover:border-[#bef264] hover:text-[#bef264]"
                data-cursor="open"
              >
                CLOSE ✕
              </button>
            </div>
            <div className="mt-3 font-display text-lg font-bold leading-tight text-white">{product.title}</div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-white/55">{product.description}</p>
            <div className="mt-3.5 flex gap-4">
              {product.highlights.map((h) => (
                <div key={h.label}>
                  <div className="font-display text-sm font-bold" style={{ color: product.accent }}>
                    {h.value}
                  </div>
                  <div className="mt-0.5 font-mono text-[7px] tracking-[0.2em] text-white/40">{h.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {product.stack.map((t) => (
                <span key={t} className="border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[7px] tracking-[0.18em] text-white/50">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 border-t border-white/10 pt-3">
              <AutoReturnBar returnAt={focusReturnAt} accent={product.accent} />
            </div>
            <div className="mt-3">
              <MagneticButton href={product.url} external cursorLabel="OPEN" variant="primary" className="!px-4 !py-2 !text-[8.5px]">
                OPEN LIVE SITE ↗
              </MagneticButton>
            </div>
          </div>
        </div>
      )}

      {/* resting quick-links (bottom-right) */}
      {!product && (
        <div data-reveal className="absolute bottom-[10%] right-6 hidden w-[min(80vw,300px)] flex-col gap-2 sm:right-12 md:flex lg:right-20">
          {WEB_PRODUCTS.map((w) => (
            <a
              key={w.id}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="open"
              className="glass-panel group flex items-center justify-between px-4 py-3 transition-transform duration-300 hover:-translate-y-0.5"
              style={{ ['--glow' as string]: `${w.accent}14` }}
            >
              <span className="flex flex-col">
                <span className="font-display text-[12.5px] font-semibold tracking-wide text-white">{w.title}</span>
                <span className="mt-0.5 font-mono text-[8px] tracking-[0.2em] text-white/40">{w.domain} ↗</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: w.accent, boxShadow: `0 0 8px ${w.accent}` }} />
                <span className="font-mono text-[7.5px] tracking-[0.22em] text-white/50">LIVE</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </SceneOverlay>
  )
}
