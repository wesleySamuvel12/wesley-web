'use client'

import { useEffect, useRef } from 'react'
import { getScrollState } from '@/lib/scrollEngine'
import { boundaryDip } from '@/lib/scenes'
import { useExperienceStore } from '@/lib/store'

/**
 * SceneDip — the film-cut overlay. As the scroll timeline approaches an
 * integer scene boundary this fades the viewport to near-black, the camera
 * snaps to the next scene's opening keyframe while the frame is dark, and
 * the dip clears to reveal the new scene. Scene swaps are therefore fully
 * masked: scenes never blend or mix during scrolling.
 */
export default function SceneDip() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = ref.current
      if (el) {
        const ready = useExperienceStore.getState().ready
        const d = ready ? boundaryDip(getScrollState().sceneFloat) : 0
        if (d <= 0.001) {
          el.style.visibility = 'hidden'
          el.style.opacity = '0'
        } else {
          el.style.visibility = 'visible'
          el.style.opacity = d.toFixed(3)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[15] bg-[#020204]"
      style={{ opacity: 0, visibility: 'hidden' }}
    />
  )
}
