const HUG_AUDIO_SRC = 'assets/heartbeat.mp3'; // Placeholder
const BG_MUSIC_SRC = 'assets/bg-music.mp3'; // Placeholder

document.addEventListener('DOMContentLoaded', () => {
    // --- Audio Setup (Howler.js) ---
    const heartbeatSound = new Howl({
        src: [HUG_AUDIO_SRC],
        volume: 0.5,
        loop: true
    });

    const bgMusic = new Howl({
        src: [BG_MUSIC_SRC],
        volume: 0.15,
        loop: true,
        autoplay: false // Wait for user interaction
    });

    let isMuted = false;
    const musicToggleBtn = document.getElementById('music-toggle');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');

    // --- Loading Screen / Mobile Audio Unlock ---
    startBtn.addEventListener('click', () => {
        // Unlock Audio Context
        if (Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
        bgMusic.play();

        // Hide Screen
        gsap.to(startScreen, {
            opacity: 0, duration: 1, onComplete: () => {
                startScreen.style.display = 'none';
                // Show Music Toggle
                musicToggleBtn.classList.remove('hidden');
            }
        });
    });

    musicToggleBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            Howler.mute(true);
            musicToggleBtn.innerText = '🔇';
        } else {
            Howler.mute(false);
            if (!bgMusic.playing()) bgMusic.play();
            musicToggleBtn.innerText = '🎵';
        }
    });

    // --- Hero Section Animations ---
    const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });

    heroTl.to("#hero-title", { opacity: 1, y: 0, duration: 1.5, delay: 0.5 })
        .to("#hero-subtitle", { opacity: 1, y: 0, duration: 1.2 }, "-=0.5")
        .to("#scroll-btn", { opacity: 1, y: 0, duration: 1 }, "-=0.5");

    // --- Scroll to Hug Section ---
    document.getElementById('scroll-btn').addEventListener('click', () => {
        document.getElementById('hug-section').scrollIntoView({ behavior: 'smooth' });
        // Reveal Hug Section
        gsap.to("#hug-section", { opacity: 1, duration: 1, display: "flex", delay: 0.5 });
    });

    // --- Virtual Hug Interaction ---
    // --- Virtual Hug Interaction ---
    const hugBtn = document.getElementById('hug-btn');
    const hugOverlay = document.getElementById('hug-overlay');
    const hugMessage = document.getElementById('hug-message');
    const armsContainer = document.getElementById('arms-container');
    const hugVideoContainer = document.getElementById('hug-video-container');
    const hugVideo = document.getElementById('hug-video');

    hugBtn.addEventListener('click', () => {
        // Hide Arms, Show Video
        gsap.to(armsContainer, {
            opacity: 0, duration: 0.5, onComplete: () => {
                armsContainer.classList.add('hidden');
                hugVideoContainer.classList.remove('hidden');
                gsap.from(hugVideoContainer, { opacity: 0, scale: 0.8, duration: 0.8 });
                hugVideo.play();
            }
        });

        // Visuals (Button)
        gsap.to(hugBtn, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        gsap.to(hugOverlay, { opacity: 1, duration: 0.5, yoyo: true, repeat: 1 });

        // Audio & Haptics
        if (!isMuted) {
            bgMusic.fade(0.15, 0.05, 500); // Duck bg music
            heartbeatSound.play();
            setTimeout(() => {
                heartbeatSound.fade(0.5, 0, 1000);
                setTimeout(() => heartbeatSound.stop(), 1000);
                bgMusic.fade(0.05, 0.15, 1000); // Restore bg music
            }, 5000); // Extended for video duration/loop feel
        }

        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

        // Message & Particles
        setTimeout(() => {
            gsap.to(hugMessage, { opacity: 1, y: 0, duration: 1 });
            createMicroParticles(hugBtn);
        }, 1000);
    });

    function createMicroParticles(element) {
        // Simple particle burst effect around the button
        const rect = element.getBoundingClientRect();
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.classList.add('burst-particle', 'bg-red-500', 'w-2', 'h-2', 'rounded-full', 'absolute');
            document.body.appendChild(p);

            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            gsap.set(p, { x: x, y: y, opacity: 1 });
            gsap.to(p, {
                x: x + (Math.random() - 0.5) * 200,
                y: y + (Math.random() - 0.5) * 200,
                opacity: 0,
                duration: 1 + Math.random(),
                onComplete: () => p.remove()
            });
        }
    }

    // --- Long Press Feature ---
    const holdBtn = document.getElementById('hold-btn');
    const holdProgress = document.getElementById('hold-progress'); // SVG Circle
    const holdStatus = document.getElementById('hold-status');
    let holdTimer;
    let holdDuration = 5000; // 5 seconds
    let startTime;
    let isHolding = false;

    // SVG Circumference for r=90 is approx 565
    const circumference = 565;
    gsap.set(holdProgress, { strokeDashoffset: circumference }); // Ensure hidden initially

    const startHold = (e) => {
        e.preventDefault();
        isHolding = true;
        startTime = Date.now();
        holdBtn.classList.add('scale-95');

        // Start Sound increase
        if (!isMuted) {
            heartbeatSound.play();
            heartbeatSound.fade(0, 0.8, holdDuration);
        }

        // Animate SVG Ring
        gsap.to(holdProgress, {
            strokeDashoffset: 0,
            duration: holdDuration / 1000,
            ease: "linear"
        });

        holdStatus.innerText = "Keep holding...";

        holdTimer = setTimeout(() => {
            completeHold();
        }, holdDuration);
    };

    const endHold = (e) => {
        e.preventDefault();
        if (!isHolding) return;
        isHolding = false;
        holdBtn.classList.remove('scale-95');
        clearTimeout(holdTimer);

        // Stop Sound
        if (!isMuted) {
            heartbeatSound.fade(heartbeatSound.volume(), 0, 500);
            setTimeout(() => { if (!isHolding) heartbeatSound.stop(); }, 500);
        }

        // Reset Animation
        gsap.killTweensOf(holdProgress);
        gsap.to(holdProgress, {
            strokeDashoffset: circumference,
            duration: 0.5,
            ease: "power2.out"
        });

        if (Date.now() - startTime < holdDuration) {
            holdStatus.innerText = "I'm still here.";
            setTimeout(() => {
                if (!isHolding) holdStatus.innerText = "Press & Hold to Feel My Hug";
            }, 2000);
        }
    };

    const completeHold = () => {
        isHolding = false;
        holdStatus.innerText = "See… I never let go. ❤️";

        // Stop Sound smoothly
        if (!isMuted) {
            heartbeatSound.fade(heartbeatSound.volume(), 0, 1000);
            setTimeout(() => heartbeatSound.stop(), 1000);
        }

        gsap.to('body', {
            backgroundColor: '#ffafbd', duration: 1, yoyo: true, repeat: 1, onComplete: () => {
                gsap.to('body', { backgroundColor: '' });
                document.body.style.backgroundColor = '';
            }
        });
        if (!isMuted && navigator.vibrate) navigator.vibrate(500);
    };

    holdBtn.addEventListener('mousedown', startHold);
    holdBtn.addEventListener('touchstart', startHold);
    holdBtn.addEventListener('mouseup', endHold);
    holdBtn.addEventListener('mouseleave', endHold);
    holdBtn.addEventListener('touchend', endHold);


    // --- Promise Section Fade-In ---
    const promiseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                gsap.to("#promise-card", { opacity: 1, y: 0, duration: 1.5 });
                promiseObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    promiseObserver.observe(document.getElementById('promise-section'));


    // --- Custom Message ---
    const customMsgInput = document.getElementById('custom-msg');
    const charCount = document.getElementById('char-count');
    const sendMsgBtn = document.getElementById('send-msg-btn');
    const msgConfirmation = document.getElementById('msg-confirmation');

    // Initialize EmailJS
    (function () {
        emailjs.init("QEXjVGLuKtsIIVcj1");
    })();

    customMsgInput?.addEventListener('input', () => {
        charCount.innerText = `${customMsgInput.value.length}/800`;
    });

    sendMsgBtn?.addEventListener('click', () => {
        const message = customMsgInput.value.trim();
        if (!message) return;

        // Visual Loading State
        const originalBtnText = sendMsgBtn.innerHTML;
        sendMsgBtn.innerHTML = 'Sending... 💌';
        sendMsgBtn.disabled = true;

        // Prepare timestamp
        const now = new Date();
        const timeStr = now.toLocaleDateString() + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Send Email via EmailJS
        if (typeof emailjs === 'undefined') {
            alert("Error: EmailJS script failed to load. Please check your internet connection.");
            sendMsgBtn.innerHTML = originalBtnText;
            sendMsgBtn.disabled = false;
            return;
        }

        emailjs.send("service_o93istz", "template_xwuol7s", {
            message: message,
            bubu_message: message,
            time_sent: timeStr,
            to_name: "My Love",
            reply_to: "bubu@love.com",
            page: "Hug Day"
        }).then(
            function (response) {
                console.log("SUCCESS!", response.status, response.text);

                // Save to LocalStorage
                const messages = JSON.parse(localStorage.getItem('hugDayMessages') || '[]');
                messages.push({
                    text: message,
                    date: new Date().toISOString()
                });
                localStorage.setItem('hugDayMessages', JSON.stringify(messages));

                // Show Confirmation
                gsap.to(msgConfirmation, { opacity: 1, duration: 0.5, pointerEvents: 'auto' });

                // Reset form
                setTimeout(() => {
                    customMsgInput.value = '';
                    charCount.innerText = '0/800';
                    sendMsgBtn.innerHTML = originalBtnText;
                    sendMsgBtn.disabled = false;

                    setTimeout(() => {
                        gsap.to(msgConfirmation, { opacity: 0, duration: 0.5, pointerEvents: 'none' });
                    }, 3000);
                }, 1000);
            },
            function (error) {
                console.error("FAILED...", error);
                alert("Email failed to send.\\nError: " + JSON.stringify(error));
                sendMsgBtn.innerHTML = originalBtnText;
                sendMsgBtn.disabled = false;
            }
        );
    });

    // --- Background Particles ---
    const particleContainer = document.getElementById('particles');
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.classList.add('fixed', 'rounded-full', 'bg-white/30', 'pointer-events-none');
        const size = Math.random() * 10 + 5;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `${Math.random() * 100}vh`;
        p.style.animation = `float ${Math.random() * 5 + 3}s infinite ease-in-out`;
        p.style.opacity = Math.random() * 0.5 + 0.1;
        particleContainer.appendChild(p);
    }
});
