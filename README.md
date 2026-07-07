# Particle Reactor

A cinematic real-time particle simulation built with HTML5 Canvas, CSS, and vanilla JavaScript.

Particle Reactor is an interactive visual experiment inspired by sci-fi HUD systems, audio visualizers, and physics-style motion. It runs fully in the browser with no frameworks or build tools.

## Live Demo

https://fazal305.github.io/particle-reactor/

## Features

- Full-screen Canvas particle engine
- Adaptive particle count for desktop and mobile
- Mouse and touch magnetic field interaction
- Click and tap explosion bursts
- Expanding ripple effects
- Dynamic particle connections
- Motion trails and background fog
- Three visual themes: Neon, Fire, and Matrix
- Optional microphone-reactive motion
- Bass pulse, mids swirl, and treble flicker effects
- Hidden performance HUD
- Edge wrapping simulation
- Responsive mobile-first layout
- Reduced-motion support
- Pure vanilla JavaScript

## Controls

| Action             | Effect                                          |
| ------------------ | ----------------------------------------------- |
| Move mouse         | Pulls nearby particles into an orbit field      |
| Click              | Spawns an explosion burst                       |
| Touch move         | Controls the magnetic field on mobile           |
| Touch tap          | Spawns an explosion burst on mobile             |
| Sound button       | Requests microphone access for audio reactivity |
| Connections button | Toggles particle connection lines               |
| Theme button       | Switches between visual palettes                |
| H key              | Shows or hides the performance HUD              |

## Audio Reactivity

Microphone access is optional. If permission is allowed, the simulation analyzes the audio spectrum:

- Bass pushes particles outward
- Mid frequencies add orbital swirl
- Treble increases brightness and flicker

If microphone permission is denied, the simulation continues normally.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API
- Web Audio API
- `requestAnimationFrame`

## Project Structure

```text
particle-reactor/
|-- index.html
|-- particle-styles.css
|-- particle-script.js
|-- LICENSE
`-- README.md
```

## What I Practiced

- Canvas rendering loops
- Particle system design
- Vector movement and orbit force
- Mouse and touch event handling
- Audio spectrum analysis
- Performance-aware animation
- Responsive simulation behavior
- UI overlays for interactive visual projects

## Run Locally

Open `index.html` in a browser.

No dependencies, package installation, or build step are required.

## Author

Built by Fazal Abbas.

- GitHub: https://github.com/fazal305
- LinkedIn: https://www.linkedin.com/in/fazal-abbas-4653dg86

## License

This project is licensed under the MIT License.
