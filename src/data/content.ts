export interface Milestone {
  id: string
  year: string
  title: string
  description: string
  accent: string
}

export const TIMELINE: Milestone[] = [
  {
    id: 'ece',
    year: 'CH.01',
    title: 'ECE STUDENT',
    description: 'Electronics and Communication Engineering — where signals, circuits and systems became a language.',
    accent: '#e2e8f0',
  },
  {
    id: 'programming',
    year: 'CH.02',
    title: 'PROGRAMMING',
    description: 'First lines of C and Python. Logic gates gave way to functions, loops and algorithms.',
    accent: '#e2e8f0',
  },
  {
    id: 'web',
    year: 'CH.03',
    title: 'WEB DEVELOPMENT',
    description: 'From static pages to full-stack products — React, Next.js, APIs and databases.',
    accent: '#67e8f9',
  },
  {
    id: 'aiml',
    year: 'CH.04',
    title: 'AI / ML',
    description: 'Models, datasets and training loops. Teaching machines to see and predict.',
    accent: '#bef264',
  },
  {
    id: 'iot',
    year: 'CH.05',
    title: 'IOT',
    description: 'ESP32 boards started talking to the cloud. Sensors became products.',
    accent: '#f5c86a',
  },
  {
    id: 'hackathons',
    year: 'CH.06',
    title: 'HACKATHONS',
    description: 'Weekends compressed into prototypes. Teams, deadlines and shipped demos.',
    accent: '#a78bfa',
  },
  {
    id: 'product',
    year: 'CH.07',
    title: 'PRODUCT DEVELOPMENT',
    description: 'Real users, real constraints — turning projects into platforms people rely on.',
    accent: '#67e8f9',
  },
  {
    id: 'future',
    year: 'CH.08',
    title: 'FUTURE ENGINEER',
    description: 'Building at the intersection of hardware, intelligence and design. The signal keeps travelling.',
    accent: '#bef264',
  },
]

export const STATS = [
  { value: '10', suffix: '+', label: 'PROJECTS', meta: 'SHIPPED & COUNTING' },
  { value: '5', suffix: '+', label: 'TECH DOMAINS', meta: 'SW · AI · HW · DATA · DESIGN' },
  { value: '4', suffix: '', label: 'MAJOR PROJECT AREAS', meta: 'FULL-STACK · CV · IOT · TINYML' },
  { value: '∞', suffix: '', label: 'IDEAS', meta: 'AND THE LIST GROWS' },
]

export interface CreativeWork {
  id: string
  title: string
  category: string
  year: string
  tools: string
  description: string
  image: string
}

export const CREATIVE_WORKS: CreativeWork[] = [
  {
    id: 'poster',
    title: 'Signal / Noise',
    category: 'POSTER DESIGN',
    year: '2024',
    tools: 'FIGMA · ILLUSTRATOR',
    description: 'Swiss-grid typographic poster series exploring negative space and one aggressive accent per composition.',
    image: '/images/creative/poster.png',
  },
  {
    id: 'ui',
    title: 'Telemetry OS',
    category: 'UI DESIGN',
    year: '2025',
    tools: 'FIGMA · MOTION',
    description: 'Dark-mode dashboard concept for IoT fleets — glass panels, dense data, calm hierarchy.',
    image: '/images/creative/ui.png',
  },
  {
    id: 'brand',
    title: 'Monolith Mark',
    category: 'BRANDING',
    year: '2024',
    tools: 'ILLUSTRATOR · DIMENSION',
    description: 'Identity system for an engineering collective — embossed geometry, matte blacks, a single lime signature.',
    image: '/images/creative/brand.png',
  },
  {
    id: 'webdesign',
    title: 'Editorial Engine',
    category: 'WEB DESIGN',
    year: '2025',
    tools: 'FIGMA · NEXT.JS',
    description: 'Oversized-type editorial layout exploration, later rebuilt as a production Next.js site.',
    image: '/images/creative/webdesign.png',
  },
  {
    id: 'motion',
    title: 'Glass In Motion',
    category: 'MOTION / 3D',
    year: '2025',
    tools: 'BLENDER · THREE.JS',
    description: 'Abstract renders and shader studies — translucent ribbons, chrome and studio light.',
    image: '/images/creative/motion.png',
  },
]

export const CONTACT = {
  email: 'hello@wesleysamuvel.dev', // TODO: replace with real address
  github: 'https://github.com/', // TODO: replace with real profile
  linkedin: 'https://www.linkedin.com/', // TODO: replace with real profile
}
