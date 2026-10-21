'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import { TECH_NODES, TECH_LINKS, CATEGORY_COLORS } from '@/data/skills'
import { useExperienceStore } from '@/lib/store'

const IDX = SCENES.findIndex((s) => s.id === 'tech')

/** deterministic fibonacci-sphere layout, y-compressed for composition */
const NODE_POSITIONS: THREE.Vector3[] = TECH_NODES.map((_, i) => {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / TECH_NODES.length)
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
  const r = 2.35
  return new THREE.Vector3(
    r * Math.cos(theta) * Math.sin(phi),
    r * Math.cos(phi) * 0.74,
    r * Math.sin(theta) * Math.sin(phi)
  )
})

const posById = new Map<string, THREE.Vector3>()
TECH_NODES.forEach((n, i) => posById.set(n.id, NODE_POSITIONS[i]))

const ADJACENCY = new Map<string, Set<string>>()
TECH_LINKS.forEach(([a, b]) => {
  if (!ADJACENCY.has(a)) ADJACENCY.set(a, new Set())
  if (!ADJACENCY.has(b)) ADJACENCY.set(b, new Set())
  ADJACENCY.get(a)?.add(b)
  ADJACENCY.get(b)?.add(a)
})

const TRAVELERS_PER_LINK = 2

function ConstellationNode({ node, index }: { node: (typeof TECH_NODES)[number]; index: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const setHoveredTech = useExperienceStore((s) => s.setHoveredTech)
  const setCursor = useExperienceStore((s) => s.setCursor)
  const isTouch = useExperienceStore((s) => s.isTouch)
  const hoveredId = useExperienceStore((s) => s.hoveredTech)
  const color = CATEGORY_COLORS[node.category]
  const basePos = NODE_POSITIONS[index]

  // touch: a tap selects a node and the scan auto-clears after 4s
  // (same auto-return philosophy as every other focus state)
  useEffect(() => {
    if (!isTouch || hoveredId !== node.id) return
    const t = window.setTimeout(() => {
      setHoveredTech(null)
      setCursor('default')
    }, 4000)
    return () => window.clearTimeout(t)
  }, [isTouch, hoveredId, node.id, setHoveredTech, setCursor])

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g || !g.visible) return
    const hovered = useExperienceStore.getState().hoveredTech
    const isHovered = hovered === node.id
    const dimmed = hovered !== null && !isHovered && !ADJACENCY.get(hovered)?.has(node.id)

    const t = state.clock.elapsedTime
    const targetScale = isHovered ? 1.55 : dimmed ? 0.8 : 1
    const k = 1 - Math.exp(-7 * delta)
    const s = g.scale.x + (targetScale - g.scale.x) * k
    g.scale.setScalar(s)

    // organic bob
    g.position.x = basePos.x + Math.sin(t * 0.5 + index) * 0.02
    g.position.y = basePos.y + Math.cos(t * 0.44 + index * 1.7) * 0.03
    g.position.z = basePos.z + Math.sin(t * 0.4 + index * 0.7) * 0.02

    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial
      const targetOpacity = dimmed ? 0.14 : 1
      mat.opacity += (targetOpacity - mat.opacity) * k
      mat.emissiveIntensity = isHovered ? 3.2 : 1.35
    }
    const label = g.children.find((c) => c.type === 'Sprite') as THREE.Sprite | undefined
    if (label) {
      const mat = label.material as THREE.SpriteMaterial
      const targetOpacity = dimmed ? 0.1 : 0.95
      mat.opacity += (targetOpacity - mat.opacity) * k
    }
  })

  return (
    <group ref={groupRef} position={basePos}>
      {/* invisible hit area */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredTech(node.id)
          setCursor('explore', 'SCAN')
        }}
        onPointerOut={() => {
          // touch taps must persist their scan — only the 4s timer or a
          // tap on empty space may clear it
          if (useExperienceStore.getState().isTouch) return
          setHoveredTech(null)
          setCursor('default')
        }}
        onPointerDown={(e) => {
          if (!useExperienceStore.getState().isTouch) return
          e.stopPropagation()
          setHoveredTech(node.id)
          setCursor('explore', 'SCAN')
        }}
      >
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
      </mesh>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.085, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.35}
          metalness={0.6}
          roughness={0.25}
          transparent
        />
      </mesh>
      <GlowSprite position={[0, 0, 0]} scale={0.36} color={color} opacity={0.3} />
      <Label3D text={node.label} position={[0, -0.26, 0]} scale={0.135} mono />
    </group>
  )
}

