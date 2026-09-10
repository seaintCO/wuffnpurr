const fallbackProducts = [
  {
    "productId": "preview_pawbridge",
    "priceId": "preview_pawbridge",
    "name": "PawBridge Pet Stairs",
    "description": "Soft-step stairs designed to make beds, sofas and favorite spaces easier to reach.",
    "price": 39.99,
    "unitAmount": 3999,
    "currency": "usd",
    "image": "/assets/pawbridge-stairs.jpg",
    "category": "Home",
    "featured": true,
    "hero": true,
    "sort": 1
  },
  {
    "productId": "preview_haven",
    "priceId": "preview_haven",
    "name": "Haven Pet Bed",
    "description": "A supportive everyday bed created for comfortable lounging and overnight rest.",
    "price": 79.99,
    "unitAmount": 7999,
    "currency": "usd",
    "image": "/assets/haven-pet-bed.jpg",
    "category": "Home",
    "featured": true,
    "hero": false,
    "sort": 2
  },
  {
    "productId": "preview_companion",
    "priceId": "preview_companion",
    "name": "Companion Collar",
    "description": "A refined adjustable collar built for everyday comfort, walks and identification.",
    "price": 24.99,
    "unitAmount": 2499,
    "currency": "usd",
    "image": "/assets/companion-collar.jpg",
    "category": "Wear",
    "featured": false,
    "hero": false,
    "sort": 3
  },
  {
    "productId": "preview_waypoint",
    "priceId": "preview_waypoint",
    "name": "Waypoint Travel Kit",
    "description": "A considered travel system for road trips, weekends away and daily life on the move.",
    "price": 49.99,
    "unitAmount": 4999,
    "currency": "usd",
    "image": "/assets/waypoint-travel-kit.jpg",
    "category": "Travel",
    "featured": false,
    "hero": false,
    "sort": 4
  },
  {
    "productId": "preview_shedaway",
    "priceId": "preview_shedaway",
    "name": "ShedAway Vacuum",
    "description": "Compact pet-hair cleanup for furniture, rugs, vehicles and the places fur collects most.",
    "price": 44.99,
    "unitAmount": 4499,
    "currency": "usd",
    "image": "/assets/shedaway-vacuum.jpg",
    "category": "Grooming",
    "featured": true,
    "hero": false,
    "sort": 5
  },
  {
    "productId": "preview_roadpaws",
    "priceId": "preview_roadpaws",
    "name": "RoadPaws",
    "description": "A padded travel seat created for cleaner, calmer and more comfortable car rides.",
    "price": 54.99,
    "unitAmount": 5499,
    "currency": "usd",
    "image": "/assets/roadpaws.jpg",
    "category": "Travel",
    "featured": false,
    "hero": false,
    "sort": 6
  },
  {
    "productId": "preview_nailgrinder",
    "priceId": "preview_nailgrinder",
    "name": "Pet Nail Grinder",
    "description": "Controlled at-home nail care in a compact format made for routine grooming.",
    "price": 19.99,
    "unitAmount": 1999,
    "currency": "usd",
    "image": "/assets/pet-nail-grinder.jpg",
    "category": "Grooming",
    "featured": false,
    "hero": false,
    "sort": 7
  },
  {
    "productId": "preview_freshnest",
    "priceId": "preview_freshnest",
    "name": "FreshNest",
    "description": "A premium self-cleaning home-care solution created to simplify daily litter maintenance.",
    "price": 249.99,
    "unitAmount": 24999,
    "currency": "usd",
    "image": "/assets/freshnest.jpg",
    "category": "Home",
    "featured": true,
    "hero": false,
    "sort": 8
  },
  {
    "productId": "preview_gentlegroom",
    "priceId": "preview_gentlegroom",
    "name": "GentleGroom",
    "description": "Gentle coat care for detangling, brushing and everyday loose-hair removal.",
    "price": 29.99,
    "unitAmount": 2999,
    "currency": "usd",
    "image": "/assets/gentlegroom.jpg",
    "category": "Grooming",
    "featured": false,
    "hero": false,
    "sort": 9
  }
];

