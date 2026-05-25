const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

const soundToggle = document.getElementById("soundToggle");
const connectionsToggle = document.getElementById("connectionsToggle");
const themeToggle = document.getElementById("themeToggle");

const performanceHud = document.getElementById("performanceHud");
const fpsValue = document.getElementById("fpsValue");
const particleValue = document.getElementById("particleValue");
const themeValue = document.getElementById("themeValue");
const soundValue = document.getElementById("soundValue");
const connectionsValue = document.getElementById("connectionsValue");

const DESKTOP_PARTICLE_COUNT = 150;
const MOBILE_PARTICLE_COUNT = 90;
const ATTRACTION_RADIUS = 140;
const CONNECTION_RADIUS = 100;
const EXPLOSION_COUNT = 30;
const TRAIL_ALPHA = 0.38;
const ORBIT_STRENGTH = 0.18;

const THEMES = {
    NEON: ["#00ffff", "#9b5cff", "#ff2bd6"],
    FIRE: ["#ff3131", "#ff7a00", "#ffd000"],
    MATRIX: ["#00ff66", "#00cc44", "#7cff9b"]
};

const particles = [];
const ripples = [];

const mouse = {
    x: 0,
    y: 0,
    isDown: false,
    active: false,
    energy: 0
};

const audioData = {
    analyser: null,
    dataArray: null,
    amplitude: 0,
    bass: 0,
    mids: 0,
    treble: 0,
    active: false
};

const settings = {
    soundOn: false,
    connectionsOn: true,
    theme: "NEON",
    particleCount: DESKTOP_PARTICLE_COUNT,
    hudOn: false
};

const performanceData = {
    frameCount: 0,
    fps: 0,
    lastFpsUpdate: performance.now()
};

let canvasWidth = 0;
let canvasHeight = 0;
let themeIndex = 0;
let fogTime = 0;

const themeNames = Object.keys(THEMES);

/* Detects mobile screens and lowers particle count for smoother performance. */
function updateAdaptiveParticleCount() {
    settings.particleCount = window.innerWidth <= 768 ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT;
}

/* Creates one normal particle or one explosion particle with fake depth. */
function createParticle(x, y, isExplosion) {
    const palette = THEMES[settings.theme];
    const randomColor = palette[Math.floor(Math.random() * palette.length)];

    const angle = Math.random() * Math.PI * 2;
    const depth = isExplosion ? 1 : Math.random() * 0.75 + 0.25;
    const baseSpeed = isExplosion ? Math.random() * 8 + 4 : Math.random() * 2.1 + 0.7;
    const depthSpeed = baseSpeed * depth;

    return {
        x: x,
        y: y,
        vx: Math.cos(angle) * depthSpeed,
        vy: Math.sin(angle) * depthSpeed,
        size: isExplosion ? Math.random() * 3 + 1 : (Math.random() * 2.4 + 0.8) * depth,
        baseSize: isExplosion ? 2.5 : (Math.random() * 2.4 + 0.8) * depth,
        color: randomColor,
        opacity: isExplosion ? 1 : 0.25 + depth * 0.55,
        baseOpacity: isExplosion ? 1 : 0.25 + depth * 0.55,
        lifespan: isExplosion ? 60 : null,
        isExplosion: isExplosion,
        depth: depth
    };
}

/* Creates one expanding click ripple. */
function createRipple(x, y) {
    const palette = THEMES[settings.theme];

    return {
        x: x,
        y: y,
        radius: 8,
        opacity: 0.8,
        color: palette[Math.floor(Math.random() * palette.length)]
    };
}

/* Fills the simulation with the current adaptive particle count. */
function initParticles() {
    particles.length = 0;

    for (let i = 0; i < settings.particleCount; i++) {
        particles.push(createParticle(Math.random() * canvasWidth, Math.random() * canvasHeight, false));
    }
}

/* Keeps normal particle count stable after resizing between desktop and mobile. */
function rebalanceParticles() {
    let normalParticleCount = 0;

    for (let i = 0; i < particles.length; i++) {
        if (!particles[i].isExplosion) {
            normalParticleCount++;
        }
    }

    while (normalParticleCount < settings.particleCount) {
        particles.push(createParticle(Math.random() * canvasWidth, Math.random() * canvasHeight, false));
        normalParticleCount++;
    }

    for (let i = particles.length - 1; i >= 0 && normalParticleCount > settings.particleCount; i--) {
        if (!particles[i].isExplosion) {
            particles.splice(i, 1);
            normalParticleCount--;
        }
    }
}

