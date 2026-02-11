/**
 * Promise Day Photo Booth
 * Handles camera access, image capture, strip generation, and UI interactions.
 * Royal Theme Edition 👑
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
        // Safe binding with optional chaining
        this.startBtn?.addEventListener('click', () => this.startCamera());
        this.captureBtn?.addEventListener('click', () => this.startCaptureSequence());
        this.retakeBtn?.addEventListener('click', () => this.retake());
        this.saveBtn?.addEventListener('click', () => this.saveMemory());
    }

    async startCamera() {
        try {
            if (this.startBtn) {
                this.startBtn.classList.add('opacity-50', 'cursor-not-allowed');
                this.startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Arranging Royal Portrait...';
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
                this.previewContainer.classList.remove('hidden');

                // Set canvas size to match video
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;

                // Entrance animation
                gsap.from(this.previewContainer, {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
            };
        } catch (err) {
            console.error("Camera access denied:", err);
            if (this.startBtn) {
                this.startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                this.startBtn.innerText = "Camera Access Needed 👑";
            }
            alert("Please allow camera access to capture our royal memory.");
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

            resolve();
        });
    }

    generateStrip() {
        // Strip Config
        const photoWidth = 600;
        const photoHeight = (photoWidth / this.canvas.width) * this.canvas.height;
        const padding = 40;
        const footerSpace = 300;
        const gap = 30;

        const stripWidth = photoWidth + (padding * 2);
        const stripHeight = padding + (photoHeight * 3) + (gap * 2) + footerSpace + padding;

        this.stripCanvas.width = stripWidth;
        this.stripCanvas.height = stripHeight;

        const ctx = this.stripCtx;

        // Royal Background
        const gradient = ctx.createLinearGradient(0, 0, 0, stripHeight);
        gradient.addColorStop(0, '#FFFDD0'); // Cream
        gradient.addColorStop(1, '#F5E6D3'); // Sand Beige
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, stripWidth, stripHeight);

        // Decoration - Royal Borders
        ctx.strokeStyle = "#C8A951"; // Antique Gold
        ctx.lineWidth = 8;
        ctx.strokeRect(15, 15, stripWidth - 30, stripHeight - 30);

        ctx.strokeStyle = "#7B1E3A"; // Royal Maroon
        ctx.lineWidth = 2;
        ctx.strokeRect(25, 25, stripWidth - 50, stripHeight - 50);

        // Helper to load image
        const loadImage = (src) => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        });

        // Draw Images
        Promise.all(this.capturedImages.map(loadImage)).then(images => {
            let yPos = padding + 20;

            images.forEach((img, index) => {
                // Drop shadow/Border for photos
                ctx.save();
                ctx.shadowColor = "rgba(0,0,0,0.3)";
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 5;

                // Gold border around photo
                ctx.fillStyle = "#7B1E3A";
                ctx.fillRect(padding - 5, yPos - 5, photoWidth + 10, photoHeight + 10);

                ctx.drawImage(img, padding, yPos, photoWidth, photoHeight);
                ctx.restore();

                yPos += photoHeight + gap;
            });

            // Footer Text
            ctx.fillStyle = "#7B1E3A"; // Royal Maroon
            ctx.textAlign = "center";

            const centerX = stripWidth / 2;
            const footerStart = stripHeight - footerSpace + 80;

            // Title
            ctx.font = "bold 45px 'Cinzel', serif";
            ctx.fillText("Promise Day 🤞", centerX, footerStart);

            // Subtitle
            ctx.font = "italic 40px 'Cormorant Garamond', serif";
            ctx.fillStyle = "#C8A951";
            ctx.fillText("My Forever Promise", centerX, footerStart + 60);

            // Date
            ctx.font = "30px 'Cormorant Garamond', serif";
            ctx.fillStyle = "#555555";
            ctx.fillText("February 11, 2026", centerX, footerStart + 120);

            // Show result
            const finalImage = this.stripCanvas.toDataURL('image/png');
            this.outputImage.src = finalImage;

            this.previewContainer.classList.add('hidden');
            this.resultContainer.classList.remove('hidden');

            // Animation
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
        this.previewContainer.classList.remove('hidden');
        this.captureBtn.classList.remove('hidden');
        if (!this.stream) this.startCamera();
    }

    saveMemory() {
        const link = document.createElement('a');
        link.download = 'promise-day-royal-memory.png';
        link.href = this.stripCanvas.toDataURL('image/png');
        link.click();
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.video.srcObject = null;
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new PhotoBooth();
});
