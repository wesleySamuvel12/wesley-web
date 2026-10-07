'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import ParticleField from '../shared/ParticleField'
import { makeLine } from '../shared/Label3D'
import { mulberry32 } from '@/lib/input'

const IDX = SCENES.findIndex((s) => s.id === 'intro')

/** SCENE 01 — near-black void, subtle particles, a distant signal ring */
export default function IntroScene() {
  const group = useSceneVisibility(IDX)
  const ring = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const isTouch = false

  const lines = useMemo(() => {
    const rnd = mulberry32(21)
    const objs: THREE.Line[] = []
    for (let i = 0; i < 5; i++) {
      const y = -3 + rnd() * 6
      const x = -6 + rnd() * 12
      const l = makeLine(
        [
          [x, y, -6 - rnd() * 4],
          [x + 1.5 + rnd() * 2.5, y, -6 - rnd() * 4],
        ],
        '#9fc4d8',
        0.12
      )
      objs.push(l)
    }
    return objs
  }, [])

  useEffect(() => {
    return () => {
      lines.forEach((l) => {
        l.geometry.dispose()
        ;(l.material as THREE.Material).dispose()
      })
    }
  }, [lines])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (ring.current) {
      ring.current.rotation.z += delta * 0.05
      ring.current.rotation.x = Math.sin(t * 0.1) * 0.2 + 1.2
    }
    if (ring2.current) {
      ring2.current.rotation.z -= delta * 0.03
      ring2.current.rotation.x = -0.8 + Math.cos(t * 0.08) * 0.15
    }
  })

  return (
    <group ref={group}>
      <ParticleField
        count={isTouch ? 500 : 1100}
        spread={[18, 10, 14]}
        size={0.028}
        color="#a8c8dc"
        opacity={0.4}
        speed={0.014}
        seed={3}
      />
      <ParticleField
        count={140}
        spread={[10, 5, 8]}
        size={0.06}
        color="#67e8f9"
        opacity={0.16}
        speed={-0.01}
        seed={9}
      />

      {/* distant signal rings */}
      <mesh ref={ring} position={[0, 0.2, -7]}>
        <torusGeometry args={[2.6, 0.006, 8, 128]} />
        <meshBasicMaterial color="#7fd8e8" transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} position={[0.4, -0.1, -8]}>
        <torusGeometry args={[3.6, 0.005, 8, 128]} />
        <meshBasicMaterial color="#bef264" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}

      <ambientLight intensity={0.25} />
      <pointLight position={[0, 2, 4]} intensity={4} color="#9fc4d8" />
    </group>
  )
}
