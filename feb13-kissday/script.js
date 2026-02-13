// Audio Management
const soundManager = {
    bgMusic: new Howl({
        src: ['assets/bg-music.mp3'], // Replace with actual file or use a CDN link
        loop: true,
        volume: 0.15, // 15% volume as requested
        autoplay: false, // Wait for user interaction
        fade: 2000
    }),
    kissSound: new Howl({
        src: ['assets/kiss.mp3'], // Replace with actual file
        volume: 0.5
    }),
    heartbeat: new Howl({
        src: ['assets/heartbeat.mp3'], // Replace with actual file
        volume: 0.3,
        loop: true
    }),
    sparkle: new Howl({
        src: ['assets/sparkle.mp3'], // Optional
        volume: 0.2
    })
};

// Global State
let isMusicPlaying = false;
let hasKissed = false;

// DOM Elements
const loader = document.getElementById('loader');
const musicBtn = document.getElementById('music-btn');
const enterBtn = document.getElementById('enter-btn');
const kissBtnContainer = document.getElementById('kiss-btn-container');
const kissBtn = document.getElementById('kiss-btn');
const postKissMsg = document.getElementById('post-kiss-msg');
const startScreen = document.getElementById('start-screen'); // If interacting from loader

// --- Initialization ---
const playPopup = document.getElementById('play-popup');
const startExpBtn = document.getElementById('start-experience-btn');

// Hide loader immediately and show popup (popup is visible by default in HTML now)
if (loader) {
    loader.style.display = 'none';
}

// Create stars immediately
createStars();

// --- Start Experience Logic ---
if (startExpBtn) {
    startExpBtn.addEventListener('click', () => {
        console.log('Begin Experience clicked');

        // Fade out popup
        if (playPopup) {
            playPopup.style.opacity = '0';
            setTimeout(() => {
                playPopup.style.display = 'none';

                // Now start animations
                initAnimations();

                // Play Music with Howler
                console.log('Attempting to play music...');
                if (soundManager && soundManager.bgMusic) {
                    try {
                        soundManager.bgMusic.volume(0.15);
                        soundManager.bgMusic.play();
                        isMusicPlaying = true;
                        console.log('Music started successfully');

                        if (musicBtn) {
                            musicBtn.classList.remove('opacity-50');
                        }
                    } catch (error) {
                        console.error('Error playing music:', error);
                    }
                }
            }, 1000);
        }
    });
}


// --- Audio Controls ---
if (musicBtn) {
    musicBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            soundManager.bgMusic.pause();
            musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>'; // Muted icon
            musicBtn.classList.add('opacity-50');
        } else {
            soundManager.bgMusic.play();
            musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>';
            musicBtn.classList.remove('opacity-50');
        }
        isMusicPlaying = !isMusicPlaying;
    });
}


// --- Entry Interaction ---
if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        // Start Audio on interaction
        if (!isMusicPlaying) {
            soundManager.bgMusic.play();
            soundManager.bgMusic.fade(0, 0.15, 2000);
            isMusicPlaying = true;
        }

        // Smooth Scroll to next section
        gsap.to(window, { duration: 1.5, scrollTo: "#emotional", ease: "power2.inOut" });

        // Start subtle heartbeat
        soundManager.heartbeat.play();
        soundManager.heartbeat.fade(0, 0.1, 5000); // Fade in heartbeat slowly
    });
}


