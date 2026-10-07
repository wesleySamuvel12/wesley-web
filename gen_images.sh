#!/bin/bash
cd /home/z/my-project
P="public/images/projects"
C="public/images/creative"
z-ai image -p "Cinematic 3D render of a futuristic digital agricultural marketplace network, glowing golden nodes connected by light streams above dark farmland fields at night, floating holographic interfaces, dark navy and amber palette, premium technology advertisement style, depth of field, high detail" -o "$P/koottam.png" -s 1344x768
z-ai image -p "Cinematic 3D render of futuristic university campus entrance with holographic face recognition scanner interface, teal wireframe face mesh, floating dashboard panels, dark environment with cyan accents, premium tech product film still, shallow depth of field" -o "$P/attendance.png" -s 1344x768
z-ai image -p "Cinematic photograph of a futuristic white and orange IoT monitoring buoy floating on dark calm ocean water at dusk, glowing sensor lights, distant storm clouds, teal water reflections, premium product advertisement, photorealistic, dramatic lighting" -o "$P/hydrofloat.png" -s 1344x768
z-ai image -p "Macro photography of futuristic electronics laboratory workbench, ESP32 microcontroller circuit board with glowing cyan traces, sensors and jumper wires, dark moody studio lighting with violet rim light, shallow depth of field, premium technology editorial" -o "$P/embedded.png" -s 1344x768
z-ai image -p "Abstract 3D visualization of machine learning data streams, flowing particle waves forming prediction curves and neural network nodes, dark background with cyan and violet glowing accents, premium cinematic data art, high detail" -o "$P/aidata.png" -s 1344x768
z-ai image -p "Bold Swiss style typographic poster design, dark charcoal background with huge white geometric letterforms and one lime green accent shape, minimal grid layout, premium print design, flat graphic design" -o "$C/poster.png" -s 1024x1024
z-ai image -p "Dark futuristic dashboard user interface design on floating glass panels, charts and data widgets, charcoal background with teal and white accents, premium UI design portfolio shot, clean minimal, high fidelity mockup" -o "$C/ui.png" -s 1344x768
z-ai image -p "Minimal brand identity design flat lay, dark stationery with embossed geometric logo mark, business cards and letterhead on dark textured paper, subtle lime green accent, premium branding photography, studio lighting" -o "$C/brand.png" -s 1024x1024
z-ai image -p "Premium dark website design mockup displayed at an angle, elegant editorial layout with huge white typography on near black background, floating in dark studio space, web design portfolio presentation, cinematic lighting" -o "$C/webdesign.png" -s 1344x768
z-ai image -p "Abstract 3D motion graphics still, flowing translucent glass ribbons and chrome spheres on dark background, subtle violet and cyan studio lighting, premium render, octane style, high detail" -o "$C/motion.png" -s 1344x768
echo "ALL_DONE"
