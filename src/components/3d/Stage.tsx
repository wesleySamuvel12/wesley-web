'use client'

import * as THREE from 'three'
import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Environment, Lightformer } from '@react-three/drei'
import CameraController from './CameraController'
import SceneManager from './SceneManager'
import EnvController from './EnvController'
import Effects from './Effects'
import { useExperienceStore } from '@/lib/store'

export default function Stage() {
  const setCanvasReady = useExperienceStore((s) => s.setCanvasReady)
  const [dpr, setDpr] = useState(1.4)

  return (
    <Canvas
      dpr={dpr}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
      }}
      camera={{ fov: 42, near: 0.08, far: 90, position: [0, 0.15, 9] }}
      onCreated={({ gl, scene, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        setCanvasReady(true)
        const w = window as unknown as Record<string, unknown>
        w.__r3fcam = camera
        w.__r3fscene = scene
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(1.55)}
      />
      <color attach="background" args={['#050505']} />
      <fogExp2 attach="fog" args={['#050505', 0.045]} />

      {/* offline studio environment — soft lightformers give PBR reflections */}
      <Environment resolution={256} frames={1} background={false}>
        <Lightformer intensity={2.2} color="#cfe2ff" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[11, 11, 1]} />
        <Lightformer intensity={1.1} color="#67e8f9" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[7, 2.5, 1]} />
        <Lightformer intensity={0.9} color="#8b7cf6" position={[5, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[7, 2.5, 1]} />
        <Lightformer intensity={0.5} color="#ffffff" position={[0, 1, 6]} scale={[6, 3, 1]} />
        <Lightformer intensity={0.35} color="#bef264" position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[8, 8, 1]} />
      </Environment>

      <CameraController />
      <Suspense fallback={null}>
        <SceneManager />
      </Suspense>
      <EnvController />
      <Effects />
    </Canvas>
  )
}
