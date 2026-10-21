'use client'

import IntroScene from './scenes/IntroScene'
import HeroScene from './scenes/HeroScene'
import IdentityScene from './scenes/IdentityScene'
import AboutScene from './scenes/AboutScene'
import TechScene from './scenes/TechScene'
import KoottamScene from './scenes/KoottamScene'
import AttendanceScene from './scenes/AttendanceScene'
import HydroScene from './scenes/HydroScene'
import EmbeddedScene from './scenes/EmbeddedScene'
import DataScene from './scenes/DataScene'
import WebScene from './scenes/WebScene'
import StatsScene from './scenes/StatsScene'
import CreativeScene from './scenes/CreativeScene'
import JourneyScene from './scenes/JourneyScene'
import ContactScene from './scenes/ContactScene'

/**
 * All scenes stay mounted; each one toggles its own visibility based on the
 * camera timeline (see useSceneVisibility). Invisible groups cost ~0 GPU.
 */
export default function SceneManager() {
  return (
    <>
      <IntroScene />
      <HeroScene />
      <IdentityScene />
      <AboutScene />
      <TechScene />
      <KoottamScene />
      <AttendanceScene />
      <HydroScene />
      <EmbeddedScene />
      <DataScene />
      <WebScene />
      <StatsScene />
      <CreativeScene />
      <JourneyScene />
      <ContactScene />
    </>
  )
}
