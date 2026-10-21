'use client'

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useExperienceStore } from '@/lib/store'

/**
 * Tier-driven post pipeline (the CSS film-grain overlay replaces a Noise pass):
 * - high: 2×MSAA + mipmap bloom + vignette
 * - med:  no MSAA (pixel density hides aliasing) + bloom + vignette
 * - low:  composer bypassed entirely — raw pipeline, maximum FPS
 */
export default function Effects() {
  const quality = useExperienceStore((s) => s.quality)
  if (quality === 'low') return null

  return (
    <EffectComposer multisampling={quality === 'high' ? 2 : 0} enableNormalPass={false}>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.28}
        mipmapBlur
        radius={0.7}
      />
      <Vignette eskil={false} offset={0.17} darkness={0.8} />
    </EffectComposer>
  )
}
