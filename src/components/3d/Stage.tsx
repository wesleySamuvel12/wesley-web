'use client'

import * as THREE from 'three'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import CameraController from './CameraController'
import SceneManager from './SceneManager'
import EnvController from './EnvController'
import Effects from './Effects'
import { useExperienceStore, type QualityTier } from '@/lib/store'

/** DPR ceilings per tier — pixel density is the #1 fill-rate lever */
const TIER_DPR: Record<QualityTier, number> = { high: 1.5, med: 1.2, low: 0.85 }
const TIER_ORDER: QualityTier[] = ['low', 'med', 'high']

/** True on CPU rasterizers (SwiftShader / llvmpipe) — start them at low tier */
function isSoftwareGL(): boolean {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return true
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)
  } catch {
    return true
  }
}

/**
 * Deterministic FPS governor (replaces drei PerformanceMonitor):
 * - 1.5s measurement windows after a warm-up
 * - avg < 26fps twice in a row  → step down
 * - avg > 52fps three windows   → step up (hysteresis, no oscillation)
 */
function FpsGovernor() {
  const acc = useRef({ warm: 0, frames: 0, time: 0, good: 0, bad: 0 })
  useFrame((_, rawDelta) => {
    const a = acc.current
    const delta = Math.min(rawDelta, 0.1)
    a.warm += delta
    if (a.warm < 1.5) return
    a.frames += 1
    a.time += delta
    if (a.time < 1.5) return
    const fps = a.frames / a.time
    a.frames = 0
    a.time = 0
    const { quality, setQuality } = useExperienceStore.getState()
    if (fps < 26) {
      a.good = 0
      a.bad += 1
      if (a.bad >= 2 && quality !== 'low') {
        setQuality(TIER_ORDER[Math.max(0, TIER_ORDER.indexOf(quality) - 1)])
        a.bad = 0
      }
    } else if (fps > 52) {
      a.bad = 0
      a.good += 1
      if (a.good >= 3 && quality !== 'high') {
        setQuality(TIER_ORDER[Math.min(2, TIER_ORDER.indexOf(quality) + 1)])
        a.good = 0
      }
    } else {
      a.bad = 0
      a.good = 0
    }
  })
  return null
}

export default function Stage() {
  const setCanvasReady = useExperienceStore((s) => s.setCanvasReady)
  const setQuality = useExperienceStore((s) => s.setQuality)
  const quality = useExperienceStore((s) => s.quality)
  const [dpr, setDpr] = useState(1.3)

  // follow the governor's tier decision with the matching pixel budget
  useEffect(() => {
    setDpr(TIER_DPR[quality])
  }, [quality])
  return (
    <Canvas
      dpr={dpr}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 42, near: 0.08, far: 90, position: [0, 0.15, 9] }}
      onCreated={({ gl, scene, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        setCanvasReady(true)
        // CPU rasterizers skip straight to the lean pipeline
        if (isSoftwareGL()) setQuality('low')
        const w = window as unknown as Record<string, unknown>
        w.__r3fcam = camera
        w.__r3fscene = scene
        w.__r3fgl = gl
        w.__r3fstore = useExperienceStore
        // dev probe: list what a screen-space ray hits (x/y in CSS pixels)
        const probe = new THREE.Raycaster()
        const probeV = new THREE.Vector2()
        w.__r3fray = (x: number, y: number) => {
          const el = gl.domElement
          const r = el.getBoundingClientRect()
          probeV.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1)
          probe.setFromCamera(probeV, camera)
          return probe
            .intersectObjects(scene.children, true)
            .slice(0, 8)
            .map((h) => ({ t: h.object.type, d: +h.distance.toFixed(2), vis: h.object.visible }))
        }
      }}
      style={{ position: 'absolute', inset: 0 }}
      onPointerMissed={() => {
        // clicking empty space returns any focused element to its normal view
        useExperienceStore.getState().clearFocus()
      }}
    >
      <FpsGovernor />
      <color attach="background" args={['#050505']} />
      <fogExp2 attach="fog" args={['#050505', 0.045]} />

      {/* offline studio environment — soft lightformers give PBR reflections.
          Skipped on the low tier: envmap sampling is expensive on weak GPUs. */}
      {quality !== 'low' && (
        <Suspense fallback={null}>
          <Environment resolution={256} frames={1} background={false}>
            <Lightformer intensity={2.2} color="#cfe2ff" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[11, 11, 1]} />
            <Lightformer intensity={1.1} color="#67e8f9" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[7, 2.5, 1]} />
            <Lightformer intensity={0.9} color="#8b7cf6" position={[5, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[7, 2.5, 1]} />
            <Lightformer intensity={0.5} color="#ffffff" position={[0, 1, 6]} scale={[6, 3, 1]} />
            <Lightformer intensity={0.35} color="#bef264" position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[8, 8, 1]} />
          </Environment>
        </Suspense>
      )}

      <CameraController />
      <Suspense fallback={null}>
        <SceneManager />
      </Suspense>
      <EnvController />
      <Effects />
    </Canvas>
  )
}
