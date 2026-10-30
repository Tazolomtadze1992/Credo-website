"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow } from "./ConsumerMenu";
import styles from "./Header.module.css";
export const SPACE_LINKS = [{
  label: "რჩეული",
  href: "/rcheuli"
}, {
  label: "ემიგრანტებისთვის",
  href: "/emigrants"
}, {
  label: "ექსპატებისთვის",
  href: "/expats"
}];

// Small hover dropdown under its own trigger; the shared Radix viewport is sized for the full consumer panel
export default function SpaceMenu({
  className,
  children
}) {
  const [open, setOpen] = useState(false);
  const slotRef = useRef(null);
  const closeTimer = useRef(undefined);
  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  useEffect(() => {
    if (!open) return;
    const onKeyDown = event => {
      if (event.key !== "Escape") return;
      setOpen(false);
      slotRef.current?.querySelector("button")?.focus({
        preventScroll: true
      });
    };
    const onPointerDown = event => {
      if (!slotRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  return <li ref={slotRef} className={`${styles.navSlot} ${styles.spaceSlot}`} onPointerEnter={event => event.pointerType === "mouse" && show()} onPointerLeave={event => event.pointerType === "mouse" && hide()} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
      <button className={className} data-state={open ? "open" : "closed"} aria-expanded={open} aria-controls="space-menu" onClick={() => setOpen(value => !value)}>
        {children}
      </button>
      <div id="space-menu" className={styles.spaceMenu} data-open={open} inert={!open ? true : undefined}>
        <ul>
          {SPACE_LINKS.map(link => <li key={link.label}>
              <a className="site-product-link" href={link.href} onClick={() => setOpen(false)}>
                <span className="site-product-title">
                  {link.label}
                  <Arrow />
                </span>
              </a>
            </li>)}
        </ul>
      </div>
    </li>;
}
