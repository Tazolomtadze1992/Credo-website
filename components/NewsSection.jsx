'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HOME_NEWS } from '../data/home-news.mjs';
import { wrapIndex } from '../lib/news-carousel-layout.mjs';

export default function NewsSection() {
  const sectionRef = useRef(null), canvasRef = useRef(null), engineRef = useRef(null);
  const scrollerRef = useRef(null), activeRef = useRef(0), reducedRef = useRef(false);
  const captionLinks = useRef([]), dialogRef = useRef(null), returnFocus = useRef(null);
  const [active, setActive] = useState(0), [near, setNear] = useState(false);
  const [mobile, setMobile] = useState(false), [reduced, setReduced] = useState(false);
  const [instant, setInstant] = useState(false), [article, setArticle] = useState(null);

  const navigate = useCallback((amount, immediately = false) => {
    const next = wrapIndex(activeRef.current + amount, HOME_NEWS.length);
    activeRef.current = next; setActive(next); setInstant(immediately);
    if (window.matchMedia('(max-width:639px)').matches) {
      const scroller = scrollerRef.current;
      scroller?.scrollTo({ left: next * (scroller.clientWidth - 16), behavior: immediately || reducedRef.current ? 'instant' : 'smooth' });
    } else engineRef.current?.move(amount, immediately);
    return next;
  }, []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width:639px)');
    const forced = process.env.NODE_ENV === 'development' && new URLSearchParams(window.location.search).get('newsMotion') === 'reduce';
    const read = () => { reducedRef.current = motion.matches || forced; setReduced(reducedRef.current); setMobile(small.matches); };
    read(); motion.addEventListener('change', read); small.addEventListener('change', read);
    return () => { motion.removeEventListener('change', read); small.removeEventListener('change', read); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { rootMargin: '1500px 0px', threshold: 0 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!near || mobile) return;
    let disposed = false, engine;
    import('../lib/create-news-carousel.mjs').then(({ createNewsCarousel }) => {
      if (disposed) return;
      engine = createNewsCarousel({ canvas: canvasRef.current, items: HOME_NEWS, active: activeRef.current, reduced: reducedRef.current, onSelect: amount => navigate(amount) });
      engineRef.current = engine;
    });
    return () => { disposed = true; engine?.dispose(); if (engineRef.current === engine) engineRef.current = null; };
  }, [near, mobile, navigate]);

  useEffect(() => { engineRef.current?.setReduced(reduced); }, [reduced]);

  useEffect(() => {
    if (!mobile) return;
    const scroller = scrollerRef.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const step = scroller.clientWidth - 16;
      if (step <= 0) return;
      const progress = scroller.scrollLeft / step;
      [...scroller.children].forEach((card, i) => card.style.setProperty('--news-progress', Math.max(-1, Math.min(1, i - progress)).toFixed(5)));
      const next = Math.max(0, Math.min(HOME_NEWS.length - 1, Math.round(progress)));
      if (next !== activeRef.current) { activeRef.current = next; setActive(next); }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const restore = () => { scroller.scrollTo({ left: activeRef.current * (scroller.clientWidth - 16), behavior: 'instant' }); update(); };
    const observer = new ResizeObserver(restore); observer.observe(scroller);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    scroller.addEventListener('scrollend', update);
    restore();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); scroller.removeEventListener('scroll', onScroll); scroller.removeEventListener('scrollend', update); };
  }, [mobile]);

  useEffect(() => { if (article && !dialogRef.current.open) dialogRef.current.showModal(); }, [article]);

  function onKeyDown(event) {
    let amount;
    if (event.key === 'ArrowRight') amount = 1;
    if (event.key === 'ArrowLeft') amount = -1;
    if (event.key === 'Home') amount = -activeRef.current;
    if (event.key === 'End') amount = HOME_NEWS.length - 1 - activeRef.current;
    if (amount === undefined) return;
    event.preventDefault();
    const next = navigate(amount, true);
    if (!mobile && event.target.closest('.news-details')) requestAnimationFrame(() => captionLinks.current[next]?.focus({ preventScroll: true }));
  }
  function openArticle(event, story) { returnFocus.current = event.currentTarget; setArticle(story); }
  const dialogStory = article || HOME_NEWS[active];

  return <>
    <section className="home-news" id="news" ref={sectionRef} aria-labelledby="news-heading" data-news-active={active} data-reduced={reduced} data-instant={instant} onKeyDown={onKeyDown}>
      <div className="news-panel">
        <header className="news-header">
          <div className="news-header-copy"><h2 id="news-heading">რა ხდება კრედოში</h2></div>
          <div className="news-controls" role="group" aria-label="სიახლეების ნავიგაცია">
            <button type="button" aria-label="წინა სიახლე" aria-controls="news-desktop" onClick={event => navigate(-1, event.detail === 0)}><img src="/assets/news/arrow-left.svg" alt="" width="16" height="16" /></button>
            <button type="button" aria-label="შემდეგი სიახლე" aria-controls="news-desktop" onClick={event => navigate(1, event.detail === 0)}><img src="/assets/news/arrow-right.svg" alt="" width="16" height="16" /></button>
          </div>
        </header>

        <div className="news-desktop" id="news-desktop" role="group" aria-roledescription="კარუსელი" aria-label="კრედოს სიახლეები">
          <div className="news-stage">
            <canvas ref={canvasRef} className="news-canvas" aria-hidden="true" />
            <div className="news-static-preview" aria-hidden="true">{Array.from({ length: 7 }, (_, column) => {
              const story = HOME_NEWS[wrapIndex(active + column, HOME_NEWS.length)];
              return <div className="news-static-card" key={column}><img src={story.image} alt="" loading="lazy" style={column && story.collapsedOffsetX ? { marginLeft: -story.collapsedOffsetX } : undefined} /></div>;
            })}</div>
          </div>
          <div className="news-details">{HOME_NEWS.map((story, i) => <div className="news-detail" key={story.id} aria-hidden={i !== active} inert={i !== active} data-active={i === active}>
            <div className="news-detail-copy"><p>{story.description}</p></div>
            <button className="action action-secondary news-read-more" type="button" tabIndex={i === active ? 0 : -1} ref={element => { captionLinks.current[i] = element; }} onClick={event => openArticle(event, story)} aria-label={`${story.cta}: ${story.title}`}>{story.cta.toUpperCase()}<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </div>)}</div>
        </div>

        <div className="news-mobile">
          <ul className="news-mobile-scroller" ref={scrollerRef} aria-label="კრედოს სიახლეები">{HOME_NEWS.map((story, i) => <li className="news-mobile-item" key={story.id} style={{ '--news-progress': Math.min(1, i) }}>
            <article className="news-mobile-card">
              <div className="news-mobile-media"><img className="news-mobile-image" src={story.mobileImage} alt="" width="1632" height="918" loading="lazy" /></div>
              <div className="news-mobile-copy"><p>{story.description}</p></div>
              <button type="button" className="action action-secondary news-read-more" onClick={event => openArticle(event, story)} aria-label={`${story.cta}: ${story.title}`}>{story.cta.toUpperCase()}<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            </article>
          </li>)}</ul>
        </div>
        <p className="news-sr-only" aria-live="polite" aria-atomic="true">სიახლე {active + 1} / {HOME_NEWS.length}: {HOME_NEWS[active].title}</p>
      </div>
    </section>

    <dialog className="news-story-dialog" ref={dialogRef} aria-labelledby="news-story-title" onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onClose={() => { setArticle(null); returnFocus.current?.focus({ preventScroll: true }); }}>
      <div className="news-story-toolbar"><span>კრედოს სიახლეები</span><button type="button" className="action action-secondary news-read-more" onClick={() => dialogRef.current.close()}>{'დახურვა'.toUpperCase()}</button></div>
      <img className="news-story-image" src={dialogStory.image} alt="" />
      <div className="news-story-content"><h2 id="news-story-title">{dialogStory.title}</h2><p className="news-story-lead">{dialogStory.description}</p>{dialogStory.body.map(text => <p key={text}>{text}</p>)}<a className="action action-secondary news-source-link" href={dialogStory.sourceUrl} target="_blank" rel="noopener noreferrer">{'სრული ამბავი კრედოს ვებსაიტზე'.toUpperCase()}</a></div>
    </dialog>
  </>;
}
