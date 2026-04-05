"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hoveringLink, setHoveringLink] = useState(false);

  const cursorX = useSpring(0, { stiffness: 500, damping: 40 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 40 });
  const trailX = useSpring(0, { stiffness: 200, damping: 30 });
  const trailY = useSpring(0, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    if (isTouchDevice) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      trailX.set(e.clientX);
      trailY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[data-cursor-hover]")
      ) {
        setHoveringLink(true);
      }
    };

    const handleOut = () => setHoveringLink(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mouseout", handleOut);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mouseout", handleOut);
    };
  }, [cursorX, cursorY, trailX, trailY, visible]);

  if (!visible) return null;

  return (
    <>
      {/* Main dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        style={{ x: cursorX, y: cursorY }}
      >
        <motion.div
          className="rounded-full -translate-x-1/2 -translate-y-1/2"
          animate={{
            width: hoveringLink ? 48 : 10,
            height: hoveringLink ? 48 : 10,
            backgroundColor: hoveringLink
              ? "#7cacf8"
              : "#ffffff",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </motion.div>
      {/* Trail ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: trailX, y: trailY }}
      >
        <motion.div
          className="rounded-full -translate-x-1/2 -translate-y-1/2 border"
          animate={{
            width: hoveringLink ? 64 : 36,
            height: hoveringLink ? 64 : 36,
            borderColor: hoveringLink
              ? "rgba(59, 130, 246, 0.6)"
              : "rgba(124, 172, 248, 0.3)",
            opacity: hoveringLink ? 1 : 0.5,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </motion.div>
    </>
  );
}
