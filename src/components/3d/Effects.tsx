'use client'

import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.25}
        mipmapBlur
        radius={0.72}
      />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.14} />
      <Vignette eskil={false} offset={0.17} darkness={0.8} />
    </EffectComposer>
  )
}
