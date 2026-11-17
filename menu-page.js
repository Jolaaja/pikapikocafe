import menuData from "./menu-data.json";

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
    categoryNavLabel: "Jelajahi kategori menu",
    categoryCount: "pilihan",
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
    categoryNavLabel: "Browse menu categories",
    categoryCount: "items",
    temperatureLabel: "Serving options",
    cold: "Cold",
    hot: "Hot",
    visitEyebrow: "See you at the cafe",
    visitTitle: "Take a moment at Pika Piko.",
    directions: "Open location in Google Maps",
    footerHome: "Pika Piko Cafe",
    footerNote: "Menu items and prices may change."
  }
};

const categoryNav = document.querySelector("#menu-category-nav");
const categoryList = document.querySelector("#digital-menu-categories");
const languageButtons = document.querySelectorAll("[data-language]");
const priceFormatters = {
  id: new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }),
  en: new Intl.NumberFormat("en-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  })
};

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderMenu(language) {
  const selectedCopy = copy[language];
  if (!selectedCopy) {
    throw new Error(`Unsupported menu language: ${language}`);
  }

  document.documentElement.lang = language;
  document.title = selectedCopy.title;
  document.querySelector('meta[name="description"]').content = selectedCopy.description;

  document.querySelectorAll("[data-copy]").forEach((element) => {
    const key = element.dataset.copy;
    if (!(key in selectedCopy)) {
      throw new Error(`Missing ${language} menu translation: ${key}`);
    }
    element.textContent = selectedCopy[key];
  });

  document.querySelectorAll("[data-copy-aria]").forEach((element) => {
    const key = element.dataset.copyAria;
    if (!(key in selectedCopy)) {
      throw new Error(`Missing ${language} menu accessibility translation: ${key}`);
    }
    element.setAttribute("aria-label", selectedCopy[key]);
  });

  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });

  categoryNav.replaceChildren();
  categoryList.replaceChildren();

  menuData.categories.forEach((category, index) => {
    const categoryName = category.title[language];
    if (!categoryName) {
      throw new Error(`Missing ${language} category title: ${category.id}`);
    }

    const navLink = document.createElement("a");
    navLink.href = `#menu-${category.id}`;
    navLink.textContent = categoryName;
    categoryNav.append(navLink);

    const section = document.createElement("section");
    section.className = "digital-menu-category";
    section.id = `menu-${category.id}`;

    const heading = document.createElement("div");
    heading.className = "digital-menu-category-heading";
    heading.append(
      createTextElement("span", "digital-menu-category-number", String(index + 1).padStart(2, "0")),
      createTextElement("h2", "digital-menu-category-title", categoryName),
      createTextElement("p", "digital-menu-category-description", category.description[language])
    );

    const list = document.createElement("ul");
    list.className = "digital-menu-item-list";

    category.items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = "digital-menu-item";

      const itemDetails = document.createElement("div");
      itemDetails.className = "digital-menu-item-details";
      itemDetails.append(createTextElement("h3", "digital-menu-item-name", item.name));

      if (item.note) {
        itemDetails.append(
          createTextElement("p", "digital-menu-item-note", item.note[language])
        );
      }

      const itemPrice = createTextElement(
        "strong",
        "digital-menu-item-price",
        priceFormatters[language].format(item.price)
      );
      listItem.append(itemDetails, itemPrice);

      if (item.temperatures && item.temperatures.length) {
        const options = document.createElement("p");
        options.className = "digital-menu-item-options";
        options.setAttribute("aria-label", selectedCopy.temperatureLabel);
        options.textContent = item.temperatures
          .map((temperature) => selectedCopy[temperature])
          .join(" · ");
        itemDetails.append(options);
      }

      list.append(listItem);
    });

    section.append(heading, list);

    if (category.notes && category.notes.length) {
      const notes = document.createElement("div");
      notes.className = "digital-menu-category-notes";
      category.notes.forEach((note) => {
        notes.append(createTextElement("p", "digital-menu-note", note[language]));
      });
      section.append(notes);
    }

    categoryList.append(section);
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => renderMenu(button.dataset.language));
});

renderMenu(document.documentElement.lang);
