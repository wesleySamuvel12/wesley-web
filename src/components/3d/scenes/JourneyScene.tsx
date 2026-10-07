'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import { TIMELINE } from '@/data/content'
import { createGlowTexture, createGridTexture } from '@/lib/textures'
import { useExperienceStore } from '@/lib/store'


const IDX = SCENES.findIndex((s) => s.id === 'journey')

const MARKERS = TIMELINE.map((m, i) => ({
  ...m,
  // offset to the right of the camera path — the lens travels PAST them
  pos: new THREE.Vector3(1.35 + Math.sin(i * 1.15) * 0.38, 0.12 + Math.cos(i * 0.8) * 0.08, 3.2 - i * 1.63),
}))

const PATH = new THREE.CatmullRomCurve3(
  MARKERS.map((m) => m.pos.clone().add(new THREE.Vector3(0, 0.55, 0))),
  false,
  'catmullrom',
  0.4
)

function Marker({ milestone, index }: { milestone: (typeof MARKERS)[number]; index: number }) {
  const ref = useRef<THREE.Group>(null)
  const orb = useRef<THREE.Mesh>(null)
  const pillar = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const g = ref.current
    if (!g || !g.visible) return
    const active = useExperienceStore.getState().currentMilestone === index
    const t = state.clock.elapsedTime
    const k = 1 - Math.exp(-6 * delta)

    const target = active ? 1.32 : 1
    const s = g.scale.x + (target - g.scale.x) * k
    g.scale.setScalar(s)

    g.position.y = milestone.pos.y + Math.sin(t * 0.7 + index) * 0.02

    if (orb.current) {
      const m = orb.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = (active ? 3.4 : 1.2) + Math.sin(t * 2 + index) * 0.3
    }
    if (pillar.current) {
      const m = pillar.current.material as THREE.MeshBasicMaterial
      m.opacity += ((active ? 0.34 : 0.1) - m.opacity) * k
    }
  })

  return (
    <group ref={ref} position={milestone.pos}>
      {/* base ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -milestone.pos.y - 0.12, 0]}>
        <torusGeometry args={[0.24, 0.008, 8, 48]} />
        <meshBasicMaterial color={milestone.accent} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* orb */}
      <mesh ref={orb}>
        <sphereGeometry args={[0.042, 20, 20]} />
        <meshStandardMaterial color={milestone.accent} emissive={milestone.accent} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <GlowSprite position={[0, 0, 0]} scale={0.34} color={milestone.accent} opacity={0.35} />
      {/* light pillar */}
      <mesh ref={pillar} position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.028, 0.09, 1.35, 12, 1, true]} />
        <meshBasicMaterial
          color={milestone.accent}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Label3D
        text={milestone.title}
        sub={milestone.year}
        position={[0, 0.34, 0]}
        scale={0.15}
        accent={milestone.accent}
      />
    </group>
  )
}

/** SCENE 09 — Journey: camera travels a physical timeline of markers */
export default function JourneyScene() {
  const group = useSceneVisibility(IDX)
  const pulse = useRef<THREE.Sprite>(null)
  const setCurrentMilestone = useExperienceStore((s) => s.setCurrentMilestone)

  const tube = useMemo(() => new THREE.TubeGeometry(PATH, 120, 0.012, 6, false), [])
  const tubeMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#67e8f9'),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  )
  const glow = useMemo(() => createGlowTexture('rgba(190,242,100,1)'), [])
  const grid = useMemo(() => createGridTexture(1024), [])

  useEffect(() => {
    return () => {
      tube.dispose()
      tubeMat.dispose()
      glow.dispose()
      grid.dispose()
    }
  }, [tube, tubeMat, glow, grid])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // pulse travels the path
    if (pulse.current) {
      const p = PATH.getPointAt((t * 0.05) % 1)
      if (p) pulse.current.position.copy(p)
    }

    // active milestone = marker the camera is currently passing
    const camZ = state.camera.position.z
    const idx = Math.min(TIMELINE.length - 1, Math.max(0, Math.round((3.2 - camZ) / 1.63)))
    setCurrentMilestone(idx)
  })

  return (
    <group ref={group}>
      <mesh geometry={tube} material={tubeMat} />
      <sprite ref={pulse} scale={[0.3, 0.3, 1]} renderOrder={6}>
        <spriteMaterial map={glow} color="#bef264" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {MARKERS.map((m, i) => (
        <Marker key={m.id} milestone={m} index={i} />
      ))}

      {/* ground */}
      <mesh position={[0, -0.45, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 30]} />
        <meshStandardMaterial map={grid} color="#0a0d10" roughness={0.3} metalness={0.55} transparent opacity={0.9} />
      </mesh>

      <ParticleField count={300} spread={[10, 6, 18]} center={[0, 0.5, -2]} size={0.022} color="#8fb8c8" opacity={0.26} speed={0.01} seed={101} />

      <ambientLight intensity={0.3} />
      <pointLight position={[1.2, 1.2, 0]} intensity={6} color="#67e8f9" distance={10} decay={2} />
      <spotLight position={[2.5, 4, 2]} angle={0.7} penumbra={1} intensity={26} color="#d6e6ff" distance={20} decay={2} />
    </group>
  )
}
