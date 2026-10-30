// Adapted from Evil Rabbit's Lifeline (MIT). See LICENSE.
"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";
const OPEN_MS = 520;
/**
 * Gentle start, soft landing — the quint curve front-loaded nearly all
 * of the travel into the first 120ms, which read as a jump.
 */ const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
/** Fraction of the viewport the expanded media may occupy. */ const FIT = 0.85;
/**
 * The clone's media. Videos mount paused, pre-seeked to the card's
 * playback position — a static frame the compositor can scale without
 * decoding — and only play once `playing` flips after the open
 * transition settles. Dismissing pauses again for the return flight.
 */ function LightboxMedia({ photo, playing, mediaTime }) {
    const videoRef = useRef(null);
    const seeded = useRef(false);
    useEffect(()=>{
        const video1 = videoRef.current;
        if (!video1) return;
        if (playing) {
            // Seek only now, stationary — a seek during the transition
            // decodes a new frame mid-flight and visibly swaps the image.
            if (!seeded.current) {
                seeded.current = true;
                if (mediaTime !== undefined) video1.currentTime = mediaTime;
            }
            video1.play().catch(()=>{
            // Autoplay rejection just leaves the poster frame showing.
            });
        } else {
            video1.pause();
        }
    }, [
        playing,
        mediaTime
    ]);
    if (!photo.video) {
        return(// eslint-disable-next-line @next/next/no-img-element
        <img src={photo.src} alt={photo.alt} className="block h-full w-full object-cover"/>);
    }
    return <video ref={videoRef} src={photo.video} poster={photo.src} muted loop playsInline preload="auto" aria-label={photo.alt} className="block h-full w-full object-cover"/>;
}
function computeTarget(start, nativeWidth) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const aspect = start.h / start.w;
    const width = Math.min(nativeWidth || 1200, vw * FIT, vh * FIT / aspect);
    const height = width * aspect;
    return {
        left: (vw - width) / 2,
        top: (vh - height) / 2,
        width,
        height
    };
}
/**
 * Expands a floating card's media from its spot on the timeline to the
 * center of the screen and back — a FLIP animation on a fixed clone
 * portaled to <body> (the track is transformed, so fixed positioning
 * inside it would break). The original card stays in layout, hidden,
 * and is re-measured on dismiss so the media returns wherever the card
 * now is, even if the timeline moved.
 */ export function LifelineLightbox({ photo, rotate, start, getHome, onClosed }) {
    const target = useRef(null);
    if (target.current === null) target.current = computeTarget(start, photo.nativeWidth);
    const { left, top, width, height } = target.current;
    const figureRef = useRef(null);
    const reduceMotion = useRef(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches).current;
    // Center-anchored FLIP: rotation and scale about the center match
    // how the card itself is transformed, so the first frame is
    // pixel-identical to the card underneath.
    const toTransform = useCallback((home)=>`translate(${home.cx - (left + width / 2)}px, ${home.cy - (top + height / 2)}px) scale(${home.w / width}) rotate(${rotate}deg)`, [
        left,
        top,
        width,
        height,
        rotate
    ]);
    const [entered, setEntered] = useState(reduceMotion);
    const [transform, setTransform] = useState(()=>reduceMotion ? "none" : toTransform(start));
    const closing = useRef(false);
    // Playback waits for the open transition to finish — a playing
    // video decodes frames while the transform animates and drops
    // transition frames on mobile; a paused, pre-seeked frame is a
    // static layer and animates cheaply.
    const [settled, setSettled] = useState(reduceMotion);
    // Safety net if transitionend never fires for the open.
    useEffect(()=>{
        if (reduceMotion) return;
        const timeout = window.setTimeout(()=>{
            if (!closing.current) setSettled(true);
        }, OPEN_MS + 80);
        return ()=>window.clearTimeout(timeout);
    }, [
        reduceMotion
    ]);
    // FLIP: first paint sits over the card, next frame eases to center.
    useLayoutEffect(()=>{
        if (reduceMotion) return;
        let inner = 0;
        const outer = requestAnimationFrame(()=>{
            inner = requestAnimationFrame(()=>{
                setEntered(true);
                setTransform("translate(0px, 0px) scale(1) rotate(0deg)");
            });
        });
        return ()=>{
            cancelAnimationFrame(outer);
            cancelAnimationFrame(inner);
        };
    }, [
        reduceMotion
    ]);
    // No gesture may pan while the lightbox is up — iOS otherwise
    // rubber-bands the body behind the fixed overlay and can leave the
    // whole page stuck offset after dismiss. React's root touch
    // listeners are passive, so this needs a native non-passive one.
    const rootRef = useRef(null);
    useEffect(()=>{
        const root = rootRef.current;
        if (!root) return;
        const block = (event)=>event.preventDefault();
        root.addEventListener("touchmove", block, {
            passive: false
        });
        return ()=>root.removeEventListener("touchmove", block);
    }, []);
    // The press that opens the card dispatches one more click right
    // after pointerup — by then the clone is mounted underneath the
    // pointer and would dismiss itself. Swallow exactly that click;
    // every later click dismisses normally.
    useEffect(()=>{
        const swallow = (event)=>{
            event.stopPropagation();
            event.preventDefault();
        };
        window.addEventListener("click", swallow, {
            capture: true,
            once: true
        });
        const timeout = window.setTimeout(()=>{
            window.removeEventListener("click", swallow, {
                capture: true
            });
        }, 500);
        return ()=>{
            window.clearTimeout(timeout);
            window.removeEventListener("click", swallow, {
                capture: true
            });
        };
    }, []);
    const dismiss = useCallback(()=>{
        if (closing.current) return;
        closing.current = true;
        if (reduceMotion) {
            onClosed();
            return;
        }
        setSettled(false); // freeze the video so the return flight is cheap
        setEntered(false);
        setTransform(toTransform(getHome() ?? start));
        // transitionend is the primary signal; this is the safety net.
        window.setTimeout(onClosed, OPEN_MS + 120);
    }, [
        reduceMotion,
        onClosed,
        toTransform,
        getHome,
        start
    ]);
    useEffect(()=>{
        const onKeyDown = (event)=>{
            if (event.key === "Escape") dismiss();
            if (event.key === "Tab") {event.preventDefault();rootRef.current?.querySelector("button")?.focus();}
        };
        const previous=document.activeElement;const page=document.querySelector(".history-page");if(page)page.inert=true;rootRef.current?.focus({preventScroll:true});
        window.addEventListener("keydown", onKeyDown);
        return ()=>{window.removeEventListener("keydown", onKeyDown);if(page)page.inert=false;previous?.focus?.({preventScroll:true});};
    }, [
        dismiss
    ]);
    return createPortal(<div ref={rootRef} tabIndex={-1} className="lf-scope history-lightbox fixed inset-0 z-[999] touch-none overscroll-contain" role="dialog" aria-modal="true" aria-label={photo.alt} // The portal lives under <body>, but React events still bubble up
    // the component tree — without this, a backdrop press would reach
    // the card's drag handlers and the track's scrubber.
    onPointerDown={(event)=>event.stopPropagation()} onPointerMove={(event)=>event.stopPropagation()} onPointerUp={(event)=>event.stopPropagation()} onClick={(event)=>event.stopPropagation()}>
      <div className={cn("absolute inset-0 cursor-zoom-out bg-black/70 transition-opacity", entered ? "opacity-100" : "opacity-0")} // Synced to the media's travel — a faster fade left the clone
    // flying over an undimmed page at the end of the dismiss.
    style={{
        transitionDuration: `${OPEN_MS}ms`
    }} onClick={dismiss}/>
      <figure ref={figureRef} className="absolute cursor-zoom-out overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/10 dark:ring-white/15" style={{
        left,
        top,
        width,
        height,
        transform,
        transformOrigin: "center",
        transition: reduceMotion ? undefined : `transform ${OPEN_MS}ms ${EASE}`,
        // Promoted for the whole flight — mobile otherwise
        // re-rasterizes the shadowed, corner-clipped media mid-scale.
        willChange: "transform"
    }} onClick={dismiss} onTransitionEnd={(event)=>{
        if (event.propertyName !== "transform") return;
        if (closing.current) onClosed();
        else setSettled(true);
    }}>
        <LightboxMedia photo={photo} playing={settled} mediaTime={start.mediaTime}/>
      </figure>
      <button className="history-lightbox-close" onClick={dismiss} aria-label="ფოტოს დახურვა">×</button>
      <p className="history-lightbox-caption">{photo.alt}</p>
    </div>, document.body);
}