/* Adds a transparent black fade layer for clean motion trails. */
function drawTrailFade() {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_ALPHA})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
}

/* Draws very subtle moving background fog. */
function drawBackgroundFog() {
    const palette = THEMES[settings.theme];

    fogTime += 0.004;

    const firstX = canvasWidth * 0.25 + Math.sin(fogTime) * 60;
    const firstY = canvasHeight * 0.35 + Math.cos(fogTime * 0.8) * 45;

    const secondX = canvasWidth * 0.75 + Math.cos(fogTime * 0.7) * 70;
    const secondY = canvasHeight * 0.65 + Math.sin(fogTime) * 55;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.018;

    const firstGradient = ctx.createRadialGradient(firstX, firstY, 0, firstX, firstY, 220);
    firstGradient.addColorStop(0, palette[0]);
    firstGradient.addColorStop(1, "transparent");

    ctx.fillStyle = firstGradient;
    ctx.beginPath();
    ctx.arc(firstX, firstY, 220, 0, Math.PI * 2);
    ctx.fill();

    const secondGradient = ctx.createRadialGradient(secondX, secondY, 0, secondX, secondY, 260);
    secondGradient.addColorStop(0, palette[2]);
    secondGradient.addColorStop(1, "transparent");

    ctx.fillStyle = secondGradient;
    ctx.beginPath();
    ctx.arc(secondX, secondY, 260, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/* Calculates bass, mids, treble, and total amplitude from microphone data. */
function updateAudioSpectrum() {
    if (!audioData.active || !audioData.analyser || !audioData.dataArray) {
        return;
    }

    audioData.analyser.getByteFrequencyData(audioData.dataArray);

    let bassTotal = 0;
    let midsTotal = 0;
    let trebleTotal = 0;

    const bassEnd = Math.floor(audioData.dataArray.length * 0.18);
    const midsEnd = Math.floor(audioData.dataArray.length * 0.55);

    for (let i = 0; i < audioData.dataArray.length; i++) {
        if (i < bassEnd) {
            bassTotal += audioData.dataArray[i];
        } else if (i < midsEnd) {
            midsTotal += audioData.dataArray[i];
        } else {
            trebleTotal += audioData.dataArray[i];
        }
    }

    audioData.bass = bassTotal / bassEnd / 255;
    audioData.mids = midsTotal / (midsEnd - bassEnd) / 255;
    audioData.treble = trebleTotal / (audioData.dataArray.length - midsEnd) / 255;
    audioData.amplitude = (audioData.bass + audioData.mids + audioData.treble) / 3;
}

/* Applies bass pulse, mids swirl, and treble flicker to particles. */
function applyAudioSpectrum() {
    if (!settings.soundOn || !audioData.active) {
        return;
    }

    updateAudioSpectrum();

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const bassPower = audioData.bass;
    const midsPower = audioData.mids;
    const treblePower = audioData.treble;

    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > 0.01) {
            const distance = Math.sqrt(distanceSquared);

            if (bassPower > 0.18) {
                particle.vx += (dx / distance) * bassPower * 1.8 * particle.depth;
                particle.vy += (dy / distance) * bassPower * 1.8 * particle.depth;
            }

            if (midsPower > 0.12) {
                particle.vx += (-dy / distance) * midsPower * 0.9 * particle.depth;
                particle.vy += (dx / distance) * midsPower * 0.9 * particle.depth;
            }
        }

        if (!particle.isExplosion) {
            particle.opacity = Math.min(particle.baseOpacity + treblePower * 0.45, 1);
            particle.size = particle.baseSize + treblePower * 1.6 * particle.depth;
        }
    }
}

/* Applies mouse attraction and orbit force to one particle. */
function applyMouseEnergy(particle) {
    if (!mouse.active) {
        return;
    }

    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const distanceSquared = dx * dx + dy * dy;
    const attractionRadiusSquared = ATTRACTION_RADIUS * ATTRACTION_RADIUS;

    if (distanceSquared < attractionRadiusSquared && distanceSquared > 0.01) {
        const distance = Math.sqrt(distanceSquared);
        const closeness = 1 - distance / ATTRACTION_RADIUS;
        const attractionForce = closeness * 0.18 * particle.depth;
        const orbitForce = closeness * ORBIT_STRENGTH * particle.depth;

        particle.vx += (dx / distance) * attractionForce;
        particle.vy += (dy / distance) * attractionForce;

        particle.vx += (-dy / distance) * orbitForce;
        particle.vy += (dx / distance) * orbitForce;

        mouse.energy = Math.min(mouse.energy + 0.004, 1);
    }
}

