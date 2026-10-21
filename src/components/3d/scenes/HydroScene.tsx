'use client'

import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { SCENES } from '@/lib/scenes'
import { getScrollState } from '@/lib/scrollEngine'
import { useSceneVisibility } from '../shared/visibility'
import { Label3D, GlowSprite } from '../shared/Label3D'
import ParticleField from '../shared/ParticleField'
import { createGlowTexture, createBeamTexture } from '@/lib/textures'
import { envBus } from '@/lib/envBus'
import { useExperienceStore } from '@/lib/store'

const IDX = SCENES.findIndex((s) => s.id === 'hydro')

const WATER_VERT = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vElev;

void main() {
  vec3 pos = position;
  vec2 p = pos.xy;

  float e = 0.0;
  e += sin(dot(p, vec2(1.0, 0.35)) * 1.35 + uTime * 0.85) * 0.055;
  e += sin(dot(p, vec2(-0.62, 1.0)) * 2.05 + uTime * 1.25) * 0.028;
  e += sin(dot(p, vec2(0.8, -0.85)) * 3.6 + uTime * 1.9) * 0.013;
  pos.z += e;
  vElev = e;

  // analytic normal
  float dx = 0.0;
  float dy = 0.0;
  dx += cos(dot(p, vec2(1.0, 0.35)) * 1.35 + uTime * 0.85) * 1.35 * 0.055 * 1.0;
  dy += cos(dot(p, vec2(1.0, 0.35)) * 1.35 + uTime * 0.85) * 1.35 * 0.055 * 0.35;
  dx += cos(dot(p, vec2(-0.62, 1.0)) * 2.05 + uTime * 1.25) * 2.05 * 0.028 * -0.62;
  dy += cos(dot(p, vec2(-0.62, 1.0)) * 2.05 + uTime * 1.25) * 2.05 * 0.028 * 1.0;
  dx += cos(dot(p, vec2(0.8, -0.85)) * 3.6 + uTime * 1.9) * 3.6 * 0.013 * 0.8;
  dy += cos(dot(p, vec2(0.8, -0.85)) * 3.6 + uTime * 1.9) * 3.6 * 0.013 * -0.85;
  vNormal = normalize(vec3(-dx, -dy, 1.0));

  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const WATER_FRAG = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uSky;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uCamPos;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uFade;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vElev;

void main() {
  vec3 viewDir = normalize(uCamPos - vWorldPos);
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;

  float fres = pow(1.0 - max(dot(viewDir, n), 0.0), 3.0);

  vec3 base;
  if (gl_FrontFacing) {
    base = mix(uDeep, uSky, fres * 0.9);
  } else {
    base = mix(vec3(0.008, 0.075, 0.095), vec3(0.05, 0.22, 0.27), fres * 0.8);
  }

  vec3 hv = normalize(viewDir + uSunDir);
  float spec = pow(max(dot(n, hv), 0.0), 240.0) * (gl_FrontFacing ? 1.7 : 0.3);
  float foam = smoothstep(0.062, 0.085, vElev) * 0.28 * (gl_FrontFacing ? 1.0 : 0.0);

  // gentle shimmer
  float shimmer = sin(vWorldPos.x * 2.4 + uTime * 1.4) * sin(vWorldPos.z * 2.1 - uTime) * 0.012;

  vec3 col = base + uSunColor * spec + vec3(foam) + shimmer;

  // manual FogExp2 to match the scene
  float dist = length(uCamPos - vWorldPos);
  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  col = mix(col, uFogColor, clamp(fogFactor, 0.0, 1.0));

  gl_FragColor = vec4(col, uFade);
}
`

function WaterSurface() {
  const mesh = useRef<THREE.Mesh>(null)
  const quality = useExperienceStore((s) => s.quality)

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: WATER_VERT,
        fragmentShader: WATER_FRAG,
        side: THREE.DoubleSide,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uDeep: { value: new THREE.Color('#052830') },
          uSky: { value: new THREE.Color('#123a47') },
          uSunDir: { value: new THREE.Vector3(0.45, 0.5, -0.74).normalize() },
          uSunColor: { value: new THREE.Color('#cfe8ef') },
          uCamPos: { value: new THREE.Vector3() },
          uFogColor: { value: new THREE.Color('#0a161d') },
          uFogDensity: { value: 0.028 },
          uFade: { value: 0 },
        },
      }),
    []
  )

  // analytic normals keep the surface believable even at reduced tessellation
  const geom = useMemo(() => {
    const seg = quality === 'low' ? 56 : quality === 'med' ? 80 : 110
    return new THREE.PlaneGeometry(60, 40, seg, Math.round(seg * 0.66))
  }, [quality])

  useEffect(() => () => geom.dispose(), [geom])

  useFrame(({ camera }, delta) => {
    mat.uniforms.uTime.value += delta
    mat.uniforms.uCamPos.value.copy(camera.position)
    mat.uniforms.uFogColor.value.copy(envBus.cur)
    mat.uniforms.uFogDensity.value = Math.max(envBus.density, 0.028)
    // gentle fade-in as the hydro scene approaches (avoids pop-in)
    const sf = getScrollState().sceneFloat
    const fade = Math.min(1, Math.max(0, (sf - (IDX - 0.08)) / 0.12))
    mat.uniforms.uFade.value = fade
  })

  return (
    <mesh ref={mesh} geometry={geom} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]} frustumCulled={false} />
  )
}

/** PROJECT 03 — HydroFloat: above the surface, then diving beneath it */
export default function HydroScene() {
  // exit early — the embedded lab owns the space after the dive
  const group = useSceneVisibility(IDX, 0.05, 0.9)
  const buoy = useRef<THREE.Group>(null)
  const beacon = useRef<THREE.Mesh>(null)
  const shafts = useRef<THREE.Group>(null)
  const setUnderwaterStore = useExperienceStore((s) => s.setUnderwater)
  const quality = useExperienceStore((s) => s.quality)
  const isTouch = useExperienceStore((s) => s.isTouch)
  const lite = quality !== 'high' || isTouch

  const beam = useMemo(() => createBeamTexture('rgba(120,220,235,0.5)'), [])
  const glow = useMemo(() => createGlowTexture('rgba(255,190,120,1)'), [])

  useEffect(() => {
    return () => {
      beam.dispose()
      glow.dispose()
    }
  }, [beam, glow])

  useFrame(({ camera }, delta) => {
    const t = performance.now() / 1000
    const under = camera.position.y < 0.04
    envBus.underwater = under
    setUnderwaterStore(under)

    if (buoy.current) {
      buoy.current.position.y = Math.sin(t * 0.55) * 0.04
      buoy.current.rotation.z = Math.sin(t * 0.4) * 0.03
      buoy.current.rotation.x = Math.cos(t * 0.33) * 0.025
    }
    if (beacon.current) {
      const m = beacon.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 2.4 + Math.sin(t * 2.6) * 1.8
    }
    if (shafts.current) {
      shafts.current.visible = under
      shafts.current.children.forEach((c, i) => {
        c.rotation.z = Math.sin(t * 0.24 + i * 1.8) * 0.08
      })
    }
    void delta
  })

  return (
    <group ref={group}>
      <WaterSurface />

      {/* ---------- buoy ---------- */}
      <group ref={buoy} position={[0, 0, 0]}>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.34, 0.3, 0.42, 32]} />
          <meshStandardMaterial color="#dfe0da" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 32]} />
          <meshStandardMaterial color="#d96a2b" roughness={0.55} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.44, 0]}>
          <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#cfd2cc" roughness={0.45} metalness={0.25} />
        </mesh>
        {/* solar cap */}
        <mesh position={[0.08, 0.72, 0]} rotation={[0, 0, -0.16]}>
          <boxGeometry args={[0.42, 0.02, 0.32]} />
          <meshStandardMaterial color="#0a1420" roughness={0.15} metalness={0.7} />
        </mesh>
        {/* antenna */}
        <mesh position={[-0.1, 1.05, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.85, 8]} />
          <meshStandardMaterial color="#8a9096" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh ref={beacon} position={[-0.1, 1.5, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#ff5a3c" emissive="#ff5a3c" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <GlowSprite position={[-0.1, 1.5, 0]} scale={0.5} color="#ff6a48" opacity={0.5} />
        {/* sensor label on hull */}
        <Label3D text="HYDRO-01" sub="IoT MONITOR" position={[0, 0.28, 0.37]} scale={0.13} accent="#5eead4" />
        {/* foam ring */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.02, 8, 48]} />
          <meshBasicMaterial color="#dff5f2" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      </group>

      {/* sun glow on horizon */}
      <sprite position={[4.5, 2.4, -14]} scale={[7, 4, 1]} renderOrder={4}>
        <spriteMaterial map={glow} color="#e8b48a" transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {/* ---------- underwater rig ---------- */}
      <group position={[0, -1.55, 0.1]}>
        <RoundedBox args={[0.46, 0.32, 0.22]} radius={0.04} smoothness={4}>
          <meshStandardMaterial color="#c8862e" roughness={0.5} metalness={0.35} />
        </RoundedBox>
        {[-0.14, 0, 0.14].map((x) => (
          <mesh key={x} position={[x, -0.28, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.26, 10]} />
            <meshStandardMaterial color="#3a4046" roughness={0.35} metalness={0.85} />
          </mesh>
        ))}
        {/* esp32 mini inside */}
        <mesh position={[0.08, 0.02, 0.115]}>
          <planeGeometry args={[0.2, 0.14]} />
          <meshStandardMaterial color="#0c1418" roughness={0.5} metalness={0.4} emissive="#67e8f9" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[-0.1, 0.05, 0.115]}>
          <planeGeometry args={[0.07, 0.07]} />
          <meshStandardMaterial color="#9aa3ab" roughness={0.25} metalness={1} />
        </mesh>
        {/* status leds */}
        <mesh position={[0.16, 0.1, 0.115]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#5eead4" emissive="#5eead4" emissiveIntensity={4} toneMapped={false} />
        </mesh>
        <GlowSprite position={[0.16, 0.1, 0.14]} scale={0.16} color="#5eead4" opacity={0.7} />
        {/* gsm antenna */}
        <mesh position={[-0.16, 0.42, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
          <meshStandardMaterial color="#3a4046" roughness={0.4} metalness={0.8} />
        </mesh>
        <Label3D text="ESP32 · GSM · GPS" sub="DEPTH SENSOR" position={[0, -0.62, 0.1]} scale={0.13} accent="#5eead4" />
      </group>

      {/* tether */}
      <mesh position={[0, -0.85, 0.05]}>
        <cylinderGeometry args={[0.008, 0.008, 1.35, 8]} />
        <meshStandardMaterial color="#23282e" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* underwater light shafts */}
      <group ref={shafts} visible={false}>
        {[-2.4, -0.4, 2.1].map((x, i) => (
          <mesh key={i} position={[x, -1.5, -1 - i * 0.7]} rotation={[0.06, 0, 0.16 * (i - 1)]}>
            <planeGeometry args={[1.6, 5.5]} />
            <meshBasicMaterial map={beam} transparent opacity={0.09} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* underwater particles + bubbles */}
      <ParticleField count={lite ? 130 : 260} spread={[15, 3.4, 11]} center={[0, -1.75, 0]} size={0.02} color="#67d8e0" opacity={0.4} speed={0.008} rise={0.1} seed={61} />
      <ParticleField count={lite ? 30 : 60} spread={[1.4, 2.4, 1.4]} center={[0, -1.2, 0.1]} size={0.045} color="#9fe8ec" opacity={0.3} speed={0.01} rise={0.3} seed={63} />

      {/* above-water particles (spray / dust) */}
      <ParticleField count={lite ? 45 : 90} spread={[12, 2.4, 10]} center={[0, 0.8, 0]} size={0.02} color="#cfe8ea" opacity={0.2} speed={0.02} seed={65} />

      {/* lighting — natural sun above, cyan beneath */}
      <directionalLight position={[5, 6, -6]} intensity={2.4} color="#fff1d8" />
      <hemisphereLight args={['#1d3a46', '#04090b', 0.55]} />
      <pointLight position={[0, -1.4, 0.6]} intensity={4.5} color="#5eead4" distance={6} decay={2} />
      <spotLight position={[3, 7, 4]} angle={0.5} penumbra={1} intensity={30} color="#e8f2ff" distance={22} decay={2} />
    </group>
  )
}
