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

    // === Music Logic ===
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    let isMusicPlaying = false;

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

    playVoiceBtn.addEventListener('click', () => {
        if (isVoicePlaying) {
            voiceAudio.pause();
            playVoiceBtn.innerHTML = '<i class="fas fa-play"></i>';
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

    voiceAudio.addEventListener('ended', () => {
        isVoicePlaying = false;
        playVoiceBtn.innerHTML = '<i class="fas fa-play"></i>';
        progressFill.style.width = '0%';
        document.getElementById('voice-subtext').style.color = '#d4af37'; // Highlight subtext
    });

    // === Section 7: Form Submission ===
    const form = document.getElementById('sweet-message-form');
    const textarea = document.getElementById('bubu-sweet-msg');
    const charCount = document.getElementById('current-count');

    textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = textarea.value.trim();
        if (!message) return;

        // Save to LocalStorage
        const submission = {
            message: message,
            date: new Date().toLocaleString()
        };
        localStorage.setItem('chocolateDayResponse', JSON.stringify(submission));

        // Hide form, show success
        form.classList.add('hidden');
        const successDiv = document.getElementById('submission-success');
        successDiv.classList.remove('hidden');
        successDiv.classList.add('fade-in');
        document.getElementById('submission-date').textContent = `Written on ${submission.date}`;

        // Optional: EmailJS integration
        if (typeof emailjs !== 'undefined') {
            // Placeholder: Assuming config exists or will be added
            // emailjs.send("service_id", "template_id", { message: message })...
            console.log("Message saved locally. EmailJS would trigger here.");
        }
    });

});
