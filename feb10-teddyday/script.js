document.addEventListener('DOMContentLoaded', () => {

    // --- References ---
    const teddyNameInput = document.getElementById('teddy-name-input');
    const teddyNameLabels = document.querySelectorAll('#teddy-name-label'); // Can be multiple if used elsewhere
    const renameBtn = document.getElementById('save-name-btn');

    // --- 1. Rename Teddy Feature ---
    function loadTeddyName() {
        const savedName = localStorage.getItem('teddyDayName');
        if (savedName) {
            updateTeddyName(savedName);
            teddyNameInput.value = savedName;
        }
    }

    function updateTeddyName(name) {
        teddyNameLabels.forEach(label => {
            label.textContent = `${name} 🧸`;
            label.classList.add('fade-in'); // simple re-trigger animation
            setTimeout(() => label.classList.remove('fade-in'), 1000);
        });
    }

    renameBtn.addEventListener('click', () => {
        const newName = teddyNameInput.value.trim();
        if (newName) {
            localStorage.setItem('teddyDayName', newName);
            updateTeddyName(newName);
            // Visual feedback
            renameBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => renameBtn.innerHTML = '<i class="fas fa-save"></i>', 2000);
        }
    });

    loadTeddyName();

    // --- 2. Hug Interaction ---
    const hugBtn = document.getElementById('hug-btn');
    const hugMessage = document.getElementById('hug-message');
    const hugAnimation = document.getElementById('hug-animation-result');

    hugBtn.addEventListener('click', () => {
        // Add button animation
        hugBtn.style.transform = 'scale(0.95)';
        setTimeout(() => hugBtn.style.transform = 'scale(1)', 200);

        // Show hug message
        hugMessage.classList.remove('hidden-message');
        hugMessage.classList.add('fade-in');

        // Show bear hug animation after a short delay
        setTimeout(() => {
            hugAnimation.classList.remove('hidden-message');
            hugAnimation.classList.add('fade-in');

            // Start video playback
            const hugVideo = document.getElementById('hug-video');
            if (hugVideo) {
                hugVideo.play().catch(err => console.log('Video autoplay prevented:', err));
            }
        }, 500);

        // Trigger haptic feedback if available
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        // Disable button after first click (optional - remove if you want multiple clicks)
        hugBtn.disabled = true;
        hugBtn.style.opacity = '0.6';
    });


    // --- 3. Comfort Cards ---
    const cards = document.querySelectorAll('.comfort-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Collapse others
            cards.forEach(c => {
                if (c !== card) c.classList.remove('expanded');
            });
            // Toggle current
            card.classList.toggle('expanded');
        });
    });


    // --- 4. Typewriter Effect ---
    const letterText = `Happy Teddy Day, Bubu 🧸\nIf I could, I'd wrap you in the safest hug right now.\nWhenever you feel tired, overwhelmed, or quiet…\njust remember you have me — always.`;
    const letterContainer = document.getElementById('letter-content');
    let charIndex = 0;

    // Use Intersection Observer to start typing when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeWriter();
                observer.disconnect(); // Only run once
            }
        });
    }, { threshold: 0.5 });

    observer.observe(document.getElementById('letter-section'));

    function typeWriter() {
        if (charIndex < letterText.length) {
            const char = letterText.charAt(charIndex);
            letterContainer.innerHTML += char === '\n' ? '<br>' : char;
            charIndex++;
            setTimeout(typeWriter, 50); // Speed
        }
    }

    // --- 5. Bubu Writes Back ---
    const replyInput = document.getElementById('reply-input');
    const sendReplyBtn = document.getElementById('send-reply-btn');
    const savedReplyContainer = document.getElementById('saved-reply-container');
    const savedMsgContent = document.querySelector('.saved-msg-content');
    const savedTime = document.querySelector('.saved-time');
    const charCounter = document.querySelector('.char-counter');

    // Load saved reply
    const savedReply = localStorage.getItem('teddyDayResponse');
    if (savedReply) {
        const data = JSON.parse(savedReply);
        showSavedReply(data.text, data.time);
    }

    replyInput.addEventListener('input', () => {
        const len = replyInput.value.length;
        charCounter.textContent = `${len}/400`;
    });

    sendReplyBtn.addEventListener('click', () => {
        const text = replyInput.value.trim();
        if (text) {
            const now = new Date();
            const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

            const data = { text: text, time: timeString };
            localStorage.setItem('teddyDayResponse', JSON.stringify(data));

            showSavedReply(text, timeString);
        }
    });

    function showSavedReply(text, time) {
        document.querySelector('.reply-card').style.display = 'none'; // Hide input
        savedReplyContainer.classList.remove('hidden');
        savedReplyContainer.classList.add('fade-in');
        savedMsgContent.innerText = text; // innerText to preserve line breaks
        savedTime.textContent = time;
    }


    // --- 6. Voice Message Player ---
    const voiceAudio = document.getElementById('voice-msg');
    const playBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('audio-progress');
    const voiceEndMsg = document.getElementById('voice-end-msg');
    let isPlaying = false;

    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            voiceAudio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            voiceAudio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            // Ambient effect
            document.body.style.backgroundColor = '#FAD4C0'; // Warm peach dim
            setTimeout(() => document.body.style.backgroundColor = '', voiceAudio.duration * 1000); // Reset after play (simple version)
        }
        isPlaying = !isPlaying;
    });

    voiceAudio.addEventListener('timeupdate', () => {
        if (voiceAudio.duration) {
            const percent = (voiceAudio.currentTime / voiceAudio.duration) * 100;
            progressBar.style.width = `${percent}%`;
        }
    });

    voiceAudio.addEventListener('ended', () => {
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        progressBar.style.width = '0%';

        // Show end message
        voiceEndMsg.classList.remove('hidden-message');
        voiceEndMsg.classList.add('fade-in');

        // Reset background if needed
        document.body.style.backgroundColor = '';
    });


    // --- 7. Scroll Reveal Animation ---
    const observerOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.fade-in-scroll');
    scrollElements.forEach(el => scrollObserver.observe(el));


    // --- 8. Background Particles ---
    function createParticles() {
        const container = document.getElementById('particles-container');
        const particleCount = 15; // Number of particles

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // Heart shape particles
            particle.innerHTML = '❤️';
            particle.style.fontSize = `${Math.random() * 20 + 10}px`;
            particle.style.position = 'absolute';
            particle.style.opacity = '0.3';
            particle.style.background = 'transparent'; // Remove circle bg
            particle.style.filter = 'blur(1px)';

            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;

            // Random animation duration and delay
            const duration = Math.random() * 10 + 10; // 10s to 20s
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `-${Math.random() * 10}s`; // Start immediately at random times

            container.appendChild(particle);
        }
    }

    createParticles();

});
