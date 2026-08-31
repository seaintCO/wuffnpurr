const products = [
  {
    "id": "pawbridge",
    "name": "PawBridge Pet Stairs",
    "price": 39.99,
    "category": "Home",
    "image": "pawbridge-stairs.jpg",
    "description": "Soft-step stairs designed to make beds, sofas and favorite spaces easier to reach."
  },
  {
    "id": "haven",
    "name": "Haven Pet Bed",
    "price": 79.99,
    "category": "Home",
    "image": "haven-pet-bed.jpg",
    "description": "A supportive everyday bed created for comfortable lounging and overnight rest."
  },
  {
    "id": "companion",
    "name": "Companion Collar",
    "price": 24.99,
    "category": "Wear",
    "image": "companion-collar.jpg",
    "description": "A refined adjustable collar built for everyday comfort, walks and identification."
  },
  {
    "id": "waypoint",
    "name": "Waypoint Travel Kit",
    "price": 49.99,
    "category": "Travel",
    "image": "waypoint-travel-kit.jpg",
    "description": "A considered travel system for road trips, weekends away and daily life on the move."
  },
  {
    "id": "shedaway",
    "name": "ShedAway Vacuum",
    "price": 44.99,
    "category": "Grooming",
    "image": "shedaway-vacuum.jpg",
    "description": "Compact pet-hair cleanup for furniture, rugs, vehicles and the places fur collects most."
  },
  {
    "id": "roadpaws",
    "name": "RoadPaws",
    "price": 54.99,
    "category": "Travel",
    "image": "roadpaws.jpg",
    "description": "A padded travel seat created for cleaner, calmer and more comfortable car rides."
  },
  {
    "id": "nailgrinder",
    "name": "Pet Nail Grinder",
    "price": 19.99,
    "category": "Grooming",
    "image": "pet-nail-grinder.jpg",
    "description": "Controlled at-home nail care in a compact format made for routine grooming."
  },
  {
    "id": "freshnest",
    "name": "FreshNest",
    "price": 249.99,
    "category": "Home",
    "image": "freshnest.jpg",
    "description": "A premium self-cleaning home-care solution created to simplify daily litter maintenance."
  },
  {
    "id": "gentlegroom",
    "name": "GentleGroom",
    "price": 29.99,
    "category": "Grooming",
    "image": "gentlegroom.jpg",
    "description": "Gentle coat care for detangling, brushing and everyday loose-hair removal."
  }
];

const LAUNCH_AT = new Date("2026-09-10T00:00:00-05:00");
const state = { filter: "All", sort: "featured", query: "" };
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const byId = id => document.getElementById(id);

function hasLaunched() {
  return Date.now() >= LAUNCH_AT.getTime();
}

function visibleProducts() {
  let list = products.filter(product => {
    const categoryMatch = state.filter === "All" || product.category === state.filter;
    const q = state.query.trim().toLowerCase();
    const searchText = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return categoryMatch && (!q || searchText.includes(q));
  });
  if (state.sort === "low") list = list.slice().sort((a,b) => a.price - b.price);
  if (state.sort === "high") list = list.slice().sort((a,b) => b.price - a.price);
  return list;
}

