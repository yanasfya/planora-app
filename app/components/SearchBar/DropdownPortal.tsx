"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface DropdownPortalProps {
  children: React.ReactNode;
  targetRef: React.RefObject<HTMLElement | null>;
  align?: "left" | "center" | "right";
}

export default function DropdownPortal({ children, targetRef, align = "center" }: DropdownPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, isMobile: false });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !targetRef.current) return;

    const updatePosition = () => {
      const rect = targetRef.current?.getBoundingClientRect();
      if (!rect) return;

      const isMobile = window.innerWidth < 768;
      const dropdownEl = dropdownRef.current;
      const dropdownWidth = dropdownEl?.offsetWidth || 384;

      let left: number;

      if (isMobile) {
        left = 16;
      } else {
        // Desktop positioning
        if (align === "center") {
          // Center the dropdown under the trigger
          left = rect.left + (rect.width / 2) - (dropdownWidth / 2);
        } else if (align === "right") {
          // Align to right edge
          left = rect.right - dropdownWidth;
        } else {
          // Align to left edge
          left = rect.left;
        }

        // Keep within viewport bounds
        const minLeft = 16;
        const maxLeft = window.innerWidth - dropdownWidth - 16;
        left = Math.max(minLeft, Math.min(left, maxLeft));
      }

      setPosition({
        top: rect.bottom + 8,
        left,
        isMobile,
      });
    };

    // Initial calculation
    updatePosition();

    // Recalculate after render to get accurate dropdown width
    requestAnimationFrame(updatePosition);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [mounted, targetRef, align]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.isMobile ? 16 : position.left,
        right: position.isMobile ? 16 : "auto",
        zIndex: 99999,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