// --- Animations (GSAP) ---
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Content
    gsap.to("#hero-content", {
        opacity: 1,
        y: 0,
        duration: 2,
        ease: "power3.out",
        delay: 0.5
    });

    // Text Reveal Section
    const texts = gsap.utils.toArray(".reveal-text");
    texts.forEach((text, i) => {
        gsap.fromTo(text,
            { opacity: 0, y: 30, filter: "blur(5px)" },
            {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 1.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 80%",
                    end: "bottom 60%",
                    scrub: false,
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Promise Section ScrollTrigger
    gsap.from("#promise p", {
        opacity: 0,
        scale: 0.95,
        duration: 1.5,
        scrollTrigger: {
            trigger: "#promise",
            start: "top 75%",
        }
    });
}

// --- Kiss Interaction ---
kissBtn.addEventListener('click', () => {
    if (hasKissed) return;
    hasKissed = true;

    // 1. Audio Effects
    soundManager.bgMusic.fade(0.15, 0.05, 500); // Duck music
    soundManager.heartbeat.fade(0.1, 0.4, 500); // Increase heartbeat

    setTimeout(() => {
        soundManager.kissSound.play();
        createParticles(window.innerWidth / 2, window.innerHeight / 2);
    }, 800); // Sync with animation peak

    // 2. Visual Sequence
    const tl = gsap.timeline();

    // Zoom In & Blur Background
    tl.to("body", {
        duration: 1,
        scale: 1.02,
        transformOrigin: "center center",
        ease: "power2.inOut"
    })
        .to("#kiss-btn", {
            scale: 0.9,
            duration: 0.3,
            ease: "power2.in",
            yoyo: true,
            repeat: 1
        }, "<") // Run together
        .to("#kiss-btn-container", {
            opacity: 0,
            duration: 0.5,
            pointerEvents: "none"
        })
        .to("#post-kiss-msg", {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
        })
        .to("#post-kiss-msg h2", {
            scale: 1,
            duration: 1.5,
            ease: "elastic.out(1, 0.5)"
        }, "<")
        .add(() => {
            // Heart Floating Animation loop
            startFloatingHearts();
        })
        .to("#post-kiss-msg", {
            opacity: 0,
            delay: 4, // Show message for 4 seconds
            duration: 1
        })
        .to("body", {
            scale: 1,
            duration: 1
        })
        .to("#playful-text", {
            opacity: 1,
            duration: 1,
            delay: 0.5
        })
        .add(() => {
            // Restore Audio
            soundManager.bgMusic.fade(0.05, 0.15, 2000);
            soundManager.heartbeat.fade(0.4, 0, 2000);
            soundManager.heartbeat.stop();
        });
});

// --- Stars & Particles ---
function createStars() {
    const container = document.getElementById('stars-container');
    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.animationDuration = Math.random() * 3 + 2 + 's';
        star.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(star);
    }
}

function createParticles(x, y) {
    // Burst of particles logic
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('star'); // Reusing star class for simplicity
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = '#E9C46A'; // Gold
        document.body.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;

        gsap.to(particle, {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity,
            opacity: 0,
            duration: 1.5,
            ease: "power2.out",
            onComplete: () => particle.remove()
        });
    }
}

function startFloatingHearts() {
    const container = document.getElementById('floating-hearts');

    // Create a heart every 300ms
    const interval = setInterval(() => {
        if (gsap.getProperty("#post-kiss-msg", "opacity") === 0) {
            clearInterval(interval);
            return;
        }

        const heart = document.createElement('div');
        heart.classList.add('fa-solid', 'fa-heart', 'floating-heart');
        heart.style.left = Math.random() * 80 + 10 + '%'; // Keep somewhat central
        heart.style.top = '100%';
        // Random size
        const size = Math.random() * 1 + 1 + 'rem';
        heart.style.fontSize = size;

        container.appendChild(heart);

        // Remove after animation (handled by CSS, but good to cleanup DOM)
        setTimeout(() => heart.remove(), 4000);
    }, 300);
}

// --- Send Kiss Back Logic ---
const submitKissBtn = document.getElementById('submit-kiss');
const messageInput = document.getElementById('kiss-message');
const charCount = document.getElementById('char-count');
const sealContainer = document.getElementById('seal-container');
const finalMsg = document.getElementById('final-msg');

messageInput.addEventListener('input', () => {
    charCount.textContent = `${messageInput.value.length}/200`;

    // Secret "Forever" Check
    if (messageInput.value.toLowerCase().includes("forever")) {
        triggerSecretAnimation();
    }
});

// --- Secret Animation ---
let secretTriggered = false;
function triggerSecretAnimation() {
    if (secretTriggered) return;
    secretTriggered = true;

    soundManager.sparkle.play();

    gsap.to("#secret-container", {
        opacity: 1,
        duration: 2,
        pointerEvents: "auto"
    });

    // Confetti logic could go here or simple star burst
    const container = document.getElementById('secret-stars');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('i');
        star.classList.add('fa-solid', 'fa-star', 'text-gold', 'absolute');
        star.style.fontSize = Math.random() * 20 + 10 + 'px';
        star.style.left = '50%';
        star.style.top = '50%';
        container.appendChild(star);

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 300 + 100;

        gsap.to(star, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            opacity: 0,
            duration: 3,
            ease: "power2.out"
        });
    }

    setTimeout(() => {
        gsap.to("#secret-container", { opacity: 0, pointerEvents: "none", duration: 1 });
        secretTriggered = false; // Allow re-trigger if they type it again? or keep one-time.
    }, 5000);
}

