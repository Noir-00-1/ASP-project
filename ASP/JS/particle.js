"use strict";

class ParticleSystem {
    constructor(canvas) {
        this.canvas    = canvas;
        this.ctx       = canvas.getContext("2d");
        this.particles = [];
        this.mouse     = { x: null, y: null };
        this.animId    = null;

        this.config = {
            count:        100,
            maxDist:      120,
            mouseRadius:  130,
            speed:        0.4,
            size:         { min: 1.0, max: 2.8 },
            color:        "184, 15, 31",
            colorNeutral: "60, 60, 110",
            crimsonRatio:  0.18,
        };

        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        const { speed, size, color, colorNeutral, crimsonRatio } = this.config;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const isCrimson = Math.random() < crimsonRatio;

        return {
            x:            Math.random() * W,
            y:            Math.random() * H,
            vx:           (Math.random() - 0.5) * speed,
            vy:           (Math.random() - 0.5) * speed,
            size:         size.min + Math.random() * (size.max - size.min),
            opacity:      0.12 + Math.random() * 0.28,
            pulsate:      Math.random() * Math.PI * 2,
            pulsateSpeed: 0.007 + Math.random() * 0.016,
            color:        isCrimson ? color : colorNeutral,
        };
    }

    init() {
        this.particles = Array.from(
            { length: this.config.count },
            () => this.createParticle()
        );
    }

    bindEvents() {
        window.addEventListener("resize", () => {
            this.resize();
            this.init();
        }, { passive: true });

        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        }, { passive: true });

        window.addEventListener("mouseleave", () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                cancelAnimationFrame(this.animId);
            } else {
                this.animate();
            }
        });

        window.addEventListener("beforeunload", () => this.destroy());
    }

    updateParticle(p) {
        const W = this.canvas.width;
        const H = this.canvas.height;
        const { mouse, config } = this;

        if (mouse.x !== null) {
            const dx   = p.x - mouse.x;
            const dy   = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < config.mouseRadius && dist > 0) {
                const force = (config.mouseRadius - dist) / config.mouseRadius;
                p.vx += (dx / dist) * force * 0.055;
                p.vy += (dy / dist) * force * 0.055;
            }
        }

        p.vx *= 0.99;
        p.vy *= 0.99;

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > config.speed * 3) {
            p.vx = (p.vx / spd) * config.speed * 3;
            p.vy = (p.vy / spd) * config.speed * 3;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10)    p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10)    p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
    }

    drawParticle(p) {
        p.pulsate += p.pulsateSpeed;
        const pulse   = Math.sin(p.pulsate) * 0.12;
        const opacity = Math.max(0.04, Math.min(0.5, p.opacity + pulse));

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${p.color}, ${opacity})`;
        this.ctx.fill();
    }

    drawConnections(p, i) {
        const { ctx, particles, config, mouse } = this;

        for (let j = i + 1; j < particles.length; j++) {
            const q    = particles[j];
            const dx   = p.x - q.x;
            const dy   = p.y - q.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < config.maxDist) {
                const opacity = (1 - dist / config.maxDist) * 0.14;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.strokeStyle = `rgba(${config.color}, ${opacity})`;
                ctx.lineWidth   = 0.4;
                ctx.stroke();
            }
        }

        if (mouse.x !== null) {
            const dx   = p.x - mouse.x;
            const dy   = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < config.mouseRadius) {
                const opacity = (1 - dist / config.mouseRadius) * 0.42;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(${config.color}, ${opacity})`;
                ctx.lineWidth   = 0.7;
                ctx.stroke();
            }
        }
    }

    animate() {
        this.animId = requestAnimationFrame(() => this.animate());
        const { ctx, canvas } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            this.updateParticle(this.particles[i]);
            this.drawConnections(this.particles[i], i);
        }

        for (const p of this.particles) {
            this.drawParticle(p);
        }
    }

    destroy() {
        if (this.animId) cancelAnimationFrame(this.animId);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    window._particleSystem = new ParticleSystem(canvas);
});