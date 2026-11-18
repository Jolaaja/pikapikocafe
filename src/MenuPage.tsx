import { useEffect, useState } from "react";
import menuData from "../menu-data.json";
import coffeeConcept from "../assets/coffee-concept.svg";
import pikaPikoMark from "../assets/pika-piko-mark.svg";
import pastryConcept from "../assets/pastry-concept.svg";

type Language = "id" | "en";
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
    homeLink: "Kembali ke beranda",
    language: "Pilih bahasa",
    languageId: "Bahasa Indonesia",
    languageEn: "English",
    languageIdShort: "ID",
    languageEnShort: "EN",
    eyebrow: "PIKA PIKO CAFE · MENU",
    subtitle: "Temukan kopi, makanan, dan minuman untuk menemani jeda.",
    posterLink: "Unduh poster menu A4",
    posterHint: "Poster bilingual · A4 landscape",
    galleryLabel: "Ilustrasi konsep minuman dan makanan",
    drinkImageAlt: "Ilustrasi konsep minuman kopi, bukan foto produk asli",
    foodImageAlt: "Ilustrasi konsep pastry, bukan foto produk asli",
    conceptTag: "VISUAL KONSEP",
    drinkPhotoTitle: "Kopi racikan",
    foodPhotoTitle: "Sajian pendamping",
    photoNote: "Foto produk asli menyusul",
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
    home: "Pika Piko Cafe — home",
    homeLink: "Back to home",
    language: "Choose language",
    languageId: "Bahasa Indonesia",
    languageEn: "English",
    languageIdShort: "ID",
    languageEnShort: "EN",
    eyebrow: "PIKA PIKO CAFE · MENU",
    subtitle: "Find coffee, food, and drinks to make your pause a little better.",
    posterLink: "Download A4 menu poster",
    posterHint: "Bilingual poster · A4 landscape",
    galleryLabel: "Drink and food concept illustrations",
    drinkImageAlt: "Coffee concept illustration, not an actual product photo",
    foodImageAlt: "Pastry concept illustration, not an actual product photo",
    conceptTag: "CONCEPT VISUAL",
    drinkPhotoTitle: "Coffee, thoughtfully made",
    foodPhotoTitle: "Something on the side",
    photoNote: "Product photos coming soon",
    searchLabel: "Search the menu",
    searchPlaceholder: "Try palm sugar coffee, matcha, or rice",
    searchResults: "{count} menu items found",
    searchAvailable: "{count} items available",
    searchEmpty: "No matching items. Try another search.",
    categoryNavLabel: "Browse menu categories",
    temperatureLabel: "Serving options",
    cold: "Cold",
    hot: "Hot",
    visitEyebrow: "See you at the cafe",
    visitTitle: "Take a pause at Pika Piko.",
    directions: "Open location in Google Maps",
    footerHome: "Pika Piko Cafe",
    footerNote: "Menu and prices may change."
  }
} satisfies Record<Language, Record<string, string>>;

const priceFormatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<Language>("id");
  const text = copy[language];
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleCategories = categories
    .map((category) => {
      if (!normalizedSearch) return category;
      const matchesCategory = `${category.title.en} ${category.title.id} ${category.description.en} ${category.description.id}`
        .toLocaleLowerCase()
        .includes(normalizedSearch);
      const matchingItems = category.items.filter((item) =>
        `${item.name} ${item.note?.id ?? ""} ${item.note?.en ?? ""}`.toLocaleLowerCase().includes(normalizedSearch)
      );
      return { ...category, items: matchesCategory ? category.items : matchingItems };
    })
    .filter((category) => category.items.length > 0);
  const visibleItemCount = visibleCategories.reduce((total, category) => total + category.items.length, 0);
  const totalItemCount = categories.reduce((total, category) => total + category.items.length, 0);

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
          <img className="digital-menu-mark" src={pikaPikoMark} alt="" />
          <span className="digital-menu-wordmark"><strong>pika piko</strong><small>CAFE</small></span>
        </a>
        <div className="digital-menu-controls">
          <div className="language-switch" role="group" aria-label={text.language}>
            <button type="button" className={language === "id" ? "active" : ""} aria-label={text.languageId} aria-pressed={language === "id"} onClick={() => setLanguage("id")}>{text.languageIdShort}</button>
            <button type="button" className={language === "en" ? "active" : ""} aria-label={text.languageEn} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>{text.languageEnShort}</button>
          </div>
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
          <section className="menu-dummy-gallery" aria-label={text.galleryLabel}>
            <figure className="menu-dummy-card">
              <div className="menu-dummy-image">
                <img src={coffeeConcept} alt={text.drinkImageAlt} />
                <span className="menu-dummy-tag">{text.conceptTag}</span>
              </div>
              <figcaption><strong>{text.drinkPhotoTitle}</strong><span>{text.photoNote}</span></figcaption>
            </figure>
            <figure className="menu-dummy-card">
              <div className="menu-dummy-image">
                <img src={pastryConcept} alt={text.foodImageAlt} />
                <span className="menu-dummy-tag">{text.conceptTag}</span>
              </div>
              <figcaption><strong>{text.foodPhotoTitle}</strong><span>{text.photoNote}</span></figcaption>
            </figure>
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
                : text.searchAvailable.replace("{count}", String(totalItemCount))}
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
                      <strong className="digital-menu-item-price">{priceFormatter.format(item.price)}</strong>
                    </li>
                  ))}
                </ul>
                {category.notes && category.notes.length > 0 && (
                  <div className="digital-menu-category-notes">
                    {category.notes.map((note) => <p className="digital-menu-note" key={note.id}>{note[language]}</p>)}
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
