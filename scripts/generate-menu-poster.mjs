import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDirectory = resolve(projectRoot, "public");
const menuData = JSON.parse(await readFile(resolve(projectRoot, "menu-data.json"), "utf8"));
const menuUrl = new URL(
  process.env.MENU_URL || "https://pikapiko-cafe.my.id/menu.html"
);

if (menuUrl.protocol !== "https:") {
  throw new Error("The public menu QR URL must use HTTPS.");
}

await mkdir(publicDirectory, { recursive: true });

const qrSvg = await QRCode.toString(menuUrl.href, {
  type: "svg",
  errorCorrectionLevel: "H",
  margin: 4,
  color: {
    dark: "#30221d",
    light: "#fffaf3"
  }
});

await writeFile(resolve(publicDirectory, "menu-qr.svg"), qrSvg, "utf8");

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

function wrapText(text, maxCharacters = 65) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function formatPrice(price) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(price)}`;
}

function temperaturesLabel(temperatures = []) {
  return temperatures
    .map((temperature) => temperature === "hot" ? "Panas · Hot" : "Dingin · Cold")
    .join(" / ");
}

function renderCategory(category, x, y, width, index) {
  const headerHeight = 36;
  const itemRows = category.items.map((item) => ({
    item,
    height: item.temperatures && item.temperatures.length ? 23 : 17
  }));
  const noteLines = (category.notes || []).flatMap((note) => wrapText(`${note.id} · ${note.en}`));
  const itemsHeight = itemRows.reduce((total, row) => total + row.height, 0);
  const notesHeight = noteLines.length ? 8 + noteLines.length * 9.5 : 0;
  const height = headerHeight + itemsHeight + notesHeight + 8;
  const parts = [
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="9" fill="#fffaf3" stroke="#ded4c6"/>`,
    `<rect x="${x}" y="${y}" width="${width}" height="${headerHeight}" rx="9" fill="#30221d"/>`,
    `<path d="M${x} ${y + headerHeight - 8}h${width}v8H${x}z" fill="#30221d"/>`,
    `<text x="${x + 12}" y="${y + 17}" fill="#fffaf3" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700">${String(index).padStart(2, "0")} · ${escapeXml(category.title.id.toUpperCase())}</text>`,
    `<text x="${x + 12}" y="${y + 30}" fill="#d7ad88" font-family="Arial, Helvetica, sans-serif" font-size="8" letter-spacing=".7">${escapeXml(category.title.en.toUpperCase())}</text>`
  ];

  let itemY = y + headerHeight;
  for (const { item, height: rowHeight } of itemRows) {
    const nameY = itemY + (item.temperatures && item.temperatures.length ? 10 : 12);
    parts.push(
      `<text x="${x + 12}" y="${nameY}" fill="#30221d" font-family="Arial, Helvetica, sans-serif" font-size="9.5" font-weight="600">${escapeXml(item.name)}</text>`,
      `<text x="${x + width - 12}" y="${nameY}" fill="#69452f" font-family="Arial, Helvetica, sans-serif" font-size="9.5" font-weight="700" text-anchor="end">${formatPrice(item.price)}</text>`
    );

    if (item.temperatures && item.temperatures.length) {
      parts.push(
        `<text x="${x + 12}" y="${itemY + 20}" fill="#8d7a68" font-family="Arial, Helvetica, sans-serif" font-size="7">${escapeXml(temperaturesLabel(item.temperatures))}</text>`
      );
    }

    parts.push(
      `<path d="M${x + 12} ${itemY + rowHeight}h${width - 24}" stroke="#e9e0d6" stroke-width=".7"/>`
    );
    itemY += rowHeight;
  }

  if (noteLines.length) {
    let noteY = itemY + 5;
    noteLines.forEach((line) => {
      parts.push(
        `<text x="${x + 12}" y="${noteY + 8}" fill="#765e4c" font-family="Arial, Helvetica, sans-serif" font-size="7.2">${escapeXml(line)}</text>`
      );
      noteY += 9.5;
    });
  }

  return { markup: parts.join(""), height };
}

const categoryById = new Map(menuData.categories.map((category) => [category.id, category]));
const posterColumns = [
  ["coffee", "milky"],
  ["food", "tea"],
  ["mocktail", "herbal"]
];
const columnX = [36, 402, 768];
const columnWidth = 340;
const columnGap = 11;
const posterParts = [];

for (let columnIndex = 0; columnIndex < posterColumns.length; columnIndex += 1) {
  let y = 172;
  for (let categoryIndex = 0; categoryIndex < posterColumns[columnIndex].length; categoryIndex += 1) {
    const categoryId = posterColumns[columnIndex][categoryIndex];
    const category = categoryById.get(categoryId);
    if (!category) {
      throw new Error(`Missing menu poster category: ${categoryId}`);
    }
    const rendered = renderCategory(
      category,
      columnX[columnIndex],
      y,
      columnWidth,
      columnIndex * 2 + categoryIndex + 1
    );
    posterParts.push(rendered.markup);
    y += rendered.height + columnGap;
  }
}

const qrData = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString("base64")}`;
const posterSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="297mm" height="210mm" viewBox="0 0 1123 794" role="img" aria-labelledby="poster-title poster-description">
  <title id="poster-title">Menu Pika Piko Cafe · A4 landscape</title>
  <desc id="poster-description">Menu bilingual dengan QR code menuju ${escapeXml(menuUrl.href)}.</desc>
  <rect width="1123" height="794" fill="#f5f0e7"/>
  <circle cx="60" cy="50" r="22" fill="#30221d"/>
  <circle cx="60" cy="50" r="19" fill="none" stroke="#d7ad88" stroke-opacity=".72"/>
  <text x="60" y="58" fill="#f5f0e7" font-family="Georgia, serif" font-size="29" font-style="italic" text-anchor="middle">P</text>
  <text x="96" y="48" fill="#30221d" font-family="Georgia, serif" font-size="26" font-weight="600">pika piko</text>
  <text x="98" y="64" fill="#765e4c" font-family="Arial, Helvetica, sans-serif" font-size="7" letter-spacing="3.1">CAFE</text>
  <text x="38" y="108" fill="#30221d" font-family="Georgia, serif" font-size="30">Menu · Menu</text>
  <text x="40" y="132" fill="#765e4c" font-family="Arial, Helvetica, sans-serif" font-size="9.5">Coffee, food &amp; drinks · Kopi, makanan &amp; minuman</text>
  <image x="970" y="16" width="124" height="124" href="${qrData}" xlink:href="${qrData}" preserveAspectRatio="xMidYMid meet"/>
  <text x="1032" y="151" fill="#30221d" font-family="Arial, Helvetica, sans-serif" font-size="7" font-weight="700" letter-spacing=".5" text-anchor="middle">PINDAI · SCAN</text>
  <path d="M36 158h1051" stroke="#cdbca9" stroke-width="1"/>
  ${posterParts.join("\n  ")}
  <path d="M36 764h1051" stroke="#cdbca9" stroke-width="1"/>
  <text x="38" y="780" fill="#765e4c" font-family="Arial, Helvetica, sans-serif" font-size="7.5">Pindai QR untuk menu digital · Scan the QR for the digital menu</text>
  <text x="1086" y="780" fill="#765e4c" font-family="Arial, Helvetica, sans-serif" font-size="7.5" text-anchor="end">${escapeXml(menuUrl.host + menuUrl.pathname)}</text>
</svg>`;

await writeFile(resolve(publicDirectory, "menu-poster.svg"), posterSvg, "utf8");
console.log(`Generated bilingual A4 menu poster and QR for ${menuUrl.href}`);
