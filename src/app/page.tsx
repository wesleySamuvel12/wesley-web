'use client'

import dynamic from 'next/dynamic'

const ExperienceShell = dynamic(() => import('@/components/experience/ExperienceShell'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050505]">
      <div className="font-mono text-[10px] tracking-[0.4em] text-white/40">WESLEY SAMUVEL — LOADING WORLD</div>
    </div>
  ),
})

export default function Page() {
  return <ExperienceShell />
}
