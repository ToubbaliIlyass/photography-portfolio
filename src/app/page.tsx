/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// Type definitions
interface PortfolioItem {
  id: number;
  title: string;
  image: string;
  rotation: string;
}

interface PolaroidCardElement extends HTMLElement {
  dataset: DOMStringMap & {
    originalRotation?: string;
  };
}

declare global {
  interface Window {
    replenishCollection?: () => void;
  }
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  { id: 1, title: "Rendez-vous", image: "/1.JPG", rotation: "0.7deg" },
  {
    id: 2,
    title: "Just a smile, or is it?",
    image: "/2.JPG",
    rotation: "-1.1deg",
  },
  { id: 3, title: "Salty sugar", image: "/3.jpg", rotation: "1.8deg" },
  { id: 4, title: "Choklat hada?", image: "/4.jpg", rotation: "-0.3deg" },
  { id: 5, title: "Matter", image: "/5.jpg", rotation: "1.4deg" },
  { id: 6, title: "It's just a scratch", image: "/6.jpg", rotation: "-1.7deg" },
  { id: 7, title: "In the middle", image: "/7.JPG", rotation: "0.5deg" },
  { id: 8, title: "Ana zlayji?", image: "/8.JPG", rotation: "-2deg" },
  { id: 9, title: "Illuminati", image: "/9.JPG", rotation: "1.2deg" },
  { id: 10, title: "Civilization", image: "/10.JPG", rotation: "-0.8deg" },
  {
    id: 11,
    title: "Surveillance, random…",
    image: "/11.JPG",
    rotation: "2.1deg",
  },
  { id: 12, title: "M25", image: "/12.JPG", rotation: "-1.5deg" },
  { id: 13, title: "Ness Ness", image: "/13.webp", rotation: "0deg" },
  { id: 14, title: "Are We at War?", image: "/14.jpg", rotation: "1.5deg" },
  { id: 15, title: "Like Him", image: "/15.png", rotation: "-0.5deg" },
  { id: 16, title: "Where is my GF?", image: "/16.jpg", rotation: "0.7deg" },
];

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize Doodle System
    const initializeDoodle = (): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const toggleBtn = document.getElementById(
        "doodle-toggle-btn",
      ) as HTMLButtonElement | null;
      const toolbar = document.getElementById("doodle-toolbar");
      const clearBtn = document.getElementById(
        "clear-doodle-btn",
      ) as HTMLButtonElement | null;
      const colorSwatches = document.querySelectorAll(".color-swatch");
      const sizePresets = document.querySelectorAll(".size-preset");

      let isDrawing = false;
      let isActive = false;
      let currentColor = "#f59e0b";
      let currentSize = 5;

      const resizeCanvas = (): void => {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) return;

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);

        canvas.width = Math.max(
          document.documentElement.scrollWidth,
          window.innerWidth,
        );
        canvas.height = Math.max(
          document.documentElement.scrollHeight,
          window.innerHeight,
        );

        ctx.drawImage(tempCanvas, 0, 0);
        updateBrush();
      };

      const updateBrush = (): void => {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = isActive ? 10 : 0;
        ctx.shadowColor = currentColor;
      };

      window.addEventListener("resize", resizeCanvas);
      setInterval(resizeCanvas, 2000); // Account for dynamic content height changes
      resizeCanvas();

      const getPosition = (
        e: MouseEvent | TouchEvent,
      ): { x: number; y: number } => {
        const touch =
          e instanceof TouchEvent && e.touches[0]
            ? e.touches[0]
            : (e as MouseEvent);
        return { x: touch.clientX, y: touch.clientY };
      };

      const startDrawing = (e: MouseEvent | TouchEvent): void => {
        if (!isActive) return;
        isDrawing = true;
        const pos = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      };

      const draw = (e: MouseEvent | TouchEvent): void => {
        if (!isDrawing || !isActive) return;
        const pos = getPosition(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      };

      const stopDrawing = (): void => {
        isDrawing = false;
      };

      colorSwatches.forEach((swatch) => {
        swatch.addEventListener("click", () => {
          colorSwatches.forEach((s) =>
            s.classList.remove("ring-2", "ring-amber-500", "active"),
          );
          swatch.classList.add("ring-2", "ring-amber-500", "active");
          currentColor = (swatch as HTMLElement).dataset.color ?? "#f59e0b";
          updateBrush();
        });
      });

      sizePresets.forEach((preset) => {
        preset.addEventListener("click", () => {
          sizePresets.forEach((p) =>
            p.classList.remove(
              "bg-stone-100",
              "ring-1",
              "ring-stone-200",
              "active-size",
            ),
          );
          preset.classList.add(
            "bg-stone-100",
            "ring-1",
            "ring-stone-200",
            "active-size",
          );
          currentSize = parseInt((preset as HTMLElement).dataset.size ?? "5");
          updateBrush();
        });
      });

      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          isActive = !isActive;
          if (isActive) {
            canvas.classList.remove("pointer-events-none");
            if (toolbar) {
              toolbar.classList.remove("hidden");
              setTimeout(() => {
                toolbar.classList.remove("translate-y-4", "opacity-0");
              }, 10);
            }
            toggleBtn.classList.add("border-amber-400", "bg-amber-50/50");
            const span = toggleBtn.querySelector("span:last-child");
            if (span) span.textContent = "Exit Drawing";
            updateBrush();
          } else {
            canvas.classList.add("pointer-events-none");
            if (toolbar) {
              toolbar.classList.add("translate-y-4", "opacity-0");
              setTimeout(() => toolbar.classList.add("hidden"), 300);
            }
            toggleBtn.classList.remove("border-amber-400", "bg-amber-50/50");
            const span = toggleBtn.querySelector("span:last-child");
            if (span) span.textContent = "Doodle Mode";
          }
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
      }

      canvas.addEventListener("mousedown", startDrawing as EventListener);
      canvas.addEventListener("mousemove", draw as EventListener);
      window.addEventListener("mouseup", stopDrawing as EventListener);

      canvas.addEventListener(
        "touchstart",
        (e: TouchEvent) => {
          if (isActive) e.preventDefault();
          startDrawing(e);
        },
        { passive: false },
      );
      canvas.addEventListener(
        "touchmove",
        (e: TouchEvent) => {
          if (isActive) e.preventDefault();
          draw(e);
        },
        { passive: false },
      );
      window.addEventListener("touchend", stopDrawing as EventListener);

      // Cleanup is handled by useEffect dependency array
    };

    const initializeStack = (): void => {
      const stack = document.querySelector(".polaroid-stack");
      const replenishBtn = document.getElementById(
        "replenish-btn",
      ) as HTMLButtonElement | null;
      if (!stack) return;

      const cards: PolaroidCardElement[] = Array.from(
        stack.querySelectorAll(".polaroid-card"),
      );
      let currentTopIndex = cards.length - 1;
      let activeCard: PolaroidCardElement | null = null;
      let startX = 0;
      let startY = 0;
      let moveX = 0;
      let moveY = 0;
      let isDragging = false;

      const initTopCard = (): void => {
        if (currentTopIndex < 0) {
          if (replenishBtn) {
            replenishBtn.classList.remove("hidden", "opacity-0");
          }
          return;
        }
        const topCard = cards[currentTopIndex];
        if (!topCard) return;

        topCard.style.cursor = "grab";
        topCard.style.pointerEvents = "auto";
        topCard.addEventListener("mousedown", startDrag as EventListener);
        topCard.addEventListener("touchstart", startDrag as EventListener, {
          passive: false,
        });
      };

      let pendingDragUpdate = false;

      const startDrag = (e: MouseEvent | TouchEvent): void => {
        e.preventDefault();
        activeCard = (e.currentTarget ?? e.target) as PolaroidCardElement;
        isDragging = true;

        const clientX =
          "touches" in e && e.touches[0]
            ? e.touches[0].clientX
            : (e as MouseEvent).clientX;
        const clientY =
          "touches" in e && e.touches[0]
            ? e.touches[0].clientY
            : (e as MouseEvent).clientY;

        startX = clientX;
        startY = clientY;

        if (activeCard) {
          activeCard.style.transition = "none";
          activeCard.style.cursor = "grabbing";
          activeCard.style.willChange = "transform";
        }

        // Dim hero text during drag
        const heroText = document.getElementById("hero-abstract-text");
        if (heroText) {
          heroText.style.opacity = "0.2";
        }

        document.addEventListener("mousemove", onDrag as EventListener);
        document.addEventListener("touchmove", onDrag as EventListener, {
          passive: false,
        });
        document.addEventListener("mouseup", endDrag as EventListener);
        document.addEventListener("touchend", endDrag as EventListener);
      };

      const onDrag = (e: MouseEvent | TouchEvent): void => {
        if (!isDragging || !activeCard) return;
        e.preventDefault();

        const clientX =
          "touches" in e && e.touches[0]
            ? e.touches[0].clientX
            : (e as MouseEvent).clientX;
        const clientY =
          "touches" in e && e.touches[0]
            ? e.touches[0].clientY
            : (e as MouseEvent).clientY;

        moveX = clientX - startX;
        moveY = clientY - startY;

        if (!pendingDragUpdate) {
          pendingDragUpdate = true;
          requestAnimationFrame(() => {
            if (activeCard && isDragging) {
              const rotation = moveX / 20;
              activeCard.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) rotate(${rotation}deg)`;
            }
            pendingDragUpdate = false;
          });
        }
      };

      const endDrag = (): void => {
        if (!isDragging || !activeCard) return;
        isDragging = false;

        // Restore hero text opacity after drag
        const heroText = document.getElementById("hero-abstract-text");
        if (heroText) {
          heroText.style.opacity = "0.9";
        }

        document.removeEventListener("mousemove", onDrag as EventListener);
        document.removeEventListener("touchmove", onDrag as EventListener);
        document.removeEventListener("mouseup", endDrag as EventListener);
        document.removeEventListener("touchend", endDrag as EventListener);

        const threshold = 100;
        if (Math.abs(moveX) > threshold || Math.abs(moveY) > threshold) {
          const flyX = moveX > 0 ? 1200 : -1200;
          const flyY = moveY > 0 ? 1200 : -1200;
          activeCard.style.transition =
            "transform 0.6s cubic-bezier(0.2, 0, 0, 1), opacity 0.4s";
          activeCard.style.transform = `translate(calc(-50% + ${flyX}px), calc(-50% + ${flyY}px)) rotate(${moveX / 5}deg)`;
          activeCard.style.opacity = "0";
          activeCard.style.pointerEvents = "none";
          activeCard.style.willChange = "auto";

          activeCard.removeEventListener(
            "mousedown",
            startDrag as EventListener,
          );
          activeCard.removeEventListener(
            "touchstart",
            startDrag as EventListener,
          );
          currentTopIndex--;
          setTimeout(initTopCard, 100);
        } else {
          activeCard.style.transition =
            "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
          activeCard.style.willChange = "auto";
          const originalRotation =
            activeCard.dataset.originalRotation ?? "0deg";
          activeCard.style.transform = `translate(-50%, -50%) rotate(${originalRotation})`;
          activeCard.style.cursor = "grab";
        }

        activeCard = null;
        moveX = 0;
        moveY = 0;
      };

      window.replenishCollection = (): void => {
        if (replenishBtn) replenishBtn.classList.add("opacity-0");
        setTimeout(() => {
          if (replenishBtn) replenishBtn.classList.add("hidden");
        }, 500);

        cards.forEach((card, index) => {
          setTimeout(
            () => {
              card.style.transition =
                "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s";
              card.style.opacity = "1";
              const originalRotation = card.dataset.originalRotation ?? "0deg";
              card.style.transform = `translate(-50%, -50%) rotate(${originalRotation})`;
              if (index === cards.length - 1) {
                currentTopIndex = cards.length - 1;
                setTimeout(initTopCard, 800);
              }
            },
            (cards.length - 1 - index) * 100,
          );
        });
      };

      // Animate cards on initial load
      const animateCardsOnLoad = (): void => {
        cards.forEach((card, index) => {
          setTimeout(
            () => {
              card.style.transition =
                "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s";
              card.style.opacity = "1";
              const originalRotation = card.dataset.originalRotation ?? "0deg";
              card.style.transform = `translate(-50%, -50%) rotate(${originalRotation})`;
              if (index === cards.length - 1) {
                currentTopIndex = cards.length - 1;
                setTimeout(initTopCard, 800);
              }
            },
            (cards.length - 1 - index) * 100,
          );
        });
      };

      window.addEventListener("DOMContentLoaded", () => {
        cards.forEach((card) => {
          const style = card.getAttribute("style");
          if (style) {
            const match = /rotate\((.*?)\)/.exec(style);
            if (match) card.dataset.originalRotation = match[1];
          }
        });
        initTopCard();
      });

      // Initialize immediately
      cards.forEach((card) => {
        const style = card.getAttribute("style");
        if (style) {
          const match = /rotate\((.*?)\)/.exec(style);
          if (match) card.dataset.originalRotation = match[1];
        }
        // Set initial hidden state for cards
        card.style.opacity = "0";
      });

      // Return the animation function for external calls
      (window as any).animateCardsOnLoad = animateCardsOnLoad;
    };

    // Animate hero text on page load first
    const heroText = document.getElementById("hero-abstract-text");
    if (heroText) {
      // Trigger the animation by resetting transform to center and opacity to full
      setTimeout(() => {
        heroText.style.transform = "translate(-50%, -50%)";
        heroText.style.opacity = "0.9";
      }, 50);
    }

    // Initialize stack first (cards will start hidden)
    initializeStack();

    // Initialize doodle system
    initializeDoodle();

    // Animate cards after hero text animation completes
    setTimeout(() => {
      (window as any).animateCardsOnLoad?.();
    }, 1000);
  }, []);

  return (
    <>
      {/* Doodle Canvas */}
      <canvas
        ref={canvasRef}
        id="doodle-canvas"
        className="pointer-events-none absolute top-0 left-0 z-40 transition-opacity duration-300 opacity-100"
      />

      <header className="fixed top-0 z-50 flex h-14 w-full items-center justify-center border-b border-stone-100/50 bg-white/70 shadow-sm backdrop-blur-xl dark:border-stone-800/50 dark:bg-stone-950/70 dark:shadow-none">
        <div className="flex w-full max-w-6xl items-center justify-between px-12">
          <div className="font-section-cursive text-2xl text-stone-900 dark:text-stone-100">
            Abstracta
          </div>
          <nav className="flex gap-8">
            <a
              className="border-b border-amber-500 pb-1 text-[10px] font-medium tracking-widest text-stone-900 transition-colors duration-500"
              href="#portfolio"
            >
              PORTFOLIO
            </a>
            <a
              className="text-[10px] font-medium tracking-widest text-stone-400 transition-colors duration-500 hover:text-amber-600"
              href="#about"
            >
              ABOUT ME
            </a>
            <a
              className="text-[10px] font-medium tracking-widest text-stone-400 transition-colors duration-500 hover:text-amber-600"
              href="#contact"
            >
              CONTACT
            </a>
          </nav>
        </div>
      </header>

      <main
        className="px-wall-margin relative -m-15 flex grow flex-col items-center justify-center pt-0 pb-12"
        id="portfolio"
      >
        {/* Hero Typography Layer */}
        <div
          id="hero-abstract-text"
          className="pointer-events-none absolute top-1/2 left-1/2 z-20 w-full max-w-6xl px-12 text-center mix-blend-difference"
          style={{
            transform: "translate(-50%, calc(-50% - 100px))",
            opacity: 0,
            transition:
              "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-in-out",
          }}
        >
          <p className="font-sans text-[clamp(5rem,14vw,14rem)] leading-[0.85] font-black tracking-[-0.08em] text-stone-900 uppercase">
            Ordinary
            <br />
            Becomes
            <br />
            Abstract
          </p>
        </div>

        {/* Polaroid Stack */}
        <div className="polaroid-stack relative z-10 mt-40 flex h-187.5 w-250 items-center justify-center">
          {PORTFOLIO_ITEMS.map((item, index) => {
            const zIndex = index + 1;
            const width = 420 + index * 6;
            const height = 520 + index * 6;
            const offsetX = ((index % 3) - 1) * 12;
            const offsetY = Math.floor(index / 3) * 8;

            return (
              <div
                key={item.id}
                className="polaroid-card absolute flex origin-center flex-col bg-white p-[10px] pb-[56px]"
                style={{
                  transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${item.rotation})`,
                  zIndex: zIndex,
                  width: `${width}px`,
                  height: `${height}px`,
                  pointerEvents:
                    index === PORTFOLIO_ITEMS.length - 1 ? "auto" : "none",
                  opacity: 0,
                  transition:
                    "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s",
                }}
              >
                <div className="relative flex-grow overflow-hidden bg-stone-50">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="h-full w-full object-cover grayscale-0"
                    unoptimized
                  />
                </div>
                <div className="mt-2 flex h-[46px] flex-col items-center justify-center">
                  <span className="font-metadata-caps mb-1 text-[8px] tracking-widest text-amber-600 uppercase">
                    Photography
                  </span>
                  <span className="font-polaroid-title text-polaroid-title text-stone-700 italic">
                    {item.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
       
        <button
          className="group absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-stone-200/80 bg-white/80 px-6 py-3 opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-700 hover:border-stone-300 hover:bg-white hover:shadow-[0_16px_50px_rgba(0,0,0,0.08)]"
          style={{
            top: "calc(50% + 280px)",
          }}
          id="replenish-btn"
          onClick={() => window.replenishCollection?.()}
        >
          <span className="material-symbols-outlined text-[18px] text-stone-500 transition-transform duration-500 group-hover:rotate-180 group-hover:text-amber-600">
            refresh
          </span>

          <span className="font-metadata-caps text-[9px] tracking-[0.28em] text-stone-500 uppercase transition-colors group-hover:text-stone-800">
            Restock Collection
          </span>
        </button>
        {/* Instruction Hint */}
        <div className="mt-8 flex animate-pulse items-center gap-3 opacity-100">
          <span className="material-symbols-outlined text-2xl text-stone-700">
            drag_pan
          </span>
          <span className="font-metadata-caps text-sm font-bold tracking-[0.15em] text-stone-800 uppercase">
            Drag top card to reveal unique perspectives
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto mb-8 flex w-full flex-col items-center gap-6 bg-transparent py-12">
        <div className="font-section-cursive text-2xl text-stone-600">
          Abstracta
        </div>
        <p className="font-metadata-caps text-[9px] tracking-[0.3em] text-stone-400 uppercase">
          © 2026 ABSTRACTA GALLERY. ALL RIGHTS RESERVED.
        </p>
      </footer>

      {/* Doodle Controls Fixed Position */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        {/* Doodle Toolbar (Visible when active) */}
        <div
          className="hidden flex-col gap-4 rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 backdrop-blur-xl"
          id="doodle-toolbar"
        >
          {/* Color Presets */}
          <div className="flex flex-col gap-2">
            <span className="font-metadata-caps text-[8px] tracking-widest text-stone-400 uppercase">
              Color
            </span>
            <div className="flex gap-2">
              <button
                className="color-swatch active h-6 w-6 rounded-full border-2 border-white shadow-sm ring-2 ring-amber-500"
                data-color="#f59e0b"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <button
                className="color-swatch h-6 w-6 rounded-full border-2 border-white shadow-sm"
                data-color="#06b6d4"
                style={{ backgroundColor: "#06b6d4" }}
              />
              <button
                className="color-swatch h-6 w-6 rounded-full border-2 border-white shadow-sm"
                data-color="#d946ef"
                style={{ backgroundColor: "#d946ef" }}
              />
              <button
                className="color-swatch h-6 w-6 rounded-full border-2 border-white shadow-sm"
                data-color="#1c1b1b"
                style={{ backgroundColor: "#1c1b1b" }}
              />
            </div>
          </div>

          {/* Brush Size Presets */}
          <div className="flex flex-col gap-2">
            <span className="font-metadata-caps text-[8px] tracking-widest text-stone-400 uppercase">
              Size
            </span>
            <div className="flex items-center gap-3">
              <button
                className="size-preset flex items-center justify-center rounded p-1 hover:bg-stone-100 transition-colors"
                data-size="2"
              >
                <div className="h-1 w-1 rounded-full bg-stone-600" />
              </button>
              <button
                className="size-preset active-size flex items-center justify-center rounded bg-stone-100 p-1 ring-1 ring-stone-200"
                data-size="5"
              >
                <div className="h-2 w-2 rounded-full bg-stone-600" />
              </button>
              <button
                className="size-preset flex items-center justify-center rounded p-1 hover:bg-stone-100 transition-colors"
                data-size="10"
              >
                <div className="h-3 w-3 rounded-full bg-stone-600" />
              </button>
            </div>
          </div>
          <hr className="border-stone-100" />

          {/* Actions */}
          <button
            className="flex items-center gap-2 text-stone-500 transition-colors hover:text-red-500"
            id="clear-doodle-btn"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            <span className="font-metadata-caps text-[9px] tracking-widest uppercase">
              Clear All
            </span>
          </button>
        </div>

        {/* Main Toggle */}
        <button
          className="group flex items-center gap-3 rounded-full border border-stone-200 bg-white/80 px-6 py-3 shadow-lg transition-all backdrop-blur-xl hover:border-amber-400 active:scale-95"
          id="doodle-toggle-btn"
        >
          <span className="material-symbols-outlined text-amber-600 transition-transform group-hover:rotate-12">
            draw
          </span>
          <span className="font-metadata-caps text-[10px] tracking-[0.3em] text-stone-500 transition-colors uppercase group-hover:text-amber-700">
            Doodle Mode
          </span>
        </button>
      </div>
    </>
  );
}
