// --- Floating Hearts Background ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 12 + 6;
        this.speedY = Math.random() * 1.2 + 0.6;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.5 + 0.4;
        this.color = `hsl(${Math.random() * 30 + 340}, 100%, 70%)`;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.y < -20) this.reset();
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(this.x, this.y + topCurveHeight);
        ctx.bezierCurveTo(
            this.x, this.y, 
            this.x - this.size / 2, this.y, 
            this.x - this.size / 2, this.y + topCurveHeight
        );
        ctx.bezierCurveTo(
            this.x - this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
            this.x, this.y + this.size, 
            this.x, this.y + this.size
        );
        ctx.bezierCurveTo(
            this.x, this.y + this.size, 
            this.x + this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
            this.x + this.size / 2, this.y + topCurveHeight
        );
        ctx.bezierCurveTo(
            this.x + this.size / 2, this.y, 
            this.x, this.y, 
            this.x, this.y + topCurveHeight
        );
        ctx.fill();
        ctx.restore();
    }
}

const particles = Array.from({ length: 25 }, () => new Particle());

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateCanvas);
}
animateCanvas();

// --- Mobile Audio Synthesizer ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
}

function playRunSound() {
    try {
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(850, audioCtx.currentTime + 0.12);
        
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
    } catch(e) {}
}

function playSuccessSound() {
    try {
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            const startTime = audioCtx.currentTime + (idx * 0.1);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    } catch(e) {}
}

// --- Dynamic Touch Evasive NO Button Logic ---
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const toast = document.getElementById('toastMsg');
const proposalCard = document.getElementById('proposalCard');
const successCard = document.getElementById('successCard');

let yesScale = 1;
let count = 0;

const messages = [
    "No press panna mudiyathu baby! 😉",
    "Ayyoyo... escape aguthu! 😜",
    "Try pannaathey, pudika mudiyathu! 🙈",
    "Kandippa YES thaan sollanum! ❤️",
    "Vitturu ma... YES clicked! 🥰"
];

function moveNoButton(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    playRunSound();

    const cardRect = proposalCard.getBoundingClientRect();
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    // Keep button safely inside mobile screen bounds
    const maxX = cardRect.width - btnWidth - 30;
    const maxY = cardRect.height - btnHeight - 30;

    const randomX = Math.max(15, Math.floor(Math.random() * maxX)) - (cardRect.width / 2) + (btnWidth / 2);
    const randomY = Math.max(15, Math.floor(Math.random() * maxY)) - (cardRect.height / 2) + (btnHeight / 2);

    const scaleVal = Math.max(0.65, 1 - count * 0.07);
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px) scale(${scaleVal})`;

    // Scale up YES button for easier tap
    yesScale += 0.12;
    yesBtn.style.transform = `scale(${yesScale})`;

    // Show toast message
    toast.innerText = messages[count % messages.length];
    toast.classList.add('show');

    count++;
}

// Instant Touch Events for Mobile
noBtn.addEventListener('touchstart', moveNoButton, { passive: false });
noBtn.addEventListener('mouseenter', moveNoButton);
noBtn.addEventListener('click', moveNoButton);

// YES Button Event Listener
yesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    playSuccessSound();

    proposalCard.classList.add('hidden');
    successCard.classList.remove('hidden');

    // Heart explosion burst
    for (let i = 0; i < 40; i++) {
        const burstParticle = new Particle();
        burstParticle.y = window.innerHeight / 2;
        burstParticle.x = window.innerWidth / 2;
        burstParticle.speedY = (Math.random() - 0.5) * 8;
        burstParticle.speedX = (Math.random() - 0.5) * 8;
        burstParticle.size = Math.random() * 16 + 8;
        particles.push(burstParticle);
    }
});