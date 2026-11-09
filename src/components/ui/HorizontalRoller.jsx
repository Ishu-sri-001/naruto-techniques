"use client";

import { useEffect, useRef, useState } from "react";
import ScrollRoller from "@/components/ui/ScrollRoller";

/*
 * ScrollRoller laid on its side, for a scroll that unrolls vertically. Fills
 * its box: the box's height is the rod's thickness and its width the rod's
 * length (knobs included). The rod's drawn length is fitted to that ratio so
 * it keeps its natural proportions at any width.
 */
export default function HorizontalRoller({ className = "" }) {
  const boxRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const length = size.h ? Math.round((26 * size.w) / size.h) : 400;

  return (
    <div ref={boxRef} aria-hidden="true" className={`pointer-events-none ${className}`}>
      {size.w > 0 && (
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${size.h}px`,
            height: `${size.w}px`,
            transform: "translate(-50%, -50%) rotate(90deg)",
          }}
        >
          <ScrollRoller
            length={length}
            className="h-full w-full drop-shadow-[-0.3rem_0.1rem_0.3rem_color-mix(in_srgb,var(--ink)_70%,transparent)]"
          />
        </div>
      )}
    </div>
  );
}
