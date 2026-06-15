export const STORAGE_KEYS = Object.freeze({
  cart: "headphoneCart",
  wishlist: "headphoneWishlist",
  buyNow: "headphoneBuyNow",
  theme: "headphoneTheme",
});

const DATA_SOURCES = [
  "../db.json",
  "../data/db.json",
  "http://127.0.0.1:3000/organic_results",
  "http://localhost:3000/organic_results",
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80";

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function cleanText(raw = "") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${raw}</body>`, "text/html");
  const decoded = doc.body.textContent || "";

  return decoded
    .replace(/\u00E2\u20AC\u201D/g, "-")
    .replace(/\u00E2\u20AC\u201C/g, "-")
    .replace(/\u00E2\u20AC\u2122/g, "'")
    .replace(/\u00C2\u00B7/g, "|")
    .replace(/\s+/g, " ")
    .trim();
}

function detectPlatforms(title) {
  const platforms = [];

  if (title.includes("ps5")) platforms.push("PS5");
  if (title.includes("ps4")) platforms.push("PS4");
  if (title.includes("xbox")) platforms.push("Xbox");
  if (title.includes("pc")) platforms.push("PC");
  if (title.includes("switch")) platforms.push("Switch");
  if (title.includes("mobile")) platforms.push("Mobile");
  if (title.includes("mac")) platforms.push("Mac");

  return platforms;
}

function pickBadge(item, price, oldPrice, rating, reviews) {
  if (item.out_of_stock) {
    return "Sold out";
  }

  if (oldPrice && oldPrice > price) {
    return `Save ${formatCurrency(oldPrice - price)}`;
  }

  if (rating >= 4.5 && reviews >= 300) {
    return "Top rated";
  }

  if (item.sponsored) {
    return "Featured";
  }

  if (price <= 40) {
    return "Value pick";
  }

  return "Hot right now";
}

function buildDescription(item, seller, title, platforms, isWireless, isWired) {
  if (item.description) {
    return cleanText(item.description);
  }

  const soundLine = title.includes("noise cancelling")
    ? "Noise cancelling audio"
    : title.includes("surround")
      ? "Surround-ready sound"
      : title.includes("stereo")
        ? "Stereo-tuned playback"
        : "Immersive everyday audio";

  const connectionLine = isWireless
    ? "wireless freedom"
    : isWired
      ? "low-latency wired performance"
      : "multi-device gaming comfort";

  const platformLine = platforms.length
    ? `for ${platforms.slice(0, 3).join(", ")}`
    : "for work, play, and long listening sessions";

  return `${soundLine} with ${connectionLine}, curated by ${seller} ${platformLine}.`;
}

export function getStorage(key, fallback = []) {
  return parseJson(localStorage.getItem(key), fallback);
}

export function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function updateNavCounts({ cartCountEl, wishlistCountEl }) {
  const cart = getStorage(STORAGE_KEYS.cart, []);
  const wishlist = getStorage(STORAGE_KEYS.wishlist, []);

  if (cartCountEl) {
    cartCountEl.textContent = String(cart.length);
  }

  if (wishlistCountEl) {
    wishlistCountEl.textContent = String(wishlist.length);
  }
}

export function showToast(toastEl, message, duration = 1800) {
  if (!toastEl) {
    return;
  }

  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastEl.classList.add("visible");

  window.clearTimeout(window.__headphoneToastTimeout);
  window.__headphoneToastTimeout = window.setTimeout(() => {
    toastEl.classList.remove("visible");
    toastEl.classList.add("hidden");
  }, duration);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function updateThemeButton(button, theme) {
  if (!button) {
    return;
  }

  const nextModeLabel = theme === "dark" ? "Light mode" : "Dark mode";
  button.textContent = nextModeLabel;
  button.setAttribute("aria-label", `Switch to ${nextModeLabel.toLowerCase()}`);
}

export function bindThemeToggle(button) {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "light";
  applyTheme(savedTheme);
  updateThemeButton(button, savedTheme);

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
    updateThemeButton(button, nextTheme);
  });
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function normalizeProduct(item, index) {
  const name = cleanText(item.title || `Headphone ${index + 1}`);
  const title = name.toLowerCase();
  const seller = cleanText(item.seller_name || "Audio Select");
  const price = roundCurrency(
    Number(item.primary_offer?.offer_price ?? item.price ?? 0),
  );
  const oldPriceCandidate = roundCurrency(
    Number(item.primary_offer?.was_price ?? item.was_price ?? 0),
  );
  const oldPrice = oldPriceCandidate > price ? oldPriceCandidate : null;
  const rating = roundCurrency(Number(item.rating ?? 0));
  const reviews = Number(item.reviews ?? 0);
  const isWireless = title.includes("wireless") || title.includes("bluetooth");
  const isWired = title.includes("wired") || title.includes("3.5mm");
  const isGaming =
    title.includes("gaming") ||
    title.includes("ps5") ||
    title.includes("xbox") ||
    title.includes("switch");
  const platforms = detectPlatforms(title);
  const stockLabel = item.out_of_stock ? "Out of stock" : "Ready to ship";
  const shippingLabel =
    item.free_shipping_with_walmart_plus || item.free_shipping
      ? "Shipping available"
      : "Store delivery";
  const badge = pickBadge(item, price, oldPrice, rating, reviews);
  const tags = unique([
    isWireless ? "Wireless" : isWired ? "Wired" : "Hybrid",
    isGaming ? "Gaming" : "Everyday",
    platforms[0],
    price >= 100 ? "Premium" : price <= 40 ? "Budget" : "Popular",
  ]);
  const featuredScore =
    rating * 20 +
    Math.min(reviews / 50, 30) +
    (item.sponsored ? 6 : 0) +
    (oldPrice ? 8 : 0);

  return {
    id: item.product_id || item.us_item_id || `audio-${index + 1}`,
    name,
    description: buildDescription(
      item,
      seller,
      title,
      platforms,
      isWireless,
      isWired,
    ),
    price,
    oldPrice,
    rating,
    reviews,
    seller,
    image: item.thumbnail || FALLBACK_IMAGE,
    badge,
    tags,
    platforms,
    link: item.product_page_url || "#",
    stockLabel,
    shippingLabel,
    isOutOfStock: Boolean(item.out_of_stock),
    isWireless,
    isWired,
    isGaming,
    isBudget: price <= 40,
    isPremium: price >= 100,
    savings: oldPrice ? roundCurrency(oldPrice - price) : 0,
    featuredScore,
  };
}

async function fetchSource(source) {
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load ${source}`);
  }

  return response.json();
}

