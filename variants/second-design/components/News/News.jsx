"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NEWS } from "../../data/news.mjs";
import { NEWS_CAROUSEL, wrapIndex } from "../../lib/news-carousel-layout.mjs";
import styles from "./News.module.css";
const PREVIEW_WIDTHS = [NEWS_CAROUSEL.imageWidth, 136, 98, 43, ...NEWS_CAROUSEL.smallWidths];
export default function News() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const activeRef = useRef(0);
  const reducedRef = useRef(false);
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const [instant, setInstant] = useState(false);

  // Same navigation as Credo-web-variants' NewsSection: the engine animates, React swaps the caption.
  const navigate = useCallback((amount, immediately = false) => {
    const next = wrapIndex(activeRef.current + amount, NEWS.length);
    activeRef.current = next;
    setActive(next);
    setInstant(immediately);
    engineRef.current?.move(amount, immediately);
    return next;
  }, []);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => {
      reducedRef.current = motion.matches;
      engineRef.current?.setReduced(motion.matches);
    };
    read();
    motion.addEventListener("change", read);
    return () => motion.removeEventListener("change", read);
  }, []);

  // Load the engine and images shortly before the section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNear(true);
        observer.disconnect();
      }
    }, {
      rootMargin: "1500px 0px",
      threshold: 0
    });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!near) return;
    let disposed = false;
    let engine;
    import("../../lib/create-news-carousel.mjs").then(({
      createNewsCarousel
    }) => {
      if (disposed || !canvasRef.current) return;
      engine = createNewsCarousel({
        canvas: canvasRef.current,
        items: NEWS,
        active: activeRef.current,
        reduced: reducedRef.current,
        onSelect: amount => navigate(amount)
      });
      engineRef.current = engine;
    });
    return () => {
      disposed = true;
      engine?.dispose();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [near, navigate]);
  function onKeyDown(event) {
    let amount;
    if (event.key === "ArrowRight") amount = 1;
    if (event.key === "ArrowLeft") amount = -1;
    if (event.key === "Home") amount = -activeRef.current;
    if (event.key === "End") amount = NEWS.length - 1 - activeRef.current;
    if (amount === undefined) return;
    event.preventDefault();
    navigate(amount, true);
  }
  return <section ref={sectionRef} className={styles.section} id="news" aria-labelledby="news-title" data-instant={instant}>
      <div className={styles.head}>
        <h2 id="news-title" className={styles.title}>
          სიახლეები
        </h2>
        <a className={styles.more} href="https://credobank.ge/media-and-blog/media" target="_blank" rel="noopener noreferrer">
          სრულად
          <img src="/design-two/icons/arrow-right-negative.svg" width={20} height={20} alt="" />
        </a>
      </div>

      <div className={styles.carousel} role="group" aria-roledescription="კარუსელი" aria-label="კრედოს სიახლეები — ისრებით გადართე" tabIndex={0} onKeyDown={onKeyDown}>
        <div className={styles.stage}>
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
          {/* Static layout until the canvas has its images */}
          <div className={styles.preview} aria-hidden="true">
            {PREVIEW_WIDTHS.map((width, column) => <div key={column} className={styles.previewCard} style={{
            width
          }}>
                <img src={NEWS[wrapIndex(active + column, NEWS.length)].image} alt="" />
              </div>)}
          </div>
        </div>

        <div className={styles.details}>
          {NEWS.map((story, i) => <article key={story.id} className={styles.detail} data-active={i === active} aria-hidden={i !== active} inert={i !== active}>
              {story.date && <p className={styles.date}>{story.date}</p>}
              <h3 className={styles.storyTitle}>
                {story.url ? <a href={story.url} target="_blank" rel="noopener noreferrer">
                    {story.title}
                  </a> : story.title}
              </h3>
              <p className={styles.description}>{story.description}</p>
            </article>)}
        </div>
      </div>

      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
        სიახლე {active + 1} / {NEWS.length}: {NEWS[active].title}
      </p>
    </section>;
}
