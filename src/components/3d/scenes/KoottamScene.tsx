'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import { PROJECTS } from '@/data/projects'
import { createGlowTexture, createGridTexture } from '@/lib/textures'

const IDX = SCENES.findIndex((s) => s.id === 'koottam')
const project = PROJECTS.find((p) => p.id === 'koottam')

const FLOW = project?.flow ?? ['CUSTOMER', 'AI', 'ORDER', 'FARMER', 'WHATSAPP']
const NODE_X = [-1.25, 0.95, -0.7, 1.05, -0.95]
const NODE_Y = [1.65, 0.85, 0.05, -0.75, -1.5]

function FlowNode({ label, index }: { label: string; index: number }) {
  const ref = useRef<THREE.Group>(null)
  const baseX = NODE_X[index] ?? 0
  const baseY = NODE_Y[index] ?? 0
  const accent = index === 1 ? '#bef264' : index === 4 ? '#f5c86a' : '#5eead4'

  useFrame((state) => {
    const g = ref.current
    if (!g || !g.visible) return
    const t = state.clock.elapsedTime
    g.position.x = baseX + Math.sin(t * 0.5 + index * 1.4) * 0.045
    g.position.y = baseY + Math.cos(t * 0.42 + index) * 0.05
    g.rotation.z = Math.sin(t * 0.3 + index) * 0.015
  })

  return (
    <group ref={ref} position={[baseX, baseY, 0]}>
      <RoundedBox args={[1.35, 0.52, 0.14]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial
          color="#0b0f14"
          roughness={0.24}
          metalness={0.4}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          transparent
          opacity={0.92}
        />
      </RoundedBox>
      {/* emissive rim */}
      <mesh>
        <boxGeometry args={[1.39, 0.56, 0.1]} />
        <meshBasicMaterial color={accent} transparent opacity={0.13} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <GlowSprite position={[0, 0, -0.2]} scale={1.5} color={accent} opacity={0.16} />
      <Label3D text={label} position={[0, 0.02, 0.09]} scale={0.17} accent={accent} />
      <Label3D text={`NODE 0${index + 1}`} position={[0, -0.17, 0.09]} scale={0.075} mono opacity={0.6} />
    </group>
  )
}

/** PROJECT 01 — Koottam Cart: AI ordering flowing to farmers over WhatsApp */
export default function KoottamScene() {
  const group = useSceneVisibility(IDX)
  const pulses = useRef<THREE.Group>(null)

  const curves = useMemo(() => {
    const list: THREE.QuadraticBezierCurve3[] = []
    for (let i = 0; i < FLOW.length - 1; i++) {
      const a = new THREE.Vector3(NODE_X[i] ?? 0, NODE_Y[i] ?? 0, 0)
      const b = new THREE.Vector3(NODE_X[i + 1] ?? 0, NODE_Y[i + 1] ?? 0, 0)
      const mid = a.clone().add(b).multiplyScalar(0.5)
      mid.x += (i % 2 === 0 ? 0.55 : -0.55)
      mid.z = -0.35
      list.push(new THREE.QuadraticBezierCurve3(a, mid, b))
    }
    return list
  }, [])

  const tubes = useMemo(
    () =>
      curves.map(
        (c) => new THREE.TubeGeometry(c, 40, 0.0075, 6, false)
      ),
    [curves]
  )
  const tubeMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#5eead4'),
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  )

  const pulseTex = useMemo(() => createGlowTexture('rgba(255,220,150,1)'), [])
  const grid = useMemo(() => createGridTexture(1024), [])

  const PULSES_PER_LINK = 3

  useEffect(() => {
    return () => {
      tubes.forEach((t) => t.dispose())
      tubeMat.dispose()
      pulseTex.dispose()
      grid.dispose()
    }
  }, [tubes, tubeMat, pulseTex, grid])

  useFrame((state) => {
    const g = pulses.current
    if (!g || !g.visible) return
    const t = state.clock.elapsedTime
    g.children.forEach((child, i) => {
      const link = Math.floor(i / PULSES_PER_LINK)
      const curve = curves[link]
      if (!curve) return
      const off = (i % PULSES_PER_LINK) / PULSES_PER_LINK
      const p = curve.getPointAt((t * 0.16 + off) % 1)
      child.position.copy(p)
      const s = 0.1 + Math.sin(t * 3 + i) * 0.02
      child.scale.setScalar(s)
    })
  })

  return (
    <group ref={group}>
      {FLOW.map((label, i) => (
        <FlowNode key={`${label}-${i}`} label={label} index={i} />
      ))}

      {tubes.map((geo, i) => (
        <mesh key={i} geometry={geo} material={tubeMat} />
      ))}

      <group ref={pulses}>
        {Array.from({ length: (FLOW.length - 1) * PULSES_PER_LINK }).map((_, i) => (
          <sprite key={i} renderOrder={6}>
            <spriteMaterial map={pulseTex} color="#ffd988" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        ))}
      </group>

      {/* ground */}
      <mesh position={[0, -2.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial map={grid} color="#0a0d0c" roughness={0.35} metalness={0.55} />
      </mesh>

      <ParticleField count={130} spread={[9, 6, 8]} size={0.03} color="#ffd988" opacity={0.35} speed={0.02} rise={0.06} seed={41} />
      <ParticleField count={80} spread={[10, 7, 9]} size={0.022} color="#5eead4" opacity={0.25} speed={-0.014} seed={43} />

      {/* warm agricultural key + teal base */}
      <spotLight position={[2.6, 3.4, 3]} angle={0.7} penumbra={1} intensity={55} color="#ffe2b0" distance={16} decay={2} />
      <pointLight position={[-3, 0, 2]} intensity={9} color="#5eead4" distance={12} decay={2} />
      <pointLight position={[0, -1.5, 2.5]} intensity={6} color="#f5c86a" distance={10} decay={2} />
      <ambientLight intensity={0.22} />
    </group>
  )
}
