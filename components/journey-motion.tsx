"use client";

import { useEffect } from "react";

export function JourneyMotion() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
          gsap.fromTo(
            ".hero-copy h1",
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
          );
          gsap.fromTo(
            ".hero-copy>p,.hero-actions",
            { y: 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.12,
              duration: 0.8,
              delay: 0.15,
              ease: "power3.out",
            },
          );
          gsap.fromTo(
            ".hero-art",
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 1.2, delay: 0.2, ease: "power2.out" },
          );
          gsap.to(".hero-art", {
            y: 35,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 1.4,
            },
          });
          gsap.utils
            .toArray<HTMLElement>(
              ".section-heading,.giving-content,.closing-section",
            )
            .forEach((element) => {
              gsap.fromTo(
                element,
                { y: 32, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.85,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: element,
                    start: "top 93%",
                    once: true,
                  },
                },
              );
            });
          gsap.utils
            .toArray<HTMLElement>(".temple-card,.steps article")
            .forEach((element, i) => {
              gsap.fromTo(
                element,
                { y: 35, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.8,
                  delay: (i % 3) * 0.1,
                  ease: "power3.out",
                  clearProps: "transform",
                  scrollTrigger: {
                    trigger: element,
                    start: "top 96%",
                    once: true,
                  },
                },
              );
            });
          const path =
            document.querySelector<SVGPathElement>(".journey-progress");
          if (path) {
            const length = path.getTotalLength();
            gsap.set(path, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });
            gsap.to(path, {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: ".journey-page",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
              },
            });
          }
          gsap.fromTo(
            ".giving-art",
            { y: 22, rotate: -2 },
            {
              y: -15,
              rotate: 2,
              ease: "none",
              scrollTrigger: {
                trigger: ".purpose-section",
                start: "top bottom",
                end: "bottom top",
                scrub: 2,
              },
            },
          );
        });
        cleanup = () => ctx.revert();
      },
    );
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);
  return null;
}
