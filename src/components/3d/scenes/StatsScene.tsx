'use client'

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import ParticleField from '../shared/ParticleField'
import { GlowSprite } from '../shared/Label3D'

const IDX = SCENES.findIndex((s) => s.id === 'stats')

/** SCENE — Performance: quiet 3D stage, the numbers live in glass DOM panels */
export default function StatsScene() {
  const group = useSceneVisibility(IDX)
  const ring = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (ring.current) {
      ring.current.rotation.z += delta * 0.06
      ring.current.rotation.x = 1.35 + Math.sin(t * 0.14) * 0.1
    }
    if (ring2.current) {
      ring2.current.rotation.z -= delta * 0.04
      ring2.current.rotation.x = -1.1 + Math.cos(t * 0.11) * 0.12
    }
  })

  return (
    <group ref={group}>
      <mesh ref={ring} position={[0, -0.3, -3]}>
        <torusGeometry args={[3.1, 0.006, 8, 140]} />
        <meshBasicMaterial color="#7fd8e8" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} position={[0, -0.1, -4]}>
        <torusGeometry args={[4.2, 0.005, 8, 140]} />
        <meshBasicMaterial color="#bef264" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <GlowSprite position={[0, 0.4, -6]} scale={7} color="#122229" opacity={0.55} />

      <ParticleField count={isMobileSafe() ? 220 : 420} spread={[14, 8, 12]} size={0.024} color="#a8c8dc" opacity={0.3} speed={0.012} seed={91} />
      <ambientLight intensity={0.25} />
    </group>
  )
}

function isMobileSafe(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768
}
