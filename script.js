// ---------- Data ----------
let places = [];

fetch("get-wisata.php")
    .then(res => res.json())
    .then(data => {
        places = data;
        renderGrid(places);
    });

// ---------- Utilities ----------
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// ---------- Render cards ----------
const grid = $('#grid');

function formatPrice(p) {
    if (p === 0) return '<span class="badge-free">Gratis</span>';
    return 'Rp ' + Number(p).toLocaleString('id-ID');
}

function createCard(place) {
    const el = document.createElement('article');
    el.className = 'card';
    el.dataset.id = place.id;

    el.innerHTML = `
        <div class="media" style="background-image:url('images/${place.img}')">
            <div class="category-tag">${place.category}</div>
        </div>
        <div class="content">
          <div class="title">${place.title}</div>
          <div class="meta">
            <i class="fas fa-map-marker-alt"></i> ${place.city}
          </div>
        </div>
        <div class="footer">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="color:gold;font-weight:700">★</span> 
            ${Number(place.rating).toFixed(1)} 
            <span style="color:var(--muted);font-size:13px">(${Number(place.reviews).toLocaleString()})</span>
          </div>
          <div style="font-weight:600">
            ${place.price == 0 ? '<span class="badge-free">Gratis</span>' : formatPrice(place.price)}
          </div>
        </div>
      `;

    el.addEventListener('click', () => {
        openModal(place);
    });

    return el;
}

function renderGrid(list) {
    grid.innerHTML = '';
    if (list.length === 0) {
        grid.innerHTML =
            '<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted)">Tidak ada hasil yang ditemukan.</div>';
        return;
    }
    list.forEach(p => grid.appendChild(createCard(p)));
}

// ---------- Filters ----------
const searchInput = $('#searchInput');
const categoryPills = $$('#categoryPills .filter-pill');
const cityPills = $$('#cityPills .filter-pill');

let currentCategory = 'Semua';
let currentCity = 'Semua';
let currentSearch = '';

function applyFilters() {
    const filtered = places.filter(place => {
        const categoryMatch =
            currentCategory === 'Semua' ||
            place.category.toLowerCase() === currentCategory.toLowerCase();

        const cityMatch =
            currentCity === 'Semua' ||
            place.city.toLowerCase() === currentCity.toLowerCase();

        const searchMatch =
            currentSearch === '' ||
            place.title.toLowerCase().includes(currentSearch) ||
            place.city.toLowerCase().includes(currentSearch) ||
            place.category.toLowerCase().includes(currentSearch) ||
            place.description.toLowerCase().includes(currentSearch);

        return categoryMatch && cityMatch && searchMatch;
    });

    renderGrid(filtered);
}

// ---------- Filter Pills Logic ----------

// Category pills
categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
        // Remove active class from all category pills
        categoryPills.forEach(p => p.classList.remove('active'));

        // Add active class to clicked pill
        pill.classList.add('active');

        // Update current category
        currentCategory = pill.dataset.cat;

        // Apply filters
        applyFilters();
    });
});

// City pills
cityPills.forEach(pill => {
    pill.addEventListener('click', () => {
        // Remove active class from all city pills
        cityPills.forEach(p => p.classList.remove('active'));

        // Add active class to clicked pill
        pill.classList.add('active');

        // Update current city
        currentCity = pill.dataset.city;

        // Apply filters
        applyFilters();
    });
});

// Search
searchInput.addEventListener('input', e => {
    currentSearch = e.target.value.toLowerCase().trim();
    applyFilters();
});

// ---------- Modal ----------
const modalBk = $('#modalBackdrop');
const modal = $('#modal');

function openModal(place) {
    $('#modalHero').style.backgroundImage = `url('images/${place.img}')`;
    $('#modalTag').textContent = place.category;
    $('#modalTitle').textContent = place.title;
    $('#modalLocation').innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + place.city;
    $('#modalPrice').innerHTML =
        place.price == 0 ? '<span class="badge-free">Gratis</span>' : formatPrice(place.price);
    $('#modalRating').textContent = Number(place.rating).toFixed(1);
    $('#modalReviews').textContent = Number(place.reviews).toLocaleString() + ' ulasan';
    $('#modalDesc').textContent = place.description;

    const map = document.createElement('iframe');
    const q = encodeURIComponent(place.map_query + ' Indonesia');
    map.src = `https://www.google.com/maps?q=${q}&output=embed`;
    map.width = '100%';
    map.height = '100%';
    map.style.border = 0;
    map.loading = 'lazy';

    const mapWrap = $('#modalMap');
    mapWrap.innerHTML = '';
    mapWrap.appendChild(map);

    modalBk.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalBk.classList.remove('open');
    document.body.style.overflow = '';
}

modalBk.addEventListener('click', e => {
    if (e.target === modalBk) closeModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

// ---------- Theme ----------
const themeToggle = $('#themeToggle');

function setTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    themeToggle.innerHTML = dark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
    localStorage.setItem('wj_theme', dark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
    setTheme(!document.documentElement.classList.contains('dark'));
});

setTheme(localStorage.getItem('wj_theme') === 'dark');