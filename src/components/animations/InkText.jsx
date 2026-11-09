"use client";

import { useEffect, useRef } from "react";
import { inkIn, inkReset } from "@/lib/ink";

/*
 * A heading that inks in (see lib/ink).
 *   play undefined  → the global TextReveal driver inks it once on scroll;
 *                     same as putting the `ink` class on any element.
 *   play true/false → controlled: inks in when it turns true, hides again
 *                     when it turns false (e.g. a scroll that re-unrolls).
 */
export default function InkText({ as: Tag = "span", children, className = "", play, delay = 0 }) {
  const ref = useRef(null);
  const controlled = play !== undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el || !controlled) return undefined;
    if (!play) {
      inkReset(el);
      return undefined;
    }
    return inkIn(el, { delay });
  }, [controlled, play, delay]);

  return (
    <Tag ref={ref} data-ink={controlled ? "manual" : undefined} className={`ink ${className}`}>
      {children}
    </Tag>
  );
}
