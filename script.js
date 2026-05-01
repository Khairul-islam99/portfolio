/* ==========================================================================
   PORTFOLIO INTERACTIVITY & PLEXUS ANIMATION SCRIPT
   ========================================================================== */

// --- 1. DARK/LIGHT MODE TOGGLE ---
// You do not need to change anything here. It automatically handles themes.
const themeToggleBtn = document.getElementById('theme-toggle');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const lightIcon = document.getElementById('theme-toggle-light-icon');
let isDark = false;

function updateTheme() {
    if (document.documentElement.classList.contains('dark')) {
        lightIcon.classList.remove('hidden');
        darkIcon.classList.add('hidden');
        isDark = true;
    } else {
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
        isDark = false;
    }
}

if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}
updateTheme();

themeToggleBtn.addEventListener('click', function() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
    updateTheme();
});


// --- 2. CUSTOM CURSOR & TOUCH LOGIC ---
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
let globalMouseX = -100, globalMouseY = -100;

// Optimize for mobile (turn off custom cursor on touch devices)
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
}

function updatePointerPosition(x, y) {
    globalMouseX = x;
    globalMouseY = y;
    if (!isTouchDevice) {
        cursorDot.style.left = `${globalMouseX}px`;
        cursorDot.style.top = `${globalMouseY}px`;
        cursorOutline.animate({
            left: `${globalMouseX}px`,
            top: `${globalMouseY}px`
        }, { duration: 300, fill: "forwards" });
    }
}

window.addEventListener('mousemove', function(e) {
    updatePointerPosition(e.clientX, e.clientY);
});

window.addEventListener('touchmove', function(e) {
    if(e.touches.length > 0) {
        updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });

window.addEventListener('touchend', function() {
    // Reset interaction point when touch ends
    globalMouseX = -100;
    globalMouseY = -100;
});

// Add hover effect to interactable elements (buttons, links)
const interactables = document.querySelectorAll('a, button, .interactable');
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});


// --- 3. HIGH-RES FULL PAGE PLEXUS NETWORK ---
// [CONFIGURATION]: You can tweak these numbers to change the particle look
const CONFIG = {
    particleCountMobile: 45,      // Less particles on mobile for better speed
    particleCountDesktop: 140,    // More particles on PC
    particleBaseSpeed: 0.4,       // How fast they move
    particleConnectDistance: 130, // How close they need to be to connect lines
    mouseRepelRadiusDesktop: 160, // How far the mouse pushes particles on PC
    mouseRepelRadiusMobile: 100   // How far touch pushes particles on Mobile
};

const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let width, height, dpr;
let particles = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    // Support for High-DPI / Retina screens to fix blurriness
    dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * CONFIG.particleBaseSpeed; 
        this.vy = (Math.random() - 0.5) * CONFIG.particleBaseSpeed; 
        this.radius = Math.random() * 2 + 1; 
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off canvas edges
        if(this.x > width + 50 || this.x < -50) this.vx *= -1; 
        if(this.y > height + 50 || this.y < -50) this.vy *= -1;
        
        // Mouse/Touch Repel Interaction
        if (globalMouseX !== -100 && globalMouseY !== -100) {
            let dx = this.x - globalMouseX;
            let dy = this.y - globalMouseY;
            let distance = Math.sqrt(dx*dx + dy*dy);
            
            let interactionRadius = isTouchDevice ? CONFIG.mouseRepelRadiusMobile : CONFIG.mouseRepelRadiusDesktop; 
            
            if (distance < interactionRadius && distance > 0) {
                let force = (interactionRadius - distance) / interactionRadius;
                this.x += (dx / distance) * force * 2;
                this.y += (dy / distance) * force * 2;
            }
        }
    }
    
    draw(colorR, colorG, colorB) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, 0.8)`;
        ctx.fill();
    }
}

// Initialize particles based on screen size
let pCount = window.innerWidth < 768 ? CONFIG.particleCountMobile : CONFIG.particleCountDesktop;
for(let i=0; i<pCount; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // [CONFIGURATION] Colors: Light Mode = Red, Dark Mode = Sky Blue
    let colorR = isDark ? 56 : 220; 
    let colorG = isDark ? 189 : 38;
    let colorB = isDark ? 248 : 38;

    for(let i=0; i<particles.length; i++) {
        particles[i].update();
        particles[i].draw(colorR, colorG, colorB);
        
        for(let j=i+1; j<particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            
            if(distance < CONFIG.particleConnectDistance) {
                ctx.beginPath();
                let opacity = 1 - (distance/CONFIG.particleConnectDistance);
                ctx.strokeStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${opacity * 0.4})`; // Lowered opacity for cleaner look
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}
animate();


// --- 4. SCROLL REVEAL ANIMATION ---
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });
revealElements.forEach(el => revealObserver.observe(el));


// --- 5. TYPEWRITER EFFECT ---
// [EDIT] Change the words you want to type out here
const words = ["LLM Fine-tuning.", "RAG Architectures.", "Multimodal AI.", "FastAPI & Docker."];
let wordIndex = 0;

function typingEffect() {
    let typewriterEl = document.getElementById('typewriter');
    if(!typewriterEl) return;
    typewriterEl.innerHTML = ""; 

    let word = words[wordIndex].split("");
    var loopTyping = function() {
        if (word.length > 0) {
            typewriterEl.innerHTML += word.shift();
            setTimeout(loopTyping, 80);
        } else {
            setTimeout(deletingEffect, 2500); // Wait time before deleting
        }
    };
    loopTyping();
}

function deletingEffect() {
    let word = words[wordIndex].split("");
    var loopDeleting = function() {
        let typewriterEl = document.getElementById('typewriter');
        if(!typewriterEl) return;

        if (word.length > 0) {
            word.pop();
            typewriterEl.innerHTML = word.join("");
            setTimeout(loopDeleting, 40);
        } else {
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(typingEffect, 500);
        }
    };
    loopDeleting();
}
setTimeout(typingEffect, 1000);


// --- 6. NAVBAR BLUR & HIGHLIGHTING ---
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    // Update active link colors
    navLinks.forEach(link => {
        link.classList.remove('text-red-600', 'dark:text-night-blue-400');
        if (link.getAttribute('href').includes(current) && current !== '') {
            link.classList.add('text-red-600', 'dark:text-night-blue-400');
        }
    });
    
    // Add shadow to navbar when scrolling down
    const navbar = document.getElementById('navbar');
    if(window.scrollY > 20) {
        navbar.classList.add('border-slate-200', 'dark:border-slate-800', 'shadow-sm');
        navbar.classList.remove('border-transparent');
    } else {
        navbar.classList.remove('border-slate-200', 'dark:border-slate-800', 'shadow-sm');
        navbar.classList.add('border-transparent');
    }
});
