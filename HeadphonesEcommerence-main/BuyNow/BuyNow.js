import {
  STORAGE_KEYS,
  bindThemeToggle,
  calculateOrderTotals,
  clearBuyNowPayload,
  clearStoredProducts,
  formatCurrency,
  getBuyNowPayload,
  showToast,
  updateNavCounts,
} from "../shared/store.js";

// Cache the main page hooks once so the rest of the file can reuse them efficiently.
const checkoutMain = document.getElementById("checkout-main");
const checkoutSummary = document.getElementById("checkout-summary");
const toast = document.getElementById("toast");
const themeToggle = document.getElementById("theme-toggle");
const cartCountEl = document.getElementById("cart-count");
const wishlistCountEl = document.getElementById("wishlist-count");

function renderEmptyState() {
  // Show a helpful fallback when no product or cart payload was passed to checkout.
  checkoutMain.innerHTML = `
    <span class="eyebrow">No selection</span>
    <h2>Nothing is queued for checkout yet.</h2>
    <p>
      Start from the homepage or your cart, then use Buy now or Checkout all to
      reach this page with an order summary.
    </p>
    <div class="checkout-actions">
      <a href="../HomePage/index.html" class="btn btn-primary">Browse products</a>
      <a href="../AddToCart/AddToCart.html" class="btn btn-secondary">Open cart</a>
    </div>
  `;

  // Mirror the same empty state in the order summary panel.
  checkoutSummary.innerHTML = `
    <h2>Order summary</h2>
    <div class="empty-state">No checkout items available.</div>
  `;
}

function renderCheckoutForm(payload) {
  // Normalize the incoming payload so template rendering always receives an array.
  const items = Array.isArray(payload?.items) ? payload.items : [];

  checkoutMain.innerHTML = `
    <span class="eyebrow">Delivery details</span>
    <!-- Adjust the heading depending on whether checkout came from a full cart or a single buy-now action. -->
    <h2>${payload?.type === "cart" ? "Complete your full cart order" : "Complete your headphone order"}</h2>
    <p>
      This is a frontend-only checkout demo. Fill out the form to simulate a real
      ecommerce order flow.
    </p>
    <form id="checkout-form" class="checkout-form">
      <!-- Group personal, shipping, and payment inputs in a responsive two-column grid. -->
      <div class="form-grid">
        <label class="field">
          <span>Full name</span>
          <input type="text" name="name" placeholder="Alex Carter" required />
        </label>
        <label class="field">
          <span>Email</span>
          <input type="email" name="email" placeholder="alex@example.com" required />
        </label>
        <label class="field">
          <span>Phone</span>
          <input type="tel" name="phone" placeholder="+1 555 0147" required />
        </label>
        <label class="field">
          <span>City</span>
          <input type="text" name="city" placeholder="San Francisco" required />
        </label>
        <label class="field full">
          <span>Shipping address</span>
          <input type="text" name="address" placeholder="221 Market Street" required />
        </label>
        <label class="field">
          <span>Payment method</span>
          <select name="payment" required>
            <option value="card">Credit card</option>
            <option value="paypal">PayPal</option>
            <option value="cod">Cash on delivery</option>
          </select>
        </label>
        <label class="field">
          <span>Delivery speed</span>
          <select name="delivery" required>
            <option value="standard">Standard delivery</option>
            <option value="express">Express delivery</option>
          </select>
        </label>
        <label class="field full">
          <span>Order notes</span>
          <textarea
            name="notes"
            rows="4"
            placeholder="Any delivery notes for this headphone order?"
          ></textarea>
        </label>
      </div>

      <div class="checkout-actions">
        <button type="submit" class="btn btn-primary">Place demo order</button>
        <a href="../HomePage/index.html" class="btn btn-secondary">Keep shopping</a>
      </div>
    </form>
  `;

  // Attach submit behavior after the form exists in the DOM.
  const form = document.getElementById("checkout-form");
  form.addEventListener("submit", (event) => {
    // Prevent a real page reload because this checkout is only simulating an order.
    event.preventDefault();

    if (payload?.type === "cart") {
      // Full-cart checkout should empty the stored cart once the order is confirmed.
      clearStoredProducts(STORAGE_KEYS.cart);
    }

    // Clear temporary checkout data so stale items do not reappear on the next visit.
    clearBuyNowPayload();
    // Refresh the cart and wishlist counters shown in the shared header.
    updateNavCounts({ cartCountEl, wishlistCountEl });
    // Surface a short success message before sending the user back to browsing.
    showToast(toast, `Demo order placed for ${items.length} item(s).`);

    // Delay navigation slightly so the user has time to notice the confirmation toast.
    window.setTimeout(() => {
      window.location.href = "../HomePage/index.html";
    }, 1200);
  });
}

function renderSummary(payload) {
  // Reuse the same payload items to build the visual order summary and totals.
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const totals = calculateOrderTotals(items);

  checkoutSummary.innerHTML = `
    <h2>Order summary</h2>
    <div class="summary-items">
      ${items
        .map(
          // Each product is rendered as a compact summary card with image, tags, and price.
          (product) => `
            <article class="summary-item">
              <img src="${product.image}" alt="${product.name}" />
              <div>
                <h3>${product.name}</h3>
                <p>${product.tags.join(" | ")}</p>
                <p><strong>${formatCurrency(product.price)}</strong></p>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>

    <!-- Totals translate raw product data into a realistic checkout breakdown. -->
    <div class="summary-total-list">
      <div class="summary-total-row">
        <span>Items</span>
        <strong>${totals.itemCount}</strong>
      </div>
      <div class="summary-total-row">
        <span>Subtotal</span>
        <strong>${formatCurrency(totals.subtotal)}</strong>
      </div>
      <div class="summary-total-row">
        <span>Savings highlighted</span>
        <strong>${formatCurrency(totals.estimatedSavings)}</strong>
      </div>
      <div class="summary-total-row">
        <span>Shipping</span>
        <strong>${totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</strong>
      </div>
      <div class="summary-total-row">
        <span>Tax</span>
        <strong>${formatCurrency(totals.tax)}</strong>
      </div>
      <div class="summary-total-row total">
        <span>Total due</span>
        <strong>${formatCurrency(totals.total)}</strong>
      </div>
    </div>

    <!-- Trust points mimic the reassurance content normally found in a real checkout sidebar. -->
    <div class="trust-points">
      <div class="trust-point">
        <strong>14-day returns</strong>
        <span>Useful for testing a realistic policy section in the demo.</span>
      </div>
      <div class="trust-point">
        <strong>Secure checkout messaging</strong>
        <span>Ideal for the conversion-focused area of a storefront page.</span>
      </div>
      <div class="trust-point">
        <strong>Responsive summary card</strong>
        <span>Stays sticky on desktop and stacks cleanly on mobile.</span>
      </div>
    </div>
  `;
}

function initializePage() {
  // Restore cross-page UI features before deciding what checkout state to show.
  bindThemeToggle(themeToggle);
  updateNavCounts({ cartCountEl, wishlistCountEl });

  const payload = getBuyNowPayload();
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    // Exit early when there is no valid checkout data to render.
    renderEmptyState();
    return;
  }

  // Render both halves of the page from the same payload for a synchronized checkout view.
  renderCheckoutForm(payload);
  renderSummary(payload);
}

// Start the checkout page once the module has loaded.
initializePage();
