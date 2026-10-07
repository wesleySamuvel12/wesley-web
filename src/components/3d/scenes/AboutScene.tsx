'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import { createCodeTexture, createGlowTexture, createLabelTexture } from '@/lib/textures'
import { input } from '@/lib/input'
import { useExperienceStore } from '@/lib/store'

const IDX = SCENES.findIndex((s) => s.id === 'about')

const DESK_TOP = -0.56

const LABELS: { text: string; accent?: string; angle: number; y: number; depth: number }[] = [
  { text: 'AI', accent: '#bef264', angle: -2.4, y: 0.75, depth: 1.0 },
  { text: 'WEB', accent: '#67e8f9', angle: -1.6, y: 0.35, depth: 0.85 },
  { text: 'IOT', accent: '#f5c86a', angle: -0.8, y: 0.8, depth: 1.0 },
  { text: 'ECE', accent: '#a78bfa', angle: 0.0, y: 0.28, depth: 0.8 },
  { text: 'DATA', accent: '#67e8f9', angle: 0.9, y: 0.72, depth: 0.95 },
  { text: 'EMBEDDED', accent: '#f5c86a', angle: 1.8, y: 0.38, depth: 0.85 },
  { text: 'DESIGN', accent: '#bef264', angle: 2.6, y: 0.85, depth: 1.05 },
]

function FloatingLabel({
  text,
  accent,
  angle,
  y,
  depth,
}: {
  text: string
  accent?: string
  angle: number
  y: number
  depth: number
}) {
  const ref = useRef<THREE.Sprite>(null)
  const [hovered, setHovered] = useState(false)
  const tex = useMemo(() => createLabelTexture(text, { accent, size: 64 }), [text, accent])
  useEffect(() => () => tex.dispose(), [tex])

  const base = useMemo(() => {
    const r = 2.15
    return new THREE.Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r - 0.4)
  }, [angle, y])

  useFrame((state, delta) => {
    const s = ref.current
    if (!s) return
    const t = state.clock.elapsedTime
    const tx = base.x + input.mx * 0.34 * depth + Math.sin(t * 0.5 + angle * 3) * 0.05
    const ty = base.y - input.my * 0.22 * depth + Math.cos(t * 0.42 + angle * 2) * 0.06
    const k = 1 - Math.exp(-4 * delta)
    s.position.x += (tx - s.position.x) * k
    s.position.y += (ty - s.position.y) * k
    s.position.z = base.z
    const target = hovered ? 0.3 : 0.21
    const cur = s.scale.y
    const nk = 1 - Math.exp(-8 * delta)
    s.scale.y += (target - cur) * nk
    s.scale.x = s.scale.y * (tex.image.width / tex.image.height)
  })

  return (
    <sprite
      ref={ref}
      position={base}
      scale={[0.5, 0.21, 1]}
      renderOrder={10}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        useExperienceStore.getState().setCursor('explore', text)
      }}
      onPointerOut={() => {
        setHovered(false)
        useExperienceStore.getState().setCursor('default')
      }}
    >
      <spriteMaterial map={tex} transparent depthWrite={false} opacity={0.95} />
    </sprite>
  )
}

