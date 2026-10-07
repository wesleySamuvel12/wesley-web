export type TechCategory = 'LANGUAGE' | 'WEB' | 'AI' | 'HARDWARE' | 'DATA' | 'CRAFT'

export interface TechNode {
  id: string
  label: string
  category: TechCategory
  level: number // 0..1
  blurb: string
}

export const TECH_NODES: TechNode[] = [
  { id: 'python', label: 'PYTHON', category: 'LANGUAGE', level: 0.9, blurb: 'Scripting, ML pipelines, automation and everything in between.' },
  { id: 'c', label: 'C', category: 'LANGUAGE', level: 0.82, blurb: 'Bare-metal firmware, registers, interrupts and timing loops.' },
  { id: 'javascript', label: 'JAVASCRIPT', category: 'LANGUAGE', level: 0.88, blurb: 'The language of the web — client, server and edge.' },
  { id: 'typescript', label: 'TYPESCRIPT', category: 'LANGUAGE', level: 0.85, blurb: 'Types first. Production-grade React and Node systems.' },
  { id: 'react', label: 'REACT', category: 'WEB', level: 0.87, blurb: 'Component architecture, hooks, rendering performance.' },
  { id: 'nextjs', label: 'NEXT.JS', category: 'WEB', level: 0.86, blurb: 'Full-stack React — SSR, API routes, edge deployments.' },
  { id: 'node', label: 'NODE.JS', category: 'WEB', level: 0.83, blurb: 'APIs, realtime services and tooling on the server.' },
  { id: 'sql', label: 'SQL', category: 'DATA', level: 0.78, blurb: 'Schema design, queries and indexed data warehouses.' },
  { id: 'aiml', label: 'AI / ML', category: 'AI', level: 0.8, blurb: 'Model training, evaluation and shipping to production.' },
  { id: 'cv', label: 'COMPUTER VISION', category: 'AI', level: 0.74, blurb: 'OpenCV, face recognition, embedded camera pipelines.' },
  { id: 'esp32', label: 'ESP32', category: 'HARDWARE', level: 0.9, blurb: 'WiFi/BLE microcontroller — my default edge brain.' },
  { id: 'arduino', label: 'ARDUINO', category: 'HARDWARE', level: 0.85, blurb: 'Rapid prototyping for sensors, actuators and robots.' },
  { id: 'iot', label: 'IOT', category: 'HARDWARE', level: 0.86, blurb: 'MQTT, telemetry, fleets of connected devices.' },
  { id: 'firebase', label: 'FIREBASE', category: 'DATA', level: 0.8, blurb: 'Realtime sync, auth and serverless backends.' },
  { id: 'supabase', label: 'SUPABASE', category: 'DATA', level: 0.72, blurb: 'Postgres, row-level security and instant APIs.' },
  { id: 'uiux', label: 'UI / UX', category: 'CRAFT', level: 0.78, blurb: 'Interfaces that feel inevitable — motion, hierarchy, restraint.' },
]

export const CATEGORY_COLORS: Record<TechCategory, string> = {
  LANGUAGE: '#e2e8f0',
  WEB: '#67e8f9',
  AI: '#bef264',
  HARDWARE: '#f5c86a',
  DATA: '#a78bfa',
  CRAFT: '#f0abfc',
}

/** links between node ids */
export const TECH_LINKS: [string, string][] = [
  ['python', 'aiml'], ['python', 'cv'], ['c', 'esp32'], ['c', 'arduino'],
  ['javascript', 'typescript'], ['javascript', 'react'], ['javascript', 'node'],
  ['typescript', 'nextjs'], ['react', 'nextjs'], ['nextjs', 'firebase'],
  ['nextjs', 'supabase'], ['node', 'sql'], ['node', 'firebase'],
  ['aiml', 'cv'], ['aiml', 'sql'], ['iot', 'esp32'], ['iot', 'firebase'],
  ['esp32', 'arduino'], ['esp32', 'cv'], ['uiux', 'react'], ['uiux', 'nextjs'],
  ['python', 'sql'], ['iot', 'aiml'], ['arduino', 'iot'],
]
