const API_BASE = 'http://localhost:3000/api';
let token = localStorage.getItem('adminToken');
let currentUser = null;

const sections = {
  login: document.getElementById('login'),
  dashboard: document.getElementById('dashboard'),
  products: document.getElementById('products'),
  categories: document.getElementById('categories'),
  orders: document.getElementById('orders'),
  users: document.getElementById('users'),
  settings: document.getElementById('settings')
};

const navItems = document.querySelectorAll('.nav-item[data-section]');
const sectionTitle = document.getElementById('sectionTitle');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const toast = document.getElementById('toast');
const loading = document.getElementById('loading');

const sectionTitles = {
  dashboard: 'Панель керування',
  products: 'Керування товарами',
  categories: 'Керування категоріями',
  orders: 'Замовлення',
  users: 'Користувачі',
  settings: 'Налаштування'
};

document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    verifyToken();
  } else {
    showSection('login');
  }

  setupEventListeners();
});

function setupEventListeners() {
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      showSection(section);
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  logoutBtn.addEventListener('click', logout);
  loginForm.addEventListener('submit', handleLogin);

  document.getElementById('addProductBtn')?.addEventListener('click', openProductModal);
  document.getElementById('addCategoryBtn')?.addEventListener('click', openCategoryModal);
  document.getElementById('productForm')?.addEventListener('submit', saveProduct);
  document.getElementById('categoryForm')?.addEventListener('submit', saveCategory);

  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.remove('active');
    });
  });
}

function showSection(section) {
  Object.values(sections).forEach(s => s.classList.remove('active'));
  if (sections[section]) {
    sections[section].classList.add('active');
    sectionTitle.textContent = sectionTitles[section] || 'Панель';

    if (section === 'dashboard') loadDashboard();
    if (section === 'products') loadProducts();
    if (section === 'categories') loadCategories();
    if (section === 'orders') loadOrders();
    if (section === 'users') loadUsers();
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('Невірні дані');
    }

    const data = await response.json();
    token = data.token;
    currentUser = data.admin;
    localStorage.setItem('adminToken', token);
    document.getElementById('adminName').textContent = currentUser.username;
    loginForm.reset();
    showSection('dashboard');
    showToast('Успішний вхід', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function verifyToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Token invalid');
    }

    currentUser = (await response.json()).user;
    document.getElementById('adminName').textContent = currentUser.username;
    showSection('dashboard');
    navItems[0].classList.add('active');
  } catch (error) {
    localStorage.removeItem('adminToken');
    token = null;
    showSection('login');
  }
}

function logout() {
  localStorage.removeItem('adminToken');
  token = null;
  currentUser = null;
  showSection('login');
  loginForm.reset();
  showToast('Вий з системи', 'success');
}

async function loadDashboard() {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const stats = await response.json();

    document.getElementById('totalOrders').textContent = stats.orders?.total_orders || 0;
    document.getElementById('totalRevenue').textContent = `₴${stats.orders?.total_revenue_uah || 0}`;
    document.getElementById('totalUsers').textContent = stats.users?.total || 0;

    const productsResponse = await fetch(`${API_BASE}/admin/products/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const products = await productsResponse.json();
    document.getElementById('totalProducts').textContent = products.length;

    const ordersResponse = await fetch(`${API_BASE}/admin/orders?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await ordersResponse.json();
    renderRecentOrders(orders);
  } catch (error) {
    showToast('Помилка завантаження даних', 'error');
  } finally {
    showLoading(false);
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recentOrdersList');
  container.innerHTML = '';

  orders.forEach(order => {
    const statusClass = `order-status ${order.status}`;
    const html = `
      <div class="order-item">
        <div class="order-info">
          <div class="card-title">#${order.id} - ${order.product_name}</div>
          <div class="card-subtitle">Користувач: ${order.username || order.telegram_id}</div>
        </div>
        <div class="card-title">${order.price_uah} ₴</div>
        <span class="${statusClass}">${order.status}</span>
      </div>
    `;
    container.innerHTML += html;
  });
}

async function loadProducts() {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/admin/products/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    showToast('Помилка завантаження товарів', 'error');
  } finally {
    showLoading(false);
  }
}

function renderProducts(products) {
  const container = document.getElementById('productsList');
  container.innerHTML = '';

  products.forEach(product => {
    const html = `
      <div class="card-item">
        <div class="card-info">
          <div class="card-title">${product.name}</div>
          <div class="card-subtitle">${product.description.substring(0, 50)}...</div>
          <div class="card-subtitle">₴${product.price_uah} / ◆${product.price_ton}</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
      </div>
    `;
    container.innerHTML += html;
  });
}

function openProductModal() {
  document.getElementById('productId').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('productModal').classList.add('active');
  loadCategoriesForSelect();
}

