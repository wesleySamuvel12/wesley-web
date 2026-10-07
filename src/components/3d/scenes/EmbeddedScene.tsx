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
  createScreenTexture,
  createSchematicTexture,
  createGridTexture,
  createGlowTexture,
} from '@/lib/textures'

const IDX = SCENES.findIndex((s) => s.id === 'embedded')
const BENCH_TOP = -0.55

function makeWire(points: THREE.Vector3[], color: string): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points)
  return new THREE.TubeGeometry(curve, 32, 0.007, 6, false)
}

/** PROJECT 04 — Embedded Intelligence: the futuristic electronics laboratory */
export default function EmbeddedScene() {
  // enter late — must not bleed into the HydroFloat dive above it
  const group = useSceneVisibility(IDX, 0.12)
  const horn = useRef<THREE.Mesh>(null)
  const fan = useRef<THREE.Group>(null)
  const schematic = useRef<THREE.Group>(null)
  const oled = useRef<THREE.Mesh>(null)

  const oledTex = useMemo(
    () => createScreenTexture(['EMBEDDED AI', 'INFER 38ms', 'TEMP 41.2C'], '#a78bfa', 12),
    []
  )
  const schem = useMemo(() => createSchematicTexture(5), [])
  const grid = useMemo(() => createGridTexture(1024), [])
  const glow = useMemo(() => createGlowTexture('rgba(167,139,250,1)'), [])

  const wires = useMemo(
    () => [
      makeWire(
        [
          new THREE.Vector3(-1.05, BENCH_TOP + 0.02, 0.12),
          new THREE.Vector3(-0.7, BENCH_TOP + 0.16, 0.3),
          new THREE.Vector3(-0.4, BENCH_TOP + 0.05, 0.2),
          new THREE.Vector3(-0.25, BENCH_TOP + 0.04, 0.32),
        ],
        '#d95f4b'
      ),
      makeWire(
        [
          new THREE.Vector3(0.55, BENCH_TOP + 0.02, -0.15),
          new THREE.Vector3(0.8, BENCH_TOP + 0.2, 0.1),
          new THREE.Vector3(1.0, BENCH_TOP + 0.04, 0.05),
        ],
        '#e8c34b'
      ),
      makeWire(
        [
          new THREE.Vector3(1.1, BENCH_TOP + 0.02, -0.05),
          new THREE.Vector3(1.35, BENCH_TOP + 0.18, 0.25),
          new THREE.Vector3(1.55, BENCH_TOP + 0.05, 0.12),
        ],
        '#22d3aa'
      ),
    ],
    []
  )

  const pins = useMemo(() => {
    const list: THREE.Vector3[] = []
    for (let i = 0; i < 10; i++) {
      list.push(new THREE.Vector3(-1.5 + i * 0.044, BENCH_TOP + 0.04, -0.28))
      list.push(new THREE.Vector3(-1.5 + i * 0.044, BENCH_TOP + 0.04, 0.08))
    }
    return list
  }, [])
  const pinRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    const mesh = pinRef.current
    if (!mesh) return
    pins.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [pins, dummy])

  useEffect(() => {
    return () => {
      oledTex.dispose()
      schem.dispose()
      grid.dispose()
      glow.dispose()
      wires.forEach((w) => w.dispose())
    }
  }, [oledTex, schem, grid, glow, wires])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (horn.current) {
      horn.current.rotation.y = Math.sin(t * 0.9) * 0.9
    }
    if (fan.current) {
      fan.current.rotation.z += delta * 7
    }
    if (schematic.current) {
      schematic.current.position.y = 0.5 + Math.sin(t * 0.5) * 0.03
      schematic.current.rotation.y = Math.sin(t * 0.2) * 0.1
    }
    if (oled.current) {
      const m = oled.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 1.05 + Math.sin(t * 2.2) * 0.15
    }
  })

  return (
    <group ref={group}>
      {/* bench */}
      <RoundedBox args={[5.4, 0.14, 2.4]} radius={0.04} smoothness={3} position={[0, -0.62, 0]}>
        <meshStandardMaterial color="#0e1015" roughness={0.4} metalness={0.4} />
      </RoundedBox>
      <mesh position={[0, -0.545, -1.18]}>
        <boxGeometry args={[5.4, 0.012, 0.012]} />
        <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>

      {/* pegboard + shelf */}
      <mesh position={[0, 0.6, -1.35]}>
        <planeGeometry args={[5.6, 2.6]} />
        <meshStandardMaterial map={grid} color="#0a0c10" roughness={0.7} metalness={0.2} />
      </mesh>
      <RoundedBox args={[2.2, 0.05, 0.4]} radius={0.02} smoothness={3} position={[-1.6, 0.95, -1.15]}>
        <meshStandardMaterial color="#12161c" roughness={0.4} metalness={0.5} />
      </RoundedBox>
      {[-2.3, -2.05, -1.8, -1.55, -1.3, -1.05].map((x, i) => (
        <mesh key={x} position={[x, 1.06, -1.15]}>
          <boxGeometry args={[0.2, 0.12 + (i % 3) * 0.03, 0.24]} />
          <meshStandardMaterial color={['#161b22', '#1a2030', '#20262e'][i % 3]} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}

      {/* ESP32 devkit with pin rows */}
      <group position={[-1.3, BENCH_TOP + 0.018, -0.1]} rotation={[0, 0.2, 0]}>
        <RoundedBox args={[0.62, 0.032, 0.36]} radius={0.012} smoothness={3}>
          <meshStandardMaterial color="#0c1418" roughness={0.5} metalness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.34, 0.05, 0.26]} radius={0.014} smoothness={3} position={[-0.05, 0.04, 0]}>
          <meshStandardMaterial color="#9aa3ab" roughness={0.24} metalness={1} />
        </RoundedBox>
        <mesh position={[0.26, 0.03, 0]}>
          <boxGeometry args={[0.07, 0.045, 0.1]} />
          <meshStandardMaterial color="#b7bdc4" roughness={0.25} metalness={1} />
        </mesh>
      </group>
      {pins.length > 0 && (
        <instancedMesh ref={pinRef} args={[undefined, undefined, pins.length]} frustumCulled={false}>
          <boxGeometry args={[0.018, 0.075, 0.018]} />
          <meshStandardMaterial color="#d9b36a" roughness={0.22} metalness={1} />
        </instancedMesh>
      )}

      {/* arduino-style board */}
      <group position={[0.32, BENCH_TOP + 0.016, -0.2]} rotation={[0, -0.15, 0]}>
        <RoundedBox args={[0.62, 0.03, 0.44]} radius={0.012} smoothness={3}>
          <meshStandardMaterial color="#0e3a34" roughness={0.5} metalness={0.35} />
        </RoundedBox>
        <mesh position={[-0.25, 0.032, 0]}>
          <boxGeometry args={[0.1, 0.05, 0.16]} />
          <meshStandardMaterial color="#b7bdc4" roughness={0.25} metalness={1} />
        </mesh>
        <mesh position={[0.24, 0.03, 0.16]}>
          <boxGeometry args={[0.2, 0.024, 0.05]} />
          <meshStandardMaterial color="#0a0d10" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0.24, 0.03, -0.16]}>
          <boxGeometry args={[0.2, 0.024, 0.05]} />
          <meshStandardMaterial color="#0a0d10" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.16, 0.012, 0.16]} />
          <meshStandardMaterial color="#0a0d10" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* OLED standing display */}
      <group position={[-0.42, BENCH_TOP + 0.14, 0.32]} rotation={[-0.18, 0.1, 0]}>
        <RoundedBox args={[0.5, 0.34, 0.04]} radius={0.015} smoothness={3}>
          <meshStandardMaterial color="#0a0d10" roughness={0.35} metalness={0.6} />
        </RoundedBox>
        <mesh ref={oled} position={[0, 0, 0.023]}>
          <planeGeometry args={[0.42, 0.26]} />
          <meshStandardMaterial
            map={oledTex}
            emissive="#ffffff"
            emissiveMap={oledTex}
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.16, 0.06, 0.1]} />
          <meshStandardMaterial color="#12161c" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* ultrasonic sensor */}
      <group position={[1.05, BENCH_TOP + 0.02, 0.05]} rotation={[0, -0.3, 0]}>
        <RoundedBox args={[0.3, 0.025, 0.2]} radius={0.01} smoothness={3}>
          <meshStandardMaterial color="#10161c" roughness={0.5} metalness={0.4} />
        </RoundedBox>
        {[-0.07, 0.07].map((x) => (
          <group key={x} position={[x, 0.05, 0.06]}>
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.05, 20]} />
              <meshStandardMaterial color="#1a2028" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.026, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.006, 20]} />
              <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.7} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>

      {/* servo with rotating horn */}
      <group position={[1.65, BENCH_TOP + 0.1, 0.28]} rotation={[0, 0.4, 0]}>
        <RoundedBox args={[0.17, 0.2, 0.12]} radius={0.02} smoothness={3}>
          <meshStandardMaterial color="#2a6f6a" roughness={0.4} metalness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.09, 0.025, 0.06]} />
          <meshStandardMaterial color="#2a6f6a" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh ref={horn} position={[0, 0.13, 0]}>
          <boxGeometry args={[0.16, 0.014, 0.02]} />
          <meshStandardMaterial color="#e8e4da" roughness={0.4} metalness={0.2} />
        </mesh>
      </group>

      {/* DC motor + fan */}
      <group position={[-1.9, BENCH_TOP + 0.1, 0.4]} rotation={[0, 0.3, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.22, 24]} />
          <meshStandardMaterial color="#9aa3ab" roughness={0.25} metalness={1} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 10]} />
          <meshStandardMaterial color="#c8ccd2" roughness={0.2} metalness={1} />
        </mesh>
      </group>
      <group ref={fan} position={[-1.9, BENCH_TOP + 0.24, 0.4]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0.5, (i * Math.PI * 2) / 3, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[0.11, 0.006, 0.035]} />
            <meshStandardMaterial color="#d8dce2" roughness={0.35} metalness={0.7} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>

      {/* wires */}
      {wires.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color={['#d95f4b', '#e8c34b', '#22d3aa'][i]} roughness={0.5} metalness={0.2} />
        </mesh>
      ))}

      {/* holographic schematic */}
      <group ref={schematic} position={[0.35, 0.5, -0.35]}>
        <mesh>
          <planeGeometry args={[1.7, 1.06]} />
          <meshBasicMaterial map={schem} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <GlowSprite position={[0, 0, -0.2]} scale={2.2} color="#a78bfa" opacity={0.1} />
      </group>

      {/* technical annotations */}
      <Label3D text="GPIO 21 · PWM 50Hz" position={[1.65, BENCH_TOP + 0.42, 0.28]} scale={0.11} mono accent="#a78bfa" />
      <Label3D text="I2C 0x3C" position={[-0.42, BENCH_TOP + 0.42, 0.32]} scale={0.1} mono />
      <Label3D text="TRIG / ECHO" position={[1.05, BENCH_TOP + 0.24, 0.05]} scale={0.1} mono />
      <Label3D text="ADC 12-BIT" position={[-1.3, BENCH_TOP + 0.3, -0.1]} scale={0.1} mono opacity={0.85} />
      <Label3D text="3V3 · GND · TX · RX" position={[0.32, BENCH_TOP + 0.26, -0.2]} scale={0.09} mono opacity={0.7} />

      <ParticleField count={110} spread={[9, 5.5, 8]} size={0.02} color="#b8a8e8" opacity={0.24} speed={0.014} seed={71} />

      {/* cool blue key + violet rim */}
      <spotLight position={[2.2, 3.8, 2.6]} angle={0.6} penumbra={1} intensity={65} color="#d6e6ff" distance={16} decay={2} />
      <spotLight position={[-3.8, 2.6, -1.2]} angle={0.7} penumbra={1} intensity={38} color="#8b7cf6" distance={14} decay={2} />
      <pointLight position={[0, 0.6, 3]} intensity={5} color="#a5b8d8" distance={10} decay={2} />
      <ambientLight intensity={0.2} />
    </group>
  )
}
