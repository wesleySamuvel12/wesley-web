/**
 * Hardware components on the Embedded Intelligence lab bench (Project 04).
 * Real parts, real specs — every entry maps to a clickable 3D component.
 */

export interface HardwareComponent {
  id: string
  name: string
  role: string
  specs: string[]
  pin: string
  accent: string
}

export const HARDWARE_COMPONENTS: HardwareComponent[] = [
  {
    id: 'esp32',
    name: 'ESP32-WROOM-32',
    role: 'MAIN MCU · WIFI + BLE',
    specs: ['240 MHz dual-core Xtensa', '520 KB SRAM · 4 MB flash', 'Deep-sleep down to 10 µA'],
    pin: 'GPIO 21 · PWM 50Hz',
    accent: '#a78bfa',
  },
  {
    id: 'arduino',
    name: 'ARDUINO UNO R3',
    role: 'CO-PROCESSOR · RAPID PROTOTYPING',
    specs: ['ATmega328P @ 16 MHz', '14 digital I/O · 6 PWM', '8-channel 10-bit ADC'],
    pin: '3V3 · GND · TX · RX',
    accent: '#7dd3fc',
  },
  {
    id: 'oled',
    name: 'SSD1306 OLED 0.96"',
    role: 'LIVE TELEMETRY DISPLAY',
    specs: ['128 × 64 monochrome px', 'I²C bus · addr 0x3C', '3.3 V logic · self-emissive'],
    pin: 'I²C 0x3C',
    accent: '#67e8f9',
  },
  {
    id: 'ultrasonic',
    name: 'HC-SR04',
    role: 'ULTRASONIC DEPTH SENSING',
    specs: ['2 cm – 400 cm range', '±3 mm effective accuracy', 'TRIG / ECHO pulse timing'],
    pin: 'TRIG / ECHO',
    accent: '#5eead4',
  },
  {
    id: 'servo',
    name: 'SG90 MICRO SERVO',
    role: 'ACTUATOR · GATE / VALVE CONTROL',
    specs: ['1.8 kg·cm torque @ 4.8 V', 'PWM 50 Hz · 0–180° sweep', 'Composite gear train'],
    pin: 'GPIO 21 · PWM 50Hz',
    accent: '#f5c86a',
  },
  {
    id: 'motor',
    name: 'N20 DC MOTOR',
    role: 'DRIVE UNIT · FAN IMPELLER',
    specs: ['6 V · ~6 000 RPM no-load', 'MOSFET low-side switching', 'Magnetic encoder ready'],
    pin: 'PWM D6',
    accent: '#bef264',
  },
]

export const HARDWARE_BY_ID: Record<string, HardwareComponent> = Object.fromEntries(
  HARDWARE_COMPONENTS.map((c) => [c.id, c])
)
