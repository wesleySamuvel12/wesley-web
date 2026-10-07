'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import ParticleField from '../shared/ParticleField'
import { GlowSprite } from '../shared/Label3D'
import { createGlowTexture } from '@/lib/textures'

const IDX = SCENES.findIndex((s) => s.id === 'contact')

/** FINAL SCENE — everything darkens, particles recede, one soft glow remains */
export default function ContactScene() {
  const group = useSceneVisibility(IDX)
  const core = useRef<THREE.Sprite>(null)
  const glow = useMemo(() => createGlowTexture('rgba(255,255,255,1)'), [])

  useEffect(() => () => glow.dispose(), [glow])

  useFrame((state) => {
    const s = core.current
    if (!s) return
    const m = s.material as THREE.SpriteMaterial
    m.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015
  })

  return (
    <group ref={group}>
      <ParticleField count={520} spread={[16, 9, 14]} size={0.024} color="#9fb8c4" opacity={0.32} speed={0.008} rise={0.03} seed={111} />
      <ParticleField count={90} spread={[8, 5, 8]} size={0.05} color="#67e8f9" opacity={0.14} speed={-0.008} seed={113} />

      {/* the last light */}
      <sprite ref={core} position={[0, 0.35, -6]} scale={[10, 6, 1]} renderOrder={4}>
        <spriteMaterial map={glow} color="#dfeaf2" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {/* faint horizon */}
      <mesh position={[0, -0.9, -8]}>
        <planeGeometry args={[30, 0.012]} />
        <meshBasicMaterial color="#8fb8c8" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <GlowSprite position={[0, 0.4, -3]} scale={4} color="#0a0d10" opacity={0.4} />
      <ambientLight intensity={0.16} />
    </group>
  )
}
