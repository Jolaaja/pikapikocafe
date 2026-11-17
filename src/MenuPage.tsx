import { useEffect, useState } from "react";
import menuData from "../menu-data.json";
import pikaPikoLogo from "../assets/pika-piko-logo.webp";
import type { Language } from "./home-copy";

type Temperature = "cold" | "hot";
type MenuItem = {
  name: string;
  price: number;
  temperatures?: Temperature[];
  note?: Record<Language, string>;
};
type MenuNote = Record<Language, string>;
type MenuCategory = {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  notes?: MenuNote[];
  items: MenuItem[];
};

const categories = menuData.categories as MenuCategory[];

const copy = {
  id: {
    title: "Menu Pika Piko Cafe",
    description: "Lihat menu kopi, makanan, mocktail, teh, dan minuman herbal Pika Piko Cafe.",
    skip: "Langsung ke menu",
    home: "Pika Piko Cafe — beranda",
    languageLabel: "Pilih bahasa",
    homeLink: "Kembali ke beranda",
    eyebrow: "PIKA PIKO CAFE · MENU",
    subtitle: "Temukan kopi, makanan, dan minuman untuk menemani jeda.",
    posterLink: "Unduh poster menu A4",
    posterHint: "Poster bilingual · A4 landscape",
    searchLabel: "Cari di menu",
    searchPlaceholder: "Contoh: kopi gula aren, matcha, atau nasi",
    searchResults: "{count} menu ditemukan",
    searchAvailable: "{count} pilihan tersedia",
    searchEmpty: "Belum ada menu yang cocok. Coba kata kunci lain.",
    categoryNavLabel: "Jelajahi kategori menu",
    temperatureLabel: "Pilihan sajian",
    cold: "Dingin",
    hot: "Panas",
    visitEyebrow: "Sampai jumpa di cafe",
    visitTitle: "Nikmati jeda di Pika Piko.",
    directions: "Buka lokasi di Google Maps",
    footerHome: "Pika Piko Cafe",
    footerNote: "Menu dan harga dapat berubah."
  },
  en: {
    title: "Pika Piko Cafe Menu",
    description: "Explore coffee, food, mocktails, tea, and herbal drinks at Pika Piko Cafe.",
    skip: "Skip to menu",
    home: "Pika Piko Cafe home",
    languageLabel: "Choose language",
    homeLink: "Back to home",
    eyebrow: "PIKA PIKO CAFE · MENU",
    subtitle: "Coffee, food, and drinks to make room for a slower moment.",
    posterLink: "Download A4 menu poster",
    posterHint: "Bilingual poster · A4 landscape",
    searchLabel: "Search the menu",
    searchPlaceholder: "Try: iced latte, matcha, or rice",
    searchResults: "{count} menu items found",
    searchAvailable: "{count} items available",
    searchEmpty: "No menu items match. Try another search.",
    categoryNavLabel: "Browse menu categories",
    temperatureLabel: "Serving options",
    cold: "Cold",
    hot: "Hot",
    visitEyebrow: "See you at the cafe",
    visitTitle: "Take a moment at Pika Piko.",
    directions: "Open location in Google Maps",
    footerHome: "Pika Piko Cafe",
    footerNote: "Menu items and prices may change."
  }
} satisfies Record<Language, Record<string, string>>;

