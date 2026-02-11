// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// --- Audio Setup (Native HTML5) ---
const bgMusic = document.getElementById('bg-music');
let isMusicPlaying = false;
const musicBtn = document.getElementById('music-btn');

// Music Popup Logic
const musicPopup = document.getElementById('music-popup');
const startMusicBtn = document.getElementById('start-music-btn');

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');

    // Initial setup with hardcoded name
    const msgName = "Bubu";
    document.getElementById('hero-title').innerHTML = `Khamma Ghani ${msgName} Sa… ❤️`;
    updatePromiseText(msgName);

    // Hide loader initially and show music popup immediately
    loader.style.display = 'none';
    musicPopup.classList.remove('hidden');
    gsap.to(musicPopup, { opacity: 1, duration: 0.5 });
});

// Start Music Button Handler
startMusicBtn.addEventListener('click', () => {
    const loader = document.getElementById('loader');

    // Hide popup immediately
    gsap.to(musicPopup, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            musicPopup.style.display = 'none';
        }
    });

    // Show loader and start loading
    loader.style.display = 'flex';
    loader.style.opacity = '1';

    // Start music
    bgMusic.volume = 0.3;
    bgMusic.play().catch(e => console.log('Audio play failed:', e));
    isMusicPlaying = true;
    musicBtn.classList.add('animate-spin-slow');
    musicBtn.innerHTML = '<i class="fas fa-music"></i>';

    // Simulate loading then hide loader and start animations
    gsap.to(loader, {
        opacity: 0,
        duration: 1.5,
        delay: 1.5, // Show "Preparing Your Kingdom" for 1.5 seconds
        onComplete: () => {
            loader.style.display = 'none';
            // Start hero animations after loading completes
            playHeroAnimations();
        }
    });
});

// Music Toggle Button
musicBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicBtn.classList.remove('animate-spin-slow');
        musicBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        bgMusic.play();
        musicBtn.classList.add('animate-spin-slow');
        musicBtn.innerHTML = '<i class="fas fa-music"></i>';
    }
    isMusicPlaying = !isMusicPlaying;
});

// --- Page Load Animation & Name Personalization ---
let msgName = "Bubu"; // Hardcoded for Bubu ❤️

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');

    // Initial setup with hardcoded name
    document.getElementById('hero-title').innerHTML = `Khamma Ghani ${msgName} Sa… ❤️`;
    updatePromiseText(msgName);

    gsap.to(loader, {
        opacity: 0,
        duration: 1.5,
        delay: 1,
        onComplete: () => {
            loader.style.display = 'none';
            playHeroAnimations();
        }
    });
});

/* 
// Removed manual name entry logic as requested
document.getElementById('enter-palace-btn').addEventListener('click', () => {
   // ...
}); 
*/

// --- Hero Section Animations ---
function playHeroAnimations() {
    const tl = gsap.timeline();

    tl.to('#hero-title', { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' })
        .to('#hero-subtitle', { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, '-=1')
        .to('#start-journey-btn', { opacity: 1, y: 0, duration: 1, ease: 'back.out(1.7)' }, '-=0.5');

    // Create floating petals
    createPetals();
}

function createPetals() {
    const container = document.getElementById('petals-container');
    const petalCount = 20;

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.animationDuration = `${Math.random() * 5 + 5}s`;
        petal.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(petal);
    }
}

// Scroll to Promise Section
document.getElementById('start-journey-btn').addEventListener('click', () => {
    // Attempt to start music if not already playing (user interaction requirement)
    if (!isMusicPlaying) {
        backgroundMusic.play();
        isMusicPlaying = true;
        musicBtn.classList.add('animate-spin-slow');
        musicBtn.innerHTML = '<i class="fas fa-music"></i>';
    }
    document.getElementById('promise').scrollIntoView({ behavior: 'smooth' });
});

// --- Promise Section (Wax Seal & Typewriter) ---
const waxSeal = document.getElementById('wax-seal');
const waxSealContainer = document.getElementById('wax-seal-container');
const parchment = document.getElementById('parchment');
const typewriterText = document.getElementById('typewriter-text');
const signature = document.getElementById('signature');

let promiseContent = "";

function updatePromiseText(name) {
    promiseContent = `My Dearest ${name} ❤️,

Today, I want to make a promise to you from the deepest part of my heart.

I promise that I will always love you.
Not just in easy days, but in difficult ones too.

I promise that I will always stand by your side.
I will support you, respect you, and protect your dreams.

I promise that I will always try to be a better man for you.
I am not perfect today… but one day, I will become the man you truly deserve.
And until that day comes, I will keep improving myself, every single day.

I promise to work hard for our future.
For our dreams.
For our happiness.

I know that tough times will come in the future. Life is not always easy.
But when those times come, we will face them together — not separately.
No matter what happens, we will not let difficulties break us apart.

I promise that no other girl will ever come between us.
For me, it is only you. Always you.

There is only one fear in my heart —
What if we do not reach a good position in life?
What if we are not successful enough to make our parents proud and happy?

That fear became stronger the day I started loving you.
Because now, my dreams are not just mine — they are ours.

That is why I promise to study hard, work hard, and build a strong future.
Because without a good position in life, it becomes very difficult to convince our parents and make everyone happy.

So today, I promise you —
I will do something great in my life.
I will become capable.
I will become responsible.

And I ask you to promise me the same —
That you will also work hard.
That you will also focus on your studies.
That we will grow together, not fall behind.

We will make our parents proud.
We will make our dreams real.
And one day, we will look back at this moment and smile.

Forever yours,
❤️`;
}

waxSeal.addEventListener('click', () => {
    // Break seal animation
    gsap.to(waxSeal, { scale: 1.5, opacity: 0, duration: 0.5 });
    gsap.to(waxSealContainer, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            waxSealContainer.style.display = 'none';
            revealParchment();
        }
    });
});

