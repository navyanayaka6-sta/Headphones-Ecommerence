# ElectronicsAccescories

`ElectronicsAccescories` is a browser-only ecommerce demo for headphones and gaming audio products. It is built with plain HTML, CSS, and JavaScript and presents a small storefront experience called `SonicCart`.

This project includes:

- A homepage product catalog
- Search, sorting, filter chips, and pagination
- Cart and wishlist flows
- A single-item and full-cart checkout flow
- Theme persistence with light and dark mode
- Local storage based state management

There is no backend in this project. Product data is loaded from JSON, and user state is stored in the browser with `localStorage`.

## What This Project Demonstrates

This project is useful if you want to learn or showcase:

- Multi-page ecommerce UI with vanilla JavaScript
- Shared state between pages using browser storage
- Rendering product cards from external JSON data
- Responsive UI design without frameworks
- Reusable utility modules and shared styling

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript with ES modules
- JSON as the product data source
- `localStorage` for cart, wishlist, checkout, and theme state

## Main Features

- Data-driven product catalog loaded from `db.json`
- Product normalization before rendering
- Search across product name, description, and tags
- Filter chips for `All`, `Wireless`, `Wired`, `Gaming`, `Budget`, and `Premium`
- Sorting by featured order, price, rating, review count, and savings
- Product pagination on the homepage
- Curated rails for top-rated and discount-focused products
- Add to cart and add to wishlist actions
- Buy now flow for a single product
- Checkout all flow from the cart page
- Wishlist-to-cart movement
- Toast feedback messages for user actions
- Light and dark theme toggle with persistence

## Folder Structure

```text
ElectronicsAccescories/
|-- db.json
|-- README.md
|-- shared/
|   |-- base.css
|   `-- store.js
|-- HomePage/
|   |-- index.html
|   |-- index.css
|   `-- index.js
|-- AddToCart/
|   |-- AddToCart.html
|   |-- AddToCart.css
|   `-- AddToCart.js
|-- AddtoWishlist/
|   |-- AddtoWishlist.html
|   |-- AddtoWishlist.css
|   `-- AddtoWishlist.js
`-- BuyNow/
    |-- BuyNow.html
    |-- BuyNow.css
    |-- BuyNow.js
    `-- BuyNo.w.html
```

## Page Overview

### `HomePage/index.html`

This is the main catalog page for the store.

It includes:

- Brand header and navigation
- Search form
- Theme toggle
- Product filters and sorting controls
- Paginated product grid
- Curated product rails
- Toast message area

The homepage script in `HomePage/index.js` is responsible for:

- Loading and normalizing catalog data
- Filtering by search and active chip
- Sorting the visible products
- Rendering product cards
- Rendering pagination
- Rendering the "Top rated" and "Price drops" rails
- Sending selected items into cart, wishlist, or checkout

### `AddToCart/AddToCart.html`

This page shows all items the user has saved to the cart.

The cart page supports:

- Viewing saved products
- Seeing calculated totals
- Removing products
- Moving products to the wishlist
- Clearing the full cart
- Checking out all current cart items

The main logic lives in `AddToCart/AddToCart.js`.

### `AddtoWishlist/AddtoWishlist.html`

This page shows the user's saved wishlist items.

The wishlist page supports:

- Viewing favorite products
- Moving one item to the cart
- Moving all items to the cart
- Buying a single saved item directly
- Removing products
- Clearing the full wishlist

The main logic lives in `AddtoWishlist/AddtoWishlist.js`.

### `BuyNow/BuyNow.html`

This is the demo checkout page.

It handles two cases:

- Checkout for one product selected with `Buy now`
- Checkout for all items currently in the cart

The checkout page:

- Reads a temporary checkout payload from storage
- Renders an order form
- Renders the order summary and totals
- Clears temporary checkout data after submission
- Clears cart data if the order came from full-cart checkout
- Redirects the user back to the homepage after a success toast

