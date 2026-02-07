/**
 * Rose Day Photo Booth
 * Handles camera access, image capture, strip generation, and UI interactions.
 */

class PhotoBooth {
    constructor() {
        this.video = document.getElementById('camera-stream');
        this.canvas = document.createElement('canvas'); // Hidden canvas for raw capture
        this.ctx = this.canvas.getContext('2d');
        this.stripCanvas = document.createElement('canvas'); // Canvas for final strip
        this.stripCtx = this.stripCanvas.getContext('2d');

        this.previewContainer = document.getElementById('camera-preview-container');
        this.resultContainer = document.getElementById('result-container');
        this.outputImage = document.getElementById('photo-strip-output');

        this.startBtn = document.getElementById('start-camera-btn');
        this.captureBtn = document.getElementById('capture-btn');
        this.retakeBtn = document.getElementById('retake-btn');
        this.saveBtn = document.getElementById('save-btn');

        this.countdownEl = document.getElementById('countdown-overlay');
        this.flashEl = document.getElementById('flash-overlay');

        this.stream = null;
        this.capturedImages = [];
        this.isCapturing = false;

        this.init();
    }

    init() {
        console.log("Photo Booth initializing...");
        if (!this.video) console.error("Camera video element not found!");
        if (!this.previewContainer) console.error("Preview container not found!");
        if (!this.startBtn) console.error("Start button not found!");

        // Safe binding with optional chaining
        this.startBtn?.addEventListener('click', () => this.startCamera());
        this.captureBtn?.addEventListener('click', () => this.startCaptureSequence());
        this.retakeBtn?.addEventListener('click', () => this.retake());
        this.saveBtn?.addEventListener('click', () => this.saveMemory());
    }