async function editProduct(id) {
  // Load product and open modal for editing
  document.getElementById('productId').value = id;
  document.getElementById('productModal').classList.add('active');
  loadCategoriesForSelect();
}

async function deleteProduct(id) {
  if (!confirm('Ви впевнені?')) return;

  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Помилка видалення');

    showToast('Товар видалено', 'success');
    loadProducts();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const productData = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    category_id: document.getElementById('productCategory').value,
    price_uah: parseFloat(document.getElementById('productPriceUah').value),
    price_ton: parseFloat(document.getElementById('productPriceTon').value),
    is_active: document.getElementById('productActive').checked ? 1 : 0
  };

  try {
    showLoading(true);
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/admin/products/${id}` : `${API_BASE}/admin/products`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) throw new Error('Помилка сохранення');

    showToast(id ? 'Товар обновлено' : 'Товар додано', 'success');
    document.getElementById('productModal').classList.remove('active');
    loadProducts();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function loadCategories() {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/categories/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await response.json();
    renderCategories(categories);
  } catch (error) {
    showToast('Помилка завантаження категорій', 'error');
  } finally {
    showLoading(false);
  }
}

function renderCategories(categories) {
  const container = document.getElementById('categoriesList');
  container.innerHTML = '';

  categories.forEach(category => {
    const html = `
      <div class="card-item">
        <div class="card-info">
          <div class="card-title">${category.icon} ${category.name}</div>
          <div class="card-subtitle">${category.description || ''}</div>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm" onclick="editCategory(${category.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">Delete</button>
        </div>
      </div>
    `;
    container.innerHTML += html;
  });
}

function openCategoryModal() {
  document.getElementById('categoryId').value = '';
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryModal').classList.add('active');
}

async function editCategory(id) {
  document.getElementById('categoryId').value = id;
  document.getElementById('categoryModal').classList.add('active');
}

async function deleteCategory(id) {
  if (!confirm('Ви впевнені?')) return;

  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Помилка видалення');

    showToast('Категорія видалена', 'success');
    loadCategories();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function saveCategory(e) {
  e.preventDefault();
  const id = document.getElementById('categoryId').value;
  const categoryData = {
    name: document.getElementById('categoryName').value,
    description: document.getElementById('categoryDescription').value,
    icon: document.getElementById('categoryIcon').value || '📦'
  };

  try {
    showLoading(true);
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) throw new Error('Помилка сохранення');

    showToast(id ? 'Категорія обновлена' : 'Категорія додана', 'success');
    document.getElementById('categoryModal').classList.remove('active');
    loadCategories();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function loadCategoriesForSelect() {
  try {
    const response = await fetch(`${API_BASE}/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await response.json();
    const select = document.getElementById('productCategory');
    select.innerHTML = '';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Помилка завантаження категорій:', error);
  }
}

async function loadOrders() {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/admin/orders?limit=100`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await response.json();
    renderOrders(orders);
  } catch (error) {
    showToast('Помилка завантаження замовлень', 'error');
  } finally {
    showLoading(false);
  }
}

function renderOrders(orders) {
  const container = document.getElementById('ordersList');
  container.innerHTML = '';

  const table = `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Товар</th>
          <th>Користувач</th>
          <th>Ціна</th>
          <th>Статус</th>
          <th>Операції</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td>#${order.id}</td>
            <td>${order.product_name}</td>
            <td>${order.username || order.telegram_id}</td>
            <td>₴${order.price_uah}</td>
            <td><span class="order-status ${order.status}">${order.status}</span></td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="updateOrderStatus(${order.id}, 'completed')">Complete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  container.innerHTML = table;
}

async function updateOrderStatus(orderId, status) {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error('Помилка обновлення');

    showToast('Статус обновлено', 'success');
    loadOrders();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function loadUsers() {
  try {
    showLoading(true);
    const response = await fetch(`${API_BASE}/users/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    showToast('Помилка завантаження користувачів', 'error');
  } finally {
    showLoading(false);
  }
}

function renderUsers(users) {
  const container = document.getElementById('usersList');
  container.innerHTML = '';

  const table = `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Мені</th>
          <th>Username</th>
          <th>Останній раз</th>
          <th>Premium</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>${user.id}</td>
            <td>${user.first_name || ''} ${user.last_name || ''}</td>
            <td>@${user.username || '-'}</td>
            <td>${new Date(user.last_seen_at).toLocaleDateString('uk-UA')}</td>
            <td>${user.is_premium ? '✅' : '❌'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  container.innerHTML = table;
}

function showLoading(show) {
  if (show) {
    loading.classList.add('active');
  } else {
    loading.classList.remove('active');
  }
}

function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
