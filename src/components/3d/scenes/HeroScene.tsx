'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { SCENES } from '@/lib/scenes'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import {
  createPcbTextures,
  createChipTexture,
  createScreenTexture,
  createGlowTexture,
  createBeamTexture,
} from '@/lib/textures'
import { mulberry32 } from '@/lib/input'
import { useExperienceStore } from '@/lib/store'

const IDX = SCENES.findIndex((s) => s.id === 'hero')

/* board is 4.4 x 3.0, top surface at local y = 0.035 */
const TOP = 0.035

interface Smd { x: number; z: number; ry: number }

function useSmdPositions(): { resistors: Smd[]; caps: Smd[]; pins: THREE.Vector3[] } {
  return useMemo(() => {
    const rnd = mulberry32(77)
    const resistors: Smd[] = []
    const caps: Smd[] = []
    const keepOuts = [
      { x: 0.15, z: 0.02, r: 0.62 },
      { x: -0.55, z: 0.35, r: 0.38 },
      { x: 0.75, z: -0.5, r: 0.46 },
      { x: -1.45, z: -0.75, r: 0.6 },
      { x: 1.4, z: -0.6, r: 0.5 },
      { x: 1.25, z: 0.8, r: 0.42 },
      { x: -0.15, z: 1.42, r: 0.35 },
      { x: -1.1, z: 0.8, r: 0.4 },
      { x: -0.6, z: -0.45, r: 0.3 },
    ]
    const free = (x: number, z: number) =>
      keepOuts.every((k) => (x - k.x) ** 2 + (z - k.z) ** 2 > k.r * k.r)

    let guard = 0
    while (resistors.length < 78 && guard < 900) {
      guard++
      const x = (rnd() - 0.5) * 4.1
      const z = (rnd() - 0.5) * 2.7
      if (!free(x, z)) continue
      resistors.push({ x, z, ry: rnd() > 0.5 ? Math.PI / 2 : 0 })
    }
    guard = 0
    while (caps.length < 34 && guard < 500) {
      guard++
      const x = (rnd() - 0.5) * 4.0
      const z = (rnd() - 0.5) * 2.6
      if (!free(x, z)) continue
      caps.push({ x, z, ry: rnd() > 0.5 ? Math.PI / 2 : 0 })
    }

    const pins: THREE.Vector3[] = []
    for (let i = 0; i < 12; i++) {
      pins.push(new THREE.Vector3(0.55 + i * 0.115, TOP + 0.045, 1.16))
      pins.push(new THREE.Vector3(0.55 + i * 0.115, TOP + 0.045, -1.16))
    }
    return { resistors, caps, pins }
  }, [])
}

function Chip({
  position,
  size,
  title,
  sub,
}: {
  position: [number, number, number]
  size: number
  title: string
  sub?: string
}) {
  const tex = useMemo(() => createChipTexture(title, sub), [title, sub])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <group position={position}>
      <RoundedBox args={[size, size * 0.16, size]} radius={size * 0.03} smoothness={3}>
        <meshStandardMaterial color="#0b0d11" roughness={0.42} metalness={0.55} />
      </RoundedBox>
      <mesh position={[0, size * 0.081, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size * 0.94, size * 0.94]} />
        <meshStandardMaterial
          map={tex}
          roughness={0.35}
          metalness={0.6}
          emissive="#ffffff"
          emissiveMap={tex}
          emissiveIntensity={0.05}
        />
      </mesh>
    </group>
  )
}

