import { useEffect, useState } from "react";
import { copy } from "./home-copy";
import cafeInterior from "../assets/cafe-interior.webp";
import coffeeConcept from "../assets/coffee-concept.svg";
import nightTerrace from "../assets/night-terrace.webp";
import pastryConcept from "../assets/pastry-concept.svg";
import pikaPikoMark from "../assets/pika-piko-mark.svg";
import sunlitInterior from "../assets/sunlit-interior.webp";
import terraceSeating from "../assets/terrace-seating.webp";
import terraceSunset from "../assets/terrace-sunset.webp";
import menuData from "../menu-data.json";

const menuCardDefinitions = [
  {
    categoryId: "coffee",
    itemNames: ["Cappuccino Kako", "Cafe Latte", "Kopi Gula Aren"],
    labelKey: "menu.coffeeLabel",
    titleKey: "menu.coffeeTitle",
    listKey: "menu.coffeeList",
    linkKey: "menu.coffeeLink"
  },
  {
    categoryId: "mocktail",
    itemNames: ["Love Triangle", "Strawberry Smoothies", "Pikako Sunrise"],
    labelKey: "menu.drinkLabel",
    titleKey: "menu.drinkTitle",
    listKey: "menu.drinkList",
    linkKey: "menu.drinkLink"
  },
  {
    categoryId: "food",
    itemNames: ["Steak Burger", "Nasi Campur Bali", "Nasi Goreng Pikako"],
    labelKey: "menu.foodLabel",
    titleKey: "menu.foodTitle",
    listKey: "menu.foodList",
    linkKey: "menu.foodLink"
  }
] as const;

const menuCards = menuCardDefinitions.map((definition) => {
  const category = menuData.categories.find((entry) => entry.id === definition.categoryId);
  if (!category) {
    throw new Error(`Missing homepage menu category: ${definition.categoryId}`);
  }

  const items = definition.itemNames.map((name) => {
    const item = category.items.find((entry) => entry.name === name);
    if (!item) {
      throw new Error(`Missing homepage menu item "${name}" in ${definition.categoryId}`);
    }
    return item;
  });

  return { ...definition, items };
});

const menuIcons = [
  <svg key="coffee" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M10 19h23v10a9 9 0 0 1-9 9h-5a9 9 0 0 1-9-9V19Z" stroke="currentColor" strokeWidth="1.5"/><path d="M33 22h3a5 5 0 0 1 0 10h-4M15 13c0-2 2-2 2-5m7 5c0-2 2-2 2-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="mocktail" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M12 19h24l-2 19H14l-2-19Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M18 15c0-2 2-2 2-5m8 5c0-2 2-2 2-5M18 25h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="food" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M9 29c4-8 9-12 15-12s11 4 15 12M12 29h24l-3 10H15l-3-10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 17c0-2 2-3 2-6m6 6c0-2 2-3 2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
];

