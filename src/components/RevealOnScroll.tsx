"use client";

import { useEffect } from "react";

/**
 * Single observer for every `[data-reveal]` block on the page.
 *
 * Mounted once rather than wrapping each section in its own client component,
 * so the whole scroll rhythm costs one IntersectionObserver. The hidden state
 * lives behind `.reveal-ready`, which the inline head script adds — a render
 * without JavaScript therefore shows everything, and `prefers-reduced-motion`
 * neutralises the transition in CSS.
 */
export default function RevealOnScroll() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (nodes.length === 0) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((n) => n.setAttribute("data-revealed", ""));
      return;
    }

    // threshold 0 rather than a fraction: a block taller than the viewport
    // must still reveal the moment its first pixel crosses the line, and a
    // fractional threshold makes that dependent on the block's own height.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).setAttribute("data-revealed", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 }
    );

    // Anything already on screen at mount (or above it, after a jump to an
    // anchor or a restored scroll position) is revealed immediately — waiting
    // for a scroll event would leave it invisible until the user moved.
    const vh = window.innerHeight;
    nodes.forEach((n) => {
      if (n.getBoundingClientRect().top < vh) n.setAttribute("data-revealed", "");
      else io.observe(n);
    });
    return () => io.disconnect();
  }, []);

  return null;
}