/** SCENE 02 — the futuristic engineering module. Camera orbits, then skims the board. */
export default function HeroScene() {
  const group = useSceneVisibility(IDX)
  const float = useRef<THREE.Group>(null)
  const { resistors, caps, pins } = useSmdPositions()

  const resRef = useRef<THREE.InstancedMesh>(null)
  const capRef = useRef<THREE.InstancedMesh>(null)
  const pinRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const pcb = useMemo(() => createPcbTextures(), [])
  const oledScreen = useMemo(
    () => createScreenTexture(['WS CORE', 'LINK OK', '3V3 · 24.6C'], '#5eead4', 4),
    []
  )
  const glow = useMemo(() => createGlowTexture('rgba(94,212,224,1)'), [])
  const beam = useMemo(() => createBeamTexture('rgba(150,200,255,0.34)'), [])

  useEffect(() => {
    return () => {
      pcb.map.dispose()
      pcb.emissive.dispose()
      oledScreen.dispose()
      const gg = glow
      const gb = beam
      gg.dispose()
      gb.dispose()
    }
  }, [pcb, oledScreen, glow, beam])

  useLayoutEffect(() => {
    const place = (ref: React.RefObject<THREE.InstancedMesh | null>, items: Smd[], w: number, h: number) => {
      const mesh = ref.current
      if (!mesh) return
      items.forEach((it, i) => {
        dummy.position.set(it.x, TOP + h / 2 + 0.002, it.z)
        dummy.rotation.set(0, it.ry, 0)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      void w
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
    place(resRef, resistors, 0.045, 0.018)
    place(capRef, caps, 0.05, 0.028)
    if (pinRef.current) {
      pins.forEach((p, i) => {
        dummy.position.copy(p)
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        pinRef.current?.setMatrixAt(i, dummy.matrix)
      })
      pinRef.current.instanceMatrix.needsUpdate = true
      pinRef.current.computeBoundingSphere()
    }
  }, [resistors, caps, pins, dummy])

  useFrame((state, delta) => {
    const g = float.current
    if (!g || !g.visible) return
    const t = state.clock.elapsedTime
    g.rotation.y = Math.sin(t * 0.14) * 0.09
    g.rotation.x = -0.1 + Math.sin(t * 0.1 + 1) * 0.015
    g.position.y = -0.18 + Math.sin(t * 0.45) * 0.022
    void delta
  })

  const isTouch = useExperienceStore((s) => s.isTouch)

  return (
    <group ref={group}>
      <group ref={float} position={[-0.1, -0.18, 0]}>
        {/* ------- main substrate ------- */}
        <RoundedBox args={[4.4, 0.07, 3.0]} radius={0.028} smoothness={4}>
          <meshStandardMaterial
            map={pcb.map}
            emissiveMap={pcb.emissive}
            emissive="#d9fbff"
            emissiveIntensity={0.62}
            roughness={0.48}
            metalness={0.35}
          />
        </RoundedBox>

        {/* under-glow */}
        <mesh position={[0, -0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.4, 4.6]} />
          <meshBasicMaterial
            map={glow}
            color="#0e7f8c"
            transparent
            opacity={0.34}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* ------- compute cluster ------- */}
        <Chip position={[0.15, TOP + 0.05, 0.02]} size={0.62} title="WS-6X" sub="QUAD A7" />
        <Chip position={[-0.55, TOP + 0.03, 0.35]} size={0.3} title="PMIC-9" />
        <Chip position={[0.75, TOP + 0.045, -0.5]} size={0.44} title="LP-4X" sub="8GB" />
        <Chip position={[-0.6, TOP + 0.028, -0.45]} size={0.28} title="RF-11" />

        {/* crystal + inductor */}
        <RoundedBox args={[0.16, 0.07, 0.1]} radius={0.02} smoothness={3} position={[0.62, TOP + 0.036, 0.42]}>
          <meshStandardMaterial color="#c8ccd2" roughness={0.18} metalness={1} />
        </RoundedBox>
        <group position={[-0.28, TOP + 0.03, 0.52]}>
          <mesh>
            <cylinderGeometry args={[0.082, 0.082, 0.06, 24]} />
            <meshStandardMaterial color="#23272d" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.032, 0]}>
            <cylinderGeometry args={[0.068, 0.068, 0.008, 24]} />
            <meshStandardMaterial color="#b0793f" roughness={0.3} metalness={1} />
          </mesh>
        </group>

        {/* ------- ESP32 module ------- */}
        <group position={[-1.45, TOP, -0.75]}>
          <RoundedBox args={[0.85, 0.045, 0.55]} radius={0.015} smoothness={3}>
            <meshStandardMaterial color="#0c1418" roughness={0.5} metalness={0.4} />
          </RoundedBox>
          <RoundedBox args={[0.56, 0.07, 0.4]} radius={0.02} smoothness={3} position={[-0.06, 0.058, 0]}>
            <meshStandardMaterial color="#9aa3ab" roughness={0.24} metalness={1} />
          </RoundedBox>
          <mesh position={[0.32, 0.03, 0]}>
            <boxGeometry args={[0.1, 0.018, 0.42]} />
            <meshStandardMaterial color="#d8d2c4" roughness={0.7} metalness={0.1} />
          </mesh>
          <GlowSprite position={[-0.06, 0.16, 0]} scale={0.5} color="#8fd8e8" opacity={0.14} />
        </group>

        {/* ------- OLED display ------- */}
        <group position={[1.4, TOP, -0.6]}>
          <RoundedBox args={[0.72, 0.07, 0.42]} radius={0.02} smoothness={3}>
            <meshStandardMaterial color="#0a0d10" roughness={0.4} metalness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.037, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.6, 0.32]} />
            <meshStandardMaterial
              map={oledScreen}
              emissive="#ffffff"
              emissiveMap={oledScreen}
              emissiveIntensity={1.35}
              roughness={0.2}
              metalness={0.2}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* ------- camera module ------- */}
        <group position={[1.25, TOP, 0.8]}>
          <RoundedBox args={[0.4, 0.06, 0.4]} radius={0.015} smoothness={3}>
            <meshStandardMaterial color="#101317" roughness={0.35} metalness={0.7} />
          </RoundedBox>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.115, 0.13, 0.16, 32]} />
            <meshStandardMaterial color="#05070a" roughness={0.28} metalness={0.75} />
          </mesh>
          <mesh position={[0, 0.212, 0]}>
            <sphereGeometry args={[0.095, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
            <meshPhysicalMaterial
              color="#0a1418"
              roughness={0.05}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.06}
            />
          </mesh>
          <GlowSprite position={[0, 0.24, 0]} scale={0.22} color="#67e8f9" opacity={0.5} />
        </group>

        {/* ------- sensor array ------- */}
        <group position={[-1.05, TOP, 0.8]}>
          {[-0.18, 0, 0.18].map((x, i) => (
            <group key={i} position={[x, 0, i * 0.16 - 0.08]}>
              <mesh>
                <boxGeometry args={[0.14, 0.05, 0.1]} />
                <meshStandardMaterial color="#12161b" roughness={0.45} metalness={0.5} />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
                <meshStandardMaterial color="#2a323a" roughness={0.2} metalness={0.9} />
              </mesh>
            </group>
          ))}
        </group>

        {/* ------- USB-C ------- */}
        <group position={[-0.15, TOP + 0.04, 1.42]}>
          <RoundedBox args={[0.36, 0.08, 0.17]} radius={0.02} smoothness={3}>
            <meshStandardMaterial color="#b7bdc4" roughness={0.25} metalness={1} />
          </RoundedBox>
          <mesh position={[0, 0.005, 0.086]}>
            <planeGeometry args={[0.2, 0.06]} />
            <meshStandardMaterial color="#05070a" roughness={0.6} metalness={0.3} />
          </mesh>
        </group>

        {/* ------- instanced passives ------- */}
        {resistors.length > 0 && (
          <instancedMesh ref={resRef} args={[undefined, undefined, resistors.length]} frustumCulled={false}>
            <boxGeometry args={[0.048, 0.018, 0.026]} />
            <meshStandardMaterial color="#181c22" roughness={0.45} metalness={0.5} />
          </instancedMesh>
        )}
        {caps.length > 0 && (
          <instancedMesh ref={capRef} args={[undefined, undefined, caps.length]} frustumCulled={false}>
            <boxGeometry args={[0.05, 0.028, 0.032]} />
            <meshStandardMaterial color="#b3986b" roughness={0.55} metalness={0.25} />
          </instancedMesh>
        )}
        {pins.length > 0 && (
          <instancedMesh ref={pinRef} args={[undefined, undefined, pins.length]} frustumCulled={false}>
            <boxGeometry args={[0.024, 0.09, 0.024]} />
            <meshStandardMaterial color="#d9b36a" roughness={0.22} metalness={1} />
          </instancedMesh>
        )}

        {/* ------- status LEDs ------- */}
        <mesh position={[-0.9, TOP + 0.02, 0.32]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color="#bef264" emissive="#bef264" emissiveIntensity={4} toneMapped={false} />
        </mesh>
        <GlowSprite position={[-0.9, TOP + 0.04, 0.32]} scale={0.16} color="#bef264" opacity={0.7} />
        <mesh position={[0.95, TOP + 0.02, 0.35]}>
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={4} toneMapped={false} />
        </mesh>
        <GlowSprite position={[0.95, TOP + 0.04, 0.35]} scale={0.14} color="#67e8f9" opacity={0.6} />

        {/* ------- engineering annotations ------- */}
        <Label3D text="WS-6X CORE" sub="MAIN SOC" position={[0.15, TOP + 0.34, 0.02]} scale={0.17} accent="#bef264" />
        <Label3D text="ESP32-WROOM" sub="WIFI + BLE" position={[-1.45, TOP + 0.32, -0.75]} scale={0.15} mono />
        <Label3D text="OLED 0.96″" position={[1.4, TOP + 0.3, -0.6]} scale={0.13} mono />
        <Label3D text="CAMERA" position={[1.25, TOP + 0.42, 0.8]} scale={0.13} mono />
        <Label3D text="SENSOR ARRAY" position={[-1.05, TOP + 0.26, 0.86]} scale={0.13} mono />
        <Label3D text="USB-C · 3V3" position={[-0.15, TOP + 0.26, 1.42]} scale={0.11} mono opacity={0.8} />
      </group>

      {/* ------- studio lighting ------- */}
      <spotLight position={[2.6, 4.6, 2.6]} angle={0.55} penumbra={1} intensity={95} color="#dceaff" distance={20} decay={2} />
      <spotLight position={[-3.4, 3.2, -2.2]} angle={0.7} penumbra={1} intensity={40} color="#8b7cf6" distance={18} decay={2} />
      <pointLight position={[0, 0.6, 4.4]} intensity={7} color="#67e8f9" distance={12} decay={2} />
      <pointLight position={[0, -1.2, 0]} intensity={5} color="#0e7f8c" distance={7} decay={2} />

      {/* volumetric slabs */}
      <mesh position={[-1.6, 2.4, -1.6]} rotation={[0.35, 0.3, -0.5]}>
        <planeGeometry args={[1.6, 6.5]} />
        <meshBasicMaterial map={beam} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[2.2, 2.6, -2.4]} rotation={[0.4, -0.4, 0.45]}>
        <planeGeometry args={[1.2, 6]} />
        <meshBasicMaterial map={beam} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <ParticleField
        count={isTouch ? 90 : 200}
        spread={[11, 7, 11]}
        size={0.022}
        color="#a8c8dc"
        opacity={0.22}
        speed={0.012}
        seed={17}
      />
    </group>
  )
}