/** SCENE 04 — futuristic workspace at the edge of software and hardware */
export default function AboutScene() {
  const group = useSceneVisibility(IDX)
  const holo = useRef<THREE.Group>(null)
  const barsRef = useRef<THREE.Group>(null)
  const led = useRef<THREE.Mesh>(null)

  const code = useMemo(() => createCodeTexture(11), [])
  const glow = useMemo(() => createGlowTexture('rgba(103,232,249,1)'), [])
  const grid = useMemo(() => createGlowTexture('rgba(20,40,48,1)'), [])

  useEffect(() => {
    return () => {
      code.dispose()
      glow.dispose()
      grid.dispose()
    }
  }, [code, glow, grid])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (holo.current) {
      holo.current.rotation.y = Math.sin(t * 0.22) * 0.24
      holo.current.position.y = 0.32 + Math.sin(t * 0.6) * 0.02
    }
    if (barsRef.current) {
      barsRef.current.children.forEach((c, i) => {
        const target = 0.1 + Math.abs(Math.sin(t * (0.6 + i * 0.13) + i)) * 0.34
        c.scale.y += (target - c.scale.y) * Math.min(1, delta * 6)
        c.position.y = c.scale.y / 2
      })
    }
    if (led.current) {
      const m = led.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 2 + Math.sin(t * 4) * 1.6
    }
  })

  return (
    <group ref={group}>
      {/* desk */}
      <RoundedBox args={[5, 0.12, 2.6]} radius={0.04} smoothness={3} position={[0, -0.62, 0]}>
        <meshStandardMaterial color="#101318" roughness={0.38} metalness={0.35} />
      </RoundedBox>
      <mesh position={[0, -0.555, -1.28]}>
        <boxGeometry args={[5, 0.012, 0.012]} />
        <meshStandardMaterial color="#bef264" emissive="#bef264" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>

      {/* floor */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 26]} />
        <meshBasicMaterial map={grid} transparent opacity={0.5} depthWrite={false} />
      </mesh>

      {/* laptop */}
      <group position={[-1.15, DESK_TOP, -0.05]}>
        <RoundedBox args={[1.2, 0.045, 0.8]} radius={0.02} smoothness={3}>
          <meshStandardMaterial color="#191d23" roughness={0.32} metalness={0.8} />
        </RoundedBox>
        <mesh position={[0, 0.024, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.05, 0.62]} />
          <meshStandardMaterial color="#0b0e12" roughness={0.6} metalness={0.3} />
        </mesh>
        <group position={[0, 0.02, -0.38]} rotation={[-1.78, 0, 0]}>
          <RoundedBox args={[1.2, 0.78, 0.035]} radius={0.015} smoothness={3} position={[0, 0.39, 0]}>
            <meshStandardMaterial color="#15191f" roughness={0.3} metalness={0.8} />
          </RoundedBox>
          <mesh position={[0, 0.39, 0.021]}>
            <planeGeometry args={[1.08, 0.68]} />
            <meshStandardMaterial
              map={code}
              emissive="#ffffff"
              emissiveMap={code}
              emissiveIntensity={0.85}
              roughness={0.25}
              metalness={0.1}
              toneMapped={false}
            />
          </mesh>
        </group>
        <pointLight position={[0, 0.5, 0.5]} intensity={1.6} color="#67e8f9" distance={2.4} decay={2} />
      </group>

      {/* holographic interface floating above laptop */}
      <group ref={holo} position={[-1.15, 0.32, 0.1]}>
        <mesh>
          <planeGeometry args={[1.5, 0.8]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.52, 0.004, 8, 64]} />
          <meshBasicMaterial color="#8fd8e8" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh rotation={[0.4, 0.2, 0]}>
          <torusGeometry args={[0.34, 0.003, 8, 64]} />
          <meshBasicMaterial color="#bef264" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <GlowSprite position={[0, 0, -0.1]} scale={1.3} color="#67e8f9" opacity={0.1} />
      </group>

      {/* ESP32 devkit */}
      <group position={[0.42, DESK_TOP + 0.022, 0.18]} rotation={[0, 0.35, 0]}>
        <RoundedBox args={[0.5, 0.03, 0.3]} radius={0.01} smoothness={3}>
          <meshStandardMaterial color="#0c1418" roughness={0.5} metalness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.045, 0.22]} radius={0.012} smoothness={3} position={[0, 0.037, 0]}>
          <meshStandardMaterial color="#9aa3ab" roughness={0.24} metalness={1} />
        </RoundedBox>
        <mesh ref={led} position={[0.18, 0.018, 0.1]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#bef264" emissive="#bef264" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>

      {/* arduino-style board */}
      <group position={[1.05, DESK_TOP + 0.02, -0.4]} rotation={[0, -0.25, 0]}>
        <RoundedBox args={[0.58, 0.028, 0.4]} radius={0.012} smoothness={3}>
          <meshStandardMaterial color="#0f2f2a" roughness={0.5} metalness={0.35} />
        </RoundedBox>
        <mesh position={[-0.24, 0.03, 0]}>
          <boxGeometry args={[0.09, 0.045, 0.14]} />
          <meshStandardMaterial color="#b7bdc4" roughness={0.25} metalness={1} />
        </mesh>
        <mesh position={[0.16, 0.026, 0.13]}>
          <boxGeometry args={[0.24, 0.022, 0.05]} />
          <meshStandardMaterial color="#0a0d10" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0.16, 0.026, -0.13]}>
          <boxGeometry args={[0.24, 0.022, 0.05]} />
          <meshStandardMaterial color="#0a0d10" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* camera module */}
      <group position={[-0.3, DESK_TOP + 0.03, -0.62]}>
        <mesh>
          <boxGeometry args={[0.24, 0.05, 0.24]} />
          <meshStandardMaterial color="#101317" roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.07, 24]} />
          <meshStandardMaterial color="#05070a" roughness={0.28} metalness={0.75} />
        </mesh>
        <GlowSprite position={[0, 0.1, 0]} scale={0.1} color="#67e8f9" opacity={0.4} />
      </group>

      {/* mug */}
      <group position={[-2.05, DESK_TOP + 0.09, 0.5]}>
        <mesh>
          <cylinderGeometry args={[0.085, 0.075, 0.18, 24]} />
          <meshStandardMaterial color="#1a1e24" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.012, 10, 24]} />
          <meshStandardMaterial color="#1a1e24" roughness={0.4} metalness={0.2} />
        </mesh>
      </group>

      {/* data-viz hologram */}
      <group position={[1.5, DESK_TOP + 0.28, 0.35]} rotation={[0, -0.4, 0]}>
        <group ref={barsRef}>
          {[-0.24, -0.12, 0, 0.12, 0.24].map((x, i) => (
            <mesh key={i} position={[x, 0.05, 0]}>
              <boxGeometry args={[0.055, 0.1, 0.055]} />
              <meshStandardMaterial
                color={i === 2 ? '#bef264' : '#0e2f33'}
                emissive={i === 2 ? '#bef264' : '#2dd4bf'}
                emissiveIntensity={i === 2 ? 1.8 : 0.9}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))}
        </group>
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.62, 0.18]} />
          <meshBasicMaterial color="#134e4a" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {/* cursor-reactive domain labels */}
      {LABELS.map((l) => (
        <FloatingLabel key={l.text} {...l} />
      ))}

      {/* rising code particles above laptop */}
      <ParticleField count={70} spread={[1.6, 1.4, 0.8]} center={[-1.15, 0.6, 0]} size={0.02} color="#67e8f9" opacity={0.4} speed={0.03} rise={0.22} seed={23} />

      {/* lighting — cool blue key + violet rim */}
      <spotLight position={[2.4, 3.6, 2.2]} angle={0.6} penumbra={1} intensity={70} color="#d6e6ff" distance={16} decay={2} />
      <spotLight position={[-3.6, 2.4, -1.6]} angle={0.7} penumbra={1} intensity={34} color="#8b7cf6" distance={14} decay={2} />
      <pointLight position={[0, 0.4, 3.4]} intensity={5} color="#67e8f9" distance={10} decay={2} />
    </group>
  )
}
