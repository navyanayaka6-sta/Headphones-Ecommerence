import {
  STORAGE_KEYS,
  addUniqueProduct,
  bindThemeToggle,
  calculateOrderTotals,
  clearStoredProducts,
  formatCurrency,
  getStorage,
  removeStoredProduct,
  saveBuyNowPayload,
  showToast,
  updateNavCounts,
} from "../shared/store.js";

const cartList = document.getElementById("cart-list");
const cartSummary = document.getElementById("cart-summary");
const cartTotals = document.getElementById("cart-totals");
const clearCartButton = document.getElementById("clear-cart");
const checkoutCartButton = document.getElementById("checkout-cart");
const toast = document.getElementById("toast");
const themeToggle = document.getElementById("theme-toggle");
const cartCountEl = document.getElementById("cart-count");
const wishlistCountEl = document.getElementById("wishlist-count");

function moveToWishlist(product) {
  addUniqueProduct(product, STORAGE_KEYS.wishlist);
  removeStoredProduct(STORAGE_KEYS.cart, product.id);
  renderCart();
  showToast(toast, `${product.name} moved to wishlist.`);
}

function renderTotals(items) {
  const totals = calculateOrderTotals(items);
  cartTotals.innerHTML = `
    <div class="summary-row">
      <span>Items</span>
      <strong>${totals.itemCount}</strong>
    </div>
    <div class="summary-row">
      <span>Subtotal</span>
      <strong>${formatCurrency(totals.subtotal)}</strong>
    </div>
    <div class="summary-row">
      <span>Estimated savings</span>
      <strong>${formatCurrency(totals.estimatedSavings)}</strong>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <strong>${totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</strong>
    </div>
    <div class="summary-row">
      <span>Estimated tax</span>
      <strong>${formatCurrency(totals.tax)}</strong>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <strong>${formatCurrency(totals.total)}</strong>
    </div>
  `;
}

function renderCart() {
  const items = getStorage(STORAGE_KEYS.cart, []);
  updateNavCounts({ cartCountEl, wishlistCountEl });
  cartList.innerHTML = "";
  renderTotals(items);

  if (!items.length) {
    cartSummary.textContent =
      "Your cart is empty right now. Add a few headphones from the storefront to continue.";
    cartList.innerHTML = `
      <div class="empty-state">
        Your cart is empty. Browse the catalog and save a few products here to test
        the checkout flow.
      </div>
    `;
    return;
  }

  cartSummary.textContent = `You currently have ${items.length} item(s) ready for checkout.`;

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
          ${product.oldPrice ? `<span>${formatCurrency(product.oldPrice)}</span>` : ""}
        </div>
        <div class="item-actions">
          <button class="btn btn-primary buy-single">Buy now</button>
          <button class="btn btn-secondary move-wishlist">Move to wishlist</button>
          <button class="btn btn-ghost remove-item">Remove</button>
        </div>
      </div>
    `;

    card.querySelector(".buy-single").addEventListener("click", () => {
      saveBuyNowPayload({ type: "single", items: [product] });
      window.location.href = "../BuyNow/BuyNow.html";
    });

    card.querySelector(".move-wishlist").addEventListener("click", () => {
      moveToWishlist(product);
    });

    card.querySelector(".remove-item").addEventListener("click", () => {
      removeStoredProduct(STORAGE_KEYS.cart, product.id);
      renderCart();
      showToast(toast, `${product.name} removed from cart.`);
    });

    cartList.appendChild(card);
  });
}

clearCartButton.addEventListener("click", () => {
  clearStoredProducts(STORAGE_KEYS.cart);
  renderCart();
  showToast(toast, "Cart cleared.");
});

checkoutCartButton.addEventListener("click", () => {
  const items = getStorage(STORAGE_KEYS.cart, []);
  if (!items.length) {
    showToast(toast, "Your cart is empty.");
    return;
  }

  saveBuyNowPayload({ type: "cart", items });
  window.location.href = "../BuyNow/BuyNow.html";
});

bindThemeToggle(themeToggle);
renderCart();
