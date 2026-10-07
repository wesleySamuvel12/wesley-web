'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import { createGlowTexture } from '@/lib/textures'
import { mulberry32 } from '@/lib/input'

const IDX = SCENES.findIndex((s) => s.id === 'data')

const LAYERS = [4, 6, 4]
const STREAMS = 3
const STREAM_PTS = 80

/** PROJECT 05 — AI/Data: particles, graphs, streams, prediction curves */
export default function DataScene() {
  const group = useSceneVisibility(IDX)
  const terrain = useRef<THREE.Mesh>(null)
  const bars = useRef<THREE.Group>(null)
  const curveHead = useRef<THREE.Sprite>(null)
  const web = useRef<THREE.Group>(null)

  const glow = useMemo(() => createGlowTexture('rgba(190,242,100,1)'), [])

  /* -------- animated wireframe terrain -------- */
  const terrainGeom = useMemo(() => new THREE.PlaneGeometry(10, 6.4, 64, 44), [])
  const basePositions = useMemo(() => {
    const attr = terrainGeom.getAttribute('position') as THREE.BufferAttribute
    return Float32Array.from(attr.array)
  }, [terrainGeom])

  useEffect(() => {
    return () => {
      terrainGeom.dispose()
      glow.dispose()
    }
  }, [terrainGeom, glow])

  /* -------- neural web nodes -------- */
  const webNodes = useMemo(() => {
    const rnd = mulberry32(99)
    const nodes: THREE.Vector3[] = []
    LAYERS.forEach((count, li) => {
      const x = -1.35 + li * 1.35
      for (let i = 0; i < count; i++) {
        const y = (i - (count - 1) / 2) * 0.3
        nodes.push(new THREE.Vector3(x + (rnd() - 0.5) * 0.06, y + Math.sin(li) * 0.1, (rnd() - 0.5) * 0.25))
      }
    })
    return nodes
  }, [])

  const webLines = useMemo(() => {
    let idx = 0
    const arr: number[] = []
    for (let li = 0; li < LAYERS.length - 1; li++) {
      const startA = LAYERS.slice(0, li).reduce((a, b) => a + b, 0)
      const startB = LAYERS.slice(0, li + 1).reduce((a, b) => a + b, 0)
      for (let a = 0; a < LAYERS[li]; a++) {
        for (let b = 0; b < LAYERS[li + 1]; b++) {
          const pa = webNodes[startA + a]
          const pb = webNodes[startB + b]
          if (!pa || !pb) continue
          arr.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z)
          idx += 6
        }
      }
    }
    void idx
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3))
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#a78bfa'),
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return new THREE.LineSegments(geom, mat)
  }, [webNodes])

  /* -------- prediction curve -------- */
  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 100; i++) {
      const x = -3.6 + (i / 100) * 7.2
      const y = Math.sin(x * 0.9) * 0.42 + Math.sin(x * 0.33 + 1.2) * 0.3 - 0.9
      pts.push(new THREE.Vector3(x, y, 0.4))
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#bef264'),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { geom, mat, pts }
  }, [])

  /* -------- flowing streams -------- */
  const streams = useMemo(() => {
    const rnd = mulberry32(7)
    const geoms: THREE.BufferGeometry[] = []
    const seeds: { lane: number; speed: number; offsets: number[] }[] = []
    for (let s = 0; s < STREAMS; s++) {
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(STREAM_PTS * 3), 3))
      geoms.push(geom)
      seeds.push({
        lane: -1.8 + s * 1.8,
        speed: 0.1 + rnd() * 0.06,
        offsets: Array.from({ length: STREAM_PTS }, () => rnd()),
      })
    }
    return { geoms, seeds }
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // terrain waves
    const mesh = terrain.current
    if (mesh && mesh.visible) {
      const attr = terrainGeom.getAttribute('position') as THREE.BufferAttribute | undefined
      if (attr) {
        const arr = attr.array as Float32Array
        for (let i = 0; i < arr.length; i += 3) {
          const x = basePositions[i]
          const y = basePositions[i + 1]
          arr[i + 2] = Math.sin(x * 0.7 + t * 0.8) * Math.cos(y * 0.6 + t * 0.6) * 0.22
        }
        attr.needsUpdate = true
      }
    }

    // bars
    if (bars.current) {
      bars.current.children.forEach((c, i) => {
        const target = 0.08 + Math.abs(Math.sin(t * (0.5 + i * 0.17) + i * 2)) * 0.5
        c.scale.y += (target - c.scale.y) * Math.min(1, delta * 5)
        c.position.y = c.scale.y / 2
      })
    }

    // prediction curve draw
    const progress = (t * 0.09) % 1.15
    const n = Math.min(curve.pts.length, Math.floor(progress * curve.pts.length))
    curve.geom.setDrawRange(0, n)
    if (curveHead.current) {
      const p = curve.pts[Math.max(0, n - 1)]
      if (p) curveHead.current.position.copy(p)
      curveHead.current.visible = n > 2 && n < curve.pts.length
    }

    // streams
    streams.geoms.forEach((geom, si) => {
      const attr = geom.getAttribute('position') as THREE.BufferAttribute | undefined
      if (!attr) return
      const arr = attr.array as Float32Array
      const seed = streams.seeds[si]
      if (!seed) return
      for (let i = 0; i < STREAM_PTS; i++) {
        const tt = (seed.offsets[i] + t * seed.speed) % 1
        const x = -5 + tt * 10
        const y =
          Math.sin(x * 0.55 + si * 2.1) * 0.5 +
          Math.cos(x * 0.22 + t * 0.4) * 0.25 +
          1.1 +
          si * 0.2
        arr[i * 3] = x
        arr[i * 3 + 1] = y
        arr[i * 3 + 2] = seed.lane * 0.6
      }
      attr.needsUpdate = true
    })

    if (web.current) {
      web.current.rotation.y = Math.sin(t * 0.24) * 0.14
    }
  })

  return (
    <group ref={group}>
      {/* wireframe terrain */}
      <mesh ref={terrain} geometry={terrainGeom} position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#1e3a42" wireframe transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* prediction curve + glowing head */}
      <line>
        <primitive object={curve.geom} attach="geometry" />
        <primitive object={curve.mat} attach="material" />
      </line>
      <sprite ref={curveHead} scale={[0.22, 0.22, 1]} renderOrder={6}>
        <spriteMaterial map={glow} color="#bef264" transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {/* neural web */}
      <group ref={web} position={[0, 0.45, -0.6]}>
        <primitive object={webLines} />
        {webNodes.map((p, i) => (
          <group key={i} position={p}>
            <mesh>
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshStandardMaterial
                color={i < LAYERS[0] ? '#a78bfa' : i < LAYERS[0] + LAYERS[1] ? '#e2e8f0' : '#bef264'}
                emissive={i < LAYERS[0] ? '#a78bfa' : i < LAYERS[0] + LAYERS[1] ? '#8fd8e8' : '#bef264'}
                emissiveIntensity={1.8}
                toneMapped={false}
              />
            </mesh>
            <GlowSprite position={[0, 0, 0]} scale={0.2} color="#a78bfa" opacity={0.3} />
          </group>
        ))}
      </group>

      {/* bar chart hologram */}
      <group position={[3.4, -0.45, -0.2]} rotation={[0, -0.35, 0]}>
        <group ref={bars}>
          {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
            <mesh key={i} position={[x, 0.1, 0]}>
              <boxGeometry args={[0.075, 0.2, 0.075]} />
              <meshStandardMaterial
                color="#0d2b2f"
                emissive={i === 3 ? '#bef264' : '#2dd4bf'}
                emissiveIntensity={i === 3 ? 1.6 : 0.8}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* flowing data streams */}
      {streams.geoms.map((geom, i) => (
        <points key={i} geometry={geom} frustumCulled={false}>
          <pointsMaterial
            size={0.035}
            color={i === 1 ? '#bef264' : '#67e8f9'}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      ))}

      {/* stack labels */}
      <Label3D text="PYTHON" position={[-3.2, 1.15, 0.3]} scale={0.16} accent="#bef264" />
      <Label3D text="PANDAS" position={[2.9, 0.85, 0.2]} scale={0.13} mono />
      <Label3D text="SCIKIT-LEARN" position={[-2.6, -1.85, 0.5]} scale={0.12} mono />
      <Label3D text="SQL" position={[3.1, -1.7, 0.4]} scale={0.13} mono accent="#a78bfa" />

      <ParticleField count={480} spread={[13, 8, 10]} size={0.022} color="#8fb8c8" opacity={0.3} speed={0.012} seed={81} />
      <ParticleField count={160} spread={[10, 6, 8]} size={0.035} color="#a78bfa" opacity={0.18} speed={-0.015} seed={83} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 1.5, 3]} intensity={7} color="#8fd8e8" distance={12} decay={2} />
      <pointLight position={[-3, -1, 2]} intensity={5} color="#a78bfa" distance={10} decay={2} />
    </group>
  )
}