const priceFormatters: Record<Language, Intl.NumberFormat> = {
  id: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat("en-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
};

function LanguageSwitch({ language, setLanguage }: { language: Language; setLanguage: (language: Language) => void }) {
  return (
    <div className="digital-menu-language" role="group" aria-label={copy[language].languageLabel}>
      <button type="button" aria-pressed={language === "id"} onClick={() => setLanguage("id")}>ID</button>
      <span aria-hidden="true">/</span>
      <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
    </div>
  );
}

export default function MenuPage() {
  const [language, setLanguage] = useState<Language>("id");
  const [search, setSearch] = useState("");
  const text = copy[language];
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleCategories = categories
    .map((category) => {
      if (!normalizedSearch) return category;
      const matchesCategory = `${category.title[language]} ${category.description[language]}`
        .toLocaleLowerCase()
        .includes(normalizedSearch);
      const matchingItems = category.items.filter((item) =>
        `${item.name} ${item.note?.[language] ?? ""}`.toLocaleLowerCase().includes(normalizedSearch)
      );
      return { ...category, items: matchesCategory ? category.items : matchingItems };
    })
    .filter((category) => category.items.length > 0);
  const visibleItemCount = visibleCategories.reduce((total, category) => total + category.items.length, 0);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = text.title;
    const metaValues: Record<string, string> = {
      'meta[name="description"]': text.description,
      'meta[property="og:url"]': `${window.location.origin}/menu.html`,
      'meta[property="og:title"]': text.title,
      'meta[property="og:description"]': text.description,
      'meta[name="twitter:title"]': text.title,
      'meta[name="twitter:description"]': text.description
    };
    Object.entries(metaValues).forEach(([selector, value]) => {
      const meta = document.querySelector<HTMLMetaElement>(selector);
      if (meta) meta.content = value;
    });
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${window.location.origin}/menu.html`;
  }, [language, text.description, text.title]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const targetId = window.location.hash.slice(1);
      if (!targetId) return;
      document.getElementById(targetId)?.scrollIntoView({ behavior: "instant", block: "start" });
    }, 150);
    const handleHashChange = () => {
      const targetId = window.location.hash.slice(1);
      if (targetId) document.getElementById(targetId)?.scrollIntoView({ behavior: "instant", block: "start" });
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="menu-page-body min-h-screen">
      <a className="menu-skip-link" href="#menu-content">{text.skip}</a>
      <header className="digital-menu-header">
        <a className="digital-menu-brand" href="/" aria-label={text.home}>
          <img className="digital-menu-mark" src={pikaPikoLogo} alt="" />
          <span className="digital-menu-wordmark"><strong>pika piko</strong><small>CAFE</small></span>
        </a>
        <div className="digital-menu-controls">
          <LanguageSwitch language={language} setLanguage={setLanguage} />
          <a className="back-home-link" href="/">{text.homeLink}</a>
        </div>
      </header>
      <main className="digital-menu-main" id="menu-content">
        <div className="digital-menu-shell">
          <section className="digital-menu-intro" aria-labelledby="menu-page-title">
            <p className="digital-menu-eyebrow">{text.eyebrow}</p>
            <h1 id="menu-page-title">{text.title}</h1>
            <p className="digital-menu-description">{text.subtitle}</p>
            <div className="digital-menu-actions">
              <a className="poster-download" href="/menu-poster.svg" download="menu-pika-piko-a4.svg">
                <span>{text.posterLink}</span><span aria-hidden="true">↓</span>
              </a>
              <span className="poster-format">{text.posterHint}</span>
            </div>
          </section>
          <div className="digital-menu-search">
            <label htmlFor="menu-search">{text.searchLabel}</label>
            <input
              id="menu-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text.searchPlaceholder}
              aria-controls="menu-category-results"
            />
            <p className="digital-menu-search-results" role="status" aria-live="polite">
              {normalizedSearch
                ? (visibleItemCount > 0 ? text.searchResults : text.searchEmpty).replace("{count}", String(visibleItemCount))
                : text.searchAvailable.replace("{count}", String(categories.reduce((total, category) => total + category.items.length, 0)))}
            </p>
          </div>
          {visibleCategories.length > 0 && (
            <nav className="menu-category-nav" aria-label={text.categoryNavLabel}>
              {visibleCategories.map((category) => <a href={`#menu-${category.id}`} key={category.id}>{category.title[language]}</a>)}
            </nav>
          )}
          <div className="digital-menu-categories" id="menu-category-results">
            {visibleCategories.map((category) => (
              <section className="digital-menu-category" id={`menu-${category.id}`} key={category.id}>
                <div className="digital-menu-category-heading">
                  <span className="digital-menu-category-number">{String(categories.findIndex((entry) => entry.id === category.id) + 1).padStart(2, "0")}</span>
                  <h2 className="digital-menu-category-title">{category.title[language]}</h2>
                  <p className="digital-menu-category-description">{category.description[language]}</p>
                </div>
                <ul className="digital-menu-item-list">
                  {category.items.map((item) => (
                    <li className="digital-menu-item" key={item.name}>
                      <div className="digital-menu-item-details">
                        <h3 className="digital-menu-item-name">{item.name}</h3>
                        {item.note && <p className="digital-menu-item-note">{item.note[language]}</p>}
                        {item.temperatures && item.temperatures.length > 0 && (
                          <p className="digital-menu-item-options" aria-label={text.temperatureLabel}>
                            {item.temperatures.map((temperature) => text[temperature]).join(" · ")}
                          </p>
                        )}
                      </div>
                      <strong className="digital-menu-item-price">{priceFormatters[language].format(item.price)}</strong>
                    </li>
                  ))}
                </ul>
                {category.notes && category.notes.length > 0 && (
                  <div className="digital-menu-category-notes">
                    {category.notes.map((note) => <p className="digital-menu-note" key={note[language]}>{note[language]}</p>)}
                  </div>
                )}
              </section>
            ))}
          </div>
          <section className="digital-menu-visit">
            <div><p className="digital-menu-eyebrow">{text.visitEyebrow}</p><h2>{text.visitTitle}</h2></div>
            <a href="https://maps.app.goo.gl/jBRzdxzhi6D8ZhKP6" target="_blank" rel="noopener noreferrer">
              <span>{text.directions}</span><span aria-hidden="true">↗</span>
            </a>
          </section>
        </div>
      </main>
      <footer className="digital-menu-footer"><a href="/">{text.footerHome}</a><span>{text.footerNote}</span></footer>
    </div>
  );
}