function revealParchment() {
    gsap.to(parchment, {
        opacity: 1,
        rotateX: 0,
        duration: 1.5,
        ease: 'power2.out',
        onComplete: startTypewriter
    });
}

function startTypewriter() {
    let i = 0;
    const speed = 50; // typing speed

    function type() {
        if (i < promiseContent.length) {
            if (promiseContent.charAt(i) === '\n') {
                typewriterText.innerHTML += '<br>';
            } else {
                typewriterText.innerHTML += promiseContent.charAt(i);
            }
            i++;
            setTimeout(type, speed);
        } else {
            // Show signature after typing done
            gsap.to(signature, { opacity: 1, duration: 2, delay: 1 });
        }
    }
    type();
}

// --- Voice Message Section ---
const playVoiceBtn = document.getElementById('play-voice-btn');
const visualizerBars = document.getElementById('visualizer-bars');
let visualizerInterval;

// Create visualizer bars dynamically
for (let i = 0; i < 20; i++) {
    const bar = document.createElement('div');
    bar.className = 'w-2 bg-antiqueGold rounded-t-sm transition-all duration-100';
    bar.style.height = '10px';
    visualizerBars.appendChild(bar);
}

// Note: Voice audio element should be added to HTML with id="voice-audio"
// For now, using placeholder. User should add their voice file.
let isVoicePlaying = false;

playVoiceBtn.addEventListener('click', () => {
    // Create audio element if it doesn't exist (placeholder for now)
    let voiceAudio = document.getElementById('voice-audio');
    if (!voiceAudio) {
        voiceAudio = document.createElement('audio');
        voiceAudio.id = 'voice-audio';
        voiceAudio.src = 'voice-message.mp3'; // Placeholder - user needs to add their voice file
        document.body.appendChild(voiceAudio);

        // When voice ends, restore background music volume
        voiceAudio.addEventListener('ended', () => {
            stopVisualizer();
            // Smoothly restore background music volume
            if (bgMusic && isMusicPlaying) {
                gsap.to(bgMusic, { volume: 0.3, duration: 1 });
            }
            isVoicePlaying = false;
            playVoiceBtn.innerHTML = '<i class="fas fa-play text-5xl text-royalMaroon ml-2"></i>';
        });
    }

    if (isVoicePlaying) {
        voiceAudio.pause();
        stopVisualizer();
        // Restore background music volume
        if (bgMusic && isMusicPlaying) {
            gsap.to(bgMusic, { volume: 0.3, duration: 1 });
        }
        playVoiceBtn.innerHTML = '<i class="fas fa-play text-5xl text-royalMaroon ml-2"></i>';
        isVoicePlaying = false;
    } else {
        // Lower background music volume
        if (bgMusic && isMusicPlaying) {
            gsap.to(bgMusic, { volume: 0.05, duration: 1 });
        }
        voiceAudio.play().catch(e => console.log('Voice play failed:', e));
        startVisualizer();
        playVoiceBtn.innerHTML = '<i class="fas fa-pause text-5xl text-royalMaroon"></i>';
        isVoicePlaying = true;
    }
});

function startVisualizer() {
    visualizerBars.style.opacity = 1;
    const bars = visualizerBars.children;
    visualizerInterval = setInterval(() => {
        for (let bar of bars) {
            const h = Math.random() * 40 + 10;
            bar.style.height = `${h}px`;
        }
    }, 100);

    // Pulse animation for button/rings
    gsap.to('#pulse-1', { scale: 1.2, duration: 0.5, yoyo: true, repeat: -1 });
    gsap.to('#pulse-2', { scale: 1.4, duration: 0.5, delay: 0.1, yoyo: true, repeat: -1 });
    gsap.to('#pulse-3', { scale: 1.6, duration: 0.5, delay: 0.2, yoyo: true, repeat: -1 });
}