function renderProducts() {
  const launched = hasLaunched();
  const list = visibleProducts();
  byId("productGrid").innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-media">
        <span class="availability-tag">${launched ? "AVAILABLE NOW" : "SEPT 10"}</span>
        <button type="button" data-quick="${product.id}" aria-label="View ${product.name}">
          <img src="/assets/${product.image}" alt="${product.name}">
        </button>
      </div>
      <div class="product-meta">
        <span class="product-category">${product.category}</span>
        <button class="product-name" type="button" data-quick="${product.id}">${product.name}</button>
        <span class="product-price">${money.format(product.price)}</span>
        <button class="product-launch ${launched ? "live" : ""}" type="button" data-product-action="${product.id}">
          ${launched ? "ADD TO BAG" : "AVAILABLE SEPT 10"}
        </button>
      </div>
    </article>
  `).join("");
  byId("emptyState").hidden = list.length > 0;
}

function updateCountdown() {
  const diff = LAUNCH_AT.getTime() - Date.now();
  if (diff <= 0) {
    byId("days").textContent = "00";
    byId("hours").textContent = "00";
    byId("minutes").textContent = "00";
    byId("seconds").textContent = "00";
    byId("launchNote").textContent = "The Woof N’ Purr collection is now available.";
    renderProducts();
    return;
  }
  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  byId("days").textContent = String(days).padStart(2,"0");
  byId("hours").textContent = String(hours).padStart(2,"0");
  byId("minutes").textContent = String(minutes).padStart(2,"0");
  byId("seconds").textContent = String(secs).padStart(2,"0");
}

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1700);
}

function openQuick(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  byId("quickImage").src = `/assets/${product.image}`;
  byId("quickImage").alt = product.name;
  byId("quickCategory").textContent = product.category;
  byId("quickName").textContent = product.name;
  byId("quickPrice").textContent = money.format(product.price);
  byId("quickDescription").textContent = product.description;
  const btn = byId("quickLaunchButton");
  btn.dataset.productAction = product.id;
  btn.textContent = hasLaunched() ? "ADD TO BAG" : "AVAILABLE SEPT 10";
  byId("quickBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeQuick() {
  byId("quickBackdrop").hidden = true;
  document.body.style.overflow = "";
}

function setFilter(filter) {
  state.filter = filter;
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderProducts();
  byId("products").scrollIntoView({ behavior:"smooth", block:"start" });
  byId("mobileNav").hidden = true;
  byId("menuToggle").setAttribute("aria-expanded","false");
}

function openSearch() {
  byId("searchPanel").hidden = false;
  byId("searchInput").focus();
}

function productAction(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  if (!hasLaunched()) {
    showToast("AVAILABLE SEPTEMBER 10");
    byId("launch").scrollIntoView({ behavior:"smooth", block:"center" });
    return;
  }
  showToast(`${product.name.toUpperCase()} — SHOPPING OPENS WITH STRIPE`);
}

document.addEventListener("click", event => {
  const filter = event.target.closest("[data-filter]");
  if (filter) setFilter(filter.dataset.filter);

  const quick = event.target.closest("[data-quick]");
  if (quick) openQuick(quick.dataset.quick);

  const action = event.target.closest("[data-product-action]");
  if (action) productAction(action.dataset.productAction);

  if (event.target.closest("#quickClose") || event.target === byId("quickBackdrop")) closeQuick();
});

byId("menuToggle").addEventListener("click", () => {
  const nav = byId("mobileNav");
  nav.hidden = !nav.hidden;
  byId("menuToggle").setAttribute("aria-expanded", String(!nav.hidden));
});

byId("searchToggle").addEventListener("click", openSearch);
byId("footerSearch").addEventListener("click", openSearch);

byId("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  state.query = byId("searchInput").value;
  byId("activeSearchText").textContent = state.query ? `SEARCH: “${state.query}”` : "";
  byId("activeSearch").hidden = !state.query;
  byId("searchPanel").hidden = true;
  renderProducts();
  byId("products").scrollIntoView({ behavior:"smooth", block:"start" });
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

const scrollLaunch = () => byId("launch").scrollIntoView({ behavior:"smooth", block:"center" });
const scrollProducts = () => byId("products").scrollIntoView({ behavior:"smooth", block:"start" });
byId("launchAction").addEventListener("click", scrollLaunch);
byId("footerLaunch").addEventListener("click", scrollLaunch);
byId("viewCollection").addEventListener("click", scrollProducts);
byId("footerCollection").addEventListener("click", scrollProducts);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeQuick();
    byId("searchPanel").hidden = true;
    byId("mobileNav").hidden = true;
  }
});

renderProducts();
updateCountdown();
setInterval(updateCountdown, 1000);
