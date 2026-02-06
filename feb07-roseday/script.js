document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // GSAP PLUGINS
    // ==========================================
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error("GSAP libraries not loaded");
        alert("⚠️ Critical Error: Animation libraries failed to load. Please check your internet connection.");
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // THREE.JS BACKGROUND SCENE
    // ==========================================
    const canvas = document.querySelector('#world-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Floating Rose Petals
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 250;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const textureLoader = new THREE.TextureLoader();
    const sprite = textureLoader.load('https://assets.codepen.io/16327/dot.png');

    const material = new THREE.PointsMaterial({
        size: 0.06,
        map: sprite,
        transparent: true,
        color: 0xff9a9e,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Gentle rotation
        particlesMesh.rotation.y = elapsedTime * 0.03;

        // Mouse parallax effect
        particlesMesh.rotation.x += (mouseY * 0.15 - particlesMesh.rotation.x) * 0.05;
        particlesMesh.rotation.y += (mouseX * 0.15 - particlesMesh.rotation.y) * 0.05;

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };
    tick();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // ==========================================
    // GSAP ANIMATIONS
    // ==========================================

    // 1. HERO TEXT REVEAL
    // Moved to startExperience() to trigger after popup click
    // const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    // ... logic moved ...

    // 2. HERO ROSE 3D PARALLAX
    const heroRose = document.getElementById('hero-rose');
    if (heroRose) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX - window.innerWidth / 2) / window.innerWidth * 30;
            const y = (e.clientY - window.innerHeight / 2) / window.innerHeight * 30;

            gsap.to(heroRose, {
                rotationY: x,
                rotationX: -y,
                duration: 1.2,
                ease: "power2.out"
            });
        });
    }

    // 3. BLOOM INTERACTION
    const bloomRose = document.getElementById('bloom-rose');
    const closedIcon = bloomRose?.querySelector('.closed-state');
    const bloomedIcon = bloomRose?.querySelector('.bloomed-state');
    const bloomMsg = document.getElementById('bloom-message');

    // Create flash element
    const flashEl = document.createElement('div');
    flashEl.classList.add('bloom-flash');
    bloomRose?.appendChild(flashEl);

    let hasBloomed = false;

    bloomRose?.addEventListener('click', (e) => {
        const rect = bloomRose.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        const centerX = rect.left + scrollLeft + rect.width / 2;
        const centerY = rect.top + scrollTop + rect.height / 2;

        if (hasBloomed) {
            // Repeat click: just burst
            createPetalBurst(centerX, centerY);
            return;
        }

        hasBloomed = true;

        // Flash effect
        gsap.fromTo(flashEl,
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.12,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            }
        );

        // Swap icons with smooth transition
        setTimeout(() => {
            closedIcon.style.display = 'none';
            bloomedIcon.classList.remove('hidden');

            gsap.fromTo(bloomedIcon,
                { opacity: 0, scale: 0.5 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: "back.out(1.7)"
                }
            );

            // Petal burst
            createPetalBurst(centerX, centerY);

            // Reveal message
            if (bloomMsg) {
                bloomMsg.classList.remove('hidden');
                gsap.fromTo(bloomMsg,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power3.out",
                        delay: 0.3
                    }
                );
            }
        }, 120);
    });

    // 4. ROSE CONSTELLATION
    const orbs = document.querySelectorAll('.orb');
    const panel = document.getElementById('orb-panel');
    const panelText = document.getElementById('orb-text');
    const closeOrb = document.getElementById('close-orb');

    orbs.forEach((orb, index) => {
        // Staggered floating animation
        gsap.to(orb, {
            y: "random(-25, 25)",
            duration: "random(2.5, 4.5)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2
        });

        orb.addEventListener('click', () => {
            const msg = orb.getAttribute('data-msg');
            const color = orb.getAttribute('data-color');

            if (panelText && panel) {
                panelText.innerText = msg;
                panel.style.borderColor = color;
                panel.classList.remove('hidden');

                gsap.fromTo(panel,
                    { opacity: 0, y: 50, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.6,
                        ease: "back.out(1.7)"
                    }
                );

                // Subtle background color shift
                gsap.to("body", {
                    backgroundColor: gsap.utils.interpolate("#0d0404", color, 0.08),
                    duration: 1.2,
                    ease: "power2.inOut"
                });
            }
        });
    });

    closeOrb?.addEventListener('click', () => {
        gsap.to(panel, {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.4,
            onComplete: () => panel.classList.add('hidden')
        });
        gsap.to("body", {
            backgroundColor: "#0d0404",
            duration: 1.2,
            ease: "power2.inOut"
        });
    });

    // 5. ENVELOPE - REDESIGNED
    const envelope = document.getElementById('envelope-wrapper');
    const letterContent = document.getElementById('letter-content');
    const waxSeal = envelope?.querySelector('.wax-seal');
    const letterText = "My Bubu, you’re not just my love… you’re my weakness. ❤️🔥 The way you smile, the way you look at me — it drives me crazy in the best way. 😵💫😍 I don’t just miss you, I crave you. 🤍🔥 Your touch stays on my mind long after you’re gone. 💭✨ You don’t just make my heart race… you make it lose control. 💓⚡ And honestly? I love being completely yours. 🫶❤️🔥😘";
    let isEnvelopeOpen = false;

    envelope?.addEventListener('click', () => {
        if (isEnvelopeOpen) return;
        isEnvelopeOpen = true;

        // Add opening class
        envelope.classList.add('open');

        // Create sparkle burst around wax seal
        if (waxSeal) {
            const rect = waxSeal.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

            const centerX = rect.left + scrollLeft + rect.width / 2;
            const centerY = rect.top + scrollTop + rect.height / 2;

            createEnvelopeSparkles(centerX, centerY);
        }

        // Glow effect on envelope
        gsap.to(envelope, {
            filter: 'drop-shadow(0 0 30px rgba(224, 74, 94, 0.4))',
            duration: 0.5,
            ease: "power2.out"
        });

        // Type letter after animation settles
        setTimeout(() => {
            if (letterContent) {
                typeWriterLetter(letterText, letterContent);
            }
        }, 1000);
    });

    function typeWriterLetter(text, element) {
        if (!element) return;

        let i = 0;
        element.innerHTML = "";

        function type() {
            if (i < text.length) {
                if (text.charAt(i) === '\n') {
                    element.innerHTML += '<br>';
                } else {
                    element.innerHTML += text.charAt(i);
                }
                i++;
                setTimeout(type, 40);
            }
        }
        type();
    }

    function createEnvelopeSparkles(x, y) {
        const sparkles = ['✨', '💕', '🌟', '💖', '⭐'];

        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
            sparkle.style.position = 'absolute';
            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.fontSize = (Math.random() * 1.2 + 0.8) + 'rem';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '9999';

            document.body.appendChild(sparkle);

            const angle = (Math.PI * 2 * i) / 20;
            const distance = 60 + Math.random() * 80;

            gsap.to(sparkle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance - 30,
                opacity: 0,
                scale: 0,
                rotation: Math.random() * 360,
                duration: 1.5 + Math.random() * 0.8,
                ease: "power2.out",
                onComplete: () => sparkle.remove()
            });
        }
    }

    function typeWriter(text, element) {
        if (!element) return;

        let i = 0;
        element.innerHTML = "";

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
                i++;
                setTimeout(type, 50);
            }
        }
        type();
    }

    // 6. SCROLL TRIGGER ANIMATIONS
    const sections = gsap.utils.toArray('section');
    sections.forEach((section, index) => {
        if (index === 0) return; // Skip hero section

        gsap.from(section.children, {
            scrollTrigger: {
                trigger: section,
                start: "top 75%",
                toggleActions: "play none none reverse"
            },
            y: 60,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out"
        });
    });

    // ==========================================
    // PETAL BURST SYSTEM
    // ==========================================
    function createPetalBurst(x, y) {
        const petalCount = 60;
        const colors = ['#e04a5e', '#ff758c', '#ff9a9e', '#fecfef', '#ffc3a0'];

        const petalPaths = [
            "M25,0 C10,0 0,15 0,35 C0,65 25,100 25,100 C25,100 50,65 50,35 C50,15 40,0 25,0 Z",
            "M25,0 C5,0 0,40 25,100 C50,40 45,0 25,0 Z",
            "M25,100 C5,70 0,30 15,10 C20,5 30,5 35,10 C50,30 45,70 25,100 Z",
            "M25,5 C15,5 8,20 8,40 C8,70 25,95 25,95 C25,95 42,70 42,40 C42,20 35,5 25,5 Z"
        ];

        for (let i = 0; i < petalCount; i++) {
            const el = document.createElement('div');
            el.classList.add('petal-burst');

            const size = Math.random() * 18 + 22;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const path = petalPaths[Math.floor(Math.random() * petalPaths.length)];

            el.innerHTML = `
                <svg viewBox="0 0 50 100" width="${size}" height="${size}" style="fill:${color}; overflow:visible;">
                    <defs>
                        <filter id="glow-${i}">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <path d="${path}" style="filter: url(#glow-${i}) drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />
                </svg>
            `;

            el.style.position = 'absolute';
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.zIndex = '9999';
            el.style.width = size + 'px';
            el.style.height = size + 'px';
            el.style.transformOrigin = 'center center';
            el.style.pointerEvents = 'none';

            gsap.set(el, {
                rotation: Math.random() * 360,
                xPercent: -50,
                yPercent: -50
            });

            document.body.appendChild(el);

            // Physics
            const angle = Math.random() * Math.PI * 2;
            const velocity = 120 + Math.random() * 280;
            const drift = (Math.random() - 0.5) * 100;

            gsap.to(el, {
                x: Math.cos(angle) * velocity + drift,
                y: Math.sin(angle) * velocity + (Math.random() * 350) + 50,
                rotation: Math.random() * 900,
                rotationX: Math.random() * 360,
                rotationY: Math.random() * 360,
                opacity: 0,
                scale: Math.random() * 0.3 + 0.3,
                duration: 2.5 + Math.random() * 1.8,
                ease: "power2.out",
                onComplete: () => el.remove()
            });
        }
    }

    // ==========================================
    // MUSIC CONTROL
    // ==========================================
    const musicBtn = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    let musicPlaying = false;

    musicBtn?.addEventListener('click', () => {
        if (musicPlaying) {
            audio.pause();
            musicBtn.innerHTML = '<i class="fas fa-music"></i>';
            gsap.to(musicBtn, { scale: 1, duration: 0.3 });
        } else {
            audio.play().catch(e => console.log('Audio play failed:', e));
            musicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            gsap.to(musicBtn, { scale: 1.1, duration: 0.3 });
        }
        musicPlaying = !musicPlaying;
    });

    // ==========================================
    // VOICE NOTE PLAYER
    // ==========================================
    const voiceBtn = document.getElementById('play-pause-btn');
    const voiceAudio = document.getElementById('main-audio');
    const waveform = document.getElementById('waveform');
    let voicePlaying = false;

    voiceBtn?.addEventListener('click', () => {
        if (voicePlaying) {
            voiceAudio.pause();
            voiceBtn.innerHTML = '<i class="fas fa-play"></i>';
            waveform?.classList.remove('playing');
        } else {
            // Pause background music if playing
            if (musicPlaying && audio) {
                audio.pause();
                musicBtn.innerHTML = '<i class="fas fa-music"></i>';
                gsap.to(musicBtn, { scale: 1, duration: 0.3 });
                musicPlaying = false; // Synchronize state
            }

            voiceAudio.play().catch(e => console.log('Voice play failed:', e));
            voiceBtn.innerHTML = '<i class="fas fa-pause"></i>';
            waveform?.classList.add('playing');
        }
        voicePlaying = !voicePlaying;
    });

    voiceAudio?.addEventListener('ended', () => {
        voicePlaying = false;
        voiceBtn.innerHTML = '<i class="fas fa-play"></i>';
        waveform?.classList.remove('playing');

        // Resume background music
        if (audio) {
            audio.play().catch(e => console.log('Resume bg music failed:', e));
            if (musicBtn) {
                musicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                gsap.to(musicBtn, { scale: 1.1, duration: 0.3 });
            }
            musicPlaying = true;
        }
    });

    // ==========================================
    // SMOOTH SCROLL
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==========================================
    // PRELOAD OPTIMIZATION & START LOGIC
    // ==========================================
    // Auto-play background music on first user interaction
    let hasInteracted = false;
    const overlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');

    const startExperience = () => {
        if (!hasInteracted && audio) {
            // Visual feedback
            if (startBtn) startBtn.style.transform = 'scale(0.9)';

            setTimeout(() => {
                // Play Audio
                audio.volume = 1.0;
                audio.play().catch(e => {
                    console.error("Audio play blocked", e);
                    alert("⚠️ Audio Playback Failed: " + e.message + "\n\nPlease click the speaker icon in the top right corner manually.");
                });
                musicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                musicPlaying = true;
                hasInteracted = true;

                // Hide Overlay
                if (overlay) {
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.classList.add('hidden'), 800);
                }

                // Initial Animations (Hero)
                const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
                heroTl.from(".char", {
                    y: 100,
                    opacity: 0,
                    stagger: 0.04,
                    duration: 0.8,
                    ease: "back.out(1.5)"
                }, "+=0.2")
                    .to("#hero-subtitle", {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                    }, "-=0.3");
            }, 200);
        }
    };

    if (startBtn) {
        startBtn.addEventListener('click', startExperience);
    }

    // Fallback if popup fails? No, force user to click.
    // Removed automatic document.click to ensure intentional start.

    // ==========================================
    // 8. BUBU WRITES BACK (INTERACTIVE)
    // ==========================================
    const messageInputState = document.getElementById('message-input-state');
    const messageDisplayState = document.getElementById('message-display-state');
    const bubuMessageInput = document.getElementById('bubu-message');
    const sendRoseBtn = document.getElementById('send-rose-btn');
    const charCountSpan = document.getElementById('char-count');
    const savedMessageText = document.getElementById('saved-message-text');
    const msgTimestamp = document.getElementById('msg-timestamp');

    // --- EMAILJS CONFIGURATION ---
    // Initialize EmailJS with Public Key
    (function () {
        emailjs.init("QEXjVGLuKtsIIVcj1");
    })();

    // Load saved message
    const savedMsg = localStorage.getItem('roseday_bubu_message');
    const savedTime = localStorage.getItem('roseday_msg_time');

    if (savedMsg) {
        showSavedMessage(savedMsg, savedTime);
    }

    // Character Counter
    bubuMessageInput?.addEventListener('input', (e) => {
        const len = e.target.value.length;
        if (charCountSpan) charCountSpan.innerText = len;

        if (len > 0) {
            sendRoseBtn.removeAttribute('disabled');
        } else {
            sendRoseBtn.setAttribute('disabled', 'true');
        }
    });

    // Submit Handler
    sendRoseBtn?.addEventListener('click', () => {
        const msg = bubuMessageInput.value.trim();
        if (!msg) return;

        // Visual Loading State
        const originalBtnText = sendRoseBtn.innerHTML;
        sendRoseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Rose...';
        sendRoseBtn.disabled = true;

        // Save
        const now = new Date();
        const timeStr = now.toLocaleDateString() + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Send Email via EmailJS
        if (typeof emailjs === 'undefined') {
            alert("Error: EmailJS script failed to load. Please check your internet connection or ad blocker.");
            sendRoseBtn.innerHTML = originalBtnText;
            sendRoseBtn.disabled = false;
            return;
        }

        emailjs.send("service_o93istz", "template_xwuol7s", {
            message: msg, // Common default variable name
            bubu_message: msg, // Custom one I used
            time_sent: timeStr,
            to_name: "My Love",
            reply_to: "bubu@love.com"
        }).then(
            function (response) {
                console.log("SUCCESS!", response.status, response.text);

                // Store Locally
                localStorage.setItem('roseday_bubu_message', msg);
                localStorage.setItem('roseday_msg_time', timeStr);

                // UI Transition
                gsap.to(messageInputState, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.5,
                    onComplete: () => {
                        showSavedMessage(msg, timeStr);
                    }
                });

                // Heart Burst
                if (typeof createPetalBurst === 'function') {
                    createPetalBurst(window.innerWidth / 2, window.innerHeight / 2);
                }
            },
            function (error) {
                console.error("FAILED...", error);
                // Alert the specific error to help debugging
                alert("Email failed to send.\nError: " + JSON.stringify(error));
                sendRoseBtn.innerHTML = originalBtnText;
                sendRoseBtn.disabled = false;
            }
        );
    });

    function showSavedMessage(msg, time) {
        if (messageInputState) messageInputState.classList.add('hidden');
        if (messageDisplayState) {
            messageDisplayState.classList.remove('hidden');
            if (savedMessageText) savedMessageText.innerText = msg;
            if (msgTimestamp) msgTimestamp.innerText = time;

            gsap.from(messageDisplayState, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: "power2.out"
            });
        }
    }

    // ==========================================
    // 9. CINEMATIC FINALE ANIMATION
    // ==========================================
    const finaleText = document.querySelector('.finale-main-text');

    gsap.to(finaleText, {
        scrollTrigger: {
            trigger: "#finale",
            start: "top 60%",
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 2,
        ease: "power2.out"
    });

    // Pre-set finale text state for animation
    if (finaleText) {
        gsap.set(finaleText, { opacity: 0, y: 30 });
    }


    // ==========================================
    // 7.5 SECRET COMPLIMENTS
    // ==========================================
    const complimentBtn = document.getElementById('compliment-btn');
    const complimentText = document.getElementById('compliment-text');

    const compliments = [
        "You are my favorite notification.",
        "Even roses feel shy next to you.",
        "My day feels incomplete without you.",
        "You are illegally cute.",
        "If smiles had a queen, it would be you.",
        "You make ordinary moments feel magical.",
        "I hope you know how special you are.",
        "You’re the reason this page exists.",
        "My heart has a favorite person. It’s you.",
        "Every rose today is jealous of you."
    ];

    let clickCount = 0;
    let lastIndex = -1;

    complimentBtn?.addEventListener('click', () => {
        // Create floating hearts
        const rect = complimentBtn.getBoundingClientRect();
        createFloatingHearts(rect.left + rect.width / 2, rect.top);

        clickCount++;

        // Special Finale Message
        if (clickCount === 6) {
            animateComplimentChange("Okay… I officially ran out of roses 🌹");
            complimentBtn.style.opacity = '0.5';
            complimentBtn.style.cursor = 'default';
            return;
        }

        if (clickCount > 6) return;

        // Random Compliment Logic
        let index;
        do {
            index = Math.floor(Math.random() * compliments.length);
        } while (index === lastIndex);

        lastIndex = index;
        animateComplimentChange(compliments[index]);
    });

    function animateComplimentChange(text) {
        if (!complimentText) return;

        // If hidden, just show
        if (complimentText.classList.contains('hidden')) {
            complimentText.innerText = text;
            complimentText.classList.remove('hidden');
            gsap.fromTo(complimentText,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
            );
        } else {
            // Out then In
            gsap.to(complimentText, {
                opacity: 0,
                y: -20,
                duration: 0.4,
                onComplete: () => {
                    complimentText.innerText = text;
                    gsap.fromTo(complimentText,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
                    );
                }
            });
        }
    }

    function createFloatingHearts(x, y) {
        const hearts = ['❤️', '💖', '🌸', '✨'];

        for (let i = 0; i < 8; i++) {
            const el = document.createElement('div');
            el.classList.add('floating-heart');
            el.innerText = hearts[Math.floor(Math.random() * hearts.length)];
            document.body.appendChild(el);

            const xOffset = (Math.random() - 0.5) * 150;

            gsap.fromTo(el,
                {
                    left: x + xOffset,
                    top: y,
                    opacity: 0,
                    scale: 0
                },
                {
                    top: y - 150 - Math.random() * 100,
                    opacity: 1,
                    scale: 1,
                    duration: 1.5 + Math.random(),
                    ease: "power2.out",
                    onComplete: () => {
                        gsap.to(el, { opacity: 0, duration: 0.5, onComplete: () => el.remove() });
                    }
                }
            );
        }
    }

});