function stopVisualizer() {
    visualizerBars.style.opacity = 0;
    clearInterval(visualizerInterval);
    gsap.killTweensOf(['#pulse-1', '#pulse-2', '#pulse-3']);
    gsap.to(['#pulse-1', '#pulse-2', '#pulse-3'], { scale: 1, duration: 0.5 }); // Reset rings
}

// --- Reply Section ---
const replyForm = document.getElementById('love-letter-form');
const messageArea = document.getElementById('message-area');
const charCount = document.getElementById('char-count');
const pigeonContainer = document.getElementById('pigeon-container');
const successMsg = document.getElementById('success-msg');

// --- EMAILJS CONFIGURATION ---
// Initialize EmailJS with Public Key
(function () {
    emailjs.init("QEXjVGLuKtsIIVcj1");
})();

messageArea.addEventListener('input', () => {
    charCount.textContent = messageArea.value.length;
});

replyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageArea.value.trim();

    if (message) {
        // Visual Loading State
        const submitBtn = replyForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Prepare timestamp
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
            message: message,
            bubu_message: message,
            time_sent: timeStr,
            to_name: "My Love",
            reply_to: "bubu@love.com"
        }).then(
            function (response) {
                console.log("SUCCESS!", response.status, response.text);

                // Store in localStorage
                localStorage.setItem('promiseday_message', message);
                localStorage.setItem('promiseday_msg_time', timeStr);
                console.log('Message saved:', message);

                // Animate Pigeon
                pigeonContainer.classList.remove('hidden');

                // Hide form contents smoothly
                gsap.to(replyForm, {
                    opacity: 0, duration: 1, onComplete: () => {
                        replyForm.style.display = 'none';
                        successMsg.classList.remove('hidden');
                        gsap.fromTo(successMsg, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 });
                    }
                });
            },
            function (error) {
                console.error("FAILED...", error);
                alert("Email failed to send.\\nError: " + JSON.stringify(error));
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        );
    }
});

// --- Final Proposal Section ---
const yesBtn = document.getElementById('yes-btn');
const thinkBtn = document.getElementById('think-btn');
const thinkModal = document.getElementById('think-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

yesBtn.addEventListener('click', () => {
    // Fireworks Effect
    startFireworks();

    // UI Changes
    gsap.to('body', { backgroundColor: '#C8A951', duration: 2 }); // Turn background golden (concept)
    yesBtn.innerHTML = 'Ab se hum, sirf hum ❤️';
    thinkBtn.style.display = 'none';

    // Confetti
    launchConfetti();
});

thinkBtn.addEventListener('click', () => {
    thinkModal.classList.remove('hidden');
    // Force reflow for transition
    void thinkModal.offsetWidth;
    thinkModal.classList.remove('opacity-0');
});

closeModalBtn.addEventListener('click', () => {
    thinkModal.classList.add('opacity-0');
    setTimeout(() => {
        thinkModal.classList.add('hidden');
    }, 300);
});

// --- Fireworks & Confetti Helpers ---
function startFireworks() {
    // Simple canvas fireworks implementation or use a library if available.
    // For this vanilla implementation, we'll try to use a simple particle burst on the button.

    // Since we don't have a fireworks library loaded, we can simulate with DOM elements or simple canvas.
    // Let's use a simple DOM-based confetti/firework burst for "Yes".

    const colors = ['#FF0000', '#FFD700', '#FFFFFF', '#00FF00', '#0000FF'];
    const container = document.getElementById('fireworks-container');

    for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.classList.add('absolute', 'w-2', 'h-2', 'rounded-full');
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = '50%';
        particle.style.top = '50%';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 200 + 50;

        gsap.to(particle, {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity,
            opacity: 0,
            duration: Math.random() * 2 + 1,
            ease: 'power3.out',
            onComplete: () => particle.remove()
        });

        container.appendChild(particle);
    }
}

function launchConfetti() {
    // Basic confetti rain
    const container = document.getElementById('fireworks-container');
    const colors = ['#C8A951', '#7B1E3A', '#FFFFFF'];

    for (let i = 0; i < 200; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = -10 + 'px';
        container.appendChild(confetti);

        gsap.to(confetti, {
            y: window.innerHeight + 100,
            rotation: Math.random() * 360,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
            ease: 'linear',
            repeat: -1
        });
    }
}