/** SCENE 05 — the technology constellation */
export default function TechScene() {
  const group = useSceneVisibility(IDX)
  const world = useRef<THREE.Group>(null)

  const linkSegs = useMemo(() => {
    const arr: number[] = []
    TECH_LINKS.forEach(([a, b]) => {
      const pa = posById.get(a)
      const pb = posById.get(b)
      if (!pa || !pb) return
      arr.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z)
    })
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3))
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#5eead4'),
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return new THREE.LineSegments(geom, mat)
  }, [])

  const travelers = useMemo(() => {
    const valid = TECH_LINKS.filter(([a, b]) => posById.has(a) && posById.has(b))
    const count = valid.length * TRAVELERS_PER_LINK
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    const mat = new THREE.PointsMaterial({
      size: 0.06,
      color: new THREE.Color('#bef264'),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    return { geom, mat, valid, count }
  }, [])

  useEffect(() => {
    return () => {
      linkSegs.geometry.dispose()
      ;(linkSegs.material as THREE.Material).dispose()
      travelers.geom.dispose()
      travelers.mat.dispose()
    }
  }, [linkSegs, travelers])

  useFrame((state, delta) => {
    const w = world.current
    if (!w || !w.visible) return
    w.rotation.y += delta * 0.045

    // advance data packets along links
    const attr = travelers.geom.getAttribute('position') as THREE.BufferAttribute | undefined
    if (attr) {
      const arr = attr.array as Float32Array
      const t = state.clock.elapsedTime
      const a = new THREE.Vector3()
      const b = new THREE.Vector3()
      travelers.valid.forEach(([aid, bid], li) => {
        const pa = posById.get(aid)
        const pb = posById.get(bid)
        if (!pa || !pb) return
        for (let k = 0; k < TRAVELERS_PER_LINK; k++) {
          const idx = li * TRAVELERS_PER_LINK + k
          const tt = (t * 0.14 + idx * 0.453) % 1
          a.copy(pa)
          b.copy(pb)
          a.lerp(b, tt)
          arr[idx * 3] = a.x
          arr[idx * 3 + 1] = a.y
          arr[idx * 3 + 2] = a.z
        }
      })
      attr.needsUpdate = true
    }
  })

  return (
    <group ref={group}>
      <group ref={world}>
        {/* central engineering core */}
        <mesh>
          <icosahedronGeometry args={[0.24, 1]} />
          <meshStandardMaterial color="#e2e8f0" emissive="#67e8f9" emissiveIntensity={1.4} metalness={0.85} roughness={0.2} wireframe />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.13, 1]} />
          <meshStandardMaterial color="#bef264" emissive="#bef264" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        <GlowSprite position={[0, 0, 0]} scale={1.7} color="#67e8f9" opacity={0.34} />
        <Label3D
          text="WESLEY ENGINEERING CORE"
          sub="16 DOMAINS LINKED"
          position={[0, -0.55, 0]}
          scale={0.19}
          accent="#bef264"
        />

        <primitive object={linkSegs} />
        <points geometry={travelers.geom} material={travelers.mat} frustumCulled={false} />

        {TECH_NODES.map((n, i) => (
          <ConstellationNode key={n.id} node={n} index={i} />
        ))}
      </group>

      <ParticleField count={420} spread={[11, 8, 11]} size={0.024} color="#7fd8e8" opacity={0.3} speed={0.015} seed={31} />

      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={9} color="#67e8f9" distance={8} decay={2} />
      <pointLight position={[4, 3, 4]} intensity={12} color="#8b7cf6" distance={16} decay={2} />
    </group>
  )
}