function IntroOverlay({ onFinish }: { onFinish: () => void }) {
  const [visible, setVisible] = useState(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 2000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="site-intro" data-site-intro aria-hidden="true" onAnimationEnd={(event) => {
      if (event.target === event.currentTarget && event.animationName === "site-intro-out") {
        setVisible(false);
        onFinish();
      }
    }}>
      <picture className="site-intro-media">
        <source media="(max-width: 700px)" srcSet={terraceSunset} />
        <img src={cafeInterior} alt="" fetchPriority="high" />
      </picture>
      <div className="site-intro-content">
        <img className="site-intro-logo" src={pikaPikoMark} alt="" />
        <span className="site-intro-name">pika piko</span>
        <span className="site-intro-caption">CAFE</span>
        <span className="site-intro-rule" />
        <span className="site-intro-tagline">{copy.id["intro.tagline"]}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const t = (key: string) => copy.id[key] ?? key;
  const [showIntro, setShowIntro] = useState(
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    document.documentElement.lang = "id";
    document.title = t("page.title");
    const metaValues: Record<string, string> = {
      'meta[name="description"]': t("page.description"),
      'meta[property="og:url"]': window.location.origin + "/",
      'meta[property="og:title"]': t("og.title"),
      'meta[property="og:description"]': t("og.description"),
      'meta[property="og:image:alt"]': t("og.imageAlt"),
      'meta[name="twitter:title"]': t("og.title"),
      'meta[name="twitter:description"]': t("og.description")
    };
    Object.entries(metaValues).forEach(([selector, value]) => {
      const meta = document.querySelector<HTMLMetaElement>(selector);
      if (meta) meta.content = value;
    });
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${window.location.origin}/`;
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("motion-ready");
    const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    revealTargets.forEach((target) => {
      const delay = Math.max(0, Number(target.dataset.revealDelay || 0));
      target.style.setProperty("--reveal-delay", `${delay}ms`);
      target.inert = true;
    });
    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => {
        target.inert = false;
        target.classList.add("is-visible");
      });
      return () => document.documentElement.classList.remove("motion-ready");
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        target.inert = false;
        target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -48px 0px", threshold: 0.12 });
    revealTargets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      revealTargets.forEach((target) => {
        target.inert = false;
        target.style.removeProperty("--reveal-delay");
      });
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  const money = (amount: number) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);

  return (
    <div className="antialiased min-h-screen">
      {showIntro && <IntroOverlay onFinish={() => setShowIntro(false)} />}
      <a className="skip-link" href="#main-content">{t("skip")}</a>
      <div className="announcement-bar">
        <p><span>PIKA PIKO CAFE</span><i aria-hidden="true">·</i><span>{t("announcement")}</span></p>
      </div>
      <header className="site-header flex items-center justify-between">
        <a className="brand-lockup" href="#home" aria-label={t("brand.home")}>
          <img className="brand-mark" src={pikaPikoMark} alt="" />
          <span className="wordmark"><span className="wordmark-name">pika piko</span><span className="wordmark-caption">CAFE</span></span>
        </a>
        <nav className="site-nav flex items-center" aria-label={t("nav.label")}>
          <a href="#menu"><span>{t("nav.menu")}</span></a>
          <a href="#space"><span>{t("nav.space")}</span></a>
          <a href="#story"><span>{t("nav.story")}</span></a>
        </nav>
        <div className="header-actions">
          <a className="header-link" href="#visit"><span>{t("nav.visit")}</span> <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <figure className="hero-media" aria-hidden="true">
            <picture><source media="(max-width: 700px)" srcSet={terraceSunset} /><img src={cafeInterior} alt="" fetchPriority="high" /></picture>
          </figure>
          <div className="hero-content">
            <p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /><span>{t("hero.eyebrow")}</span></p>
            <h1 id="hero-title"><span>{t("hero.titleA")}</span><br /><em>{t("hero.titleB")}</em></h1>
            <p className="hero-intro">{t("hero.intro")}</p>
            <div className="hero-actions flex items-center">
              <a className="button button-light" href="#menu"><span>{t("hero.menu")}</span> <span aria-hidden="true">↗</span></a>
              <a className="hero-secondary" href="https://maps.app.goo.gl/jBRzdxzhi6D8ZhKP6" target="_blank" rel="noopener noreferrer"><span>{t("hero.directions")}</span> <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <p className="hero-caption"><span>01 — 03</span> <span>{t("hero.caption")}</span></p>
          <a className="scroll-cue" href="#highlights" aria-label={t("hero.scrollLabel")}><span /><span>{t("hero.scroll")}</span></a>
        </section>

        <section className="highlights" id="highlights" aria-label={t("highlights.label")}>
          <p><span>01</span> <span>{t("highlights.one")}</span></p>
          <p><span>02</span> <span>{t("highlights.two")}</span></p>
          <p><span>03</span> <span>{t("highlights.three")}</span></p>
        </section>

        <section className="menu-section section-wrap" id="menu" aria-labelledby="menu-title">
          <div className="section-heading" data-reveal>
            <div><p className="eyebrow">{t("menu.eyebrow")}</p><h2 id="menu-title"><span>{t("menu.titleA")}</span><br /><em>{t("menu.titleB")}</em></h2></div>
            <p className="section-description">{t("menu.intro")}</p>
          </div>
          <div className="menu-showcase" role="group" aria-label={t("menu.showcaseLabel")}>
            <figure className="menu-showcase-item menu-showcase-coffee" data-reveal>
              <img src={coffeeConcept} alt={t("images.coffeeConcept")} loading="lazy" decoding="async" />
              <figcaption><span className="menu-showcase-kicker">{t("menu.coffeeConceptKicker")}</span><span className="menu-showcase-title">{t("menu.coffeeConceptTitle")}</span><span className="menu-concept-note">{t("menu.conceptNote")}</span></figcaption>
            </figure>
            <figure className="menu-showcase-item menu-showcase-pastry" data-reveal data-reveal-delay="120">
              <img src={pastryConcept} alt={t("images.pastryConcept")} loading="lazy" decoding="async" />
              <figcaption><span className="menu-showcase-kicker">{t("menu.pastryConceptKicker")}</span><span className="menu-showcase-title">{t("menu.pastryConceptTitle")}</span><span className="menu-concept-note">{t("menu.conceptNote")}</span></figcaption>
            </figure>
          </div>
          <p className="menu-demo-note" role="note"><span className="demo-dot" aria-hidden="true" /><span>{t("menu.demo")}</span></p>
          <div className="menu-grid grid grid-cols-3">
            {menuCards.map((card, index) => (
              <article className={`menu-card${index === 1 ? " menu-card-featured" : ""}`} data-reveal data-reveal-delay={index * 120} key={index}>
                <div className="menu-card-top"><span className="menu-number">0{index + 1}</span><span className="menu-icon">{menuIcons[index]}</span></div>
                <p className="menu-overline">{t(card.labelKey)}</p>
                <h3>{t(card.titleKey)}</h3>
                <ul className="menu-items" aria-label={t(card.listKey)}>
                  {card.items.map((item) => <li key={item.name}><span>{item.name}</span><strong>{money(item.price)}</strong></li>)}
                </ul>
                <a className="menu-card-link" href={`/menu.html#menu-${card.categoryId}`}>
                  <span>{t(card.linkKey)}</span><span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
          <a className="menu-full-link" href="/menu.html"><span>{t("menu.fullMenu")}</span><span aria-hidden="true">↗</span></a>
        </section>

        <section className="space-section" id="space" aria-labelledby="space-title">
          <div className="space-image"><img src={sunlitInterior} alt={t("images.interior")} loading="lazy" decoding="async" /><span className="image-index">{t("space.imageLabel")}</span></div>
          <div className="space-copy"><p className="eyebrow eyebrow-light">{t("space.eyebrow")}</p><h2 id="space-title"><span>{t("space.titleA")}</span><br /><em>{t("space.titleB")}</em></h2><p>{t("space.description")}</p><a className="light-link" href="#gallery"><span>{t("space.link")}</span> <span aria-hidden="true">↗</span></a></div>
        </section>

        <section className="gallery-section section-wrap" id="gallery" aria-labelledby="gallery-title">
          <div className="gallery-heading" data-reveal><div><p className="eyebrow">{t("gallery.eyebrow")}</p><h2 id="gallery-title"><span>{t("gallery.titleA")}</span><br /><em>{t("gallery.titleB")}</em></h2></div><p>{t("gallery.description")}</p></div>
          <div className="gallery-grid">
            {[
              ["gallery-item-tall", terraceSeating, "images.terrace", "gallery.terrace"],
              ["", cafeInterior, "images.cafe", "gallery.interior"],
              ["gallery-item-wide", nightTerrace, "images.night", "gallery.night"]
            ].map(([className, image, alt, label], index) => (
              <figure className={`gallery-item ${className}`} data-reveal data-reveal-delay={index * 100} key={image}>
                <img src={image} alt={t(alt)} loading="lazy" decoding="async" />
                <figcaption><span>0{index + 1}</span> <span>{t(label)}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="story-section" id="story" aria-labelledby="story-title">
          <div className="story-mark" aria-hidden="true">P.</div>
          <div className="story-copy" data-reveal><p className="eyebrow">{t("story.eyebrow")}</p><h2 id="story-title"><span>{t("story.titleA")}</span><br /><em>{t("story.titleB")}</em></h2><p>{t("story.description")}</p></div>
        </section>

        <section className="visit-section section-wrap" id="visit" aria-labelledby="visit-title">
          <div className="visit-heading" data-reveal><p className="eyebrow">{t("visit.eyebrow")}</p><h2 id="visit-title"><span>{t("visit.titleA")}</span><br /><em>{t("visit.titleB")}</em></h2></div>
          <div className="visit-details">
            <article className="visit-card" data-reveal>
              <div>
                <span className="visit-label">{t("visit.location")}</span>
                <h3>Pika Piko Cafe</h3>
              </div>
              <a href="https://maps.app.goo.gl/jBRzdxzhi6D8ZhKP6" target="_blank" rel="noopener noreferrer">
                <span>{t("visit.map")}</span><span aria-hidden="true">↗</span>
              </a>
            </article>
            <article className="visit-card" data-reveal>
              <div>
                <span className="visit-label">{t("visit.hours")}</span>
                <h3>{t("visit.daily")}</h3>
              </div>
              <p>{t("visit.hoursValue")}</p>
            </article>
          </div>
        </section>

        <section className="last-call" aria-labelledby="last-call-title">
          <div className="last-call-inner" data-reveal><p className="eyebrow eyebrow-light">{t("last.eyebrow")}</p><h2 id="last-call-title"><span>{t("last.titleA")}</span><br /><em>{t("last.titleB")}</em></h2><a className="button button-outline" href="https://maps.app.goo.gl/jBRzdxzhi6D8ZhKP6" target="_blank" rel="noopener noreferrer"><span>{t("last.cta")}</span><span aria-hidden="true">↗</span></a></div>
          <span className="last-call-side" aria-hidden="true">PIKA PIKO CAFE · MOMEN BAIK, SETIAP HARI</span>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand-lockup" href="#home" aria-label={t("brand.top")}><img className="brand-mark brand-mark-footer" src={pikaPikoMark} alt="" /><span className="wordmark wordmark-footer"><span className="wordmark-name">pika piko</span><span className="wordmark-caption">CAFE</span></span></a>
        <p className="footer-note">{t("footer.note")}</p>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Pika Piko Cafe</span><a href="#home">{t("footer.top")}</a></div>
      </footer>
    </div>
  );
}
