import {
  STORAGE_KEYS,
  addUniqueProduct,
  bindThemeToggle,
  formatCurrency,
  loadCatalog,
  saveBuyNowPayload,
  showToast,
  updateNavCounts,
} from "../shared/store.js";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "wireless", label: "Wireless" },
  { id: "wired", label: "Wired" },
  { id: "gaming", label: "Gaming" },
  { id: "budget", label: "Budget" },
  { id: "premium", label: "Premium" },
];

const PAGE_SIZE = 9;

const state = {
  allProducts: [],
  filteredProducts: [],
  activeFilter: "all",
  activeSort: "featured",
  search: "",
  currentPage: 1,
};

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const productGrid = document.getElementById("product-grid");
const filterChips = document.getElementById("filter-chips");
const sortSelect = document.getElementById("sort-select");
const resultsCopy = document.getElementById("results-copy");
const activeState = document.getElementById("active-state");
const pagination = document.getElementById("pagination");
const heroMetrics = document.getElementById("hero-metrics");
const toast = document.getElementById("toast");
const cartCountEl = document.getElementById("cart-count");
const wishlistCountEl = document.getElementById("wishlist-count");
const themeToggle = document.getElementById("theme-toggle");
const ratedRail = document.getElementById("rated-rail");
const dealsRail = document.getElementById("deals-rail");

function matchesFilter(product) {
  switch (state.activeFilter) {
    case "wireless":
      return product.isWireless;
    case "wired":
      return product.isWired;
    case "gaming":
      return product.isGaming;
    case "budget":
      return product.isBudget;
    case "premium":
      return product.isPremium;
    default:
      return true;
  }
}

function sortProducts(products) {
  const nextProducts = [...products];

  switch (state.activeSort) {
    case "price-asc":
      nextProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      nextProducts.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      nextProducts.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      break;
    case "reviews":
      nextProducts.sort((a, b) => b.reviews - a.reviews || b.rating - a.rating);
      break;
    case "savings":
      nextProducts.sort((a, b) => b.savings - a.savings || a.price - b.price);
      break;
    default:
      nextProducts.sort(
        (a, b) => b.featuredScore - a.featuredScore || b.rating - a.rating,
      );
  }

  return nextProducts;
}

function updateMetricCards() {
  const wirelessCount = state.allProducts.filter((product) => product.isWireless)
    .length;
  const topRatedCount = state.allProducts.filter((product) => product.rating >= 4.4)
    .length;

  heroMetrics.innerHTML = `
    <article class="metric-card">
      <strong>${state.allProducts.length}</strong>
      <span>catalog items from your JSON</span>
    </article>
    <article class="metric-card">
      <strong>${wirelessCount}</strong>
      <span>wireless-ready headphone options</span>
    </article>
    <article class="metric-card">
      <strong>${topRatedCount}</strong>
      <span>high-rated picks to feature first</span>
    </article>
  `;
}

function renderFilterChips() {
  filterChips.innerHTML = "";

  FILTERS.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-chip ${state.activeFilter === filter.id ? "active" : ""}`;
    button.textContent = filter.label;
    button.addEventListener("click", () => {
      state.activeFilter = filter.id;
      state.currentPage = 1;
      renderFilterChips();
      applyState();
    });
    filterChips.appendChild(button);
  });
}

function handleStorageAction(product, key) {
  const result = addUniqueProduct(product, key);
  updateNavCounts({ cartCountEl, wishlistCountEl });
  showToast(toast, result.message);
}

function handleBuyNow(product) {
  saveBuyNowPayload({ type: "single", items: [product] });
  window.location.href = "../BuyNow/BuyNow.html";
}

function renderProducts() {
  productGrid.innerHTML = "";

  if (!state.filteredProducts.length) {
    productGrid.innerHTML = `
      <div class="empty-state">
        No headphones matched your current search and filters. Try another keyword
        or switch back to "All".
      </div>
    `;
    pagination.innerHTML = "";
    return;
  }

  const start = (state.currentPage - 1) * PAGE_SIZE;
  const paginatedProducts = state.filteredProducts.slice(start, start + PAGE_SIZE);

  paginatedProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" />
        <span class="card-badge">${product.badge}</span>
      </div>
      <div class="product-body">
        <div class="seller-line">
          <span><strong>${product.seller}</strong></span>
          <span>${product.shippingLabel}</span>
        </div>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="tag-row">
          ${product.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <div class="price-row">
          <div class="price-block">
            <strong>${formatCurrency(product.price)}</strong>
            ${product.oldPrice ? `<span>${formatCurrency(product.oldPrice)}</span>` : ""}
          </div>
          <div class="rating-pill">
            <strong>${product.rating.toFixed(1)} / 5</strong>
            <span>${product.reviews} reviews</span>
          </div>
        </div>
        <div class="card-meta">
          <div class="meta-card">
            <span>Compatibility</span>
            <strong>${product.platforms.slice(0, 3).join(", ") || "Multi-use"}</strong>
          </div>
          <div class="meta-card">
            <span>Availability</span>
            <strong>${product.stockLabel}</strong>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary add-cart" ${product.isOutOfStock ? "disabled" : ""}>
            Add to cart
          </button>
          <button class="btn btn-secondary add-wishlist">
            Wishlist
          </button>
          <button class="btn btn-ghost buy-now" ${product.isOutOfStock ? "disabled" : ""}>
            Buy now
          </button>
        </div>
        <a class="details-link" href="${product.link}" target="_blank" rel="noreferrer">
          Open product listing
        </a>
      </div>
    `;

    card.querySelector(".add-cart").addEventListener("click", () => {
      handleStorageAction(product, STORAGE_KEYS.cart);
    });
    card.querySelector(".add-wishlist").addEventListener("click", () => {
      handleStorageAction(product, STORAGE_KEYS.wishlist);
    });
    card.querySelector(".buy-now").addEventListener("click", () => {
      handleBuyNow(product);
    });

    productGrid.appendChild(card);
  });
}

