/**
 * Proposal Day - Main Script
 * Refined and optimized
 */

document.addEventListener('DOMContentLoaded', () => {
    // === STATE MANAGEMENT ===
    const state = {
        orbsClicked: new Set(),
        musicPlaying: false,
        accepted: localStorage.getItem('proposeDay_accepted'),
        initialized: false
    };

    // === DOM REFERENCES ===
    const music = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    const overlay = document.getElementById('start-overlay');
    const sections = {
        opening: document.getElementById('s1-opening'),
        orbs: document.getElementById('s2-orbs'),
        memory: document.getElementById('s3-memory'),
        door: document.getElementById('s4-door'),
        proposal: document.getElementById('s5-proposal'),
        resolution: document.getElementById('s7-resolution')
    };

    // === INITIALIZATION CHECK ===
    if (state.accepted) {
        showResolution(true);
        return;
    }

    // === AUDIO SYSTEM ===
    function toggleMusic() {
        if (music.paused) {
            music.play()
                .then(() => {
                    sessionStorage.setItem('musicPlaying', 'true');
                    musicBtn.style.opacity = '1';
                    musicBtn.setAttribute('aria-label', 'Pause Music');
                    state.musicPlaying = true;
                })
                .catch(err => {
                    console.error('Audio playback failed:', err);
                    musicBtn.style.display = 'none';
                });
        } else {
            music.pause();
            sessionStorage.setItem('musicPlaying', 'false');
            musicBtn.style.opacity = '0.5';
            musicBtn.setAttribute('aria-label', 'Play Music');
            state.musicPlaying = false;
        }
    }

    musicBtn?.addEventListener('click', toggleMusic);

    // Audio error handling
    music?.addEventListener('error', (e) => {
        console.error('Audio loading failed:', e);
        state.musicPlaying = false;
        musicBtn.style.display = 'none';
    });

    music?.addEventListener('loadeddata', () => {
        console.log('Audio ready to play');
    });

    // === UNIFIED INITIALIZATION ===
    function initialize() {
        if (state.initialized) return;
        state.initialized = true;

        overlay.classList.add('hidden');

        music.volume = 0.8;
        music.play()
            .then(() => {
                sessionStorage.setItem('musicPlaying', 'true');
                musicBtn.style.opacity = '1';
                state.musicPlaying = true;
            })
            .catch(err => {
                console.log('Autoplay blocked:', err);
                musicBtn.style.opacity = '1';
            });

        startOpeningSequence();
    }

    // Auto-start if music was previously playing
    if (sessionStorage.getItem('musicPlaying') === 'true') {
        initialize();
    }

    // Manual start via popup button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startBtn.style.transform = 'scale(0.9)';
            setTimeout(initialize, 200);
        });
    } else {
        overlay?.addEventListener('click', initialize);
    }

    // === TRANSITIONS HELPER ===
    function currentScene() {
        return document.querySelector('.scene.active');
    }

    function switchScene(nextSceneId, callback) {
        const current = currentScene();
        if (!current) return;

        gsap.to(current, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                current.classList.remove('active');
                const next = document.getElementById(nextSceneId);
                if (!next) return;

                next.classList.add('active');
                gsap.fromTo(next,
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration: 1,
                        onComplete: callback
                    }
                );
            }
        });
    }

    // === SECTION 1: OPENING SEQUENCE ===
    function startOpeningSequence() {
        setTimeout(() => {
            const tl = gsap.timeline();

            if (gsap.plugins?.text) {
                gsap.registerPlugin(gsap.plugins.text);
            }

            tl.to('#intro-text', {
                text: {
                    value: "If I had to choose...",
                    delimiter: ""
                },
                duration: 2,
                ease: "power1.inOut"
            })
                .to({}, { duration: 2 })
                .to('#intro-text', { opacity: 0, duration: 1 })
                .call(() => {
                    const introText = document.getElementById('intro-text');
                    if (introText) introText.textContent = "...I would choose you.";
                })
                .to('#intro-text', { opacity: 1, duration: 1 })
                .to({}, { duration: 2 })
                .call(() => switchScene('s2-orbs', setupOrbInteractions));
        }, 500);
    }

    // === SECTION 2: ORBS INTERACTION ===
    const messages = {
        comfort: "You are the place I feel safe.",
        chaos: "Even when life is messy, I want it messy with you.",
        forever: "Time feels different when I imagine it with you."
    };

    function setupOrbInteractions() {
        const orbs = document.querySelectorAll('.orb');
        if (!orbs.length || orbs[0].dataset.initialized) return;

        orbs.forEach(orb => {
            orb.dataset.initialized = 'true';
            orb.setAttribute('tabindex', '0');
            orb.setAttribute('role', 'button');
            const type = orb.dataset.type;
            orb.setAttribute('aria-label', `Explore ${type}`);

            const handleInteraction = () => {
                if (state.orbsClicked.has(type)) return;

                const modal = document.getElementById('orb-message-modal');
                const text = document.getElementById('orb-text');
                if (!modal || !text) return;

                text.textContent = messages[type];
                modal.classList.remove('hidden');

                gsap.fromTo(modal,
                    { scale: 0.8, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.5 }
                );

                state.orbsClicked.add(type);
            };

            orb.addEventListener('click', handleInteraction);
            orb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInteraction();
                }
            });
        });
    }

    const closeOrbBtn = document.getElementById('close-orb');
    closeOrbBtn?.addEventListener('click', () => {
        const modal = document.getElementById('orb-message-modal');
        if (!modal) return;

        gsap.to(modal, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            onComplete: () => {
                modal.classList.add('hidden');
                checkOrbsComplete();
            }
        });
    });

    closeOrbBtn?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeOrbBtn.click();
        }
    });

    function checkOrbsComplete() {
        if (state.orbsClicked.size === 3) {
            setTimeout(() => {
                switchScene('s3-memory', () => {
                    setTimeout(initMemorySequence, 500);
                });
            }, 1000);
        }
    }

    // === SECTION 3: MEMORY SEQUENCE ===
    function initMemorySequence() {
        const tl = gsap.timeline();

        tl.to('.section-title', { opacity: 1, duration: 1.5 })
            .fromTo('.polaroid',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.3, duration: 1 }
            )
            .to({}, { duration: 1 })
            .to('#memory-text-1', { opacity: 1, duration: 1.5 })
            .to({}, { duration: 1 })
            .to('#memory-text-2', { opacity: 1, duration: 1.5 })
            .to({}, { duration: 2 })
            .call(() => switchScene('s4-door', setupDoorInteraction));
    }

    // === SECTION 4: DOOR TRANSITION ===
    function setupDoorInteraction() {
        const door = document.querySelector('.door-container');
        if (!door) return;

        door.setAttribute('tabindex', '0');
        door.setAttribute('role', 'button');
        door.setAttribute('aria-label', 'Open the door to continue');

        const handleDoorClick = () => {
            door.removeEventListener('click', handleDoorClick);
            door.removeEventListener('keydown', handleDoorKeydown);

            gsap.to(door, {
                scale: 30,
                opacity: 0,
                duration: 2,
                ease: "power2.in"
            });

            gsap.to('body', {
                background: 'radial-gradient(circle at center, #1a0b1c, #000)',
                duration: 2
            });

            setTimeout(() => switchScene('s5-proposal', initProposalSequence), 1500);
        };

        const handleDoorKeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDoorClick();
            }
        };

        door.addEventListener('click', handleDoorClick);
        door.addEventListener('keydown', handleDoorKeydown);
    }

    // === SECTION 5: PROPOSAL SEQUENCE ===
    function initProposalSequence() {
        setTimeout(() => {
            const tl = gsap.timeline();
            tl.to('.prop-text.p-t-1', { opacity: 1, duration: 2 })
                .to({}, { duration: 1 })
                .to('.prop-text.p-t-2', { opacity: 1, duration: 2 })
                .to({}, { duration: 1 })
                .to('.prop-text.p-t-3', { opacity: 1, duration: 2 })
                .to({}, { duration: 0.5 })
                .to('#answer-buttons', {
                    opacity: 1,
                    pointerEvents: 'auto',
                    duration: 1
                });
        }, 1000);
    }

    // === BUTTON INTERACTIONS ===
    const btnChoose = document.getElementById('btn-choose-us');
    const btnThink = document.getElementById('btn-think');
    const thinkContainer = document.getElementById('think-container');

    // Make Me Think
    btnThink?.addEventListener('click', () => {
        gsap.to('#answer-buttons', {
            opacity: 0,
            pointerEvents: 'none',
            duration: 0.5
        });
        gsap.to('.spline-wrapper', {
            scale: 0.8,
            opacity: 0.5,
            duration: 1
        });

        if (thinkContainer) {
            thinkContainer.classList.remove('hidden');
            gsap.fromTo(thinkContainer,
                { opacity: 0 },
                { opacity: 1, duration: 1 }
            );
        }

        setTimeout(() => {
            if (thinkContainer) {
                gsap.to(thinkContainer, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => thinkContainer.classList.add('hidden')
                });
            }
            gsap.to('.spline-wrapper', {
                scale: 1,
                opacity: 1,
                duration: 1
            });
            gsap.to('#answer-buttons', {
                opacity: 1,
                pointerEvents: 'auto',
                duration: 1
            });
        }, 4000);
    });

    // Choose Us (YES)
    btnChoose?.addEventListener('click', () => {
        const now = new Date();
        localStorage.setItem('proposeDay_accepted', now.toISOString());

        gsap.to('#answer-buttons, .prop-text', {
            opacity: 0,
            duration: 1
        });
        gsap.to('body', {
            background: 'radial-gradient(circle at center, #541c1c, #000)',
            duration: 2
        });

        createBurst();
        setTimeout(() => showResolution(false), 2000);
    });

    function createBurst() {
        const burstContainer = document.createElement('div');
        burstContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9999;
        `;
        burstContainer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(burstContainer);

        for (let i = 0; i < 20; i++) {
            const heart = document.createElement('div');
            heart.textContent = '❤️';
            heart.style.cssText = `
                position: absolute;
                font-size: 2rem;
                opacity: 0;
            `;
            burstContainer.appendChild(heart);

            const angle = (Math.PI * 2 * i) / 20;
            const distance = 100 + Math.random() * 100;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            gsap.to(heart, {
                x, y,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });

            gsap.to(heart, {
                opacity: 0,
                duration: 0.5,
                delay: 0.5,
                onComplete: () => heart.remove()
            });
        }

        setTimeout(() => burstContainer.remove(), 2000);
    }

    // === FINAL RESOLUTION ===
    function showResolution(isImmediate) {
        if (isImmediate) {
            document.querySelectorAll('.scene').forEach(el => el.classList.remove('active'));
            sections.resolution?.classList.add('active', 'relative-flow');
            document.body.style.background = 'radial-gradient(circle at center, #541c1c, #000)';
            if (overlay) overlay.style.display = 'none';

            const sectionsToShow = [
                's8-photobooth',
                's9-anniversary',
                's10-timeline',
                's11-voice-message',
                's12-response'
            ];

            sectionsToShow.forEach(id => {
                document.getElementById(id)?.classList.remove('hidden-section');
            });

            document.querySelector('.site-footer')?.classList.remove('hidden-section');
            document.body.classList.add('scroll-active');
            document.body.style.overflowY = 'auto';
        } else {
            switchScene('s7-resolution', () => {
                sections.resolution?.classList.add('relative-flow');
            });
        }

        const acceptedDate = new Date(localStorage.getItem('proposeDay_accepted'));
        const dateStr = acceptedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const dateDisplay = document.getElementById('date-display');
        if (dateDisplay) {
            dateDisplay.textContent = `Chosen on ${dateStr} 💍`;
        }

        const tl = gsap.timeline({ delay: isImmediate ? 0.5 : 0 });
        tl.to('.res-line', {
            opacity: 1,
            duration: 1.5,
            stagger: 1
        })
            .to('.res-title', {
                opacity: 1,
                duration: 2,
                scale: 1.1,
                ease: "back.out(1.2)"
            })
            .to('.heart.h1', {
                opacity: 1,
                x: -20,
                duration: 1
            })
            .to('.heart.h2', {
                opacity: 1,
                x: 20,
                duration: 1
            }, "<")
            .to('.heart', {
                x: 0,
                duration: 2,
                ease: "elastic.out(1, 0.3)"
            })
            .call(() => {
                if (!isImmediate) {
                    const sectionsToShow = [
                        's8-photobooth',
                        's9-anniversary',
                        's10-timeline',
                        's11-voice-message',
                        's12-response'
                    ];

                    sectionsToShow.forEach(id => {
                        document.getElementById(id)?.classList.remove('hidden-section');
                    });

                    document.querySelector('.site-footer')?.classList.remove('hidden-section');
                    document.body.classList.add('scroll-active');
                    document.body.style.overflowY = 'auto';
                }

                const scrollHint = document.getElementById('scroll-hint');
                if (scrollHint && !isImmediate) {
                    scrollHint.classList.remove('hidden-hint');
                    scrollHint.classList.add('active');
                }

                setupScrollObserver();
                initAnniversaryCounter();
                initTimeline();
                initVoiceMessage();
                initResponseSection();
            });

        if (isImmediate) {
            setTimeout(() => {
                initAnniversaryCounter();
                initTimeline();
                initVoiceMessage();
                initResponseSection();
                setupScrollObserver();
            }, 500);
        }
    }

    // === SCROLL OBSERVER ===
    function setupScrollObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');

                    const bgMap = {
                        's8-photobooth': 'radial-gradient(circle at center, #2d1b2e, #1a0b1c)',
                        's9-anniversary': 'radial-gradient(circle at center, #4a2c3a, #2a1b2a)',
                        's11-voice-message': 'linear-gradient(to bottom, #2d1b2e, #1a0b1c)',
                        's12-response': 'linear-gradient(to bottom, #4a2c3a, #e0c3fc)'
                    };

                    if (bgMap[entry.target.id]) {
                        document.body.style.background = bgMap[entry.target.id];
                    }

                    if (entry.target.id === 's8-photobooth') {
                        const scrollHint = document.getElementById('scroll-hint');
                        if (scrollHint) scrollHint.style.opacity = '0';
                    }
                }
            });
        }, observerOptions);

        const sectionsToObserve = [
            's8-photobooth',
            's9-anniversary',
            's10-timeline',
            's11-voice-message',
            's12-response',
            '.site-footer'
        ];

        sectionsToObserve.forEach(selector => {
            const element = document.querySelector(selector) || document.getElementById(selector);
            if (element) observer.observe(element);
        });

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const line = document.querySelector('.timeline-line');
                    if (line) line.style.height = '100%';
                }
            });
        }, { threshold: 0.2 });

        const timelineSec = document.getElementById('s10-timeline');
        if (timelineSec) timelineObserver.observe(timelineSec);
    }

    // === VOICE MESSAGE ===
    function initVoiceMessage() {
        const audio = document.getElementById('custom-voice-msg');
        const playBtn = document.getElementById('voice-play-btn');
        const progressBar = document.getElementById('voice-progress-bar');
        const progressContainer = document.querySelector('.progress-container');
        const timeDisplay = document.getElementById('voice-time');
        const endMsg = document.getElementById('voice-end-msg');
        const container = document.querySelector('.voice-container');
        const bgMusic = document.getElementById('bg-music');

        if (!audio || !playBtn) return;

        // Prevent duplicate initialization
        if (playBtn.dataset.initialized === 'true') return;
        playBtn.dataset.initialized = 'true';

        // Track if background music was playing before voice message
        let bgMusicWasPlaying = false;

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                // Starting voice message
                audio.play()
                    .then(() => {
                        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        container?.classList.add('playing');

                        // Pause background music if it's playing
                        if (bgMusic && !bgMusic.paused) {
                            bgMusicWasPlaying = true;
                            gsap.to(bgMusic, {
                                volume: 0,
                                duration: 0.5,
                                onComplete: () => bgMusic.pause()
                            });
                        }
                    })
                    .catch(err => {
                        console.error('Voice message playback failed:', err);
                        playBtn.innerHTML = '<i class="fas fa-play"></i>';
                        container?.classList.remove('playing');
                    });
            } else {
                // Pausing voice message
                audio.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                container?.classList.remove('playing');

                // Resume background music if it was playing
                if (bgMusic && bgMusicWasPlaying) {
                    bgMusic.volume = 0;
                    bgMusic.play()
                        .catch(err => console.error('Background music resume failed:', err));
                    gsap.to(bgMusic, { volume: 0.8, duration: 1 });
                }
            }
        });

        audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            if (progressBar) progressBar.style.width = `${progress}%`;

            const mins = Math.floor(audio.currentTime / 60);
            const secs = Math.floor(audio.currentTime % 60);
            if (timeDisplay) {
                timeDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }
        });

        audio.addEventListener('ended', () => {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            container?.classList.remove('playing');

            // Show end message
            if (endMsg) {
                endMsg.classList.add('show');
                endMsg.classList.remove('hidden');
            }

            // Resume background music if it was playing
            if (bgMusic && bgMusicWasPlaying) {
                bgMusic.volume = 0;
                bgMusic.play();
                gsap.to(bgMusic, { volume: 0.8, duration: 1.5 });
                bgMusicWasPlaying = false;
            }
        });

        progressContainer?.addEventListener('click', (e) => {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        });
    }

    // === RESPONSE SECTION ===
    function initResponseSection() {
        const form = document.getElementById('response-form');
        const textarea = document.getElementById('bubu-message');
        const charCount = document.getElementById('char-count');
        const savedView = document.getElementById('response-saved');
        const savedTextDisplay = document.querySelector('.saved-text-display');
        const dateDisplay = document.getElementById('response-timestamp');

        // Prevent duplicate initialization
        if (form && form.dataset.initialized === 'true') return;
        if (form) form.dataset.initialized = 'true';

        // Initialize EmailJS with Public Key
        if (typeof emailjs !== 'undefined') {
            emailjs.init("QEXjVGLuKtsIIVcj1");
        }

        const savedData = localStorage.getItem('proposeDayResponse');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                showSavedState(data.text, data.date);
            } catch (e) {
                console.error("Error parsing saved response", e);
            }
        }

        textarea?.addEventListener('input', () => {
            const len = textarea.value.length;
            if (charCount) charCount.textContent = len;
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = textarea?.value.trim();

            if (!text) return;

            // Get submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (!submitBtn) return;

            // Visual Loading State
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            const now = new Date();
            const timeStr = now.toLocaleDateString() + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Send Email via EmailJS
            if (typeof emailjs === 'undefined') {
                alert("Error: EmailJS script failed to load. Please check your internet connection.");
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            emailjs.send("service_o93istz", "template_xwuol7s", {
                message: text,
                bubu_message: text,
                time_sent: timeStr,
                to_name: "My Love",
                reply_to: "bubu@proposeday.com"
            }).then(
                function (response) {
                    console.log("SUCCESS!", response.status, response.text);

                    // Store data
                    const data = {
                        text: text,
                        date: now.toISOString()
                    };

                    localStorage.setItem('proposeDayResponse', JSON.stringify(data));

                    // UI Transition
                    gsap.to(form, {
                        opacity: 0,
                        scale: 0.9,
                        duration: 0.5,
                        onComplete: () => showSavedState(text, data.date)
                    });

                    // Heart Burst if available
                    if (typeof createBurst === 'function') {
                        createBurst();
                    }
                },
                function (error) {
                    console.error("FAILED...", error);
                    alert("Email failed to send.\nError: " + JSON.stringify(error));
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            );
        });

        function showSavedState(text, dateStr) {
            if (form) form.classList.add('hidden');
            if (savedView) {
                savedView.classList.remove('hidden');
                if (savedTextDisplay) savedTextDisplay.textContent = `"${text}"`;

                const dateObj = new Date(dateStr);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                if (dateDisplay) dateDisplay.textContent = `Written on ${formattedDate} 💍`;

                gsap.fromTo(savedView,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.2)" }
                );
            }
        }
    }

    // === ANNIVERSARY COUNTER ===
    function initAnniversaryCounter() {
        const startDate = new Date('2026-01-26T00:00:00');

        function updateCounter() {
            const now = new Date();
            const diff = now - startDate;

            if (diff < 0) return;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const els = {
                days: document.getElementById('days'),
                hours: document.getElementById('hours'),
                minutes: document.getElementById('minutes'),
                seconds: document.getElementById('seconds'),
                totalDays: document.getElementById('total-days-count'),
                context: document.getElementById('total-days-context')
            };

            if (els.days) els.days.textContent = days;
            if (els.hours) els.hours.textContent = hours;
            if (els.minutes) els.minutes.textContent = minutes;
            if (els.seconds) els.seconds.textContent = seconds;
            if (els.totalDays) els.totalDays.textContent = days;
            if (els.context) els.context.classList.add('visible');
        }

        setInterval(updateCounter, 1000);
        updateCounter();
    }

    // === TIMELINE INTERACTION ===
    function initTimeline() {
        const nodes = document.querySelectorAll('.timeline-node');

        // Check if already initialized
        if (nodes.length > 0 && nodes[0].dataset.timelineInitialized === 'true') {
            return;
        }

        nodes.forEach(node => {
            // Mark as initialized
            node.dataset.timelineInitialized = 'true';

            const handleNodeClick = (e) => {
                // Don't toggle if clicking inside the card content
                if (e.target.closest('.node-card')) {
                    return;
                }

                // Close all other nodes
                nodes.forEach(n => {
                    if (n !== node) {
                        n.classList.remove('active');
                        n.setAttribute('aria-expanded', 'false');
                    }
                });

                e.stopPropagation();
                const isActive = node.classList.toggle('active');
                node.setAttribute('aria-expanded', isActive.toString());

                if (window.innerWidth <= 768 && isActive) {
                    setTimeout(() => {
                        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            };

            node.addEventListener('click', handleNodeClick);
            node.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNodeClick(e);
                }
            });
        });

        // Use once: true to prevent duplicate listeners
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.timeline-node')) {
                nodes.forEach(n => {
                    n.classList.remove('active');
                    n.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    // === ERROR HANDLING ===
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });

    const splineViewer = document.querySelector('spline-viewer');
    splineViewer?.addEventListener('error', (e) => {
        console.error('Spline failed to load:', e);
    });
});