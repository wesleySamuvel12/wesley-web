/**
 * Live, deployed web products — real URLs, real screenshots.
 * Captured from production (verified working sites).
 */

export interface WebProduct {
  id: string
  title: string
  tagline: string
  description: string
  url: string
  domain: string
  stack: string[]
  image: string
  accent: string
  category: string
  highlights: { label: string; value: string }[]
}

export const WEB_PRODUCTS: WebProduct[] = [
  {
    id: 'iqac',
    title: 'AI ENABLED IQAC PORTAL',
    tagline: 'INSTITUTIONAL QUALITY ASSURANCE SUITE',
    description:
      'A live academic management system built for NIET — role-based portals for Administrator, HOD, Staff and Students, department modules across 11 departments and AI-assisted quality workflows.',
    url: 'https://iqac-portals.vercel.app/',
    domain: 'iqac-portals.vercel.app',
    stack: ['NEXT.JS', 'REACT', 'ROLE-BASED AUTH', 'VERCEL'],
    image: '/images/web/iqac.png',
    accent: '#67e8f9',
    category: 'FULL-STACK WEB PLATFORM',
    highlights: [
      { label: 'ROLE PORTALS', value: '4' },
      { label: 'DEPARTMENTS', value: '11' },
      { label: 'STATUS', value: 'DEPLOYED' },
    ],
  },
  {
    id: 'fdppro',
    title: 'FDP PRO · EVENT SITE',
    tagline: '7-DAY ONLINE FDP — NIET MATHEMATICS DEPT.',
    description:
      'A complete event platform designed and built for the Department of Mathematics, NIET — a 7-day online Faculty Development Programme on advanced applications of mathematics in engineering systems, machine learning and scientific research, with schedule, speakers, topics, committee and free registration flows.',
    url: 'https://fdppro.netlify.app/',
    domain: 'fdppro.netlify.app',
    stack: ['HTML5', 'CSS3', 'VANILLA JS', 'NETLIFY'],
    image: '/images/web/fdppro.png',
    accent: '#a78bfa',
    category: 'EVENT WEB PLATFORM',
    highlights: [
      { label: 'PROGRAM DAYS', value: '7' },
      { label: 'PARTICIPANTS', value: '394+' },
      { label: 'STATUS', value: 'DEPLOYED' },
    ],
  },
  {
    id: 'msproject',
    title: 'MS PROJECT CLONE',
    tagline: 'PROFESSIONAL PROJECT SCHEDULING, REBUILT FOR WEB',
    description:
      'A Microsoft Project–class scheduling suite for the browser — Gantt engine, task hierarchy, resource assignment, critical path, baselines, eight work views and a built-in AI assistant.',
    url: 'https://msproject.space-z.ai',
    domain: 'msproject.space-z.ai',
    stack: ['REACT', 'TYPESCRIPT', 'GANTT ENGINE', 'AI ASSISTANT'],
    image: '/images/web/msproject.png',
    accent: '#bef264',
    category: 'PRODUCTIVITY PLATFORM',
    highlights: [
      { label: 'WORK VIEWS', value: '8' },
      { label: 'SAMPLE PLAN', value: '37 TASKS' },
      { label: 'STATUS', value: 'DEPLOYED' },
    ],
  },
]

/** Only trust absolute, non-placeholder URLs */
export function isRealUrl(url: string | null | undefined): boolean {
  if (!url) return false
  if (!/^https?:\/\//i.test(url)) return false
  // bare github root used as a placeholder in early drafts
  if (/^https?:\/\/(www\.)?github\.com\/?$/i.test(url)) return false
  return true
}