// --- Voice Player Logic ---
const playPauseBtn = document.getElementById('play-pause-btn');
const mainAudio = document.getElementById('main-audio');
const waveform = document.getElementById('waveform');

if (playPauseBtn && mainAudio) {
    playPauseBtn.addEventListener('click', () => {
        if (mainAudio.paused) {
            mainAudio.play();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            waveform.classList.add('playing');

            // Duck background music if playing
            if (soundManager.bgMusic && isMusicPlaying) {
                soundManager.bgMusic.fade(0.15, 0.05, 500);
            }
        } else {
            mainAudio.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            waveform.classList.remove('playing');

            // Restore background music
            if (soundManager.bgMusic && isMusicPlaying) {
                soundManager.bgMusic.fade(0.05, 0.15, 500);
            }
        }
    });

    mainAudio.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        waveform.classList.remove('playing');

        // Restore background music
        if (soundManager.bgMusic && isMusicPlaying) {
            soundManager.bgMusic.fade(0.05, 0.15, 1000);
        }
    });
}

// --- EmailJS Configuration & Message Sending ---
(function () {
    emailjs.init("QEXjVGLuKtsIIVcj1");
})();

// Character counter
if (messageInput && charCount) {
    messageInput.addEventListener('input', (e) => {
        const len = e.target.value.length;
        charCount.innerText = len;
    });
}

// Submit handler
if (submitKissBtn && messageInput) {
    submitKissBtn.addEventListener('click', () => {
        const msg = messageInput.value.trim();
        if (!msg) {
            alert('Please write something before sealing it! 💋');
            return;
        }

        // Visual loading state
        const originalBtnText = submitKissBtn.innerHTML;
        submitKissBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sealing...';
        submitKissBtn.disabled = true;

        const now = new Date();
        const timeStr = now.toLocaleDateString() + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Send via EmailJS
        if (typeof emailjs === 'undefined') {
            alert("Error: EmailJS script failed to load. Please check your internet connection.");
            submitKissBtn.innerHTML = originalBtnText;
            submitKissBtn.disabled = false;
            return;
        }

        emailjs.send("service_o93istz", "template_xwuol7s", {
            message: msg,
            bubu_message: msg,
            time_sent: timeStr,
            to_name: "My Love",
            reply_to: "bubu@love.com"
        }).then(
            function (response) {
                console.log("SUCCESS!", response.status, response.text);

                // Show seal animation
                if (sealContainer) {
                    sealContainer.style.opacity = '1';
                    sealContainer.style.transform = 'scale(1) rotate(-15deg)';

                    // Replace image with a Heart Icon for "Heart Seal" request
                    sealContainer.innerHTML = '<i class="fa-solid fa-heart text-6xl text-wine drop-shadow-md border-4 border-wine rounded-full p-2 bg-white/20 backdrop-blur-sm"></i>';

                    gsap.from(sealContainer, {
                        scale: 3,
                        opacity: 0,
                        rotation: 0,
                        duration: 1.2,
                        ease: "elastic.out(1, 0.3)"
                    });
                }

                // Show final message
                if (finalMsg) {
                    setTimeout(() => {
                        finalMsg.style.opacity = '1';
                        gsap.from(finalMsg, {
                            y: 20,
                            opacity: 0,
                            duration: 1,
                            ease: "power2.out"
                        });
                    }, 800);
                }

                // Disable form and show success state
                messageInput.disabled = true;
                submitKissBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Sealed with Love';
                submitKissBtn.classList.add('bg-gold', 'text-wine');

                // Big Heart Particle Burst
                if (typeof createParticles === 'function') {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => createParticles(window.innerWidth / 2, window.innerHeight / 2), i * 300);
                    }
                }
            },
            function (error) {
                console.error("FAILED...", error);
                alert("Failed to send your kiss. Please try again.\nError: " + JSON.stringify(error));
                submitKissBtn.innerHTML = originalBtnText;
                submitKissBtn.disabled = false;
            }
        );
    });
}