function renderPagination() {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(state.filteredProducts.length / PAGE_SIZE);
  if (totalPages <= 1) {
    return;
  }

  const shell = document.createElement("div");
  shell.className = "pagination-shell";

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.textContent = "Previous";
  previousButton.disabled = state.currentPage === 1;
  previousButton.addEventListener("click", () => {
    state.currentPage -= 1;
    renderProducts();
    renderPagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const pageLabel = document.createElement("span");
  pageLabel.textContent = `Page ${state.currentPage} of ${totalPages}`;

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.textContent = "Next";
  nextButton.disabled = state.currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    state.currentPage += 1;
    renderProducts();
    renderPagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  shell.append(previousButton, pageLabel, nextButton);
  pagination.appendChild(shell);
}

function renderActiveState() {
  const activeFilterLabel =
    FILTERS.find((filter) => filter.id === state.activeFilter)?.label || "All";
  const searchText = state.search ? ` for "${state.search}"` : "";

  activeState.textContent = `Showing ${state.filteredProducts.length} item(s) in ${activeFilterLabel}${searchText}.`;
  resultsCopy.textContent = `${state.allProducts.length} products loaded from your headphone dataset.`;
}

function renderRail(track, products) {
  track.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "rail-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.tags.join(" | ")}</p>
      <div class="rail-card-footer">
        <strong>${formatCurrency(product.price)}</strong>
        <button class="btn btn-secondary rail-buy" ${product.isOutOfStock ? "disabled" : ""}>
          Buy now
        </button>
      </div>
    `;

    card.querySelector(".rail-buy").addEventListener("click", () => {
      handleBuyNow(product);
    });

    track.appendChild(card);
  });
}

function setupRailButtons(previousId, nextId, track) {
  const previousButton = document.getElementById(previousId);
  const nextButton = document.getElementById(nextId);

  previousButton.addEventListener("click", () => {
    track.scrollBy({ left: -320, behavior: "smooth" });
  });

  nextButton.addEventListener("click", () => {
    track.scrollBy({ left: 320, behavior: "smooth" });
  });
}

function applyState() {
  const query = state.search.trim().toLowerCase();

  const filtered = state.allProducts.filter((product) => {
    const matchesSearch =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesSearch && matchesFilter(product);
  });

  state.filteredProducts = sortProducts(filtered);
  renderActiveState();
  renderProducts();
  renderPagination();
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.search = searchInput.value;
  state.currentPage = 1;
  applyState();
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  state.currentPage = 1;
  applyState();
});

sortSelect.addEventListener("change", (event) => {
  state.activeSort = event.target.value;
  state.currentPage = 1;
  applyState();
});

async function initializePage() {
  bindThemeToggle(themeToggle);
  updateNavCounts({ cartCountEl, wishlistCountEl });
  renderFilterChips();

  try {
    state.allProducts = await loadCatalog();
    updateMetricCards();
    applyState();

    const topRated = [...state.allProducts]
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, 10);

    const deals = [...state.allProducts]
      .sort((a, b) => b.savings - a.savings || a.price - b.price)
      .slice(0, 10);

    renderRail(ratedRail, topRated);
    renderRail(dealsRail, deals);
    setupRailButtons("rated-prev", "rated-next", ratedRail);
    setupRailButtons("deals-prev", "deals-next", dealsRail);
  } catch (error) {
    resultsCopy.textContent =
      "The catalog could not be loaded. Make sure this app is served through Live Server or a local JSON server.";
    productGrid.innerHTML = `
      <div class="empty-state">
        We could not read products from <code>ElectronicsAccescories/db.json</code>.
        Serve the folder locally, then refresh the page.
      </div>
    `;
    showToast(toast, error.message);
  }
}

initializePage();
