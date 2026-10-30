"use client";

import { useEffect, useRef } from "react";
import { MOTIONS, MOTION_DURATION } from "./motions";
/**
 * Plays the Figma loops on descendants marked with data-motion while the card is hovered.
 * On leave the current 2s cycle finishes, so elements settle at rest instead of snapping back.
 */
export default function HoverMotionCard({
  className,
  children
}) {
  const ref = useRef(null);
  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = Array.from(card.querySelectorAll("[data-motion]"));
    const running = new Map();
    const enter = () => {
      if (!canHover.matches || reduced.matches) return;
      for (const el of targets) {
        const current = running.get(el);
        if (current) {
          // Re-entered while finishing its last cycle: keep looping from where it is.
          current.effect?.updateTiming({
            iterations: Infinity
          });
          continue;
        }
        const keyframes = MOTIONS[el.dataset.motion ?? ""];
        if (!keyframes) continue;
        const animation = el.animate(keyframes, {
          duration: MOTION_DURATION,
          iterations: Infinity
        });
        animation.onfinish = () => {
          animation.cancel();
          running.delete(el);
        };
        running.set(el, animation);
      }
    };
    const leave = () => {
      for (const animation of running.values()) {
        const iteration = animation.effect?.getComputedTiming().currentIteration ?? 0;
        animation.effect?.updateTiming({
          iterations: iteration + 1
        });
      }
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      for (const animation of running.values()) animation.cancel();
    };
  }, []);
  return <article ref={ref} className={className}>
      {children}
    </article>;
}