const state = {
  products: [],
  stripeConnected: false,
  filter: "All",
  sort: "featured",
  query: "",
  cart: loadCart()
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const byId = id => document.getElementById(id);

function loadCart() {
  try {
    const value = JSON.parse(localStorage.getItem("wnp-cart-v10") || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem("wnp-cart-v10", JSON.stringify(state.cart));
}

function imageFor(product) {
  return product.image || "/assets/product-placeholder.svg";
}

function categories() {
  const values = [...new Set(state.products.map(product => product.category).filter(Boolean))];
  return values.sort((a, b) => a.localeCompare(b));
}

function renderNavigation() {
  const items = ["All", ...categories()];
  const desktop = items.map(category => `
    <button class="nav-item ${state.filter === category ? "active" : ""}" type="button" data-filter="${escapeHtml(category)}">
      ${category === "All" ? "SHOP ALL" : escapeHtml(category).toUpperCase()}
    </button>
  `).join("");

  const mobile = items.map(category => `
    <button type="button" data-filter="${escapeHtml(category)}">
      ${category === "All" ? "SHOP ALL" : escapeHtml(category).toUpperCase()}
    </button>
  `).join("");

  byId("desktopNav").innerHTML = desktop;
  byId("mobileNav").innerHTML = mobile;
}

function visibleProducts() {
  let list = state.products.filter(product => {
    const categoryMatch = state.filter === "All" || product.category === state.filter;
    const q = state.query.trim().toLowerCase();
    const text = `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();
    return categoryMatch && (!q || text.includes(q));
  });

  if (state.sort === "low") list = list.slice().sort((a, b) => a.price - b.price);
  if (state.sort === "high") list = list.slice().sort((a, b) => b.price - a.price);
  if (state.sort === "featured") {
    list = list.slice().sort((a, b) => {
      if (a.hero !== b.hero) return a.hero ? -1 : 1;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (a.sort ?? 9999) - (b.sort ?? 9999);
    });
  }

  return list;
}

function renderProducts() {
  const list = visibleProducts();

  byId("productGrid").innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-media">
        <button type="button" data-quick="${product.priceId}" aria-label="View ${escapeHtml(product.name)}">
          <img src="${escapeHtml(imageFor(product))}" alt="${escapeHtml(product.name)}" loading="lazy">
        </button>
      </div>
      <div class="product-meta">
        <span class="product-category">${escapeHtml(product.category || "Collection")}</span>
        <button class="product-name" type="button" data-quick="${product.priceId}">
          ${escapeHtml(product.name)}
        </button>
        <span class="product-price">${money.format(product.price)}</span>
        <button class="product-action add-btn" type="button" data-price-id="${product.priceId}">
          ADD TO BAG
        </button>
      </div>
    </article>
  `).join("");

  byId("emptyState").hidden = list.length > 0;
}

function renderHero() {
  const hero =
    state.products.find(product => product.hero) ||
    state.products.find(product => /pawbridge/i.test(product.name)) ||
    state.products.find(product => product.featured) ||
    state.products[0];

  if (!hero) return;

  byId("heroImage").src = imageFor(hero);
  byId("heroImage").alt = hero.name;
  byId("heroEyebrow").textContent = hero.category ? hero.category.toUpperCase() : "FEATURED";
  byId("heroTitle").innerHTML = escapeHtml(hero.name).replace(/\s+/g, " ").replace("Pet Stairs", "<br>Pet Stairs");
  byId("heroDescription").textContent = hero.description || "An elevated everyday essential from Woof N’ Purr.";
  byId("heroProductName").textContent = hero.name;
  byId("heroPrice").textContent = money.format(hero.price);
  byId("heroAdd").dataset.priceId = hero.priceId;
  byId("heroDiscover").dataset.quick = hero.priceId;
}

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function findProduct(priceId) {
  return state.products.find(product => product.priceId === priceId);
}

function addToCart(priceId) {
  const product = findProduct(priceId);
  if (!product) return;

  state.cart[priceId] = Math.min(10, (state.cart[priceId] || 0) + 1);
  saveCart();
  renderCart();
  showToast(`${product.name.toUpperCase()} ADDED`);
}

function changeQty(priceId, delta) {
  const next = (state.cart[priceId] || 0) + delta;
  if (next <= 0) delete state.cart[priceId];
  else state.cart[priceId] = Math.min(10, next);
  saveCart();
  renderCart();
}

function cleanCart() {
  const known = new Set(state.products.map(product => product.priceId));
  let changed = false;

  for (const priceId of Object.keys(state.cart)) {
    if (!known.has(priceId)) {
      delete state.cart[priceId];
      changed = true;
    }
  }

  if (changed) saveCart();
}

function renderCart() {
  cleanCart();
  const entries = Object.entries(state.cart);

  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const subtotal = entries.reduce((sum, [priceId, quantity]) => {
    const product = findProduct(priceId);
    return sum + (product ? product.price * quantity : 0);
  }, 0);

  byId("cartCount").textContent = `(${count})`;
  byId("cartSubtotal").textContent = money.format(subtotal);

  if (!entries.length) {
    byId("cartItems").innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
    return;
  }

  byId("cartItems").innerHTML = entries.map(([priceId, quantity]) => {
    const product = findProduct(priceId);
    if (!product) return "";

    return `
      <article class="cart-item">
        <img src="${escapeHtml(imageFor(product))}" alt="${escapeHtml(product.name)}">
        <div>
          <h3>${escapeHtml(product.name)}</h3>
          <div class="cart-item-price">${money.format(product.price)}</div>
          <div class="qty-row">
            <button class="qty-btn" type="button" data-dec="${priceId}" aria-label="Decrease quantity">−</button>
            <span>${quantity}</span>
            <button class="qty-btn" type="button" data-inc="${priceId}" aria-label="Increase quantity">+</button>
            <button class="remove-btn" type="button" data-remove="${priceId}">REMOVE</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function setFilter(filter) {
  state.filter = filter;
  renderNavigation();
  renderProducts();
  byId("mobileNav").hidden = true;
  byId("menuToggle").setAttribute("aria-expanded", "false");
  byId("products").scrollIntoView({ behavior: "smooth", block: "start" });
}

function openCart() {
  byId("cartBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  byId("cartBackdrop").hidden = true;
  document.body.style.overflow = "";
}

function openQuick(priceId) {
  const product = findProduct(priceId);
  if (!product) return;

  byId("quickImage").src = imageFor(product);
  byId("quickImage").alt = product.name;
  byId("quickCategory").textContent = product.category || "Collection";
  byId("quickName").textContent = product.name;
  byId("quickPrice").textContent = money.format(product.price);
  byId("quickDescription").textContent = product.description || "Woof N’ Purr pet essential.";
  byId("quickAdd").dataset.priceId = product.priceId;

  byId("quickBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeQuick() {
  byId("quickBackdrop").hidden = true;
  document.body.style.overflow = "";
}

function openSearch() {
  byId("searchPanel").hidden = false;
  byId("searchInput").focus();
}

async function checkout() {
  const items = Object.entries(state.cart).map(([priceId, quantity]) => ({
    priceId,
    quantity
  }));

  if (!items.length) {
    showToast("YOUR BAG IS EMPTY");
    return;
  }

  if (!state.stripeConnected) {
    showToast("CONNECT STRIPE IN VERCEL TO CHECK OUT");
    return;
  }

  const button = byId("checkoutButton");
  const previous = button.textContent;
  button.disabled = true;
  button.textContent = "OPENING STRIPE…";

  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Checkout unavailable");
    if (!data.url) throw new Error("Stripe Checkout URL missing");

    window.location.assign(data.url);
  } catch (error) {
    showToast(String(error.message || error).toUpperCase());
    button.disabled = false;
    button.textContent = previous;
  }
}

async function loadStripeCatalog({ silent = false } = {}) {
  try {
    const response = await fetch(`/api/products?t=${Date.now()}`, {
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok || !data.configured) {
      throw new Error(data.error || "Stripe not configured");
    }

    state.stripeConnected = true;
    state.products = Array.isArray(data.products) ? data.products : [];

    byId("catalogStatus").textContent = state.products.length
      ? `${state.products.length} LIVE STRIPE PRODUCT${state.products.length === 1 ? "" : "S"}`
      : "NO ACTIVE USD ONE-TIME STRIPE PRODUCTS YET";

    byId("catalogEyebrow").textContent = "LIVE STRIPE CATALOG";

    renderNavigation();
    renderHero();
    renderProducts();
    renderCart();

    if (!silent && state.products.length) {
      showToast("STRIPE CATALOG CONNECTED");
    }
  } catch (error) {
    state.stripeConnected = false;

    if (!state.products.length) {
      state.products = fallbackProducts;
      byId("catalogStatus").textContent = "PREVIEW MODE — CONNECT STRIPE IN VERCEL";
      byId("catalogEyebrow").textContent = "PREVIEW COLLECTION";
      renderNavigation();
      renderHero();
      renderProducts();
      renderCart();
    }
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("click", event => {
  const filter = event.target.closest("[data-filter]");
  if (filter) setFilter(filter.dataset.filter);

  const add = event.target.closest("[data-price-id]");
  if (add && !add.matches("#quickAdd")) addToCart(add.dataset.priceId);

  const quick = event.target.closest("[data-quick]");
  if (quick) openQuick(quick.dataset.quick);

  const inc = event.target.closest("[data-inc]");
  if (inc) changeQty(inc.dataset.inc, 1);

  const dec = event.target.closest("[data-dec]");
  if (dec) changeQty(dec.dataset.dec, -1);

  const remove = event.target.closest("[data-remove]");
  if (remove) {
    delete state.cart[remove.dataset.remove];
    saveCart();
    renderCart();
  }

  if (event.target.closest(".cart-open") || event.target.closest("#cartOpen")) openCart();
  if (event.target.closest("#cartClose") || event.target === byId("cartBackdrop")) closeCart();
  if (event.target.closest("#quickClose") || event.target === byId("quickBackdrop")) closeQuick();
});

byId("heroAdd").addEventListener("click", () => {
  if (byId("heroAdd").dataset.priceId) addToCart(byId("heroAdd").dataset.priceId);
});

byId("quickAdd").addEventListener("click", () => {
  if (byId("quickAdd").dataset.priceId) addToCart(byId("quickAdd").dataset.priceId);
});

byId("menuToggle").addEventListener("click", () => {
  const nav = byId("mobileNav");
  nav.hidden = !nav.hidden;
  byId("menuToggle").setAttribute("aria-expanded", String(!nav.hidden));
});

byId("searchToggle").addEventListener("click", openSearch);
byId("footerSearch").addEventListener("click", openSearch);

byId("footerShop").addEventListener("click", () => {
  byId("products").scrollIntoView({ behavior: "smooth", block: "start" });
});

byId("searchForm").addEventListener("submit", event => {
  event.preventDefault();

  state.query = byId("searchInput").value;
  byId("activeSearchText").textContent = state.query ? `SEARCH: “${state.query}”` : "";
  byId("activeSearch").hidden = !state.query;
  byId("searchPanel").hidden = true;

  renderProducts();
  byId("products").scrollIntoView({ behavior: "smooth", block: "start" });
});

byId("clearSearch").addEventListener("click", () => {
  state.query = "";
  byId("searchInput").value = "";
  byId("activeSearch").hidden = true;
  renderProducts();
});

byId("sortSelect").addEventListener("change", event => {
  state.sort = event.target.value;
  renderProducts();
});

byId("checkoutButton").addEventListener("click", checkout);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeQuick();
    byId("searchPanel").hidden = true;
    byId("mobileNav").hidden = true;
  }
});

const params = new URLSearchParams(location.search);
if (params.get("checkout") === "success") {
  state.cart = {};
  saveCart();
  setTimeout(() => showToast("PAYMENT RECEIVED — THANK YOU"), 250);
  history.replaceState({}, "", location.pathname);
}

if (params.get("checkout") === "cancelled") {
  setTimeout(() => showToast("CHECKOUT CANCELLED"), 250);
  history.replaceState({}, "", location.pathname);
}

state.products = fallbackProducts;
renderNavigation();
renderHero();
renderProducts();
renderCart();
loadStripeCatalog();

// Live Stripe catalog refresh for already-open storefronts.
setInterval(() => loadStripeCatalog({ silent: true }), 60000);
