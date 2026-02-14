document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const SECRET_PASSWORD = 'love'; // Simple default password
    const REDIRECT_URL = 'feb14-valentinesday/index.html'; // Redirect to Valentine's Day page

    // --- Elements ---
    const passwordInput = document.getElementById('password-input');
    const unlockBtn = document.getElementById('unlock-btn');
    const hintMsg = document.getElementById('hint-msg');
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const particlesContainer = document.getElementById('particles-container');
    const successOverlay = document.getElementById('success-overlay');

    // --- Particle System ---
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart-particle');
        heart.innerHTML = '❤️'; // You can also use SVG or FontAwesome here

        // Randomize position and size
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = (Math.random() * 1 + 0.5) + 'rem';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's';

        particlesContainer.appendChild(heart);

        // Remove after animation
        setTimeout(() => {
            heart.remove();
        }, 10000); // Matches max animation duration
    }

    // Create hearts periodically
    setInterval(createHeart, 500);


    // --- Music Toggle ---
    let isPlaying = false;
    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-music"></i>';
            musicToggle.style.opacity = '0.7';
        } else {
            bgMusic.play();
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            musicToggle.style.opacity = '1';
        }
        isPlaying = !isPlaying;
    });


    // --- Password Logic ---
    function checkPassword() {
        const inputVal = passwordInput.value.trim().toLowerCase();

        if (inputVal === SECRET_PASSWORD) {
            // Success
            passwordInput.blur();
            unlockBtn.innerText = "Unlocked! ❤️";
            hintMsg.innerText = "";

            // Fade out UI, Fade in Heartbeat
            successOverlay.style.opacity = '1';

            // Play success sound logic (optional, sticking to requested features)

            setTimeout(() => {
                window.location.href = REDIRECT_URL;
            }, 2000);

        } else {
            // Error
            passwordInput.classList.add('shake');
            passwordInput.style.borderColor = "#ff4444";
            hintMsg.innerText = "Hmm… try again, my love 😉";
            hintMsg.style.color = "#ff4444";

            setTimeout(() => {
                passwordInput.classList.remove('shake');
                passwordInput.style.borderColor = "rgba(255,255,255,0.2)";
            }, 500);

            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    unlockBtn.addEventListener('click', checkPassword);

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
});