/* Draws the soft pulsing energy ring around the cursor. */
function drawMouseEnergyField() {
    if (!mouse.active) {
        return;
    }

    const palette = THEMES[settings.theme];
    const pulseRadius = 32 + mouse.energy * 36 + Math.sin(fogTime * 8) * 4;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.16 + mouse.energy * 0.15;
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.08 + mouse.energy * 0.1;
    ctx.strokeStyle = palette[2];

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, pulseRadius + 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    mouse.energy *= 0.94;
}

/* Updates one particle position, mouse physics, damping, wrapping, and lifespan. */
function updateParticle(particle) {
    applyMouseEnergy(particle);

    particle.x += particle.vx;
    particle.y += particle.vy;

    particle.vx *= 0.992;
    particle.vy *= 0.992;

    if (!settings.soundOn && !particle.isExplosion) {
        particle.opacity += (particle.baseOpacity - particle.opacity) * 0.08;
        particle.size += (particle.baseSize - particle.size) * 0.08;
    }

    if (particle.x > canvasWidth) {
        particle.x = 0;
    } else if (particle.x < 0) {
        particle.x = canvasWidth;
    }

    if (particle.y > canvasHeight) {
        particle.y = 0;
    } else if (particle.y < 0) {
        particle.y = canvasHeight;
    }

    if (particle.isExplosion) {
        particle.lifespan -= 1;
        particle.opacity = Math.max(particle.lifespan / 60, 0);
    }
}

/* Draws one sharp particle with depth-based size and glow. */
function drawParticle(particle) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 1 + particle.depth * 2;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/* Draws thin connection lines between nearby particles. */
function drawConnections() {
    const connectionRadiusSquared = CONNECTION_RADIUS * CONNECTION_RADIUS;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 0.55;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const firstParticle = particles[i];
            const secondParticle = particles[j];

            const dx = secondParticle.x - firstParticle.x;
            const dy = secondParticle.y - firstParticle.y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared < connectionRadiusSquared) {
                const distance = Math.sqrt(distanceSquared);
                const opacity = 1 - distance / CONNECTION_RADIUS;
                const depthOpacity = (firstParticle.depth + secondParticle.depth) / 2;

                ctx.globalAlpha = opacity * 0.18 * depthOpacity;
                ctx.strokeStyle = firstParticle.color;

                ctx.beginPath();
                ctx.moveTo(firstParticle.x, firstParticle.y);
                ctx.lineTo(secondParticle.x, secondParticle.y);
                ctx.stroke();
            }
        }
    }

    ctx.restore();
}

/* Spawns a fast visual explosion and click ripple. */
function spawnExplosion(x, y) {
    ripples.push(createRipple(x, y));

    for (let i = 0; i < EXPLOSION_COUNT; i++) {
        particles.push(createParticle(x, y, true));
    }
}

/* Updates and draws click ripple rings. */
function updateAndDrawRipples() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 1.2;

    for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];

        ripple.radius += 5;
        ripple.opacity *= 0.9;

        ctx.globalAlpha = ripple.opacity;
        ctx.strokeStyle = ripple.color;

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (ripple.opacity < 0.03) {
            ripples.splice(i, 1);
        }
    }

    ctx.restore();
}

/* Removes explosion particles after their lifespan ends. */
function cleanupExplosionParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].isExplosion && particles[i].lifespan <= 0) {
            particles.splice(i, 1);
        }
    }
}

/* Updates FPS and HUD text without expensive DOM updates every frame. */
function updatePerformanceHud(currentTime) {
    performanceData.frameCount++;

    if (currentTime - performanceData.lastFpsUpdate >= 500) {
        performanceData.fps = Math.round(
            performanceData.frameCount * 1000 / (currentTime - performanceData.lastFpsUpdate)
        );

        performanceData.frameCount = 0;
        performanceData.lastFpsUpdate = currentTime;

        if (settings.hudOn) {
            fpsValue.textContent = performanceData.fps;
            particleValue.textContent = particles.length;
            themeValue.textContent = settings.theme;
            soundValue.textContent = settings.soundOn
                ? `ON B:${Math.round(audioData.bass * 100)} M:${Math.round(audioData.mids * 100)} T:${Math.round(audioData.treble * 100)}`
                : "OFF";
            connectionsValue.textContent = settings.connectionsOn ? "ON" : "OFF";
        }
    }
}

