export interface ProjectFeature {
  label: string
  value: string
  status?: 'live' | 'active' | 'integrated' | 'beta'
}

export interface ProjectStat {
  label: string
  value: string
}

export interface Project {
  id: string
  index: string
  scene: string
  title: string[]
  subtitle: string
  description: string
  category: string
  technologies: string[]
  image: string
  github: string
  demo: string
  stats: ProjectStat[]
  features: ProjectFeature[]
  /** animated data-flow chain (rendered in overlay + 3D) */
  flow?: string[]
  accent: string
}

export const PROJECTS: Project[] = [
  {
    id: 'koottam',
    index: '01',
    scene: 'koottam',
    title: ['KOOTTAM', 'CART'],
    subtitle: 'AI-POWERED FARMER TO CONSUMER PLATFORM',
    description:
      'A community commerce platform where an AI assistant takes orders over WhatsApp, aggregates neighbourhood demand and routes it directly to farmers.',
    category: 'FULL-STACK · AI',
    technologies: ['NEXT.JS', 'NODE.JS', 'GEMINI AI', 'WHATSAPP API', 'FIREBASE'],
    image: '/images/projects/koottam.png',
    // live repo / demo URLs are wired only when a real one exists (see isRealUrl)
    github: 'https://github.com/',
    demo: 'https://github.com/',
    stats: [
      { label: 'COMMUNITIES', value: '12+' },
      { label: 'ORDER FLOW', value: 'AUTO' },
      { label: 'RESPONSE', value: '<3s' },
    ],
    features: [
      { label: 'AI ORDERING', value: 'NATURAL LANGUAGE', status: 'active' },
      { label: 'WHATSAPP', value: 'END-TO-END', status: 'integrated' },
      { label: 'COMMUNITY BUYING', value: 'GROUP DEMAND', status: 'live' },
    ],
    flow: ['CUSTOMER', 'AI', 'ORDER', 'FARMER', 'WHATSAPP'],
    accent: '#f5c86a',
  },
  {
    id: 'attendance',
    index: '02',
    scene: 'attendance',
    title: ['SMART', 'ATTENDANCE'],
    subtitle: 'FACE RECOGNITION CAMPUS CHECK-IN SYSTEM',
    description:
      'A contactless attendance engine combining face recognition, QR fallback, biometric verification and geofenced check-ins with live analytics.',
    category: 'COMPUTER VISION · IOT',
    technologies: ['PYTHON', 'OPENCV', 'REACT', 'SQLITE', 'BLE'],
    image: '/images/projects/attendance.png',
    github: 'https://github.com/',
    demo: 'https://github.com/',
    stats: [
      { label: 'RECOGNITION', value: '98.2%' },
      { label: 'CHECK-IN', value: '<1s' },
      { label: 'LIVENESS', value: 'ON' },
    ],
    features: [
      { label: 'FACE RECOGNITION', value: 'CNN EMBEDDINGS', status: 'active' },
      { label: 'BIOMETRIC + QR', value: 'DUAL FALLBACK', status: 'integrated' },
      { label: 'GEOFENCE', value: 'GPS RADIUS', status: 'live' },
      { label: 'ANALYTICS', value: 'LIVE DASHBOARD', status: 'live' },
    ],
    accent: '#67e8f9',
  },
  {
    id: 'hydrofloat',
    index: '03',
    scene: 'hydro',
    title: ['HYDRO', 'FLOAT'],
    subtitle: 'INTELLIGENT WATER LEVEL MONITORING',
    description:
      'A floating IoT sentinel that measures water level to millimetre precision, reports over GSM, stamps GPS position and warns before floods happen.',
    category: 'EMBEDDED · IOT',
    technologies: ['ESP32', 'C++', 'GSM', 'GPS', 'FIREBASE RTDB'],
    image: '/images/projects/hydrofloat.png',
    github: 'https://github.com/',
    demo: 'https://github.com/',
    stats: [
      { label: 'PRECISION', value: '±2mm' },
      { label: 'UPTIME', value: '99.4%' },
      { label: 'ALERTS', value: 'SMS+APP' },
    ],
    features: [
      { label: 'ULTRASONIC DEPTH', value: '±2 MM', status: 'active' },
      { label: 'GSM UPLINK', value: 'SMS / LTE-M', status: 'integrated' },
      { label: 'GPS STAMPED', value: 'EVERY PACKET', status: 'live' },
      { label: 'SOLAR POWERED', value: 'SELF-SUSTAINING', status: 'live' },
    ],
    accent: '#5eead4',
  },
  {
    id: 'embedded',
    index: '04',
    scene: 'embedded',
    title: ['EMBEDDED', 'INTELLIGENCE'],
    subtitle: 'TINYML SYSTEMS ON REAL HARDWARE',
    description:
      'A series of edge-AI experiments — gesture recognition, sensor fusion and predictive maintenance running directly on ESP32 and Arduino silicon.',
    category: 'EMBEDDED AI',
    technologies: ['ESP32', 'ARDUINO', 'TFLITE MICRO', 'C++', 'SENSORS'],
    image: '/images/projects/embedded.png',
    github: 'https://github.com/',
    demo: 'https://github.com/',
    stats: [
      { label: 'INFERENCE', value: '38ms' },
      { label: 'MODELS', value: '6' },
      { label: 'POWER', value: '<1W' },
    ],
    features: [
      { label: 'TINYML', value: 'ON-DEVICE', status: 'active' },
      { label: 'SENSOR FUSION', value: '9-AXIS', status: 'integrated' },
      { label: 'REAL-TIME OS', value: 'FREERTOS', status: 'live' },
      { label: 'OLED TELEMETRY', value: 'LIVE READOUT', status: 'live' },
    ],
    accent: '#a78bfa',
  },
  {
    id: 'aidata',
    index: '05',
    scene: 'data',
    title: ['DATA BECOMES', 'INTELLIGENCE.'],
    subtitle: 'MACHINE LEARNING PIPELINES & ANALYTICS',
    description:
      'Explorations where raw signals turn into decisions — cleaning pipelines, predictive models and visual analytics built with the classic Python stack.',
    category: 'AI / ML · DATA',
    technologies: ['PYTHON', 'PANDAS', 'SCIKIT-LEARN', 'SQL', 'MATPLOTLIB'],
    image: '/images/projects/aidata.png',
    github: 'https://github.com/',
    demo: 'https://github.com/',
    stats: [
      { label: 'MODELS SHIPPED', value: '8+' },
      { label: 'DATASETS', value: '30+' },
      { label: 'BEST F1', value: '0.94' },
    ],
    features: [
      { label: 'PIPELINES', value: 'PANDAS ETL', status: 'active' },
      { label: 'MODELS', value: 'SKLEARN / XGB', status: 'integrated' },
      { label: 'SQL WAREHOUSE', value: 'INDEXED', status: 'live' },
    ],
    accent: '#bef264',
  },
]
