# PARTICLE REACTOR

A cinematic real-time particle simulation built with pure HTML, CSS, and vanilla JavaScript.

PARTICLE REACTOR is an interactive visual engineering project inspired by sci-fi HUD systems, music visualizers, fluid simulations, and living digital organisms. The entire experience runs inside a single HTML5 Canvas with no frameworks or libraries.

---

## LIVE DEMO

https://fazal305.github.io/particle-reactor/

---

## FEATURES

- Full-screen Canvas particle engine
- 150 adaptive particles with fake 3D depth
- Mouse magnetic field with orbit physics
- Click explosions with ripple waves
- Mobile touch support
- Audio-reactive particle behavior
- Bass pulse, mids swirl, treble flicker
- Dynamic particle connections
- Motion trails
- Cinematic background fog
- Adaptive performance system
- Hidden FPS / debug HUD
- Ambient idle mode
- Multiple visual themes
- Edge wrapping simulation
- Responsive mobile-first design
- Pure vanilla JavaScript
- No libraries or frameworks

---

## THEMES

### NEON
Cyberpunk cyan / purple / pink palette

### FIRE
Red / orange / yellow energy palette

### MATRIX
Classic green terminal-inspired palette

---

## CONTROLS

| Action | Effect |
|---|---|
| Move Mouse | Creates magnetic orbit field |
| Click | Spawns explosion burst |
| Touch Move | Mobile magnetic field |
| Touch Tap | Mobile explosion |
| SOUND ON | Enables microphone reactivity |
| CONNECTIONS ON/OFF | Toggle particle lines |
| THEME | Switch visual palettes |
| H Key | Toggle hidden performance HUD |

---

## AUDIO SPECTRUM SYSTEM

The audio engine reacts differently depending on frequency range:

- Bass frequencies push particles outward
- Mid frequencies create orbital swirl motion
- Treble frequencies increase brightness and flicker

Microphone access is optional. If permission is denied, the simulation continues normally.

---

## AMBIENT MODE

If the user becomes inactive for a few seconds:

- The reactor enters ambient mode
- Particles drift into flowing formations
- Motion becomes calmer and more cinematic

Moving the mouse wakes the system back up instantly.

---

## TECH STACK

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API
- Web Audio API
- requestAnimationFrame()

---

## PERFORMANCE OPTIMIZATIONS

This project includes several real-time rendering optimizations:

- distanceSquared calculations
- adaptive particle count
- lightweight glow rendering
- particle cleanup system
- reduced object allocation
- requestAnimationFrame rendering loop
- mobile performance balancing

---

## WHAT I LEARNED

This project helped me practice:

- Particle systems
- Real-time rendering
- Canvas optimization
- Audio visualization
- Vector math
- Orbit physics
- Performance balancing
- Animation loops
- Mouse interaction systems
- Responsive simulation design

---

## PROJECT STRUCTURE

```text
particle-reactor/
│
├── index.html
├── particle-styles.css
├── particle-script.js
├── README.md
└── LICENSE
