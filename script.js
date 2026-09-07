const products = [
  {id:'pawbridge',name:'PawBridge Pet Stairs',price:39.99,category:'Home',image:'pawbridge-stairs.jpg',description:'Soft-step stairs designed to make beds, sofas and favorite spaces easier to reach.'},
  {id:'haven',name:'Haven Pet Bed',price:79.99,category:'Home',image:'haven-pet-bed.jpg',description:'A supportive everyday bed created for comfortable lounging and overnight rest.'},
  {id:'companion',name:'Companion Collar',price:24.99,category:'Wear',image:'companion-collar.jpg',description:'A refined adjustable collar built for everyday comfort, walks and identification.'},
  {id:'waypoint',name:'Waypoint Travel Kit',price:49.99,category:'Travel',image:'waypoint-travel-kit.jpg',description:'A considered travel system for road trips, weekends away and daily life on the move.'},
  {id:'shedaway',name:'ShedAway Vacuum',price:44.99,category:'Grooming',image:'shedaway-vacuum.jpg',description:'Compact pet-hair cleanup for furniture, rugs, vehicles and the places fur collects most.'},
  {id:'roadpaws',name:'RoadPaws',price:54.99,category:'Travel',image:'roadpaws.jpg',description:'A padded travel seat created for cleaner, calmer and more comfortable car rides.'},
  {id:'nailgrinder',name:'Pet Nail Grinder',price:19.99,category:'Grooming',image:'pet-nail-grinder.jpg',description:'Controlled at-home nail care in a compact format made for routine grooming.'},
  {id:'freshnest',name:'FreshNest',price:249.99,category:'Home',image:'freshnest.jpg',description:'A premium self-cleaning home-care solution created to simplify daily litter maintenance.'},
  {id:'gentlegroom',name:'GentleGroom',price:29.99,category:'Grooming',image:'gentlegroom.jpg',description:'Gentle coat care for detangling, brushing and everyday loose-hair removal.'}
];

const state = {
  filter: 'All',
  sort: 'featured',
  query: '',
  cart: loadCart()
};
const money = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const byId = id => document.getElementById(id);

function loadCart(){
  try { return JSON.parse(localStorage.getItem('wnp-cart') || '{}'); }
  catch { return {}; }
}
function saveCart(){ localStorage.setItem('wnp-cart', JSON.stringify(state.cart)); }

function visibleProducts(){
  let list = products.filter(product => {
    const category = state.filter === 'All' || product.category === state.filter;
    const q = state.query.trim().toLowerCase();
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return category && (!q || haystack.includes(q));
  });
  if(state.sort === 'low') list = list.slice().sort((a,b)=>a.price-b.price);
  if(state.sort === 'high') list = list.slice().sort((a,b)=>b.price-a.price);
  return list;
}

