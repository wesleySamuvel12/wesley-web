'use client'

import { AutoReturnBar } from '@/components/ui/experience-ui'
import { HARDWARE_BY_ID } from '@/data/hardware'
import { useExperienceStore } from '@/lib/store'

/**
 * Component inspector for the Embedded Intelligence lab bench.
 * Appears when a 3D component is clicked; auto-closes after a few seconds
 * (the store arms the timer, this card just mirrors the countdown).
 */
export default function HardwareOverlay() {
  const focusedId = useExperienceStore((s) => s.focusedHardware)
  const focusReturnAt = useExperienceStore((s) => s.focusReturnAt)
  const setFocusedHardware = useExperienceStore((s) => s.setFocusedHardware)
  const component = focusedId ? HARDWARE_BY_ID[focusedId] : null

  if (!component) return null

  return (
    <div className="pointer-events-auto absolute bottom-[22%] right-6 z-30 w-[min(86vw,320px)] sm:right-12 md:right-16 lg:right-20">
      <div className="glass-panel p-5" style={{ ['--glow' as string]: `${component.accent}1f` }}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8.5px] tracking-[0.3em]" style={{ color: component.accent }}>
            ● COMPONENT INSPECT
          </span>
          <button
            onClick={() => setFocusedHardware(null)}
            className="border border-white/15 px-2.5 py-1 font-mono text-[8px] tracking-[0.22em] text-white/60 transition-colors hover:border-[#bef264] hover:text-[#bef264]"
            data-cursor="open"
          >
            CLOSE ✕
          </button>
        </div>

        <div className="mt-3 font-display text-lg font-bold leading-tight text-white">{component.name}</div>
        <div className="mt-1 font-mono text-[8.5px] tracking-[0.26em]" style={{ color: component.accent }}>
          {component.role}
        </div>

        <div className="mt-3.5 space-y-2 border-t border-white/10 pt-3.5">
          {component.specs.map((s) => (
            <div key={s} className="flex items-center gap-2 text-[11.5px] leading-snug text-white/60">
              <span className="h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: component.accent }} />
              {s}
            </div>
          ))}
        </div>

        <div className="mt-3.5 flex items-center justify-between border border-white/10 bg-white/[0.03] px-3 py-2">
          <span className="font-mono text-[8px] tracking-[0.24em] text-white/35">PINOUT</span>
          <span className="font-mono text-[8.5px] tracking-[0.18em] text-white/75">{component.pin}</span>
        </div>

        <div className="mt-3.5">
          <AutoReturnBar returnAt={focusReturnAt} accent={component.accent} />
        </div>
      </div>
    </div>
  )
}