The main logic lives in `BuyNow/BuyNow.js`.

### `BuyNow/BuyNo.w.html`

This file is a small redirect helper that forwards to `BuyNow.html`. It acts as a safe entry point if an older or mistyped filename is opened.

## User Flow

The typical user journey looks like this:

1. Open the homepage at `HomePage/index.html`.
2. Browse products loaded from `db.json`.
3. Use search, filters, and sorting to narrow the catalog.
4. Add products to cart or wishlist.
5. Choose `Buy now` for single-item checkout, or go to the cart for bulk checkout.
6. Submit the checkout form to simulate a completed order.
7. Return to the homepage after the success message.

## Shared Architecture

One of the strongest parts of this project is the shared code in the `shared` folder.

### `shared/store.js`

This file contains reusable logic used across multiple pages.

Important responsibilities:

- Declares storage keys
- Reads and writes browser storage
- Updates cart and wishlist counts in the header
- Shows temporary toast messages
- Applies and persists theme selection
- Formats money values
- Loads product data from supported sources
- Normalizes raw product data into a UI-friendly object
- Prevents duplicate cart and wishlist entries
- Calculates checkout totals

Important exported functions:

- `getStorage()`
- `setStorage()`
- `updateNavCounts()`
- `showToast()`
- `bindThemeToggle()`
- `formatCurrency()`
- `normalizeProduct()`
- `loadCatalog()`
- `addUniqueProduct()`
- `removeStoredProduct()`
- `clearStoredProducts()`
- `saveBuyNowPayload()`
- `getBuyNowPayload()`
- `clearBuyNowPayload()`
- `calculateOrderTotals()`

### `shared/base.css`

This file contains shared styling used by all pages in the project.

It provides:

- Theme color variables
- Shared button styles
- Shared header and nav styles
- Shared card and layout helpers
- Shared form field styling
- Shared toast styling
- Shared responsive breakpoints

Because of this shared stylesheet, each page-specific CSS file only needs to focus on the layout unique to that page.

## Product Data

### Data source

The main product dataset is stored in:

- `db.json`

The current file contains an `organic_results` array with marketplace-style headphone data.

### Data loading behavior

The `loadCatalog()` function in `shared/store.js` tries these sources in order:

1. `../db.json`
2. `../data/db.json`
3. `http://127.0.0.1:3000/organic_results`
4. `http://localhost:3000/organic_results`

This makes the project flexible enough to run from:

- The included local JSON file
- A local JSON server that exposes compatible product data

### Product normalization

Raw product records are converted into a cleaner frontend model before rendering.

The normalized product object includes fields such as:

- `id`
- `name`
- `description`
- `price`
- `oldPrice`
- `rating`
- `reviews`
- `seller`
- `image`
- `badge`
- `tags`
- `platforms`
- `stockLabel`
- `shippingLabel`
- `isWireless`
- `isWired`
- `isGaming`
- `isBudget`
- `isPremium`
- `savings`
- `featuredScore`

This pattern makes the UI simpler because every page can rely on the same cleaned product shape.

## Local Storage Keys

The project uses these browser storage keys:

| Purpose | Key |
| --- | --- |
| Cart | `headphoneCart` |
| Wishlist | `headphoneWishlist` |
| Buy now payload | `headphoneBuyNow` |
| Theme | `headphoneTheme` |

### What is stored

- `headphoneCart`
  Stores an array of normalized product objects
- `headphoneWishlist`
  Stores an array of normalized product objects
- `headphoneBuyNow`
  Stores a temporary object such as `{ type: "single", items: [...] }` or `{ type: "cart", items: [...] }`
- `headphoneTheme`
  Stores the currently selected theme value

## Styling and UI Design

The visual direction of this project is based on:

- Rounded surface cards
- Soft gradients and glass-like panels
- A sticky top navigation bar
- A warm accent color for call-to-action buttons
- `DM Sans` and `Space Grotesk` from Google Fonts

