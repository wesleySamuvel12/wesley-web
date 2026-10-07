'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import ParticleField from '../shared/ParticleField'
import { makeLine } from '../shared/Label3D'

const IDX = SCENES.findIndex((s) => s.id === 'identity')

/** SCENE 03 — editorial near-black. One beam of light, sparse dust. */
export default function IdentityScene() {
  const group = useSceneVisibility(IDX)
  const beam = useRef<THREE.Mesh>(null)

  const lines = useMemo(() => {
    const objs: THREE.Line[] = []
    objs.push(
      makeLine(
        [
          [-4.5, -1.15, -2],
          [4.5, -1.15, -2],
        ],
        '#bef264',
        0.16
      ),
      makeLine(
        [
          [-3.2, 1.7, -3],
          [3.2, 1.7, -3],
        ],
        '#9fc4d8',
        0.1
      )
    )
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

  useFrame((state) => {
    if (beam.current) {
      const m = beam.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.05 + Math.sin(state.clock.elapsedTime * 0.4) * 0.02
    }
  })

  return (
    <group ref={group}>
      <ParticleField count={260} spread={[14, 8, 10]} size={0.03} color="#c8d8e0" opacity={0.3} speed={0.01} seed={14} />

      {/* faint volumetric slab behind the typography */}
      <mesh ref={beam} position={[0, 0.3, -4]}>
        <planeGeometry args={[9, 5.5]} />
        <meshBasicMaterial color="#1a2732" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}

      <ambientLight intensity={0.2} />
    </group>
  )
}
