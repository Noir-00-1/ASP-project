"use strict";

(function initCursor() {
    const ring = document.querySelector(".cursor");
    const dot  = document.querySelector(".cursor-dot");

    if (!ring || !dot) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let mouseX  = 0;
    let mouseY  = 0;
    let ringX   = 0;
    let ringY   = 0;
    let visible = false;

    document.addEventListener("mousemove", ({ clientX, clientY }) => {
        mouseX = clientX;
        mouseY = clientY;

        dot.style.left = `${clientX}px`;
        dot.style.top  = `${clientY}px`;

        if (!visible) {
            ring.style.opacity = "1";
            dot.style.opacity  = "1";
            visible = true;
        }
    });

    const animateRing = () => {
        ringX += (mouseX - ringX) * 0.11;
        ringY += (mouseY - ringY) * 0.11;
        ring.style.left = `${ringX}px`;
        ring.style.top  = `${ringY}px`;
        requestAnimationFrame(animateRing);
    };

    animateRing();

    document.addEventListener("mouseleave", () => {
        ring.style.opacity = "0";
        dot.style.opacity  = "0";
        visible = false;
    });

    document.addEventListener("mouseenter", () => {
        ring.style.opacity = "1";
        dot.style.opacity  = "1";
        visible = true;
    });

    const INTERACTIVE = "a, button, input, textarea, select, label, [role='button'], .faq-question";

    document.addEventListener("mouseover", ({ target }) => {
        if (target.closest(INTERACTIVE)) ring.classList.add("cursor-hover");
    });

    document.addEventListener("mouseout", ({ target }) => {
        if (target.closest(INTERACTIVE)) ring.classList.remove("cursor-hover");
    });

    ring.style.opacity = "0";
    dot.style.opacity  = "0";
})();