"use strict";

document.addEventListener("DOMContentLoaded", () => {
    [
        initLoader,
        initNavbar,
        initMobileMenu,
        initSmoothScroll,
        initActiveNav,
        initReveal,
        initCounters,
        initOrbitalFloat,
        initFAQ,
    ].forEach(fn => {
        try {
            fn();
        } catch (err) {
            console.error(`[${fn.name}] failed:`, err);
        }
    });
});

function initLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;

    window.addEventListener("load", () => {
        setTimeout(() => {
            loader.classList.add("hide");
            loader.addEventListener(
                "transitionend",
                () => loader.remove(),
                { once: true }
            );
        }, 500);
    });
}

function initNavbar() {
    const header = document.querySelector(".header");
    if (!header) return;

    const update = () =>
        header.classList.toggle("scrolled", window.scrollY > 40);

    window.addEventListener("scroll", update, { passive: true });
    update();
}

function initMobileMenu() {
    const btn      = document.querySelector(".mobile-btn");
    const menu     = document.querySelector(".mobile-menu");
    if (!btn || !menu) return;

    const setOpen = (open) => {
        menu.classList.toggle("mobile-open", open);
        btn.setAttribute("aria-expanded", String(open));
    };

    btn.addEventListener("click", () =>
        setOpen(!menu.classList.contains("mobile-open"))
    );

    menu.querySelectorAll("a").forEach(link =>
        link.addEventListener("click", () => setOpen(false))
    );

    document.addEventListener("click", (e) => {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
            setOpen(false);
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href || href === "#") return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function initActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");
    if (!sections.length || !navLinks.length) return;

    const OFFSET = 160;

    const update = () => {
        let current = "";

        sections.forEach(section => {
            const { top, bottom } = section.getBoundingClientRect();
            if (top <= OFFSET && bottom > OFFSET) {
                current = section.id;
            }
        });

        navLinks.forEach(link =>
            link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${current}`
            )
        );
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
}

function initReveal() {
    const items = document.querySelectorAll(
        ".glass-card, .hero-content, .hero-visual, .reveal"
    );
    if (!items.length) return;

    let remaining = items.length;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                // Respect stagger classes if present
                entry.target.classList.add("show");
                observer.unobserve(entry.target);

                remaining--;
                if (remaining === 0) observer.disconnect();
            });
        },
        { threshold: 0.12 }
    );

    items.forEach(item => observer.observe(item));
}

function initCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    const DURATION = 2000;
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    const animateCounter = (counter) => {
        const target = Number(counter.dataset.counter);
        const suffix = counter.dataset.suffix || "";
        let startTime = null;

        const tick = (timestamp) => {
            if (!startTime) startTime = timestamp;

            const elapsed  = timestamp - startTime;
            const progress = Math.min(elapsed / DURATION, 1);
            const value    = Math.floor(easeOutQuart(progress) * target);

            counter.textContent = `${value}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                counter.textContent = `${target}${suffix}`;
            }
        };

        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(counter => observer.observe(counter));
}

function initOrbitalFloat() {
    const visual = document.querySelector(".hero-visual");
    if (!visual) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let angle = 0;

    const tick = () => {
        angle += 0.007;
        const x = (Math.cos(angle) * 10).toFixed(2);
        const y = (Math.sin(angle) * 10).toFixed(2);
        visual.style.translate = `${x}px ${y}px`;
        requestAnimationFrame(tick);
    };

    tick();
}

function initFAQ() {
    const items = document.querySelectorAll(".faq-item");
    if (!items.length) return;

    const open = (item) => {
        const wasActive = item.classList.contains("active");

        items.forEach(el => {
            el.classList.remove("active");
            el.querySelector(".faq-question")
              ?.setAttribute("aria-expanded", "false");
        });

        if (!wasActive) {
            item.classList.add("active");
            item.querySelector(".faq-question")
                ?.setAttribute("aria-expanded", "true");
        }
    };

    items.forEach(item => {
        const btn = item.querySelector(".faq-question");
        if (!btn) return;

        btn.setAttribute("aria-expanded", "false");
        btn.addEventListener("click", () => open(item));
        btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(item);
            }
        });
    });
}