function renderProducts(){
  const list = visibleProducts();
  byId('productGrid').innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-media">
        <button type="button" data-quick="${product.id}" aria-label="View ${product.name}">
          <img src="/assets/${product.image}" alt="${product.name}">
        </button>
      </div>
      <div class="product-meta">
        <span class="product-category">${product.category}</span>
        <button class="product-name" type="button" data-quick="${product.id}">${product.name}</button>
        <span class="product-price">${money.format(product.price)}</span>
        <button class="product-action add-btn" type="button" data-id="${product.id}">ADD TO BAG</button>
      </div>
    </article>`).join('');
  byId('emptyState').hidden = list.length > 0;
}

function showToast(message){
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>toast.classList.remove('show'),1600);
}

function setFilter(filter){
  state.filter = filter;
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter===filter));
  renderProducts();
  byId('mobileNav').hidden = true;
  byId('menuToggle').setAttribute('aria-expanded','false');
  byId('products').scrollIntoView({behavior:'smooth',block:'start'});
}

function addToCart(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  state.cart[id] = Math.min(10,(state.cart[id]||0)+1);
  saveCart();
  renderCart();
  showToast(`${p.name.toUpperCase()} ADDED`);
}
function changeQty(id,delta){
  const next=(state.cart[id]||0)+delta;
  if(next<=0) delete state.cart[id]; else state.cart[id]=Math.min(10,next);
  saveCart();
  renderCart();
}
function renderCart(){
  const entries=Object.entries(state.cart);
  const count=entries.reduce((s,[,q])=>s+q,0);
  const subtotal=entries.reduce((s,[id,q])=>{
    const p=products.find(x=>x.id===id); return s+(p?p.price*q:0);
  },0);
  byId('cartCount').textContent=`(${count})`;
  byId('cartSubtotal').textContent=money.format(subtotal);
  if(!entries.length){ byId('cartItems').innerHTML='<p class="cart-empty">Your bag is empty.</p>'; return; }
  byId('cartItems').innerHTML=entries.map(([id,qty])=>{
    const p=products.find(x=>x.id===id);
    return `<article class="cart-item">
      <img src="/assets/${p.image}" alt="${p.name}">
      <div><h3>${p.name}</h3><div class="cart-item-price">${money.format(p.price)}</div>
      <div class="qty-row">
        <button class="qty-btn" type="button" data-dec="${id}" aria-label="Decrease ${p.name}">−</button>
        <span>${qty}</span>
        <button class="qty-btn" type="button" data-inc="${id}" aria-label="Increase ${p.name}">+</button>
        <button class="remove-btn" type="button" data-remove="${id}">REMOVE</button>
      </div></div>
    </article>`;
  }).join('');
}
function openCart(){ byId('cartBackdrop').hidden=false; document.body.style.overflow='hidden'; }
function closeCart(){ byId('cartBackdrop').hidden=true; document.body.style.overflow=''; }

function openQuick(id){
  const p=products.find(x=>x.id===id); if(!p) return;
  byId('quickImage').src=`/assets/${p.image}`; byId('quickImage').alt=p.name;
  byId('quickCategory').textContent=p.category; byId('quickName').textContent=p.name;
  byId('quickPrice').textContent=money.format(p.price); byId('quickDescription').textContent=p.description;
  byId('quickAdd').dataset.id=p.id;
  byId('quickBackdrop').hidden=false; document.body.style.overflow='hidden';
}
function closeQuick(){ byId('quickBackdrop').hidden=true; document.body.style.overflow=''; }

async function checkout(){
  const items=Object.entries(state.cart).map(([id,quantity])=>({id,quantity}));
  if(!items.length){ showToast('YOUR BAG IS EMPTY'); return; }
  const button=byId('checkoutButton');
  const old=button.textContent; button.disabled=true; button.textContent='OPENING STRIPE…';
  try{
    const response=await fetch('/api/create-checkout-session',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})
    });
    const data=await response.json();
    if(!response.ok) throw new Error(data.error||'Checkout unavailable');
    if(!data.url) throw new Error('Checkout URL missing');
    window.location.assign(data.url);
  }catch(error){
    showToast(String(error.message||error).toUpperCase());
    button.disabled=false; button.textContent=old;
  }
}

function openSearch(){ byId('searchPanel').hidden=false; byId('searchInput').focus(); }

document.addEventListener('click',event=>{
  const filter=event.target.closest('[data-filter]'); if(filter) setFilter(filter.dataset.filter);
  const add=event.target.closest('.add-btn'); if(add) addToCart(add.dataset.id);
  const quick=event.target.closest('[data-quick]'); if(quick) openQuick(quick.dataset.quick);
  const inc=event.target.closest('[data-inc]'); if(inc) changeQty(inc.dataset.inc,1);
  const dec=event.target.closest('[data-dec]'); if(dec) changeQty(dec.dataset.dec,-1);
  const rem=event.target.closest('[data-remove]'); if(rem){delete state.cart[rem.dataset.remove];saveCart();renderCart();}
  if(event.target.closest('.cart-open')||event.target.closest('#cartOpen')) openCart();
  if(event.target.closest('#cartClose')||event.target===byId('cartBackdrop')) closeCart();
  if(event.target.closest('#quickClose')||event.target===byId('quickBackdrop')) closeQuick();
});

byId('menuToggle').addEventListener('click',()=>{
  const nav=byId('mobileNav'); nav.hidden=!nav.hidden; byId('menuToggle').setAttribute('aria-expanded',String(!nav.hidden));
});
byId('searchToggle').addEventListener('click',openSearch);
byId('footerSearch').addEventListener('click',openSearch);
byId('searchForm').addEventListener('submit',event=>{
  event.preventDefault(); state.query=byId('searchInput').value;
  byId('activeSearchText').textContent=state.query?`SEARCH: “${state.query}”`:'';
  byId('activeSearch').hidden=!state.query; byId('searchPanel').hidden=true; renderProducts();
  byId('products').scrollIntoView({behavior:'smooth',block:'start'});
});
byId('clearSearch').addEventListener('click',()=>{
  state.query=''; byId('searchInput').value=''; byId('activeSearch').hidden=true; renderProducts();
});
byId('sortSelect').addEventListener('change',event=>{state.sort=event.target.value;renderProducts();});
byId('quickAdd').addEventListener('click',()=>{ if(byId('quickAdd').dataset.id) addToCart(byId('quickAdd').dataset.id); });
byId('checkoutButton').addEventListener('click',checkout);
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeCart();closeQuick();byId('searchPanel').hidden=true;byId('mobileNav').hidden=true;}});

const params=new URLSearchParams(location.search);
if(params.get('checkout')==='success'){
  state.cart={}; saveCart(); setTimeout(()=>showToast('PAYMENT RECEIVED — THANK YOU'),250);
  history.replaceState({},'',location.pathname);
}
if(params.get('checkout')==='cancelled'){
  setTimeout(()=>showToast('CHECKOUT CANCELLED'),250);
  history.replaceState({},'',location.pathname);
}

renderProducts(); renderCart();
