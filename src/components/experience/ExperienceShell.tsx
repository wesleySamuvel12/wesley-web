'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { SCENES, TOTAL_DURATION } from '@/lib/scenes'
import { initScrollEngine } from '@/lib/scrollEngine'
import { initInput } from '@/lib/input'
import { PROJECTS } from '@/data/projects'
import { useExperienceStore } from '@/lib/store'

import IntroOverlay from '@/components/overlays/IntroOverlay'
import HeroOverlay from '@/components/overlays/HeroOverlay'
import IdentityOverlay from '@/components/overlays/IdentityOverlay'
import AboutOverlay from '@/components/overlays/AboutOverlay'
import TechOverlay from '@/components/overlays/TechOverlay'
import ProjectOverlay from '@/components/overlays/ProjectOverlay'
import WebOverlay from '@/components/overlays/WebOverlay'
import HardwareOverlay from '@/components/overlays/HardwareOverlay'
import StatsOverlay from '@/components/overlays/StatsOverlay'
import CreativeOverlay from '@/components/overlays/CreativeOverlay'
import JourneyOverlay from '@/components/overlays/JourneyOverlay'
import ContactOverlay from '@/components/overlays/ContactOverlay'
import Loader from '@/components/navigation/Loader'
import { Navigation, SectionIndicator, MobileSceneBadge } from '@/components/navigation/Navigation'
import ErrorBoundary from './ErrorBoundary'
import SceneDip from './SceneDip'

const Stage = dynamic(() => import('@/components/3d/Stage'), { ssr: false })
const CustomCursor = dynamic(() => import('@/components/ui/CustomCursor'), { ssr: false })

const PROJECT_SCENES = PROJECTS.map((p) => Math.max(0, SCENES.findIndex((s) => s.id === p.scene)))

/** Invisible scroll-track sentinels (drive GSAP reveals per scene) */
const SENTINELS = (() => {
  let acc = 0
  return SCENES.map((s, i) => {
    const start = acc
    acc += s.duration
    return { i, start, dur: s.duration }
  })
})()

/**
 * WESLEY'S DIGITAL ENGINEERING WORLD
 * One fixed cinematic viewport + one tall scroll track = one continuous film.
 */
export default function ExperienceShell() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const cleanupScroll = initScrollEngine()
    const cleanupInput = initInput()
    // scrolling while an element is focused returns the camera to normal view
    const onUserScroll = () => useExperienceStore.getState().clearFocus()
    window.addEventListener('wheel', onUserScroll, { passive: true })
    window.addEventListener('touchmove', onUserScroll, { passive: true })
    setMounted(true)
    return () => {
      cleanupScroll()
      cleanupInput()
      window.removeEventListener('wheel', onUserScroll)
      window.removeEventListener('touchmove', onUserScroll)
    }
  }, [])

  return (
    <div className="relative bg-[#050505]">
      {/* scroll track — the film strip */}
      <div className="relative" style={{ height: `${TOTAL_DURATION}vh` }} aria-hidden="true">
        {SENTINELS.map((s) => (
          <div
            key={s.i}
            id={`sentinel-${s.i}`}
            style={{ position: 'absolute', top: `${s.start}vh`, height: `${s.dur}vh`, left: 0, width: '1px' }}
          />
        ))}
      </div>

      {/* fixed cinematic viewport — padding respects device safe areas */}
      <div className="viewport-pad fixed inset-0 z-10" role="main">
        <div className="experience-frame relative h-full w-full overflow-hidden rounded-[16px] border border-white/[0.09] bg-[#050505] sm:rounded-[22px] md:rounded-[26px]">
          <ErrorBoundary>
            {mounted && <Stage />}
          </ErrorBoundary>

          {/* film-cut dip — masks scene swaps so nothing mixes while scrolling */}
          <SceneDip />

          {/* overlays — container lets events fall through to the canvas */}
          <div className="pointer-events-none absolute inset-0 z-20">
            <IntroOverlay />
            <HeroOverlay />
            <IdentityOverlay />
            <AboutOverlay />
            <TechOverlay />
            {PROJECTS.map((p, i) => (
              <ProjectOverlay key={p.id} index={PROJECT_SCENES[i]} project={p} />
            ))}
            <WebOverlay />
            <HardwareOverlay />
            <StatsOverlay />
            <CreativeOverlay />
            <JourneyOverlay />
            <ContactOverlay />
          </div>

          {/* chrome */}
          <Navigation />
          <MobileSceneBadge />
          <SectionIndicator />
          <div className="film-grain pointer-events-none absolute inset-0 z-[60]" aria-hidden="true" />
          <div className="frame-vignette pointer-events-none absolute inset-0 z-[61] rounded-[inherit]" aria-hidden="true" />
          <Loader />
        </div>
      </div>

      <CustomCursor />
    </div>
  )
}
