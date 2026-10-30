"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Button from "../Button/Button";
import { ConsumerPanel } from "./ConsumerMenu";
import SpaceMenu, { SPACE_LINKS } from "./SpaceMenu";
import { useDesktopNavigationMotion } from "./useDesktopNavigationMotion";
import styles from "./Header.module.css";
const NAV_ITEMS = [{
  id: "personal",
  label: "სამომხმარებლო",
  hasMenu: true,
  menu: "consumer"
}, {
  id: "business",
  label: "ბიზნესი",
  hasMenu: true
}, {
  id: "space",
  label: "სივრცე",
  hasMenu: true
}, {
  id: "about",
  label: "ჩვენ შესახებ",
  hasMenu: true
}, {
  id: "contact",
  label: "კონტაქტი",
  hasMenu: false
}];
export default function Header() {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState(SPACE_LINKS.some(link => link.href === pathname) ? "space" : "personal");
  const [lang, setLang] = useState("EN");
  // Tablet/mobile menu (≤1279px, where the desktop nav no longer fits); not in the Figma design, kept in the site's existing styles
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useDesktopNavigationMotion();
  const {
    value,
    visualValue,
    close
  } = nav;
  return <header className={styles.header}>
      <div className={styles.left}>
        <a href="/?v=2" className={styles.logo} aria-label="კრედო ბანკი">
          <img className={styles.logoMark} src="/design-two/icons/logo-mark.svg" width={29.1228} height={29.1778} alt="" />
          <img className={styles.logoText} src="/design-two/icons/logo-text.svg" width={152.607} height={15.9661} alt="" />
        </a>

        {/* Radix navigation + motion hook from Credo-web-variants; "სამომხმარებლო" opens the consumer menu */}
        <NavigationMenu.Root ref={nav.frameRef} className={`site-nav-frame ${styles.nav}`} value={value} onValueChange={nav.changeValue} delayDuration={100} skipDelayDuration={300} aria-label="მთავარი ნავიგაცია" data-open={nav.presented} data-expanded={Boolean(value)} data-phase={nav.phase} data-input={nav.input} onKeyDownCapture={nav.onKeyDownCapture} onPointerMoveCapture={nav.onPointerMoveCapture}>
          <NavigationMenu.List className={styles.navList}>
            {NAV_ITEMS.map(item => {
            const isActive = item.id === activeId;
            const className = `${styles.navItem} ${isActive ? styles.navItemActive : ""}`;
            const content = <>
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.hasMenu && <img className="site-trigger-chevron" src="/design-two/icons/chevron-down.svg" width={20} height={20} alt="" />}
                </>;
            if (item.menu) {
              return <NavigationMenu.Item key={item.id} value={item.menu} className={styles.navSlot}>
                    <NavigationMenu.Trigger className={className} data-nav-trigger={item.menu} onClick={() => setActiveId(item.id)}>
                      {content}
                    </NavigationMenu.Trigger>
                    {nav.presented && <NavigationMenu.Content forceMount ref={nav.registerPanel} className="site-nav-content" data-panel={item.menu} data-visible={item.menu === visualValue} data-side="end" inert={item.menu !== value ? true : undefined} aria-hidden={item.menu !== value}>
                        <ConsumerPanel onChoose={close} />
                      </NavigationMenu.Content>}
                  </NavigationMenu.Item>;
            }
            if (item.id === "space") {
              return <SpaceMenu key={item.id} className={className}>
                    {content}
                  </SpaceMenu>;
            }
            return <li key={item.id} className={styles.navSlot}>
                  <button className={className} onClick={() => setActiveId(item.id)} aria-current={isActive ? "page" : undefined}>
                    {content}
                  </button>
                </li>;
          })}
          </NavigationMenu.List>
          <div className="site-viewport-position">
            <NavigationMenu.Viewport forceMount ref={nav.viewportRef} className="site-nav-viewport" inert={!value ? true : undefined} aria-hidden={!value} />
          </div>
        </NavigationMenu.Root>
      </div>
      <div className="site-nav-backdrop" data-open={Boolean(value)} data-input={nav.input} aria-hidden="true" onPointerDown={close} />

      <div className={styles.actions}>
        {/* CAPS style for Georgian is written in Mtavruli (see Button.module.css) */}
        <Button variant="secondary" aria-label="ვიდეო ბანკი">
          ᲕᲘᲓᲔᲝ ᲑᲐᲜᲙᲘ
        </Button>
        <Button variant="primary">MYCREDO</Button>
      </div>

      <div className={styles.utilities}>
        <button className={styles.search} aria-label="ძიება">
          <img src="/design-two/icons/search.svg" width={16} height={16} alt="" />
        </button>
        <button className={styles.lang} onClick={() => setLang(lang === "EN" ? "KA" : "EN")} aria-label="ენის შეცვლა">
          <img src="/design-two/icons/globe.svg" width={20} height={20} alt="" />
          <span>{lang}</span>
        </button>
        <button className={styles.burger} aria-label={mobileOpen ? "მენიუს დახურვა" : "მენიუს გახსნა"} aria-expanded={mobileOpen} aria-controls="mobile-menu" onClick={() => setMobileOpen(open => !open)}>
          <span data-open={mobileOpen} />
        </button>
      </div>

      {mobileOpen && <nav id="mobile-menu" className={styles.mobileMenu} aria-label="მობილური ნავიგაცია">
          <ul>
            <li>
              <a href="/loans">სესხები</a>
            </li>
            {NAV_ITEMS.slice(1).map(item => <li key={item.id}>
                <a href="#">{item.label}</a>
                {item.id === "space" && <ul className={styles.mobileSubmenu}>
                    {SPACE_LINKS.map(link => <li key={link.label}>
                        <a href={link.href}>{link.label}</a>
                      </li>)}
                  </ul>}
              </li>)}
          </ul>
          <div className={styles.mobileActions}>
            <Button href="#" variant="secondary" aria-label="ვიდეო ბანკი">
              ᲕᲘᲓᲔᲝ ᲑᲐᲜᲙᲘ
            </Button>
            <Button href="#" variant="primary">
              MYCREDO
            </Button>
          </div>
        </nav>}
    </header>;
}
