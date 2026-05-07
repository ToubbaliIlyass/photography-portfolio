/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LayoutGroup, motion, useScroll, useTransform } from "framer-motion";

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
  { id: 17, title: "the key", image: "/17.jpg", rotation: "-1.2deg" },
];

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const yourTurnPlaceholderRef = useRef<HTMLDivElement>(null);
  const contactPlaceholderRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLElement>(null);
  const revealTimeoutsRef = useRef<number[]>([]);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [contributionTitle, setContributionTitle] =
    useState("What do you see?");
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [pendingTitle, setPendingTitle] = useState("");
  const [stageGeometry, setStageGeometry] = useState<{
    start: { left: number; top: number; width: number; height: number } | null;
    end: { left: number; top: number; width: number; height: number } | null;
  }>({ start: null, end: null });
  const [contactName, setContactName] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [contactStatus, setContactStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [contactMessage, setContactMessage] = useState("");
  const [contactRevealStarted, setContactRevealStarted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const floatingStartX = stageGeometry.start?.left ?? 0;
  const floatingStartY = stageGeometry.start?.top ?? 0;
  const floatingStartWidth = stageGeometry.start?.width ?? 0;
  const floatingStartHeight = stageGeometry.start?.height ?? 0;
  const floatingEndX = stageGeometry.end?.left ?? floatingStartX;
  const floatingEndY = stageGeometry.end?.top ?? floatingStartY;
  const floatingEndWidth = stageGeometry.end?.width ?? floatingStartWidth;
  const floatingEndHeight = stageGeometry.end?.height ?? floatingStartHeight;

  const floatingX = useTransform(
    scrollYProgress,
    [0, 1],
    [floatingStartX, floatingEndX],
  );
  const floatingY = useTransform(
    scrollYProgress,
    [0, 1],
    [floatingStartY, floatingEndY],
  );
  const floatingWidth = useTransform(
    scrollYProgress,
    [0, 1],
    [floatingStartWidth, floatingEndWidth],
  );
  const floatingHeight = useTransform(
    scrollYProgress,
    [0, 1],
    [floatingStartHeight, floatingEndHeight],
  );
  const floatingRotate = useTransform(scrollYProgress, [0, 1], [1.5, -3]);
  const floatingPolaroidStyle = contactRevealStarted
    ? {
        x: floatingX,
        y: floatingY,
        width: floatingWidth,
        height: floatingHeight,
        rotate: floatingRotate,
      }
    : {
        x: floatingStartX,
        y: floatingStartY,
        width: floatingStartWidth,
        height: floatingStartHeight,
        rotate: 1.5,
      };
  useEffect(() => {
    if (!uploadPreviewUrl) return;

    return () => URL.revokeObjectURL(uploadPreviewUrl);
  }, [uploadPreviewUrl]);

  const canSendContact =
    Boolean(uploadPreviewUrl) &&
    Boolean(uploadFile) &&
    contactName.trim().length > 0 &&
    contactNote.trim().length > 0;

  const handleContactSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!canSendContact || !uploadFile) {
      setContactStatus("error");
      setContactMessage("Add your name, a note, and a photo first.");
      return;
    }

    const formData = new FormData();
    formData.append("title", contributionTitle.trim() || "What do you see?");
    formData.append("name", contactName.trim());
    formData.append("note", contactNote.trim());
    formData.append("image", uploadFile);

    setContactStatus("sending");
    setContactMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setContactStatus("error");
        setContactMessage(data.error ?? "Something went wrong.");
        return;
      }

      setContactStatus("sent");
      setContactMessage(data.message ?? "Sent. I'll see it in my inbox.");
      setContactName("");
      setContactNote("");
    } catch {
      setContactStatus("error");
      setContactMessage("Could not send right now. Try again later.");
    }
  };

  const clearRevealTimers = () => {
    revealTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    revealTimeoutsRef.current = [];
  };

  const beginContactReveal = (nextTitle: string) => {
    setContributionTitle(nextTitle.trim() || "What do you see?");
    setTitleModalOpen(false);
    setContactRevealStarted(true);
    clearRevealTimers();

    requestAnimationFrame(() => {
      contactSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  useEffect(() => {
    return () => clearRevealTimers();
  }, []);

  useEffect(() => {
    const measureStage = () => {
      const wrapper = wrapperRef.current;
      const startEl = yourTurnPlaceholderRef.current;
      const endEl = contactPlaceholderRef.current;

      if (!wrapper || !startEl || !endEl) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const startRect = startEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();

      setStageGeometry({
        start: {
          left: startRect.left - wrapperRect.left,
          top: startRect.top - wrapperRect.top,
          width: startRect.width,
          height: startRect.height,
        },
        end: {
          left: endRect.left - wrapperRect.left,
          top: endRect.top - wrapperRect.top,
          width: endRect.width,
          height: endRect.height,
        },
      });
    };

    measureStage();

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(measureStage);
    });

    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);
    if (yourTurnPlaceholderRef.current) {
      resizeObserver.observe(yourTurnPlaceholderRef.current);
    }
    if (contactPlaceholderRef.current) {
      resizeObserver.observe(contactPlaceholderRef.current);
    }

    window.addEventListener("resize", measureStage);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureStage);
    };
  }, [uploadPreviewUrl]);

  useEffect(() => {
    const initializeAboutPolaroid = (): void => {
      const aboutCard = document.querySelector<HTMLElement>(
        ".about-polaroid-card",
      );
      if (!aboutCard) return;

      let activeCard: PolaroidCardElement | null = null;
      let startX = 0;
      let startY = 0;
      let moveX = 0;
      let moveY = 0;
      let baseX = Number(aboutCard.dataset.posX ?? "0");
      let baseY = Number(aboutCard.dataset.posY ?? "0");
      let baseRotation = Number(aboutCard.dataset.rotation ?? "0.5");
      let isDragging = false;
      let pendingDragUpdate = false;

      const applyCardTransform = (
        card: HTMLElement,
        offsetX: number,
        offsetY: number,
        rotation: number,
      ): void => {
        card.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${rotation}deg)`;
      };

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
              const nextX = baseX + moveX;
              const nextY = baseY + moveY;
              const rotation = baseRotation + moveX / 20;
              applyCardTransform(activeCard, nextX, nextY, rotation);
            }
            pendingDragUpdate = false;
          });
        }
      };

      const endDrag = (): void => {
        if (!isDragging || !activeCard) return;
        isDragging = false;

        document.removeEventListener("mousemove", onDrag as EventListener);
        document.removeEventListener("touchmove", onDrag as EventListener);
        document.removeEventListener("mouseup", endDrag as EventListener);
        document.removeEventListener("touchend", endDrag as EventListener);

        // Get card dimensions
        const cardRect = activeCard.getBoundingClientRect();
        const cardWidth = cardRect.width;
        const cardHeight = cardRect.height;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate bounds - keep the full card within the viewport
        const maxX = windowWidth / 2 - cardWidth / 2;
        const minX = -windowWidth / 2 + cardWidth / 2;
        const maxY = windowHeight / 2 - cardHeight / 2;
        const minY = -windowHeight / 2 + cardHeight / 2;

        const nextX = Math.max(minX, Math.min(maxX, baseX + moveX));
        const nextY = Math.max(minY, Math.min(maxY, baseY + moveY));
        const nextRotation = baseRotation + moveX / 20;

        activeCard.style.transition =
          "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        activeCard.style.willChange = "auto";
        applyCardTransform(activeCard, nextX, nextY, nextRotation);
        activeCard.style.cursor = "grab";
        activeCard.dataset.posX = String(nextX);
        activeCard.dataset.posY = String(nextY);
        activeCard.dataset.rotation = String(nextRotation);
        baseX = nextX;
        baseY = nextY;
        baseRotation = nextRotation;

        activeCard = null;
        moveX = 0;
        moveY = 0;
      };

      aboutCard.addEventListener("mousedown", startDrag as EventListener);
      aboutCard.addEventListener("touchstart", startDrag as EventListener, {
        passive: false,
      });

      applyCardTransform(aboutCard, baseX, baseY, baseRotation);
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

    // Initialize about polaroid drag
    initializeAboutPolaroid();

    const initializeDoodle = (): (() => void) => {
      const canvas = canvasRef.current;
      const toggleBtn = document.getElementById("doodle-toggle-btn");
      const toolbar = document.getElementById("doodle-toolbar");
      const clearBtn = document.getElementById("clear-doodle-btn");
      const colorSwatches = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".color-swatch"),
      );
      const sizePresets = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".size-preset"),
      );

      if (!canvas || !toggleBtn || !toolbar || !clearBtn)
        return () => {
          /* empty */
        };

      const context = canvas.getContext("2d");
      if (!context)
        return () => {
          /* empty */
        };

      let isDoodleActive = false;
      let isDrawing = false;
      let brushColor = "#f59e0b";
      let brushSize = 5;
      let pixelRatio = window.devicePixelRatio || 1;
      let resizeRafId = 0;
      let scrollRafId = 0;

      const resizeCanvas = (): void => {
        const previousCanvas = document.createElement("canvas");
        const previousContext = previousCanvas.getContext("2d");

        previousCanvas.width = canvas.width;
        previousCanvas.height = canvas.height;
        if (previousContext && canvas.width > 0 && canvas.height > 0) {
          previousContext.drawImage(canvas, 0, 0);
        }

        pixelRatio = window.devicePixelRatio || 1;
        const pageWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
          window.innerWidth,
        );
        const pageHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          window.innerHeight,
        );

        canvas.width = Math.round(pageWidth * pixelRatio);
        canvas.height = Math.round(pageHeight * pixelRatio);
        canvas.style.width = `${pageWidth}px`;
        canvas.style.height = `${pageHeight}px`;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.drawImage(previousCanvas, 0, 0);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        updateCanvasPosition();
      };

      const scheduleResizeCanvas = (): void => {
        if (resizeRafId) return;

        resizeRafId = requestAnimationFrame(() => {
          resizeRafId = 0;
          resizeCanvas();
        });
      };

      const updateCanvasPosition = (): void => {
        canvas.style.transform = `translate(${-window.scrollX}px, ${-window.scrollY}px)`;
      };

      const scheduleCanvasPositionUpdate = (): void => {
        if (scrollRafId) return;

        scrollRafId = requestAnimationFrame(() => {
          scrollRafId = 0;
          updateCanvasPosition();
        });
      };

      const applyNeonBrush = (color: string, size: number): void => {
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.shadowColor = color;
        context.shadowBlur = size * 3.2;
        context.globalCompositeOperation = "lighter";
      };

      const setToolbarOpen = (open: boolean): void => {
        toolbar.classList.toggle("hidden", !open);
        requestAnimationFrame(() => {
          toolbar.classList.toggle("translate-y-4", !open);
          toolbar.classList.toggle("opacity-0", !open);
        });
      };

      const setDoodleActive = (active: boolean): void => {
        isDoodleActive = active;
        canvas.style.pointerEvents = active ? "auto" : "none";
        canvas.style.cursor = active ? "crosshair" : "default";
        toggleBtn.classList.toggle("border-amber-400", active);
        toggleBtn.classList.toggle("bg-amber-50", active);
        const label = toggleBtn.querySelector("span:last-child");
        if (label) label.textContent = active ? "Exit Drawing" : "Doodle Mode";
        setToolbarOpen(active);
      };

      const getPoint = (event: PointerEvent): { x: number; y: number } => ({
        x: event.pageX,
        y: event.pageY,
      });

      const startDrawing = (event: PointerEvent): void => {
        if (!isDoodleActive) return;
        event.preventDefault();
        isDrawing = true;
        canvas.setPointerCapture(event.pointerId);
        const point = getPoint(event);
        applyNeonBrush(brushColor, brushSize);
        context.beginPath();
        context.moveTo(point.x, point.y);
      };

      const draw = (event: PointerEvent): void => {
        if (!isDoodleActive || !isDrawing) return;
        event.preventDefault();
        const point = getPoint(event);
        applyNeonBrush(brushColor, brushSize);
        context.lineTo(point.x, point.y);
        context.stroke();
      };

      const stopDrawing = (event: PointerEvent): void => {
        if (!isDrawing) return;
        isDrawing = false;
        context.closePath();
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      };

      const handleToggle = (): void => setDoodleActive(!isDoodleActive);

      const handleClear = (): void => {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      };

      const handleColorClick = (event: Event): void => {
        const button = event.currentTarget as HTMLButtonElement;
        brushColor = button.dataset.color ?? brushColor;
        colorSwatches.forEach((swatch) => {
          swatch.classList.remove("active", "ring-2", "ring-amber-500");
        });
        button.classList.add("active", "ring-2", "ring-amber-500");
      };

      const handleSizeClick = (event: Event): void => {
        const button = event.currentTarget as HTMLButtonElement;
        brushSize = Number(button.dataset.size ?? brushSize);
        sizePresets.forEach((preset) => {
          preset.classList.remove(
            "active-size",
            "bg-stone-100",
            "ring-1",
            "ring-stone-200",
          );
        });
        button.classList.add(
          "active-size",
          "bg-stone-100",
          "ring-1",
          "ring-stone-200",
        );
      };

      resizeCanvas();
      const resizeObserver = new ResizeObserver(scheduleResizeCanvas);
      resizeObserver.observe(document.documentElement);
      resizeObserver.observe(document.body);

      toggleBtn.addEventListener("click", handleToggle);
      clearBtn.addEventListener("click", handleClear);
      canvas.addEventListener("pointerdown", startDrawing);
      canvas.addEventListener("pointermove", draw);
      canvas.addEventListener("pointerup", stopDrawing);
      canvas.addEventListener("pointercancel", stopDrawing);
      window.addEventListener("resize", scheduleResizeCanvas);
      window.addEventListener("scroll", scheduleCanvasPositionUpdate, {
        passive: true,
      });
      colorSwatches.forEach((swatch) => {
        swatch.addEventListener("click", handleColorClick);
      });
      sizePresets.forEach((preset) => {
        preset.addEventListener("click", handleSizeClick);
      });

      return () => {
        if (resizeRafId) cancelAnimationFrame(resizeRafId);
        if (scrollRafId) cancelAnimationFrame(scrollRafId);
        resizeObserver.disconnect();
        toggleBtn.removeEventListener("click", handleToggle);
        clearBtn.removeEventListener("click", handleClear);
        canvas.removeEventListener("pointerdown", startDrawing);
        canvas.removeEventListener("pointermove", draw);
        canvas.removeEventListener("pointerup", stopDrawing);
        canvas.removeEventListener("pointercancel", stopDrawing);
        window.removeEventListener("resize", scheduleResizeCanvas);
        window.removeEventListener("scroll", scheduleCanvasPositionUpdate);
        colorSwatches.forEach((swatch) => {
          swatch.removeEventListener("click", handleColorClick);
        });
        sizePresets.forEach((preset) => {
          preset.removeEventListener("click", handleSizeClick);
        });
      };
    };
    const cleanupDoodle = initializeDoodle();

    // Animate cards after hero text animation completes
    setTimeout(() => {
      (window as any).animateCardsOnLoad?.();
    }, 1000);

    return cleanupDoodle;
  }, []);

  return (
    <LayoutGroup id="upload-shared-polaroid">
      {/* Doodle Canvas */}
      <div className="pointer-events-none fixed inset-0 z-40 touch-none overflow-hidden">
        <canvas
          ref={canvasRef}
          id="doodle-canvas"
          className="pointer-events-none absolute top-0 left-0 opacity-100 transition-opacity duration-300 will-change-transform"
        />
      </div>

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
        className="px-wall-margin relative -m-15 flex min-h-screen flex-col items-center justify-center pt-0 pb-12"
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
                className="polaroid-card absolute flex origin-center flex-col bg-white p-2.5 pb-14"
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
                <div className="relative grow overflow-hidden bg-stone-50">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="h-full w-full object-cover grayscale-0"
                    unoptimized
                  />
                </div>
                <div className="mt-2 flex h-11.5 flex-col items-center justify-center">
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

      {/* About Me Section */}
      <section
        className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white px-12 py-20 dark:bg-stone-950"
        id="about"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Draggable About Polaroid */}
          <div
            className="about-polaroid-card absolute flex origin-center cursor-grab flex-col bg-white p-2.5 pb-16 shadow-[0_28px_90px_rgba(0,0,0,0.24)] ring-1 ring-black/5 active:cursor-grabbing"
            style={{
              width: "380px",
              height: "600px",
              transform: "translate(-50%, -50%) rotate(0.5deg)",
              zIndex: 10,
              pointerEvents: "auto",
              top: "50%",
              left: "50%",
            }}
          >
            <div className="relative grow overflow-hidden bg-stone-50">
              <Image
                src="/me.JPG"
                alt="Howa"
                fill
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <div className="mt-2 flex h-11.5 flex-col items-center justify-center">
              <span className="font-metadata-caps mb-1 text-[8px] tracking-widest text-amber-600 uppercase">
                Portrait
              </span>
              <span className="font-sans text-[1.1rem] font-black tracking-[-0.06em] text-stone-900 uppercase">
                Howa
              </span>
            </div>
          </div>

          {/* Scrolling Text Below Polaroid */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 overflow-hidden py-12">
            <style>{`
              @keyframes scroll-rtl {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              
              .scrolling-text {
                display: flex;
                white-space: nowrap;
                width: max-content;
                min-width: 200%;
                animation: scroll-rtl 32s linear infinite;
                font-size: clamp(4rem, 9vw, 9rem);
                line-height: 0.92;
                letter-spacing: -0.08em;
              }
              
              .scrolling-text span {
                padding-right: 6rem;
              }
            `}</style>
            <div className="scrolling-text items-center">
              <span className="font-sans font-black text-stone-900 uppercase opacity-90 dark:text-stone-100">
                I photograph to show the ordinary differently, using details,
                emotion, and abstraction to turn everyday scenes into meaningful
                stories.
              </span>
              <span className="font-sans font-black text-stone-900 uppercase opacity-90 dark:text-stone-100">
                I photograph to show the ordinary differently, using details,
                emotion, and abstraction to turn everyday scenes into meaningful
                stories.
              </span>
              <span className="font-sans font-black text-stone-900 uppercase opacity-90 dark:text-stone-100">
                I photograph to show the ordinary differently, using details,
                emotion, and abstraction to turn everyday scenes into meaningful
                stories.
              </span>
              <span className="font-sans font-black text-stone-900 uppercase opacity-90 dark:text-stone-100">
                I photograph to show the ordinary differently, using details,
                emotion, and abstraction to turn everyday scenes into meaningful
                stories.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Participation wrapper (animation stage) */}
      <div ref={wrapperRef} className="relative z-10 w-full">
        {uploadPreviewUrl ? (
          <motion.button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="group absolute z-40 flex cursor-pointer flex-col bg-white p-2.5 pb-14 shadow-[0_28px_90px_rgba(0,0,0,0.22)] ring-1 ring-black/5"
            style={{
              ...floatingPolaroidStyle,
              opacity: stageGeometry.start ? 1 : 0,
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="relative grow overflow-hidden bg-stone-50">
              <Image
                src={uploadPreviewUrl}
                alt="Uploaded preview"
                fill
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-2 flex h-11.5 flex-col items-center justify-center">
              <span className="font-metadata-caps mb-1 text-[8px] tracking-widest text-amber-600 uppercase">
                New Perspective
              </span>
              <span className="font-sans text-[1.1rem] font-normal tracking-[-0.04em] text-stone-500 uppercase transition-colors duration-500 group-hover:text-stone-900">
                {contributionTitle}
              </span>
            </div>
          </motion.button>
        ) : null}

        <section
          className="relative flex min-h-screen w-full items-center justify-center overflow-hidden border-t border-stone-100 bg-white px-12 py-20 dark:border-stone-800 dark:bg-stone-950"
          id="your-turn"
        >
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-70">
            <h2 className="text-center font-sans text-[clamp(7rem,18vw,18rem)] leading-[0.8] font-black -tracking-widest text-stone-900 uppercase dark:text-stone-100">
              Your Turn
            </h2>
          </div>

          <div
            ref={yourTurnPlaceholderRef}
            className="pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-0"
            aria-hidden="true"
          />

          {!uploadPreviewUrl ? (
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="group relative z-10 flex h-[520px] w-[520px] max-w-[82vw] cursor-pointer flex-col bg-white p-2.5 pb-14 shadow-[0_28px_90px_rgba(0,0,0,0.22)] ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.01] hover:rotate-1 active:scale-[0.99]"
            >
              <div className="relative grow overflow-hidden bg-stone-50">
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03),transparent_55%)]">
                  <span className="material-symbols-outlined text-6xl text-stone-200 transition-colors duration-500 group-hover:text-amber-500/60">
                    add_photo_alternate
                  </span>
                </div>
              </div>

              <div className="mt-2 flex h-11.5 flex-col items-center justify-center">
                <span className="font-metadata-caps mb-1 text-[8px] tracking-widest text-amber-600 uppercase">
                  New Perspective
                </span>
                <span className="font-sans text-[1.1rem] font-normal tracking-[-0.04em] text-stone-500 uppercase transition-colors duration-500 group-hover:text-stone-900">
                  Click to contribute
                </span>
              </div>
            </button>
          ) : null}

          <input
            ref={uploadInputRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              const nextUrl = URL.createObjectURL(file);
              setUploadPreviewUrl(nextUrl);
              setUploadFile(file);
              setContributionTitle("What do you see?");
              setPendingTitle("");
              setTitleModalOpen(true);
              setContactRevealStarted(false);
              setContactStatus("idle");
              setContactMessage("");
            }}
          />
        </section>

        <section
          ref={contactSectionRef}
          className={`relative w-full overflow-hidden bg-white px-6 transition-[max-height,padding,opacity] duration-700 ease-out dark:bg-stone-950 ${
            contactRevealStarted
              ? "max-h-[1400px] py-16 opacity-100"
              : "max-h-0 py-0 opacity-0"
          }`}
          id="contact"
          aria-hidden={!contactRevealStarted}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
            <motion.div
              className="absolute top-8 left-1/2 -translate-x-1/2 font-sans text-[clamp(5rem,20vw,16rem)] leading-[0.8] font-black tracking-[-0.07em] text-stone-900 uppercase"
              initial={false}
              animate={{
                opacity: contactRevealStarted ? 0.72 : 0,
                y: contactRevealStarted ? 0 : 18,
              }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              GET IN
            </motion.div>
            <motion.div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 font-sans text-[clamp(5rem,20vw,16rem)] leading-[0.8] font-black tracking-[-0.07em] text-stone-900 uppercase"
              initial={false}
              animate={{
                opacity: contactRevealStarted ? 0.72 : 0,
                y: contactRevealStarted ? 0 : 18,
              }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.12 }}
            >
              TOUCH
            </motion.div>
          </div>

          <div className="relative mx-auto grid w-full max-w-6xl items-start gap-12 md:grid-cols-[340px_1fr]">
            <div className="justify-self-center md:justify-self-start">
              <div
                ref={contactPlaceholderRef}
                className="pointer-events-none h-[320px] w-[300px] rotate-[-3deg] opacity-0"
                aria-hidden="true"
              />
            </div>

            <motion.form
              className="rounded-[24px] border border-stone-300/85 bg-white/78 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-sm md:p-8 dark:border-stone-700 dark:bg-stone-950/70"
              onSubmit={handleContactSubmit}
              initial={false}
              animate={{
                opacity: contactRevealStarted ? 1 : 0,
                y: contactRevealStarted ? 0 : 28,
              }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.7 }}
            >
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-metadata-caps text-[10px] tracking-[0.32em] text-amber-600 uppercase">
                    Collaborate
                  </p>
                  <h3 className="font-section-cursive mt-1 text-[clamp(2.8rem,8vw,5.2rem)] leading-[0.86] text-stone-600 dark:text-stone-200">
                    Connect
                  </h3>
                </div>
              </div>

              <div className="grid gap-8">
                <label className="space-y-2">
                  <span className="font-metadata-caps text-[10px] tracking-[0.28em] text-stone-400 uppercase">
                    Name
                  </span>
                  <input
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-none border border-stone-300/90 bg-white/35 px-5 py-4 font-sans text-[2.1rem] leading-[1] font-semibold tracking-[-0.03em] text-slate-700 transition-colors outline-none placeholder:text-slate-500 focus:border-amber-500/70 dark:border-stone-700 dark:bg-stone-950/50 dark:text-stone-200"
                  />
                </label>

                <label className="space-y-2">
                  <span className="font-metadata-caps text-[10px] tracking-[0.28em] text-stone-400 uppercase">
                    Note
                  </span>
                  <textarea
                    value={contactNote}
                    onChange={(event) => setContactNote(event.target.value)}
                    placeholder="A short note about collaboration or anything else"
                    rows={5}
                    className="w-full resize-none rounded-none border border-stone-300/90 bg-white/35 px-5 py-4 font-sans text-[2rem] leading-[1.2] font-semibold tracking-[-0.03em] text-slate-700 transition-colors outline-none placeholder:text-slate-500 focus:border-amber-500/70 dark:border-stone-700 dark:bg-stone-950/50 dark:text-stone-200"
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
                  {contactStatus === "sent"
                    ? "Message sent."
                    : "Your uploaded photo will be attached automatically."}
                </p>

                <button
                  type="submit"
                  disabled={!canSendContact || contactStatus === "sending"}
                  className="font-metadata-caps rounded-full border border-stone-300 bg-white/80 px-9 py-4 text-[12px] tracking-[0.34em] text-stone-600 uppercase transition-transform duration-200 hover:-translate-y-0.5 hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                >
                  {contactStatus === "sending" ? "Sending" : "Send  ->"}
                </button>
              </div>

              {contactMessage ? (
                <p
                  className={`mt-3 font-sans text-sm ${
                    contactStatus === "sent"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {contactMessage}
                </p>
              ) : null}
            </motion.form>
          </div>
        </section>
      </div>

      {titleModalOpen ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <motion.div
            initial={{ y: 18, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm rounded-2xl border border-stone-200/60 bg-white/95 p-7 shadow-[0_12px_48px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:border-stone-800/60 dark:bg-stone-950/95"
          >
            <p className="font-metadata-caps text-[9px] tracking-[0.28em] text-amber-600 uppercase">
              Optional
            </p>
            <h3 className="font-section-cursive mt-1 text-[2.4rem] leading-[1] text-stone-900 dark:text-stone-100">
              Name this
            </h3>
            <p className="mt-3 font-sans text-[13px] leading-relaxed text-stone-500 dark:text-stone-400">
              Leave empty for &quot;What do you see?&quot;
            </p>

            <input
              value={pendingTitle}
              onChange={(event) => setPendingTitle(event.target.value)}
              placeholder="Type a title"
              className="mt-5 w-full rounded-lg border border-stone-200/70 bg-white/50 px-4 py-2.5 font-sans text-sm text-stone-900 transition-all outline-none placeholder:text-stone-400 focus:border-amber-400/50 focus:bg-white dark:border-stone-700/70 dark:bg-stone-950/50 dark:text-stone-100 dark:focus:border-amber-500/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const trimmedTitle = pendingTitle.trim();
                  beginContactReveal(trimmedTitle || "What do you see?");
                }
              }}
            />

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                className="font-metadata-caps rounded-lg border border-stone-200/70 px-4 py-2 text-[9px] tracking-[0.24em] text-stone-600 uppercase transition-all hover:border-stone-400/70 hover:bg-stone-50/50 dark:border-stone-700/70 dark:text-stone-300 dark:hover:border-stone-600/70"
                onClick={() => {
                  setContributionTitle("What do you see?");
                  setPendingTitle("");
                  beginContactReveal("What do you see?");
                }}
              >
                Skip
              </button>
              <button
                type="button"
                className="font-metadata-caps rounded-lg bg-stone-900 px-4 py-2 text-[9px] tracking-[0.24em] text-white uppercase transition-all hover:bg-stone-800 active:scale-95 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
                onClick={() => {
                  const trimmedTitle = pendingTitle.trim();
                  beginContactReveal(trimmedTitle || "What do you see?");
                }}
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}

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
      <div className="fixed right-8 bottom-8 z-50 flex flex-col items-end gap-4">
        {/* Doodle Toolbar (Visible when active) */}
        <div
          className="hidden translate-y-4 transform flex-col gap-4 rounded-2xl border border-stone-200 bg-white/90 p-4 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-300"
          id="doodle-toolbar"
        >
          {/* Color Presets */}
          <div className="flex flex-col gap-2">
            <span className="font-metadata-caps text-[8px] tracking-widest text-stone-400 uppercase">
              Color
            </span>
            <div className="grid grid-cols-8 gap-2">
              <button
                className="color-swatch active h-6 w-6 cursor-pointer rounded-full border-2 border-white shadow-sm ring-2 ring-amber-500 transition-transform hover:scale-110"
                data-color="#f59e0b"
                style={{ backgroundColor: "#f59e0b" }}
                title="Orange"
              />
              <button
                className="color-swatch h-6 w-6 cursor-pointer rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                data-color="#ef4444"
                style={{ backgroundColor: "#ef4444" }}
                title="Red"
              />
              <button
                className="color-swatch h-6 w-6 cursor-pointer rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                data-color="#ec4899"
                style={{ backgroundColor: "#ec4899" }}
                title="Pink"
              />
              <button
                className="color-swatch h-6 w-6 cursor-pointer rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                data-color="#06b6d4"
                style={{ backgroundColor: "#06b6d4" }}
                title="Cyan"
              />
              <button
                className="color-swatch h-6 w-6 cursor-pointer rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                data-color="#22c55e"
                style={{ backgroundColor: "#22c55e" }}
                title="Green"
              />
              <button
                className="color-swatch h-6 w-6 cursor-pointer rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                data-color="#d946ef"
                style={{ backgroundColor: "#d946ef" }}
                title="Magenta"
              />
              <button
                className="color-swatch h-6 w-6 cursor-pointer rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                data-color="#6366f1"
                style={{ backgroundColor: "#6366f1" }}
                title="Indigo"
              />
              <button
                className="color-swatch h-6 w-6 cursor-pointer rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                data-color="#1c1b1b"
                style={{ backgroundColor: "#1c1b1b" }}
                title="Black"
              />
            </div>
          </div>

          {/* Brush Size Presets */}
          <div className="flex flex-col gap-2">
            <span className="font-metadata-caps text-[8px] tracking-widest text-stone-400 uppercase">
              Size
            </span>
            <div className="flex items-center justify-center gap-3">
              <button
                className="size-preset flex cursor-pointer items-center justify-center rounded p-1 transition-colors hover:bg-stone-100"
                data-size="2"
                title="Small"
              >
                <div className="h-1 w-1 rounded-full bg-stone-600" />
              </button>
              <button
                className="size-preset active-size flex items-center justify-center rounded bg-stone-100 p-1 ring-1 ring-stone-200"
                data-size="5"
                title="Medium"
              >
                <div className="h-2 w-2 rounded-full bg-stone-600" />
              </button>
              <button
                className="size-preset flex cursor-pointer items-center justify-center rounded p-1 transition-colors hover:bg-stone-100"
                data-size="10"
                title="Large"
              >
                <div className="h-3 w-3 rounded-full bg-stone-600" />
              </button>
            </div>
          </div>
          <hr className="border-stone-100" />

          {/* Actions */}
          <button
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-stone-500 transition-colors hover:bg-red-50 hover:text-red-500"
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
          className="group flex items-center gap-3 rounded-full border border-stone-200 bg-white/80 px-6 py-3 shadow-lg backdrop-blur-xl transition-all hover:border-amber-400 active:scale-95"
          id="doodle-toggle-btn"
        >
          <span className="material-symbols-outlined text-amber-600 transition-transform group-hover:rotate-12">
            draw
          </span>
          <span className="font-metadata-caps text-[10px] tracking-[0.3em] text-stone-500 uppercase transition-colors group-hover:text-amber-700">
            Doodle Mode
          </span>
        </button>
      </div>
    </LayoutGroup>
  );
}
