import {
  STORAGE_KEYS,
  addUniqueProduct,
  bindThemeToggle,
  clearStoredProducts,
  formatCurrency,
  getStorage,
  removeStoredProduct,
  saveBuyNowPayload,
  showToast,
  updateNavCounts,
} from "../shared/store.js";

const wishlistList = document.getElementById("wishlist-list");
const wishlistSummary = document.getElementById("wishlist-summary");
const wishlistStats = document.getElementById("wishlist-stats");
const moveAllToCartButton = document.getElementById("move-all-to-cart");
const clearWishlistButton = document.getElementById("clear-wishlist");
const toast = document.getElementById("toast");
const themeToggle = document.getElementById("theme-toggle");
const cartCountEl = document.getElementById("cart-count");
const wishlistCountEl = document.getElementById("wishlist-count");

function moveToCart(product, shouldShowToast = true) {
  addUniqueProduct(product, STORAGE_KEYS.cart);
  removeStoredProduct(STORAGE_KEYS.wishlist, product.id);
  renderWishlist();

  if (shouldShowToast) {
    showToast(toast, `${product.name} moved to cart.`);
  }
}

function renderStats(items) {
  const premiumCount = items.filter((product) => product.isPremium).length;
  const wirelessCount = items.filter((product) => product.isWireless).length;

  wishlistStats.innerHTML = `
    <div class="summary-row">
      <span>Saved items</span>
      <strong>${items.length}</strong>
    </div>
    <div class="summary-row">
      <span>Wireless picks</span>
      <strong>${wirelessCount}</strong>
    </div>
    <div class="summary-row">
      <span>Premium picks</span>
      <strong>${premiumCount}</strong>
    </div>
  `;
}

function renderWishlist() {
  const items = getStorage(STORAGE_KEYS.wishlist, []);
  updateNavCounts({ cartCountEl, wishlistCountEl });
  wishlistList.innerHTML = "";
  renderStats(items);

  if (!items.length) {
    wishlistSummary.textContent =
      "Your wishlist is empty right now. Save a few products from the homepage to test this flow.";
    wishlistList.innerHTML = `
      <div class="empty-state">
        No saved products yet. Add headphones to your wishlist from the homepage,
        then manage them here.
      </div>
    `;
    return;
  }

  wishlistSummary.textContent = `You currently have ${items.length} favorite item(s) saved.`;

  items.forEach((product) => {
    const card = document.createElement("article");
    card.className = "collection-item";
    card.innerHTML = `
      <div class="item-visual">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="item-copy">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <div class="item-tags">
          ${product.tags.map((tag) => `<span class="pill">${tag}</span>`).join("")}
        </div>
        <div class="item-price">
          <strong>${formatCurrency(product.price)}</strong>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary move-cart">Move to cart</button>
          <button class="btn btn-secondary buy-single">Buy now</button>
          <button class="btn btn-ghost remove-item">Remove</button>
        </div>
      </div>
    `;

    card.querySelector(".move-cart").addEventListener("click", () => {
      moveToCart(product);
    });

    card.querySelector(".buy-single").addEventListener("click", () => {
      saveBuyNowPayload({ type: "single", items: [product] });
      window.location.href = "../BuyNow/BuyNow.html";
    });

    card.querySelector(".remove-item").addEventListener("click", () => {
      removeStoredProduct(STORAGE_KEYS.wishlist, product.id);
      renderWishlist();
      showToast(toast, `${product.name} removed from wishlist.`);
    });

    wishlistList.appendChild(card);
  });
}

moveAllToCartButton.addEventListener("click", () => {
  const items = getStorage(STORAGE_KEYS.wishlist, []);

  if (!items.length) {
    showToast(toast, "Your wishlist is empty.");
    return;
  }

  items.forEach((product) => {
    addUniqueProduct(product, STORAGE_KEYS.cart);
  });
  clearStoredProducts(STORAGE_KEYS.wishlist);
  renderWishlist();
  showToast(toast, "Wishlist moved to cart.");
});

clearWishlistButton.addEventListener("click", () => {
  clearStoredProducts(STORAGE_KEYS.wishlist);
  renderWishlist();
  showToast(toast, "Wishlist cleared.");
});

bindThemeToggle(themeToggle);
renderWishlist();