    async startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera access is not supported in this browser or context (requires HTTPS or localhost).");
            return;
        }

        try {
            if (this.startBtn) {
                this.startBtn.disabled = true;
                this.startBtn.innerText = 'Starting Camera...';
            }

            console.log("Requesting camera access...");
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: false
            });
            console.log("Camera access granted.");

            this.video.srcObject = this.stream;

            this.video.onloadedmetadata = () => {
                console.log("Video metadata loaded. Playing...");
                this.video.play().then(() => {
                    if (this.startBtn) this.startBtn.classList.add('hidden');
                    this.previewContainer.classList.remove('hidden');
                    this.captureBtn.classList.remove('hidden');

                    // Set canvas size to match video
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;

                    // Entrance animation
                    if (typeof gsap !== 'undefined') {
                        gsap.from(this.previewContainer, {
                            scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(1.2)"
                        });
                    }
                }).catch(e => console.error("Play failed:", e));
            };
        } catch (err) {
            console.error("Camera access denied or error:", err);
            if (this.startBtn) {
                this.startBtn.disabled = false;
                this.startBtn.innerText = "Camera Access Needed 📸";
            }
            alert(`Could not access camera: ${err.message}. Please allow permissions.`);
        }
    }

    async startCaptureSequence() {
        if (this.isCapturing) return;
        this.isCapturing = true;
        this.capturedImages = [];
        this.captureBtn.classList.add('hidden');

        // Capture 3 photos
        for (let i = 1; i <= 3; i++) {
            await this.runCountdown(3);
            await this.capturePhoto();

            if (i < 3) {
                // Formatting pause between shots
                this.countdownEl.innerText = "Smile! 😊";
                this.countdownEl.classList.remove('hidden');
                await new Promise(r => setTimeout(r, 1500));
                this.countdownEl.classList.add('hidden');
            }
        }

        this.generateStrip();
        this.stopCamera();
    }

    runCountdown(seconds) {
        return new Promise(resolve => {
            this.countdownEl.classList.remove('hidden');
            let count = seconds;

            this.countdownEl.innerText = count;

            const timer = setInterval(() => {
                count--;
                if (count > 0) {
                    this.countdownEl.innerText = count;
                    // Pulse animation
                    gsap.fromTo(this.countdownEl,
                        { scale: 1.5, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.4 }
                    );
                } else {
                    clearInterval(timer);
                    this.countdownEl.classList.add('hidden');
                    resolve();
                }
            }, 1000);

            // Initial pulse
            gsap.fromTo(this.countdownEl,
                { scale: 1.5, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4 }
            );
        });
    }

    capturePhoto() {
        return new Promise(resolve => {
            // Flash effect
            this.flashEl.classList.add('active');
            setTimeout(() => this.flashEl.classList.remove('active'), 200);

            // Draw to canvas (Mirrored to match preview)
            this.ctx.save();
            this.ctx.translate(this.canvas.width, 0);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            const dataUrl = this.canvas.toDataURL('image/png');
            this.capturedImages.push(dataUrl);

            // Create petal burst at center
            this.createBurst();

            resolve();
        });
    }

    generateStrip() {
        // Strip Config
        const photoWidth = 600;
        const photoHeight = (photoWidth / this.canvas.width) * this.canvas.height; // Maintain aspect ratio
        const padding = 40;
        const headerSpace = 0;
        const footerSpace = 250; // Increased for more text space
        const gap = 30;

        const stripWidth = photoWidth + (padding * 2);
        const stripHeight = padding + (photoHeight * 3) + (gap * 2) + footerSpace + padding;

        this.stripCanvas.width = stripWidth;
        this.stripCanvas.height = stripHeight;

        const ctx = this.stripCtx;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, stripHeight);
        gradient.addColorStop(0, '#fff0f5'); // Lavender blush
        gradient.addColorStop(1, '#ffe4e1'); // Misty rose
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, stripWidth, stripHeight);

        // Decoration - Soft Border
        ctx.strokeStyle = "rgba(224, 74, 94, 0.3)";
        ctx.lineWidth = 4;
        ctx.strokeRect(15, 15, stripWidth - 30, stripHeight - 30);

        // Helper to load image
        const loadImage = (src) => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        });

        // Draw Images
        Promise.all(this.capturedImages.map(loadImage)).then(images => {
            let yPos = padding;

            images.forEach((img, index) => {
                // Drop shadow for photos
                ctx.save();
                ctx.shadowColor = "rgba(0,0,0,0.2)";
                ctx.shadowBlur = 15;
                ctx.shadowOffsetY = 5;

                ctx.drawImage(img, padding, yPos, photoWidth, photoHeight);
                ctx.restore();

                yPos += photoHeight + gap;
            });

            // Footer Text
            ctx.fillStyle = "#5a2c2c";
            ctx.textAlign = "center";

            const centerX = stripWidth / 2;
            const footerStart = stripHeight - footerSpace + 60;

            // Context Detection
            const isProposeDay = document.title.includes("Question") || document.title.includes("Propose");
            const isTeddyDay = document.title.includes("Teddy") || window.location.pathname.includes("teddyday");

            // Title
            ctx.font = "bold 40px 'Cinzel', serif";
            let titleText = "Rose Day 🌹";
            if (isTeddyDay) {
                titleText = "Teddy Day 🧸";
            } else if (isProposeDay) {
                titleText = "Rose Day 🌹";
            }
            ctx.fillText(titleText, centerX, footerStart);

            // Subtitle
            ctx.font = "50px 'Dancing Script', cursive";
            ctx.fillStyle = "#e04a5e";
            ctx.fillText("Bubu  &  ❤️", centerX, footerStart + 70);

            // Date Logic
            let dateText = "";
            ctx.font = "italic 24px 'Playfair Display', serif";
            ctx.fillStyle = "#8b5a5a";

            // If Propose Day page, show "Chosen on...", otherwise show current date
            if (isProposeDay) {
                const savedDateStr = localStorage.getItem('proposeDay_accepted');
                const dateObj = savedDateStr ? new Date(savedDateStr) : new Date();
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                dateText = `Chosen on ${dateStr}`;
            } else {
                const now = new Date();
                dateText = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            }

            ctx.fillText(dateText, centerX, footerStart + 130);

            // Low opacity heart watermark
            ctx.globalAlpha = 0.1;
            ctx.font = "100px Arial";
            ctx.fillText("❤️", stripWidth - 80, stripHeight - 40);
            ctx.globalAlpha = 1.0;

            // Show result
            const finalImage = this.stripCanvas.toDataURL('image/png');
            this.outputImage.src = finalImage;

            this.previewContainer.classList.add('hidden');
            this.resultContainer.classList.remove('hidden');

            // Animation for strip appearance
            gsap.from(this.outputImage, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });

            this.isCapturing = false;
        });
    }

    retake() {
        this.resultContainer.classList.add('hidden');
        this.previewContainer.classList.remove('hidden'); // Show preview again
        this.captureBtn.classList.remove('hidden'); // Show capture button
        // Camera is likely still running, but we can ensure
        if (!this.stream) this.startCamera();
    }

    saveMemory() {
        const link = document.createElement('a');
        link.download = 'rose-day-memory.png';
        link.href = this.stripCanvas.toDataURL('image/png');
        link.click();

        // Success animation
        const successMsg = document.createElement('div');
        successMsg.classList.add('success-message');
        successMsg.innerHTML = 'This moment is ours forever.';
        this.resultContainer.appendChild(successMsg);

        gsap.fromTo(successMsg,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5 }
        );

        setTimeout(() => successMsg.remove(), 4000);

        // Heart burst
        this.createBurst();
    }

    createBurst() {
        // Create simple heart/petal particles
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '9999';
        document.body.appendChild(container);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Context detection for particles
        const isTeddyDay = document.title.includes("Teddy") || window.location.pathname.includes("teddyday");
        const particles = isTeddyDay ? ['🧸', '❤️', '✨'] : ['🌹', '✨'];

        for (let i = 0; i < 30; i++) {
            const el = document.createElement('div');
            el.textContent = particles[Math.floor(Math.random() * particles.length)];
            el.style.position = 'absolute';
            el.style.fontSize = Math.random() * 20 + 20 + 'px';
            el.style.left = centerX + 'px';
            el.style.top = centerY + 'px';
            el.style.opacity = 0;
            container.appendChild(el);

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 200 + 100;
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity;

            gsap.to(el, {
                x: x,
                y: y,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });

            gsap.to(el, {
                y: y + 100, // Gravity effect
                opacity: 0,
                duration: 1,
                delay: 0.5,
                onComplete: () => el.remove()
            });
        }

        setTimeout(() => container.remove(), 2000);
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null; // Clear reference
            this.video.srcObject = null;
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new PhotoBooth();
});
