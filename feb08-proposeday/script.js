document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        orbsClicked: new Set(),
        musicPlaying: false,
        accepted: localStorage.getItem('proposeDay_accepted'),
        initialized: false
    };

    // --- References ---
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

    // --- Init: Check for Acceptance ---
    if (state.accepted) {
        showResolution(true);
        return;
    }

    // --- Audio System ---
    function toggleMusic() {
        if (music.paused) {
            music.play().then(() => {
                sessionStorage.setItem('musicPlaying', 'true');
                musicBtn.style.opacity = '1';
                musicBtn.setAttribute('aria-label', 'Pause Music');
                state.musicPlaying = true;
            }).catch(e => {
                console.error('Audio playback failed:', e);
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

    musicBtn.addEventListener('click', toggleMusic);

    // --- Audio Error Handling ---
    music.addEventListener('error', (e) => {
        console.error('Audio loading failed:', e);
        state.musicPlaying = false;
        musicBtn.style.display = 'none';
    });

    music.addEventListener('loadeddata', () => {
        console.log('Audio ready to play');
    });

    // --- Unified Initialization ---
    function initialize() {
        if (state.initialized) return;
        state.initialized = true;

        // Hide overlay
        overlay.classList.add('hidden');

        // Start music with fade-in
        // Start music immediately
        music.volume = 0.8;
        music.play().then(() => {
            sessionStorage.setItem('musicPlaying', 'true');
            musicBtn.style.opacity = '1';
            state.musicPlaying = true;
        }).catch(e => {
            console.log('Autoplay blocked or audio failed:', e);
            // Fallback: Ensure button is visible for manual play
            musicBtn.style.opacity = '1';
        });

        // Start the experience
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
            // Visual feedback before transition
            startBtn.style.transform = 'scale(0.9)';
            setTimeout(initialize, 200);
        });
    } else {
        // Fallback
        overlay.addEventListener('click', initialize);
    }

    // --- Transitions Helper ---
    function currentScene() {
        return document.querySelector('.scene.active');
    }

    function switchScene(nextSceneId, callback) {
        const current = currentScene();
        gsap.to(current, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                current.classList.remove('active');
                const next = document.getElementById(nextSceneId);
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

    // --- SECTION 1: OPENING SEQUENCE ---
    function startOpeningSequence() {
        setTimeout(() => {
            const tl = gsap.timeline();

            // Register TextPlugin
            if (gsap.plugins && gsap.plugins.text) {
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
                    document.getElementById('intro-text').textContent = "...I would choose you.";
                })
                .to('#intro-text', { opacity: 1, duration: 1 })
                .to({}, { duration: 2 })
                .call(() => switchScene('s2-orbs', setupOrbInteractions));
        }, 500);
    }

    // --- SECTION 2: ORBS INTERACTION ---
    const messages = {
        comfort: "You are the place I feel safe.",
        chaos: "Even when life is messy, I want it messy with you.",
        forever: "Time feels different when I imagine it with you."
    };

    function setupOrbInteractions() {
        if (document.querySelector('.orb').dataset.initialized) return;

        document.querySelectorAll('.orb').forEach(orb => {
            orb.dataset.initialized = 'true';

            orb.setAttribute('tabindex', '0');
            orb.setAttribute('role', 'button');
            const type = orb.dataset.type;
            orb.setAttribute('aria-label', `Explore ${type}`);

            const handleInteraction = () => {
                if (state.orbsClicked.has(type)) return;

                const modal = document.getElementById('orb-message-modal');
                const text = document.getElementById('orb-text');
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

    document.getElementById('close-orb').addEventListener('click', () => {
        const modal = document.getElementById('orb-message-modal');
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

    document.getElementById('close-orb').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('close-orb').click();
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

    // --- SECTION 3: MEMORY SEQUENCE ---
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
            .call(() => {
                switchScene('s4-door', setupDoorInteraction);
            });
    }

    // --- SECTION 4: DOOR TRANSITION ---
    function setupDoorInteraction() {
        const door = document.querySelector('.door-container');

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

            setTimeout(() => {
                switchScene('s5-proposal', initProposalSequence);
            }, 1500);
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

    // --- SECTION 5: PROPOSAL SEQUENCE ---
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

    // --- BUTTON INTERACTIONS ---
    const btnChoose = document.getElementById('btn-choose-us');
    const btnThink = document.getElementById('btn-think');
    const thinkContainer = document.getElementById('think-container');

    // Make Me Think
    btnThink.addEventListener('click', () => {
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

        thinkContainer.classList.remove('hidden');
        gsap.fromTo(thinkContainer,
            { opacity: 0 },
            { opacity: 1, duration: 1 }
        );

        setTimeout(() => {
            gsap.to(thinkContainer, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => thinkContainer.classList.add('hidden')
            });
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
    btnChoose.addEventListener('click', () => {
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

        setTimeout(() => {
            showResolution(false);
        }, 2000);
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
                x: x,
                y: y,
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

    // --- FINAL RESOLUTION ---
    function showResolution(isImmediate) {
        if (isImmediate) {
            document.querySelectorAll('.scene').forEach(el => el.classList.remove('active'));
            sections.resolution.classList.add('active');
            sections.resolution.classList.add('relative-flow');

            document.body.style.background = 'radial-gradient(circle at center, #541c1c, #000)';
            overlay.style.display = 'none';

            // Immediately show all scroll sections
            const boothSection = document.getElementById('s8-photobooth');
            const anniversarySec = document.getElementById('s9-anniversary');
            const timelineSec = document.getElementById('s10-timeline');

            if (boothSection) boothSection.classList.remove('hidden-section');
            if (anniversarySec) anniversarySec.classList.remove('hidden-section');
            if (timelineSec) timelineSec.classList.remove('hidden-section');

            document.body.classList.add('scroll-active');
            document.body.style.overflowY = 'auto';
        } else {
            switchScene('s7-resolution', () => {
                sections.resolution.classList.add('relative-flow');
            });
        }

        const acceptedDate = new Date(localStorage.getItem('proposeDay_accepted'));
        const dateStr = acceptedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('date-display').textContent = `Chosen on ${dateStr} 💍`;

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
                const boothSection = document.getElementById('s8-photobooth');
                const anniversarySec = document.getElementById('s9-anniversary');
                const timelineSec = document.getElementById('s10-timeline');
                const footerSec = document.querySelector('.site-footer');
                const scrollHint = document.getElementById('scroll-hint');

                // For immediate load, sections are already unhidden above
                // For first-time, unhide them now
                if (!isImmediate) {
                    boothSection.classList.remove('hidden-section');
                    anniversarySec.classList.remove('hidden-section');
                    timelineSec.classList.remove('hidden-section');
                    if (footerSec) footerSec.classList.remove('hidden-section');

                    document.body.classList.add('scroll-active');
                    document.body.style.overflowY = 'auto';
                }

                if (scrollHint && !isImmediate) {
                    scrollHint.classList.remove('hidden-hint');
                    scrollHint.classList.add('active');
                }

                // --- SCROLL OBSERVER LOGIC ---
                function setupScrollObserver() {
                    const observerOptions = {
                        root: null,
                        rootMargin: '0px',
                        threshold: 0.1 // Trigger when 10% visible
                    };

                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('active');

                                // Handle specific background changes based on section visibility
                                if (entry.target.id === 's8-photobooth') {
                                    if (scrollHint) scrollHint.style.opacity = 0;
                                    document.body.style.background = 'radial-gradient(circle at center, #2d1b2e, #1a0b1c)';
                                }
                                if (entry.target.id === 's9-anniversary') {
                                    document.body.style.background = 'radial-gradient(circle at center, #4a2c3a, #2a1b2a)';
                                }
                            }
                        });
                    }, observerOptions);

                    // Observe sections
                    if (boothSection) observer.observe(boothSection);
                    if (anniversarySec) observer.observe(anniversarySec);
                    if (timelineSec) observer.observe(timelineSec);
                    if (footerSec) observer.observe(footerSec);

                    // Specific observer for timeline line animation
                    const timelineObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const line = document.querySelector('.timeline-line');
                                if (line) line.style.height = '100%';
                            }
                        });
                    }, { threshold: 0.2 });

                    if (timelineSec) timelineObserver.observe(timelineSec);
                }

                // Initialize Observer
                setupScrollObserver();

                // Initialize sections
                initAnniversaryCounter();
                initTimeline();
            });

        // If this is immediate load, also setup scroll and initialize now
        if (isImmediate) {
            setTimeout(() => {
                initAnniversaryCounter();
                initTimeline();

                // Setup Observer for immediate load
                const boothSection = document.getElementById('s8-photobooth');
                const anniversarySec = document.getElementById('s9-anniversary');
                const timelineSec = document.getElementById('s10-timeline');
                const footerSec = document.querySelector('.site-footer');
                const scrollHint = document.getElementById('scroll-hint'); // Define here for scope closure if needed

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

                                if (entry.target.id === 's8-photobooth') {
                                    // Ensure scroll hint is hidden if it exists
                                    const hint = document.getElementById('scroll-hint');
                                    if (hint) hint.style.opacity = 0;
                                    document.body.style.background = 'radial-gradient(circle at center, #2d1b2e, #1a0b1c)';
                                }
                                if (entry.target.id === 's9-anniversary') {
                                    document.body.style.background = 'radial-gradient(circle at center, #4a2c3a, #2a1b2a)';
                                }
                            }
                        });
                    }, observerOptions);

                    if (boothSection) observer.observe(boothSection);
                    if (anniversarySec) observer.observe(anniversarySec);
                    if (timelineSec) observer.observe(timelineSec);
                    if (footerSec) observer.observe(footerSec);

                    const timelineObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const line = document.querySelector('.timeline-line');
                                if (line) line.style.height = '100%';
                            }
                        });
                    }, { threshold: 0.2 });

                    if (timelineSec) timelineObserver.observe(timelineSec);
                }

                setupScrollObserver();

            }, 500);
        }
    }

    // --- ANNIVERSARY COUNTER LOGIC ---
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

            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours;
            document.getElementById('minutes').textContent = minutes;
            document.getElementById('seconds').textContent = seconds;

            const contextEl = document.getElementById('total-days-context');
            const countSpan = document.getElementById('total-days-count');

            if (countSpan) countSpan.textContent = days;
            if (contextEl) contextEl.classList.add('visible');
        }

        setInterval(updateCounter, 1000);
        updateCounter();
    }

    // --- TIMELINE INTERACTION ---
    function initTimeline() {
        const nodes = document.querySelectorAll('.timeline-node');

        nodes.forEach(node => {
            const handleNodeClick = (e) => {
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

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.timeline-node')) {
                nodes.forEach(n => {
                    n.classList.remove('active');
                    n.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });

    const splineViewer = document.querySelector('spline-viewer');
    if (splineViewer) {
        splineViewer.addEventListener('error', (e) => {
            console.error('Spline failed to load:', e);
        });
    }
});