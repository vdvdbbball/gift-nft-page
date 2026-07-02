const API_BASE = 'http://localhost:3000/api';
const ITEMS_PER_PAGE = 12;

let currentCategory = null;
let allProducts = [];
let allCategories = [];

// DOM Elements
const categoryFilter = document.getElementById('categoryFilter');
const productsList = document.getElementById('productsList');
const categoriesList = document.getElementById('categoriesList');
const pricesTable = document.getElementById('pricesTable');
const navLinks = document.querySelectorAll('.nav-link');
const loading = document.getElementById('loading');
const toast = document.getElementById('toast');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts();
  setupNavigation();
  setupMenuToggle();
});

// Menu Toggle
function setupMenuToggle() {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });

  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
    });
  });
}

// Navigation
function setupNavigation() {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });
}

// Load Categories
async function loadCategories() {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/categories`);
    const categories = await response.json();
    allCategories = categories;

    renderCategories(categories);
    renderCategoryFilter(categories);
  } catch (error) {
    console.error('Error loading categories:', error);
    showToast('Помилка завантаження категорій', 'error');
  } finally {
    showLoading(false);
  }
}

// Render Categories
function renderCategories(categories) {
  categoriesList.innerHTML = '';
  categories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-icon">${category.icon || '📦'}</div>
      <div class="category-name">${category.name}</div>
      <div class="category-count"></div>
    `;
    card.addEventListener('click', () => {
      currentCategory = category.id;
      filterProducts();
      document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
    });
    categoriesList.appendChild(card);
  });
}

// Render Category Filter
function renderCategoryFilter(categories) {
  categoryFilter.innerHTML = '<option value="">Всі категорії</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    categoryFilter.appendChild(option);
  });
}

// Load Products
async function loadProducts() {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/products`);
    allProducts = await response.json();
    renderProducts(allProducts);
    renderPrices(allProducts);
  } catch (error) {
    console.error('Error loading products:', error);
    showToast('Помилка завантаження товарів', 'error');
  } finally {
    showLoading(false);
  }
}

// Render Products
function renderProducts(products) {
  productsList.innerHTML = '';
  if (products.length === 0) {
    productsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Немає товарів</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">${product.image_url ? `<img src="${product.image_url}" alt="${product.name}">` : '📦'}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-description">${product.description.substring(0, 100)}...</div>
      <div class="product-prices">
        <div class="price">
          <span>Гривні</span>
          <span class="price-value">₴${product.price_uah}</span>
        </div>
        <div class="price">
          <span>TON</span>
          <span class="price-value">◆${product.price_ton}</span>
        </div>
      </div>
      <div class="product-footer">
        <button class="btn btn-primary btn-buy btn-small" data-product-id="${product.id}">🛍️ Купити</button>
      </div>
    `;

    const buyBtn = card.querySelector('.btn-buy');
    buyBtn.addEventListener('click', () => buyProduct(product.id, product.name));

    productsList.appendChild(card);
  });
}

// Render Prices
function renderPrices(products) {
  pricesTable.innerHTML = '';
  products.slice(0, 20).forEach(product => {
    const row = document.createElement('div');
    row.className = 'price-row';
    row.innerHTML = `
      <div class="price-name">${product.name}</div>
      <div class="price-value">₴${product.price_uah}</div>
      <div class="price-value">◆${product.price_ton}</div>
    `;
    pricesTable.appendChild(row);
  });
}

// Filter Products
function filterProducts() {
  const selectedCategory = categoryFilter.value || currentCategory;
  if (!selectedCategory) {
    renderProducts(allProducts);
    return;
  }

  const filtered = allProducts.filter(p => p.category_id == selectedCategory);
  renderProducts(filtered);
}

// Buy Product
async function buyProduct(productId, productName) {
  try {
    showToast(`Добавлено товар "${productName}" в кошик`, 'success');
    // Integration with Telegram Bot and payment system
    // This would trigger the payment process
    console.log(`Product ${productId} added to cart`);
  } catch (error) {
    console.error('Error buying product:', error);
    showToast('Помилка при покупці', 'error');
  }
}

// Filter Event
categoryFilter.addEventListener('change', filterProducts);

// Show/Hide Loading
function showLoading(show) {
  if (show) {
    loading.classList.add('active');
  } else {
    loading.classList.remove('active');
  }
}

// Show Toast Notification
function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
