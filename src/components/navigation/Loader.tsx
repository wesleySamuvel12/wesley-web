'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useProgress } from '@react-three/drei'
import { useExperienceStore } from '@/lib/store'

/** Cinematic preloader — monogram, progress, thin bar. Fades into the intro. */
export default function Loader() {
  const { active, progress, total } = useProgress()
  const canvasReady = useExperienceStore((s) => s.canvasReady)
  const root = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(false)
  const [display, setDisplay] = useState(0)

  // synthetic progress so the loader always feels alive (kept short — fast first response)
  useEffect(() => {
    const obj = { v: 0 }
    const tween = gsap.to(obj, {
      v: 100,
      duration: 1.15,
      ease: 'power2.inOut',
      onUpdate: () => setDisplay(Math.round(obj.v)),
    })
    return () => {
      tween.kill()
    }
  }, [])

  const realDone = !active && (total === 0 || progress >= 100)
  const ready = display >= 100 && realDone && canvasReady

  useEffect(() => {
    if (!ready || gone) return
    const t = window.setTimeout(() => {
      if (root.current) {
        gsap.to(root.current, {
          opacity: 0,
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: () => {
            useExperienceStore.getState().setReady(true)
            setGone(true)
          },
        })
      } else {
        useExperienceStore.getState().setReady(true)
        setGone(true)
      }
    }, 350)
    return () => window.clearTimeout(t)
  }, [ready, gone])

  useEffect(() => {
    if (barRef.current) barRef.current.style.width = `${display}%`
    if (numRef.current) numRef.current.textContent = String(display).padStart(3, '0')
  }, [display])

  if (gone) return null

  return (
    <div
      ref={root}
      className="absolute inset-0 z-[120] flex flex-col items-center justify-center bg-[#050505]"
      aria-hidden="true"
    >
      <div className="flex h-12 w-12 items-center justify-center border border-white/20 font-display text-lg font-bold text-white">
        W
      </div>
      <div className="mt-6 font-display text-[10px] font-medium tracking-[0.42em] text-white/50">
        WESLEY SAMUVEL
      </div>
      <div className="mt-8 h-px w-40 overflow-hidden bg-white/10 sm:w-52">
        <div ref={barRef} className="h-full bg-[#bef264] shadow-[0_0_10px_rgba(190,242,100,0.8)]" style={{ width: '0%' }} />
      </div>
      <div className="mt-3 font-mono text-[9px] tracking-[0.3em] text-white/35">
        <span ref={numRef}>000</span> — CALIBRATING WORLD
      </div>
    </div>
  )
}
