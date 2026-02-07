// Initialize Lenis for smooth scrolling
const lenis = new Lenis();
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- SECTION 1: QUIET INTRO ---
const tlIntro = gsap.timeline({
    scrollTrigger: {
        trigger: ".intro-section",
        start: "top top",
        end: "+=100%",
        scrub: true,
        pin: true
    }
});

tlIntro.to(".text-1", { opacity: 1, duration: 1 })
    .to(".text-1", { opacity: 0, duration: 1 }, "+=0.5")
    .to(".text-2", { opacity: 1, duration: 1 })
    .to(".text-2", { opacity: 0, duration: 1 }, "+=1");

// --- SECTION 2: ENVELOPE MODAL INTERACTION ---
const envelopeBtn = document.getElementById('envelopeTrigger');
const letterModal = document.getElementById('letterModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');

const openModal = () => {
    letterModal.classList.add('active');

    // Animate content entrance
    gsap.fromTo(".letter-paper",
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.2)", delay: 0.1 }
    );

    // Animate text elements stagger
    gsap.fromTo(".letter-header, .promise-line, .letter-sign",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.3 }
    );
};

const closeModal = () => {
    gsap.to(".letter-paper", {
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
            letterModal.classList.remove('active');
        }
    });
};

envelopeBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);




// --- SECTION 5: FORM LOGIC ---
const promiseInput = document.getElementById('promiseInput');
const sealBtn = document.getElementById('sealBtn');
const confirmationText = document.getElementById('confirmationText');
const timestampText = document.getElementById('timestampText');
const charCounter = document.querySelector('.char-counter');

// Check LocalStorage
const savedPromise = localStorage.getItem('promiseDayResponse');
if (savedPromise) {
    const data = JSON.parse(savedPromise);
    showSealedState(data.message, data.timestamp);
}

// Char Counter
promiseInput.addEventListener('input', () => {
    charCounter.innerText = `${promiseInput.value.length} / 500`;
});

// Seal Action
sealBtn.addEventListener('click', () => {
    const text = promiseInput.value.trim();
    if (text.length === 0) {
        alert("Please write a promise first... 🤍");
        return;
    }

    const timestamp = new Date().toLocaleString();
    const data = { message: text, timestamp: timestamp };

    localStorage.setItem('promiseDayResponse', JSON.stringify(data));

    // Animation
    gsap.to(".seal-mark", {
        scale: 1,
        opacity: 1,
        display: "block",
        duration: 0.5,
        ease: "back.out(1.7)"
    });

    setTimeout(() => {
        showSealedState(text, timestamp);
    }, 1000);
});

function showSealedState(msg, time) {
    promiseInput.value = msg;
    promiseInput.disabled = true;
    sealBtn.style.display = 'none';
    charCounter.style.display = 'none';

    confirmationText.classList.remove('hidden');
    confirmationText.style.opacity = 1;

    timestampText.innerText = time;
    timestampText.classList.remove('hidden');
    timestampText.style.opacity = 1;
}


// --- SECTION 6: OUTRO ---
gsap.to(".outro-text", {
    scrollTrigger: {
        trigger: ".outro-section",
        start: "center bottom",
        end: "center center",
        scrub: true
    },
    opacity: 1,
    y: 0
});

// --- MUSIC POPUP LOGIC ---
const musicPopup = document.getElementById('musicPopup');
const playMusicBtn = document.getElementById('playMusicBtn');
const bgMusic = document.getElementById('bgMusic');

window.addEventListener('load', () => {
    // Show popup after a short delay
    setTimeout(() => {
        musicPopup.style.display = 'flex';
    }, 1000);
});

playMusicBtn.addEventListener('click', () => {
    bgMusic.play().then(() => {
        // Fade out popup
        gsap.to(musicPopup, {
            opacity: 0, duration: 0.5, onComplete: () => {
                musicPopup.style.display = 'none';
            }
        });
    }).catch(error => {
        console.log("Audio playback failed:", error);
        alert("Audio requires user interaction. Please try again.");
    });
});
