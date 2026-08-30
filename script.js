
const products = [
  {
    "id": "pawbridge",
    "name": "PawBridge Pet Stairs",
    "price": 39.99,
    "category": "Home",
    "available": true,
    "image": "pawbridge-stairs.jpg",
    "description": "Soft-step stairs designed to make beds, sofas and favorite spaces easier to reach."
  },
  {
    "id": "haven",
    "name": "Haven Pet Bed",
    "price": 79.99,
    "category": "Home",
    "available": true,
    "image": "haven-pet-bed.jpg",
    "description": "A supportive, deeply comfortable everyday bed for quiet rest and overnight sleep."
  },
  {
    "id": "companion",
    "name": "Companion Collar",
    "price": 24.99,
    "category": "Wear",
    "available": true,
    "image": "companion-collar.jpg",
    "description": "A refined adjustable collar built for daily comfort, walks and identification."
  },
  {
    "id": "waypoint",
    "name": "Waypoint Travel Kit",
    "price": 49.99,
    "category": "Travel",
    "available": true,
    "image": "waypoint-travel-kit.jpg",
    "description": "A considered travel system for car rides, weekend stays and daily life on the move."
  },
  {
    "id": "shedaway",
    "name": "ShedAway Vacuum",
    "price": 44.99,
    "category": "Grooming",
    "available": true,
    "image": "shedaway-vacuum.jpg",
    "description": "Compact pet-hair cleanup for furniture, rugs, vehicles and the places fur collects most."
  },
  {
    "id": "roadpaws",
    "name": "RoadPaws",
    "price": 54.99,
    "category": "Travel",
    "available": false,
    "image": "roadpaws.jpg",
    "description": "A padded travel seat designed for cleaner, calmer and more comfortable car rides."
  },
  {
    "id": "nailgrinder",
    "name": "Pet Nail Grinder",
    "price": 19.99,
    "category": "Grooming",
    "available": false,
    "image": "pet-nail-grinder.jpg",
    "description": "Controlled at-home nail care with a compact format made for routine grooming."
  },
  {
    "id": "freshnest",
    "name": "FreshNest",
    "price": 249.99,
    "category": "Home",
    "available": true,
    "image": "freshnest.jpg",
    "description": "A premium self-cleaning home-care solution created to simplify daily litter maintenance."
  },
  {
    "id": "gentlegroom",
    "name": "GentleGroom",
    "price": 29.99,
    "category": "Grooming",
    "available": false,
    "image": "gentlegroom.jpg",
    "description": "Gentle coat care for detangling, brushing and everyday loose-hair removal."
  }
];