/* Runs the full update and draw loop every animation frame. */
function animate(currentTime) {
    drawTrailFade();
    drawBackgroundFog();

    applyAudioSpectrum();

    for (let i = 0; i < particles.length; i++) {
        updateParticle(particles[i]);
    }

    cleanupExplosionParticles();

    if (settings.connectionsOn) {
        drawConnections();
    }

    updateAndDrawRipples();
    drawMouseEnergyField();

    for (let i = 0; i < particles.length; i++) {
        drawParticle(particles[i]);
    }

    updatePerformanceHud(currentTime);
    requestAnimationFrame(animate);
}

/* Requests microphone permission and connects it to an analyser node. */
async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const microphoneSource = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.82;

        microphoneSource.connect(analyser);

        audioData.analyser = analyser;
        audioData.dataArray = new Uint8Array(analyser.frequencyBinCount);
        audioData.active = true;
    } catch (error) {
        settings.soundOn = false;
        audioData.active = false;
        soundToggle.textContent = "SOUND OFF";
        soundToggle.classList.remove("active");
    }
}

/* Changes the theme and gives every particle a fresh color from that theme. */
function setTheme(themeName) {
    settings.theme = themeName;

    const palette = THEMES[settings.theme];

    for (let i = 0; i < particles.length; i++) {
        particles[i].color = palette[Math.floor(Math.random() * palette.length)];
    }

    themeToggle.textContent = settings.theme;
}

/* Resizes the canvas and rebalances particles for desktop or mobile. */
function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    updateAdaptiveParticleCount();
    rebalanceParticles();

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

/* Updates mouse coordinates from mouse events. */
function updateMousePosition(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
}

/* Updates mouse coordinates from touch events. */
function updateTouchPosition(event) {
    if (event.touches.length === 0) {
        return;
    }

    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    mouse.active = true;
}

/* Shows or hides the hidden performance panel. */
function togglePerformanceHud() {
    settings.hudOn = !settings.hudOn;
    performanceHud.classList.toggle("visible", settings.hudOn);
}

/* Sets up all button, keyboard, mouse, touch, and resize events. */
function setupEventListeners() {
    window.addEventListener("resize", function () {
        resizeCanvas();
    });

    window.addEventListener("keydown", function (event) {
        if (event.key.toLowerCase() === "h") {
            togglePerformanceHud();
        }
    });

    window.addEventListener("mousemove", function (event) {
        updateMousePosition(event);
    });

    window.addEventListener("mousedown", function (event) {
        mouse.isDown = true;
        updateMousePosition(event);
        spawnExplosion(event.clientX, event.clientY);
    });

    window.addEventListener("mouseup", function () {
        mouse.isDown = false;
    });

    window.addEventListener("touchmove", function (event) {
        event.preventDefault();
        updateTouchPosition(event);
    }, { passive: false });

    window.addEventListener("touchstart", function (event) {
        event.preventDefault();
        mouse.isDown = true;
        updateTouchPosition(event);
        spawnExplosion(mouse.x, mouse.y);
    }, { passive: false });

    window.addEventListener("touchend", function () {
        mouse.isDown = false;
    });

    soundToggle.addEventListener("click", async function () {
        settings.soundOn = !settings.soundOn;

        if (settings.soundOn && !audioData.active) {
            await initAudio();
        }

        soundToggle.textContent = settings.soundOn ? "SOUND ON" : "SOUND OFF";
        soundToggle.classList.toggle("active", settings.soundOn);
    });

    connectionsToggle.addEventListener("click", function () {
        settings.connectionsOn = !settings.connectionsOn;

        connectionsToggle.textContent = settings.connectionsOn ? "CONNECTIONS ON" : "CONNECTIONS OFF";
        connectionsToggle.classList.toggle("active", settings.connectionsOn);
    });

    themeToggle.addEventListener("click", function () {
        themeIndex++;

        if (themeIndex >= themeNames.length) {
            themeIndex = 0;
        }

        setTheme(themeNames[themeIndex]);
    });
}

/* Starts the full particle reactor app. */
function startApp() {
    updateAdaptiveParticleCount();
    resizeCanvas();
    initParticles();
    setupEventListeners();
    requestAnimationFrame(animate);
}

startApp();