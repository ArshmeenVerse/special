/**
 * Kiss Day Photo Booth
 * Handles camera access, image capture, strip generation, and UI interactions.
 * Theme: Wine, Gold, Blush.
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
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.startCamera());
        if (this.captureBtn) this.captureBtn.addEventListener('click', () => this.startCaptureSequence());
        if (this.retakeBtn) this.retakeBtn.addEventListener('click', () => this.retake());
        if (this.saveBtn) this.saveBtn.addEventListener('click', () => this.saveMemory());
    }

    async startCamera() {
        try {
            this.startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting...';

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
                this.startBtn.classList.add('hidden');
                this.previewContainer.classList.remove('hidden');
                this.previewContainer.classList.add('flex'); // Ensure flex is applied

                // Set canvas size to match video
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;

                // Animation
                gsap.from(this.previewContainer, {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
            };
        } catch (err) {
            console.error("Camera access denied:", err);
            this.startBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Access Denied';
            alert("Please allow camera access to use the Photo Booth! 💋");
        }
    }

    async startCaptureSequence() {
        if (this.isCapturing) return;
        this.isCapturing = true;
        this.capturedImages = [];
        this.captureBtn.classList.add('opacity-50', 'pointer-events-none');

        // Capture 3 photos
        for (let i = 1; i <= 3; i++) {
            await this.runCountdown(3);
            await this.capturePhoto();

            if (i < 3) {
                // Formatting pause between shots
                this.countdownEl.innerText = "Smile! 💋";
                this.countdownEl.classList.remove('hidden');
                await new Promise(r => setTimeout(r, 1000));
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

            gsap.fromTo(this.countdownEl,
                { scale: 1.5, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4 }
            );
        });
    }

    capturePhoto() {
        return new Promise(resolve => {
            // Flash effect
            this.flashEl.classList.remove('opacity-0');
            setTimeout(() => this.flashEl.classList.add('opacity-0'), 150);

            // Audio
            // Assuming soundManager exists from script.js, if not, we gracefully skip
            if (window.soundManager && window.soundManager.kissSound) {
                window.soundManager.kissSound.play();
            }

            // Draw to canvas (Mirrored)
            this.ctx.save();
            this.ctx.translate(this.canvas.width, 0);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            const dataUrl = this.canvas.toDataURL('image/png');
            this.capturedImages.push(dataUrl);

            resolve();
        });
    }

    generateStrip() {
        // Strip Config
        const photoWidth = 600;
        const photoHeight = (photoWidth / this.canvas.width) * this.canvas.height;
        const padding = 40;
        const headerSpace = 100;
        const footerSpace = 250;
        const gap = 30;

        const stripWidth = photoWidth + (padding * 2);
        const stripHeight = headerSpace + (photoHeight * 3) + (gap * 2) + footerSpace + padding;

        this.stripCanvas.width = stripWidth;
        this.stripCanvas.height = stripHeight;

        const ctx = this.stripCtx;

        // Background (Cream/Blush)
        const gradient = ctx.createLinearGradient(0, 0, 0, stripHeight);
        gradient.addColorStop(0, '#FFF5F8'); // Very light blush
        gradient.addColorStop(1, '#FFE4E1'); // Misty rose
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, stripWidth, stripHeight);

        // Header Text
        ctx.fillStyle = "#5A1E2C"; // Wine
        ctx.font = "bold 30px 'Cinzel', serif";
        ctx.textAlign = "center";
        ctx.fillText("KISS DAY 2026", stripWidth / 2, 70);

        // Helper to load image
        const loadImage = (src) => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        });

        Promise.all(this.capturedImages.map(loadImage)).then(images => {
            let yPos = headerSpace;

            images.forEach((img) => {
                // Shadow
                ctx.save();
                ctx.shadowColor = "rgba(0,0,0,0.2)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 4;

                ctx.drawImage(img, padding, yPos, photoWidth, photoHeight);
                ctx.restore();

                yPos += photoHeight + gap;
            });

            // Footer Text
            const centerX = stripWidth / 2;
            const footerStart = stripHeight - footerSpace + 60;

            ctx.fillStyle = "#5A1E2C";
            ctx.font = "italic 40px 'Playfair Display', serif";
            ctx.fillText("Sealed with a Kiss 💋", centerX, footerStart);

            ctx.fillStyle = "#E9C46A"; // Gold
            ctx.font = "30px 'Cormorant Garamond', serif";
            ctx.fillText("Bubu & ❤️", centerX, footerStart + 50);

            // Watermark
            ctx.globalAlpha = 0.1;
            ctx.font = "80px Arial";
            ctx.fillText("❤️", stripWidth - 80, stripHeight - 40);
            ctx.globalAlpha = 1.0;

            // Show result
            const finalImage = this.stripCanvas.toDataURL('image/png');
            this.outputImage.src = finalImage;

            this.previewContainer.classList.add('hidden');
            this.previewContainer.classList.remove('flex');
            this.resultContainer.classList.remove('hidden');

            gsap.from(this.outputImage, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });

            this.isCapturing = false;
            this.captureBtn.classList.remove('opacity-50', 'pointer-events-none');
        });
    }

    retake() {
        this.resultContainer.classList.add('hidden');
        this.previewContainer.classList.remove('hidden');
        this.previewContainer.classList.add('flex');

        if (!this.stream) this.startCamera();
    }

    saveMemory() {
        const link = document.createElement('a');
        link.download = 'kiss-day-memory.png';
        link.href = this.stripCanvas.toDataURL('image/png');
        link.click();

        // Celebration
        if (window.createParticles) {
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2);
        }

        this.saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        setTimeout(() => {
            this.saveBtn.innerHTML = '<i class="fa-solid fa-download"></i> Save Memory';
        }, 3000);
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.video.srcObject = null;
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new PhotoBooth();
});
