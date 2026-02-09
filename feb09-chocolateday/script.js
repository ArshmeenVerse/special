document.addEventListener('DOMContentLoaded', () => {
    // === GSAP Animations ===
    gsap.registerPlugin(ScrollTrigger);

    // Fade in sections on scroll
    gsap.utils.toArray('.scene').forEach(section => {
        gsap.fromTo(section,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                scrollTrigger: {
                    trigger: section,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // === Music Popup Logic ===
    const musicPopup = document.getElementById('music-popup');
    const playMusicBtn = document.getElementById('play-music-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    let isMusicPlaying = false;

    // Show popup on page load (it's visible by default in HTML)
    playMusicBtn.addEventListener('click', () => {
        musicPopup.classList.add('hidden');
        bgMusic.play().catch(e => console.log("Audio play blocked", e));
        isMusicPlaying = true;
        musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
    });

    // Music toggle button
    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            bgMusic.play().catch(e => console.log("Audio play blocked", e));
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        isMusicPlaying = !isMusicPlaying;
    });


    // === Section 2: Break Chocolate ===
    const breakable = document.getElementById('crack-chocolate');
    const msgContainer = document.getElementById('hidden-messages');
    let clicks = 0;
    const sweetMessages = [
        "You're sweeter than this! 🍫",
        "Your smile melts me... 🫠",
        "My favorite addiction ❤️",
        "Life tastes better with you ✨",
        "Even dark chocolate isn't as rich as our love!"
    ];

    breakable.addEventListener('click', () => {
        if (clicks < sweetMessages.length) {
            // Animate crack
            breakable.classList.add('cracked');
            setTimeout(() => _breakable.classList.remove('cracked'), 200); // Quick shake/reset mimic

            // Show message
            const msg = document.createElement('p');
            msg.classList.add('sweet-msg', 'fade-in');
            msg.textContent = sweetMessages[clicks];
            msgContainer.appendChild(msg);
            clicks++;

            if (clicks === sweetMessages.length) {
                document.querySelector('.click-hint').textContent = "All sweetness revealed! ❤️";
                breakable.style.cursor = 'default';
            }
        }
    });

    // === Section 3: Sweetness Meter ===
    const slider = document.getElementById('sweetness-slider');
    const emojiDisplay = document.getElementById('meter-emoji');
    const meterText = document.getElementById('meter-text');
    const body = document.body;

    const meterStates = [
        { emoji: '😐', text: 'Not sweet enough...', bg: '#3e2723' },
        { emoji: '😌', text: 'Getting there...', bg: '#4a302a' },
        { emoji: '😘', text: 'Ooh, tasty!', bg: '#563a32' },
        { emoji: '🥰', text: 'Super sweet!', bg: '#6d4c41' },
        { emoji: '🔥', text: 'Sugar Overload! Caution! 🚨', bg: '#795548' }
    ];

    slider.addEventListener('input', (e) => {
        const val = e.target.value - 1;
        const state = meterStates[val];

        emojiDisplay.textContent = state.emoji;
        meterText.textContent = state.text;

        // Subtle background shift
        gsap.to('.bg-gradient', {
            background: `radial-gradient(circle at center, ${state.bg}, #2d1b18)`,
            duration: 1
        });

        emojiDisplay.style.transform = `scale(${1 + val * 0.2})`;
    });

    // === Section 4: Chocolate Box ===
    const box = document.getElementById('choco-box');
    const modal = document.getElementById('choco-message-modal');
    const modalText = document.getElementById('choco-msg-text');
    const closeModal = document.getElementById('close-choco-modal');

    box.addEventListener('click', function (e) {
        // Only open if clicking lid area or box itself, not items if already open (though items are inside)
        // Simple toggle:
        if (!this.classList.contains('open')) {
            this.classList.add('open');
            document.querySelector('.instruction-text').textContent = "Pick a flavor...";
        }
    });

    document.querySelectorAll('.choco-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't trigger box click
            const type = item.dataset.type;
            let msg = "";
            switch (type) {
                case 'milk': msg = "Milk Chocolate: Like your hugs, pure comfort. 🤗"; break;
                case 'dark': msg = "Dark Chocolate: Deep, intense, and mysterious like you. 🌌"; break;
                case 'caramel': msg = "Caramel: Warm, gooey, and golden. ✨"; break;
                case 'white': msg = "White Chocolate: Soft, sweet, and dreamy. ☁️"; break;
            }
            modalText.textContent = msg;
            modal.classList.remove('hidden');
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // === Section 6: Voice Message ===
    const playVoiceBtn = document.getElementById('play-voice-btn');
    const voiceAudio = document.getElementById('voice-msg-audio');
    const progressFill = document.getElementById('audio-progress');
    const timeDisplay = document.querySelector('.time-stamp');
    let isVoicePlaying = false;

    // Pause background music when voice starts playing
    voiceAudio.addEventListener('play', () => {
        if (isMusicPlaying && !bgMusic.paused) {
            bgMusic.pause();
        }
    });

    // Resume background music when voice finishes
    voiceAudio.addEventListener('ended', () => {
        isVoicePlaying = false;
        playVoiceBtn.innerHTML = '<i class="fas fa-play"></i>';
        progressFill.style.width = '0%';
        document.getElementById('voice-subtext').style.color = '#d4af37'; // Highlight subtext

        // Resume background music if it was playing
        if (isMusicPlaying) {
            bgMusic.play().catch(e => console.log("Audio resume failed", e));
        }
    });

    playVoiceBtn.addEventListener('click', () => {
        if (isVoicePlaying) {
            voiceAudio.pause();
            playVoiceBtn.innerHTML = '<i class="fas fa-play"></i>';
            // Resume background music when voice is paused
            if (isMusicPlaying) {
                bgMusic.play().catch(e => console.log("Audio resume failed", e));
            }
        } else {
            voiceAudio.play();
            playVoiceBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isVoicePlaying = !isVoicePlaying;
    });

    voiceAudio.addEventListener('timeupdate', () => {
        const percent = (voiceAudio.currentTime / voiceAudio.duration) * 100;
        progressFill.style.width = `${percent}%`;

        // Format time
        const mins = Math.floor(voiceAudio.currentTime / 60);
        const secs = Math.floor(voiceAudio.currentTime % 60);
        timeDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    });

    // === EmailJS Initialization ===
    // Initialize EmailJS with Public Key (same as Rose Day)
    (function () {
        emailjs.init("QEXjVGLuKtsIIVcj1");
    })();

    // === Section 7: Form Submission ===
    const form = document.getElementById('sweet-message-form');
    const textarea = document.getElementById('bubu-sweet-msg');
    const charCount = document.getElementById('current-count');
    const submitBtn = form?.querySelector('button[type="submit"]');

    // Load saved message if exists
    const savedResponse = localStorage.getItem('chocolateDayResponse');
    if (savedResponse) {
        const data = JSON.parse(savedResponse);
        const successDiv = document.getElementById('submission-success');
        if (successDiv) {
            form.classList.add('hidden');
            successDiv.classList.remove('hidden');
            document.getElementById('submission-date').textContent = `Written on ${data.date}`;
        }
    }

    textarea?.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;

        // Enable/disable submit button based on input
        if (submitBtn) {
            if (textarea.value.trim().length > 0) {
                submitBtn.removeAttribute('disabled');
            } else {
                submitBtn.setAttribute('disabled', 'true');
            }
        }
    });

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = textarea.value.trim();
        if (!message) return;

        // Visual Loading State
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Prepare timestamp
        const now = new Date();
        const timeStr = now.toLocaleDateString() + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Send Email via EmailJS (same service as Rose Day)
        if (typeof emailjs === 'undefined') {
            alert("Error: EmailJS script failed to load. Please check your internet connection or ad blocker.");
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }

        emailjs.send("service_o93istz", "template_xwuol7s", {
            message: message,
            bubu_message: message,
            time_sent: timeStr,
            page: "Chocolate Day",
            to_name: "My Love",
            reply_to: "bubu@love.com"
        }).then(
            function (response) {
                console.log("SUCCESS!", response.status, response.text);

                // Save to LocalStorage
                const submission = {
                    message: message,
                    date: timeStr
                };
                localStorage.setItem('chocolateDayResponse', JSON.stringify(submission));

                // Hide form, show success with animation
                form.classList.add('hidden');
                const successDiv = document.getElementById('submission-success');
                successDiv.classList.remove('hidden');
                successDiv.classList.add('fade-in');
                document.getElementById('submission-date').textContent = `Written on ${timeStr}`;

                // Chocolate burst animation
                if (typeof gsap !== 'undefined') {
                    gsap.from(successDiv, {
                        opacity: 0,
                        y: 20,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                }
            },
            function (error) {
                console.error("FAILED...", error);
                alert("Message failed to send.\nError: " + JSON.stringify(error) + "\n\nYour message has been saved locally though!");

                // Save locally even if email fails
                const submission = {
                    message: message,
                    date: timeStr
                };
                localStorage.setItem('chocolateDayResponse', JSON.stringify(submission));

                // Show success anyway since it's saved locally
                form.classList.add('hidden');
                const successDiv = document.getElementById('submission-success');
                successDiv.classList.remove('hidden');
                successDiv.classList.add('fade-in');
                document.getElementById('submission-date').textContent = `Written on ${timeStr}`;
            }
        );
    });

});

