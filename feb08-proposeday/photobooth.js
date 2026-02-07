/**
 * Propose Day Photo Booth
 * Refined and optimized implementation
 */

class PhotoBooth {
    constructor() {
        // Canvas elements
        this.video = document.getElementById('camera-stream');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stripCanvas = document.createElement('canvas');
        this.stripCtx = this.stripCanvas.getContext('2d');

        // DOM elements
        this.previewContainer = document.getElementById('camera-preview-container');
        this.resultContainer = document.getElementById('result-container');
        this.outputImage = document.getElementById('photo-strip-output');
        this.startBtn = document.getElementById('start-camera-btn');
        this.captureBtn = document.getElementById('capture-btn');
        this.retakeBtn = document.getElementById('retake-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.countdownEl = document.getElementById('countdown-overlay');
        this.flashEl = document.getElementById('flash-overlay');

        // State
        this.stream = null;
        this.capturedImages = [];
        this.isCapturing = false;

        this.init();
    }

    init() {
        this.startBtn?.addEventListener('click', () => this.startCamera());
        this.captureBtn?.addEventListener('click', () => this.startCaptureSequence());
        this.retakeBtn?.addEventListener('click', () => this.retake());
        this.saveBtn?.addEventListener('click', () => this.saveMemory());
    }

    async startCamera() {
        try {
            if (this.startBtn) {
                this.startBtn.classList.add('loading');
                this.startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accessing Camera...';
            }

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: false
            });

            this.video.srcObject = this.stream;

            this.video.onloadedmetadata = () => {
                this.video.play();

                if (this.startBtn) this.startBtn.classList.add('hidden');
                this.previewContainer?.classList.remove('hidden');
                this.captureBtn?.classList.remove('hidden');

                // Set canvas size to match video
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;

                // Entrance animation
                if (typeof gsap !== 'undefined' && this.previewContainer) {
                    gsap.from(this.previewContainer, {
                        scale: 0.9,
                        opacity: 0,
                        duration: 0.6,
                        ease: "back.out(1.2)"
                    });
                }
            };
        } catch (err) {
            console.error("Camera access denied:", err);
            if (this.startBtn) {
                this.startBtn.classList.remove('loading');
                this.startBtn.innerText = "Camera access needed 💍";
            }
            alert("Please allow camera access to capture our memory.");
        }
    }

    async startCaptureSequence() {
        if (this.isCapturing) return;

        this.isCapturing = true;
        this.capturedImages = [];
        this.captureBtn?.classList.add('hidden');

        // Capture 3 photos
        for (let i = 1; i <= 3; i++) {
            await this.runCountdown(3);
            await this.capturePhoto();

            if (i < 3) {
                if (this.countdownEl) {
                    this.countdownEl.innerText = "Say Yes! 💍";
                    this.countdownEl.classList.remove('hidden');
                }
                await new Promise(r => setTimeout(r, 1500));
                this.countdownEl?.classList.add('hidden');
            }
        }

        this.generateStrip();
        this.stopCamera();
    }

    runCountdown(seconds) {
        return new Promise(resolve => {
            if (!this.countdownEl) {
                resolve();
                return;
            }

            this.countdownEl.classList.remove('hidden');
            let count = seconds;
            this.countdownEl.innerText = count;

            const timer = setInterval(() => {
                count--;
                if (count > 0) {
                    this.countdownEl.innerText = count;

                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(this.countdownEl,
                            { scale: 1.5, opacity: 0 },
                            { scale: 1, opacity: 1, duration: 0.4 }
                        );
                    }
                } else {
                    clearInterval(timer);
                    this.countdownEl.classList.add('hidden');
                    resolve();
                }
            }, 1000);

            // Initial pulse
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(this.countdownEl,
                    { scale: 1.5, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.4 }
                );
            }
        });
    }

    capturePhoto() {
        return new Promise(resolve => {
            // Flash effect
            if (this.flashEl) {
                this.flashEl.classList.add('active');
                setTimeout(() => this.flashEl.classList.remove('active'), 200);
            }

            // Draw to canvas (mirrored to match preview)
            this.ctx.save();
            this.ctx.translate(this.canvas.width, 0);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            const dataUrl = this.canvas.toDataURL('image/png');
            this.capturedImages.push(dataUrl);

            // Create heart burst
            this.createBurst();

            resolve();
        });
    }

    generateStrip() {
        // Strip configuration
        const photoWidth = 600;
        const photoHeight = (photoWidth / this.canvas.width) * this.canvas.height;
        const padding = 40;
        const footerSpace = 250;
        const gap = 30;

        const stripWidth = photoWidth + (padding * 2);
        const stripHeight = padding + (photoHeight * 3) + (gap * 2) + footerSpace + padding;

        this.stripCanvas.width = stripWidth;
        this.stripCanvas.height = stripHeight;

        const ctx = this.stripCtx;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, stripHeight);
        gradient.addColorStop(0, '#f3e5f5');
        gradient.addColorStop(1, '#e1bee7');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, stripWidth, stripHeight);

        // Soft border
        ctx.strokeStyle = "rgba(106, 27, 154, 0.3)";
        ctx.lineWidth = 4;
        ctx.strokeRect(15, 15, stripWidth - 30, stripHeight - 30);

        // Helper to load images
        const loadImage = (src) => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });

        // Draw images
        Promise.all(this.capturedImages.map(loadImage)).then(images => {
            let yPos = padding;

            images.forEach((img, index) => {
                if (!img) return;

                // Drop shadow
                ctx.save();
                ctx.shadowColor = "rgba(0,0,0,0.2)";
                ctx.shadowBlur = 15;
                ctx.shadowOffsetY = 5;

                ctx.drawImage(img, padding, yPos, photoWidth, photoHeight);
                ctx.restore();

                yPos += photoHeight + gap;
            });

            // Footer text
            ctx.fillStyle = "#4a144c";
            ctx.textAlign = "center";

            const centerX = stripWidth / 2;
            const footerStart = stripHeight - footerSpace + 60;

            // Title
            ctx.font = "bold 40px 'Cinzel', serif";
            ctx.fillText("Propose Day 💍", centerX, footerStart);

            // Subtitle
            ctx.font = "50px 'Dancing Script', cursive";
            ctx.fillStyle = "#8e24aa";
            ctx.fillText("She Said Yes! ❤️", centerX, footerStart + 70);

            // Date
            const savedDateStr = localStorage.getItem('proposeDay_accepted');
            const dateObj = savedDateStr ? new Date(savedDateStr) : new Date();
            const dateStr = dateObj.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });

            ctx.font = "italic 24px 'Playfair Display', serif";
            ctx.fillStyle = "#6a1b9a";
            ctx.fillText(`Forever started on ${dateStr}`, centerX, footerStart + 130);

            // Show result
            const finalImage = this.stripCanvas.toDataURL('image/png');
            if (this.outputImage) {
                this.outputImage.src = finalImage;
            }

            this.previewContainer?.classList.add('hidden');
            this.resultContainer?.classList.remove('hidden');

            // Animation
            if (typeof gsap !== 'undefined' && this.outputImage) {
                gsap.from(this.outputImage, {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out"
                });
            }

            this.isCapturing = false;
        });
    }

    retake() {
        this.resultContainer?.classList.add('hidden');
        this.previewContainer?.classList.remove('hidden');
        this.captureBtn?.classList.remove('hidden');

        if (!this.stream) {
            this.startCamera();
        }
    }

    saveMemory() {
        const link = document.createElement('a');
        link.download = 'propose-day-memory.png';
        link.href = this.stripCanvas.toDataURL('image/png');
        link.click();

        // Success message
        const successMsg = document.createElement('div');
        successMsg.classList.add('success-message');
        successMsg.innerHTML = 'Promise Kept. 💍';
        this.resultContainer?.appendChild(successMsg);

        if (typeof gsap !== 'undefined') {
            gsap.fromTo(successMsg,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 }
            );
        }

        setTimeout(() => successMsg.remove(), 4000);
        this.createBurst();
    }

    createBurst() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(container);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < 30; i++) {
            const el = document.createElement('div');
            el.textContent = Math.random() > 0.5 ? '💍' : '💖';
            el.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 20 + 20}px;
                left: ${centerX}px;
                top: ${centerY}px;
                opacity: 0;
            `;
            container.appendChild(el);

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 200 + 100;
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity;

            if (typeof gsap !== 'undefined') {
                gsap.to(el, {
                    x: x,
                    y: y,
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out"
                });

                gsap.to(el, {
                    y: y + 100,
                    opacity: 0,
                    duration: 1,
                    delay: 0.5,
                    onComplete: () => el.remove()
                });
            } else {
                setTimeout(() => el.remove(), 1500);
            }
        }

        setTimeout(() => container.remove(), 2000);
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            if (this.video) {
                this.video.srcObject = null;
            }
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new PhotoBooth();
});