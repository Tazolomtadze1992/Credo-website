"use client";

import { useState } from "react";
import Button from "../Button/Button";
import styles from "./Hero.module.css";
const MAIN_SLIDE = {
  title: ["შენი საიმედო", "ფინანსური პარტნიორი"],
  copy: "მართე ფინანსები სადაც არ უნდა იყო - სესხი, ბარათი და ანაბარი ერთ სივრცეში, სერვისცენტრში თუ ვიდეო ზარით",
  // CAPS style for Georgian is written in Mtavruli (see Button.module.css)
  cta: "ᲒᲐᲘᲒᲔ ᲛᲔᲢᲘ",
  ctaLabel: "გაიგე მეტი",
  image: "/design-two/images/hero-app.png",
  imageAlt: "კრედო ბანკის მობილური აპლიკაცია"
};

// The design shows 3 slides but only the first one's content; slides 2–3 reuse it until content is ready.
const SLIDES = [MAIN_SLIDE, MAIN_SLIDE, MAIN_SLIDE];
export default function Hero() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const go = step => setIndex(i => (i + step + SLIDES.length) % SLIDES.length);
  return <section className={styles.hero} aria-roledescription="carousel" aria-label="მთავარი შეთავაზებები">
      <div className={styles.slide} aria-roledescription="slide" aria-label={`${index + 1} / ${SLIDES.length}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            {slide.title[0]}
            <br />
            {slide.title[1]}
          </h1>
          <p className={styles.copy}>{slide.copy}</p>
          <Button variant="primary" size="medium" className={styles.cta} aria-label={slide.ctaLabel}>
            {slide.cta}
          </Button>
        </div>
        <div className={styles.media}>
          <img className={styles.image} src={slide.image} alt={slide.imageAlt} />
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {SLIDES.map((_, i) => <button key={i} className={`${styles.dot} ${i === index ? styles.dotActive : ""}`} onClick={() => setIndex(i)} aria-label={`სლაიდი ${i + 1}`} aria-current={i === index ? "true" : undefined} />)}
        </div>
        <div className={styles.arrows}>
          <button className={styles.arrow} onClick={() => go(-1)} aria-label="წინა">
            <img src="/design-two/icons/chevron-left.svg" width={24} height={24} alt="" />
          </button>
          <button className={`${styles.arrow} ${styles.arrowNext}`} onClick={() => go(1)} aria-label="შემდეგი">
            <img src="/design-two/icons/chevron-left.svg" width={24} height={24} alt="" />
          </button>
        </div>
      </div>
    </section>;
}
