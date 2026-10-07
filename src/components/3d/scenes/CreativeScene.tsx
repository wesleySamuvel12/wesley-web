'use client'

import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useTexture } from '@react-three/drei'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import { DISPLAYS } from './creativeLayout'
import { CREATIVE_WORKS } from '@/data/content'
import { useExperienceStore } from '@/lib/store'
import { createGlowTexture } from '@/lib/textures'

const IDX = SCENES.findIndex((s) => s.id === 'creative')

function Display({ work, index }: { work: (typeof CREATIVE_WORKS)[number]; index: number }) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const cfg = DISPLAYS[index] ?? { x: 0, y: 0, z: 0, ry: 0 }
  const setFocusedCreative = useExperienceStore((s) => s.setFocusedCreative)
  const setCursor = useExperienceStore((s) => s.setCursor)

  const tex = useTexture(work.image)
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
  }, [tex])

  const glow = useMemo(() => createGlowTexture('rgba(190,242,100,1)'), [])

  useFrame((state, delta) => {
    const g = ref.current
    if (!g || !g.visible) return
    const t = state.clock.elapsedTime
    const focused = useExperienceStore.getState().focusedCreative
    const isFocused = focused === work.id
    const dim = focused !== null && !isFocused

    const target = hovered || isFocused ? 1.07 : dim ? 0.94 : 1
    const k = 1 - Math.exp(-7 * delta)
    const s = g.scale.x + (target - g.scale.x) * k
    g.scale.setScalar(s)

    g.position.y = cfg.y + Math.sin(t * 0.5 + index * 1.3) * 0.035
    g.rotation.y = cfg.ry + Math.sin(t * 0.22 + index) * 0.03

    const edge = g.children[1] as THREE.Mesh | undefined
    if (edge) {
      const m = edge.material as THREE.MeshBasicMaterial
      const targetOp = isFocused ? 0.5 : hovered ? 0.35 : dim ? 0.05 : 0.16
      m.opacity += (targetOp - m.opacity) * k
    }
    void glow
  })

  return (
    <group ref={ref} position={[cfg.x, cfg.y, cfg.z]} rotation={[0, cfg.ry, 0]}>
      {/* frame */}
      <RoundedBox
        args={[1.95, 1.28, 0.09]}
        radius={0.035}
        smoothness={4}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          setCursor('view', 'VIEW')
        }}
        onPointerOut={() => {
          setHovered(false)
          setCursor('default')
        }}
        onClick={(e) => {
          e.stopPropagation()
          setFocusedCreative(work.id)
          setCursor('default')
        }}
      >
        <meshStandardMaterial color="#101318" roughness={0.3} metalness={0.8} />
      </RoundedBox>
      {/* lime edge glow */}
      <mesh>
        <boxGeometry args={[2.0, 1.33, 0.06]} />
        <meshBasicMaterial color="#bef264" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* artwork */}
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[1.8, 1.16]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* glass sheen */}
      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[1.8, 1.16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} depthWrite={false} />
      </mesh>
      <GlowSprite position={[0, -0.85, 0.2]} scale={1.4} color="#bef264" opacity={0.06} />
      <Label3D
        text={work.title.toUpperCase()}
        sub={work.category}
        position={[0, -0.85, 0.15]}
        scale={0.13}
        accent="#bef264"
      />
    </group>
  )
}

/** SCENE 08 — Creative gallery: floating displays in 3D space */
export default function CreativeScene() {
  const group = useSceneVisibility(IDX)
  return (
    <group ref={group}>
      {CREATIVE_WORKS.map((w, i) => (
        <Display key={w.id} work={w} index={i} />
      ))}

      <ParticleField count={260} spread={[12, 6, 10]} size={0.02} color="#c8d8c0" opacity={0.22} speed={0.012} seed={95} />
      <GlowSprite position={[0, 0.6, -5]} scale={9} color="#101418" opacity={0.6} />

      {/* dark stage with warm rim highlights */}
      <spotLight position={[0, 3.5, 4.5]} angle={0.7} penumbra={1} intensity={40} color="#f2e8d8" distance={16} decay={2} />
      <pointLight position={[-4, 0.5, -2]} intensity={9} color="#f5c86a" distance={12} decay={2} />
      <pointLight position={[4, 0.5, -2]} intensity={9} color="#67e8f9" distance={12} decay={2} />
      <ambientLight intensity={0.24} />
    </group>
  )
}