const state = {
  filter: 'All',
  sort: 'featured',
  query: '',
  cart: {}
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const byId = id => document.getElementById(id);
const grid = byId('productGrid');
const emptyState = byId('emptyState');
const cartBackdrop = byId('cartBackdrop');
const cartItems = byId('cartItems');
const cartCount = byId('cartCount');
const cartSubtotal = byId('cartSubtotal');
const searchPanel = byId('searchPanel');
const searchInput = byId('searchInput');
const quickBackdrop = byId('quickBackdrop');
const quickAdd = byId('quickAdd');
const toast = byId('toast');

function filteredProducts() {
  let list = products.filter(product => {
    const categoryMatch = state.filter === 'All' || product.category === state.filter;
    const q = state.query.trim().toLowerCase();
    const text = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return categoryMatch && (!q || text.includes(q));
  });

  if (state.sort === 'low') list = list.slice().sort((a,b) => a.price - b.price);
  if (state.sort === 'high') list = list.slice().sort((a,b) => b.price - a.price);
  if (state.sort === 'available') list = list.slice().sort((a,b) => Number(b.available) - Number(a.available));
  return list;
}

function renderProducts() {
  const list = filteredProducts();
  grid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-media">
        ${product.available ? '' : '<span class="availability-tag">COMING SOON</span>'}
        <button type="button" data-quick="${product.id}" aria-label="View ${product.name}">
          <img src="/assets/${product.image}" alt="${product.name}">
        </button>
      </div>
      <div class="product-meta">
        <span class="product-category">${product.category}</span>
        <button class="product-name" type="button" data-quick="${product.id}">${product.name}</button>
        <span class="product-price">${money.format(product.price)}</span>
        <button class="product-action ${product.available ? 'add-btn' : ''}" type="button"
          ${product.available ? `data-id="${product.id}"` : 'disabled'}>
          ${product.available ? 'ADD TO BAG' : 'COMING SOON'}
        </button>
      </div>
    </article>
  `).join('');
  emptyState.hidden = list.length > 0;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1900);
}

function setFilter(filter) {
  state.filter = filter;
  document.querySelectorAll('[data-filter]').forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
  renderProducts();
  byId('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
  byId('mobileNav').hidden = true;
  byId('menuToggle').setAttribute('aria-expanded','false');
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product || !product.available) return;
  state.cart[id] = (state.cart[id] || 0) + 1;
  renderCart();
  showToast(`${product.name.toUpperCase()} ADDED`);
}

function changeQty(id, delta) {
  const next = (state.cart[id] || 0) + delta;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = Math.min(next, 10);
  renderCart();
}

function renderCart() {
  const entries = Object.entries(state.cart);
  const count = entries.reduce((sum,[,qty]) => sum + qty,0);
  const subtotal = entries.reduce((sum,[id,qty]) => {
    const product = products.find(p => p.id === id);
    return sum + (product ? product.price * qty : 0);
  },0);

  cartCount.textContent = `(${count})`;
  cartSubtotal.textContent = money.format(subtotal);

  if (!entries.length) {
    cartItems.innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
    return;
  }

  cartItems.innerHTML = entries.map(([id,qty]) => {
    const p = products.find(product => product.id === id);
    return `
      <article class="cart-item">
        <img src="/assets/${p.image}" alt="${p.name}">
        <div>
          <h3>${p.name}</h3>
          <div class="cart-item-price">${money.format(p.price)}</div>
          <div class="qty-row">
            <button class="qty-btn" type="button" data-dec="${id}" aria-label="Decrease quantity">−</button>
            <span>${qty}</span>
            <button class="qty-btn" type="button" data-inc="${id}" aria-label="Increase quantity">+</button>
            <button class="remove-btn" type="button" data-remove="${id}">REMOVE</button>
          </div>
        </div>
      </article>`;
  }).join('');
}

function openCart() {
  cartBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartBackdrop.hidden = true;
  document.body.style.overflow = '';
}

function openQuick(id) {
  const p = products.find(product => product.id === id);
  if (!p) return;
  byId('quickImage').src = `/assets/${p.image}`;
  byId('quickImage').alt = p.name;
  byId('quickCategory').textContent = p.category;
  byId('quickName').textContent = p.name;
  byId('quickPrice').textContent = money.format(p.price);
  byId('quickDescription').textContent = p.description;
  byId('quickAvailability').textContent = p.available ? 'AVAILABLE NOW' : 'COMING SOON';
  quickAdd.dataset.id = p.id;
  quickAdd.disabled = !p.available;
  quickAdd.textContent = p.available ? 'ADD TO BAG' : 'COMING SOON';
  quickBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeQuick() {
  quickBackdrop.hidden = true;
  document.body.style.overflow = '';
}

async function checkout() {
  const items = Object.entries(state.cart).map(([id,quantity]) => ({ id, quantity }));
  if (!items.length) {
    showToast('YOUR BAG IS EMPTY');
    return;
  }

  const button = byId('checkoutButton');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'OPENING SECURE CHECKOUT…';

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Checkout unavailable');
    if (!data.url) throw new Error('Stripe did not return a checkout URL');
    window.location.href = data.url;
  } catch (error) {
    showToast(error.message.toUpperCase());
    button.disabled = false;
    button.textContent = original;
  }
}

document.addEventListener('click', event => {
  const filter = event.target.closest('[data-filter]');
  if (filter) setFilter(filter.dataset.filter);

  const add = event.target.closest('.add-btn');
  if (add) addToCart(add.dataset.id);

  const quick = event.target.closest('[data-quick]');
  if (quick) openQuick(quick.dataset.quick);

  const inc = event.target.closest('[data-inc]');
  if (inc) changeQty(inc.dataset.inc,1);

  const dec = event.target.closest('[data-dec]');
  if (dec) changeQty(dec.dataset.dec,-1);

  const remove = event.target.closest('[data-remove]');
  if (remove) {
    delete state.cart[remove.dataset.remove];
    renderCart();
  }

  if (event.target.closest('.cart-open') || event.target.closest('#cartOpen')) openCart();
  if (event.target.closest('#cartClose') || event.target === cartBackdrop) closeCart();
  if (event.target.closest('#quickClose') || event.target === quickBackdrop) closeQuick();
});

byId('menuToggle').addEventListener('click', () => {
  const nav = byId('mobileNav');
  nav.hidden = !nav.hidden;
  byId('menuToggle').setAttribute('aria-expanded', String(!nav.hidden));
});

function openSearch() {
  searchPanel.hidden = false;
  searchInput.focus();
}
byId('searchToggle').addEventListener('click', openSearch);
byId('footerSearch').addEventListener('click', openSearch);

byId('searchForm').addEventListener('submit', event => {
  event.preventDefault();
  state.query = searchInput.value;
  byId('activeSearchText').textContent = state.query ? `SEARCH: “${state.query}”` : '';
  byId('activeSearch').hidden = !state.query;
  searchPanel.hidden = true;
  renderProducts();
  byId('products').scrollIntoView({ behavior:'smooth', block:'start' });
});

byId('clearSearch').addEventListener('click', () => {
  state.query = '';
  searchInput.value = '';
  byId('activeSearch').hidden = true;
  renderProducts();
});

byId('sortSelect').addEventListener('change', event => {
  state.sort = event.target.value;
  renderProducts();
});

byId('quickAdd').addEventListener('click', () => {
  if (!quickAdd.disabled && quickAdd.dataset.id) addToCart(quickAdd.dataset.id);
});

byId('checkoutButton').addEventListener('click', checkout);

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeCart();
    closeQuick();
    searchPanel.hidden = true;
  }
});

const params = new URLSearchParams(window.location.search);
if (params.get('checkout') === 'success') showToast('ORDER RECEIVED — THANK YOU');
if (params.get('checkout') === 'cancelled') showToast('CHECKOUT CANCELLED');

renderProducts();
renderCart();
