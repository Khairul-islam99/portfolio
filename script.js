// 1. Custom Cursor Logic
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;

    cursorOutline.animate({
        left: `${mouseX}px`,
        top: `${mouseY}px`
    }, { duration: 500, fill: "forwards" });
});

const interactables = document.querySelectorAll('a, button');
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// 2. Plexus Particle Network Animation
const canvas = document.getElementById("plexus-canvas");
const ctx = canvas.getContext("2d");
let particlesArray = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initPlexus();
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
    }
    draw() {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initPlexus() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 10000;
    // Limit particles for performance
    if(numberOfParticles > 150) numberOfParticles = 150; 
    
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animatePlexus() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Connect particles to each other
        for (let j = i; j < particlesArray.length; j++) {
            let dx = particlesArray[i].x - particlesArray[j].x;
            let dy = particlesArray[i].y - particlesArray[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(56, 189, 248, ${1 - distance/120})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
            }
        }
        
        // Connect particles to MOUSE (This makes it interactive!)
        let dxMouse = particlesArray[i].x - mouseX;
        let dyMouse = particlesArray[i].y - mouseY;
        let distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
        if (distanceMouse < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${1 - distanceMouse/150})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
        }
    }
    requestAnimationFrame(animatePlexus);
}
initPlexus();
animatePlexus();

// 3. Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });
revealElements.forEach(el => revealObserver.observe(el));

// 4. Typewriter Effect
const words = ["LLMs.", "RAG Architectures.", "DevOps Orchestration.", "AI Microservices."];
let wordIndex = 0;

function typingEffect() {
    let word = words[wordIndex].split("");
    var loopTyping = function() {
        let typewriterEl = document.getElementById('typewriter');
        if(!typewriterEl) return;
        
        if (word.length > 0) {
            typewriterEl.innerHTML += word.shift();
            setTimeout(loopTyping, 80);
        } else {
            setTimeout(deletingEffect, 2500);
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

// 5. Active Navbar Highlighting
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

    navLinks.forEach(link => {
        link.classList.remove('text-sky-400');
        if (link.getAttribute('href').includes(current) && current !== '') {
            link.classList.add('text-sky-400');
        }
    });
    
    const navbar = document.getElementById('navbar');
    if(window.scrollY > 20) {
        navbar.classList.add('shadow-md', 'shadow-slate-900/50');
    } else {
        navbar.classList.remove('shadow-md', 'shadow-slate-900/50');
    }
});