The shared theme system allows the store to switch between light and dark mode while preserving consistent spacing, typography, and button styling.

## Running the Project

Because the app uses `fetch()` to load JSON, it should be served through a local web server. Opening the HTML files directly with `file:///` may prevent the catalog from loading.

### Option 1: VS Code Live Server

1. Open the project folder in VS Code.
2. Right-click `HomePage/index.html`.
3. Choose `Open with Live Server`.

### Option 2: Python HTTP Server

From the `ElectronicsAccescories` folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/HomePage/index.html
```

### Option 3: Node static server

From the `ElectronicsAccescories` folder:

```bash
npx serve .
```

Then open the URL shown by the server and navigate to `HomePage/index.html`.

## Recommended Starting Pages

- `HomePage/index.html` for the main storefront
- `AddToCart/AddToCart.html` for cart testing
- `AddtoWishlist/AddtoWishlist.html` for wishlist testing
- `BuyNow/BuyNow.html` for checkout testing

The usual starting point is `HomePage/index.html`.

## Important Implementation Notes

### 1. The project is frontend-only

There is no server-side checkout, user account system, inventory service, or payment integration. All actions are simulated on the client.

### 2. Cart and wishlist state are persistent

Data remains stored in the browser until it is cleared manually or removed by the app.

### 3. Full-cart checkout and single-item checkout share the same page

Instead of having two checkout pages, the project stores a temporary payload that tells the checkout page what to render.

### 4. The homepage builds product experience from normalized data

Instead of trusting the raw JSON structure everywhere, the project cleans the data once and uses a stable product model afterward.

## How to Extend the Project

Here are some practical improvement ideas:

### Add more product filters

Examples:

- Seller filter
- Platform filter
- In-stock only toggle
- Price range filter

### Improve the checkout form

Examples:

- Better validation feedback
- Coupon input
- Dynamic shipping cost changes
- Different payment field sections
- Order confirmation step

### Add quantity support

Right now the cart stores items as a flat list of unique products. You could expand it to support:

- Quantities per item
- Quantity controls in the cart
- More advanced total calculations

### Replace local JSON with an API

Possible upgrades:

- Fetch data from a custom backend
- Store cart and wishlist server-side
- Support user sign-in and saved sessions

### Add tests

Good candidates:

- Tests for `normalizeProduct()`
- Tests for `calculateOrderTotals()`
- End-to-end tests for the catalog-to-checkout flow

## Troubleshooting

### Products do not appear on the homepage

Possible causes:

- The project was opened directly from the filesystem
- The local server was started from the wrong folder
- The JSON file path is not reachable

Fix:

- Serve the project through a local web server
- Make sure `db.json` is available relative to the current page

### Cart or wishlist counts do not match expectations

Possible causes:

- Old data is still stored in `localStorage`
- You switched browsers or browser profiles
- The storage was cleared manually

Fix:

- Clear browser storage and test again
- Re-add products from the homepage

### Theme does not stay selected

Possible causes:

- Browser storage was cleared
- `localStorage` is blocked or disabled in the browser

Fix:

- Check browser storage permissions
- Confirm the browser is allowing local storage for the page

## Good Learning Areas in This Project

This project is a strong reference if you are practicing:

- DOM rendering with template strings and dynamic elements
- Reusable JavaScript modules
- Cross-page browser storage
- Product-card based UI systems
- Filter and sort logic
- Simple checkout simulation
- Shared design systems in static sites

## Summary

`ElectronicsAccescories` is a clean multi-page storefront demo that shows how far a static web app can go with just HTML, CSS, JavaScript, JSON, and browser storage.

Its strongest qualities are:

- Shared architecture through `shared/store.js` and `shared/base.css`
- A complete shopper journey from browsing to checkout
- Data-driven product rendering
- Responsive UI and theme persistence
- Easy-to-read project structure for learning and extension

If you want to understand or present one polished project from this workspace, this is the best one to start with.