export async function loadCatalog() {
  for (const source of DATA_SOURCES) {
    try {
      const data = await fetchSource(source);
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.organic_results)
          ? data.organic_results
          : Array.isArray(data.products)
            ? data.products
            : [];

      if (items.length) {
        return items.map(normalizeProduct);
      }
    } catch {
      continue;
    }
  }

  throw new Error("Could not load headphone catalog data.");
}

export function addUniqueProduct(product, key) {
  const items = getStorage(key, []);

  if (items.some((item) => item.id === product.id)) {
    return {
      added: false,
      message: `${product.name} is already saved.`,
    };
  }

  const nextItems = [...items, product];
  setStorage(key, nextItems);

  return {
    added: true,
    message:
      key === STORAGE_KEYS.cart
        ? `${product.name} added to cart.`
        : `${product.name} added to wishlist.`,
  };
}

export function removeStoredProduct(key, productId) {
  const items = getStorage(key, []);
  const nextItems = items.filter((item) => item.id !== productId);
  setStorage(key, nextItems);
  return nextItems;
}

export function clearStoredProducts(key) {
  setStorage(key, []);
}

export function saveBuyNowPayload(payload) {
  setStorage(STORAGE_KEYS.buyNow, payload);
}

export function getBuyNowPayload() {
  return getStorage(STORAGE_KEYS.buyNow, null);
}

export function clearBuyNowPayload() {
  localStorage.removeItem(STORAGE_KEYS.buyNow);
}

export function calculateOrderTotals(items) {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = roundCurrency(
    safeItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
  );
  const estimatedSavings = roundCurrency(
    safeItems.reduce((sum, item) => sum + Number(item.savings || 0), 0),
  );
  const shipping = safeItems.length === 0 ? 0 : subtotal >= 150 ? 0 : 11.99;
  const tax = roundCurrency(subtotal * 0.08);
  const total = roundCurrency(subtotal + shipping + tax);

  return {
    itemCount: safeItems.length,
    subtotal,
    estimatedSavings,
    shipping,
    tax,
    total,
  };
}
