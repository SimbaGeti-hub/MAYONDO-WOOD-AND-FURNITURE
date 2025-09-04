// Prevent back button navigation to login page
history.pushState(null, null, location.href);
window.onpopstate = () => { history.go(1); };


// Elements & initial state
const productForm = document.getElementById('productForm');
const productsTableBody = document.querySelector('#productsTable tbody');
const searchProductInput = document.getElementById('searchProduct');
const cancelBtn = document.getElementById('cancelBtn');
let products = JSON.parse(localStorage.getItem('products')) || [];

// ------------------ Sidebar Toggle (mobile) ------------------
const sidebar = document.querySelector(".sidebar");
const hamburger = document.querySelector(".hamburger");
if (hamburger && sidebar) {
  hamburger.addEventListener("click", () => sidebar.classList.toggle("active"));

  // Close if click outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 900) {
      if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    }
  });
}

// ------------------ Validation ------------------
function validateForm() {
  let valid = true;
  const messages = [];

  const costPrice = parseFloat(productForm.costPrice.value);
  const quantity = parseInt(productForm.quantity.value, 10);
  const productPrice = parseFloat(productForm.productPrice.value);

  if (!productForm.productName.value.trim()) {
    valid = false; messages.push('Product name is required.');
  }
  if (!productForm.productType.value.trim()) {
    valid = false; messages.push('Product type is required.');
  }
  if (isNaN(costPrice) || costPrice < 0) {
    valid = false; messages.push('Cost price must be a non-negative number.');
  }
  if (isNaN(quantity) || quantity < 0) {
    valid = false; messages.push('Quantity must be a non-negative integer.');
  }
  if (isNaN(productPrice) || productPrice < 0) {
    valid = false; messages.push('Product price must be a non-negative number.');
  }
  if (!productForm.supplierName.value.trim()) {
    valid = false; messages.push('Supplier name is required.');
  }
  if (!productForm.productDate.value) {
    valid = false; messages.push('Date purchased is required.');
  }
  if (!productForm.quality.value.trim()) {
    valid = false; messages.push('Quality is required.');
  }

  if (!valid) {
    alert('Please fix the following errors:\n' + messages.join('\n'));
  }

  return valid;
}

// ------------------ Rendering ------------------
function renderProducts(filter = '') {
  productsTableBody.innerHTML = '';
  const normalizedFilter = (filter || '').toLowerCase().trim();

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(normalizedFilter) ||
    p.type.toLowerCase().includes(normalizedFilter)
  );

  filteredProducts.forEach((prod, index) => {
    const tr = document.createElement('tr');

    // Determine original index in the products array (for operations)
    const originalIndex = products.findIndex(p => p.name.toLowerCase() === prod.name.toLowerCase() && p.type === prod.type);

    // Highlight if editing this row
    if (productForm.dataset.editIndex && String(productForm.dataset.editIndex) === String(originalIndex)) {
      tr.classList.add('editing-row');
    }

    tr.innerHTML = `
      <td>${escapeHtml(prod.name)}</td>
      <td>${escapeHtml(prod.type)}</td>
      <td>${Number(prod.costPrice).toFixed(2)}</td>
      <td>${Number(prod.quantity)}</td>
      <td>${Number(prod.productPrice).toFixed(2)}</td>
      <td>${escapeHtml(prod.supplier)}</td>
      <td>${escapeHtml(prod.date)}</td>
      <td>${escapeHtml(prod.quality)}</td>
      <td>${escapeHtml(prod.color || '')}</td>
      <td>${escapeHtml(prod.measurements || '')}</td>
      <td>${escapeHtml(prod.addedBy || 'Unknown')}</td>
      <td class="actions-td">
        <button class="btn btn-edit" data-index="${originalIndex}"><i class="fa fa-edit"></i> Edit</button>
        <button class="btn btn-delete" data-index="${originalIndex}"><i class="fa fa-trash"></i> Delete</button>
      </td>
    `;

    productsTableBody.appendChild(tr);
  });

  // attach listeners to newly created buttons
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(btn.getAttribute('data-index'));
      editProduct(idx);
    });
  });
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(btn.getAttribute('data-index'));
      deleteProduct(idx);
    });
  });

  // Keep overview in sync
  renderStockStatus(products);
}

// ------------------ Safe HTML escape helper ------------------
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ------------------ Clear / Cancel ------------------
function clearForm() {
  productForm.reset();
  delete productForm.dataset.editIndex;
  renderProducts(searchProductInput.value);
  // remove any highlighted row style
  const rows = document.querySelectorAll('.editing-row');
  rows.forEach(r => r.classList.remove('editing-row'));
}

if (cancelBtn) {
  cancelBtn.addEventListener('click', (e) => {
    clearForm();
  });
}

// ------------------ Add / Update logic ------------------
productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || {};
  const newProduct = {
    name: productForm.productName.value.trim(),
    type: productForm.productType.value.trim(),
    costPrice: parseFloat(productForm.costPrice.value) || 0,
    quantity: parseInt(productForm.quantity.value, 10) || 0,
    productPrice: parseFloat(productForm.productPrice.value) || 0,
    supplier: productForm.supplierName.value.trim(),
    date: productForm.productDate.value,
    quality: productForm.quality.value.trim(),
    color: productForm.color.value.trim(),
    measurements: productForm.measurements.value.trim(),
    addedBy: loggedInUser.username || 'Unknown'
  };

  // If editing a specific index, update that index
  if (typeof productForm.dataset.editIndex !== 'undefined' && productForm.dataset.editIndex !== '') {
    const editIndex = Number(productForm.dataset.editIndex);
    products[editIndex] = newProduct;
  } else {
    // Check if a product with the same name exists (case-insensitive)
    const existingIndex = products.findIndex(p => p.name.toLowerCase() === newProduct.name.toLowerCase());
    if (existingIndex >= 0) {
      // Update existing product record (replace)
      products[existingIndex] = newProduct;
    } else {
      // New product — push to array
      products.push(newProduct);
    }
  }

  // Persist and re-render
  localStorage.setItem('products', JSON.stringify(products));
  clearForm();
  renderProducts(searchProductInput.value);
});

// ------------------ Edit / Delete exposed functions ------------------
function editProduct(index) {
  const prod = products[index];
  if (!prod) return;

  // Fill the form
  productForm.productName.value = prod.name;
  productForm.productType.value = prod.type;
  productForm.costPrice.value = prod.costPrice;
  productForm.quantity.value = prod.quantity;
  productForm.productPrice.value = prod.productPrice;
  productForm.supplierName.value = prod.supplier;
  productForm.productDate.value = prod.date;
  productForm.quality.value = prod.quality;
  productForm.color.value = prod.color || '';
  productForm.measurements.value = prod.measurements || '';

  // Mark editing index and highlight when rendering
  productForm.dataset.editIndex = String(index);
  renderProducts(searchProductInput.value);

  // Scroll to form so user sees the editing state
  productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteProduct(index) {
  const prod = products[index];
  if (!prod) return;

  const ok = confirm(`Delete product "${prod.name}"?`);
  if (!ok) return;

  products.splice(index, 1);
  localStorage.setItem('products', JSON.stringify(products));

  // If currently editing the deleted row, clear form
  if (productForm.dataset.editIndex && Number(productForm.dataset.editIndex) === index) {
    clearForm();
  }

  renderProducts(searchProductInput.value);
}

// ------------------ Search (live) ------------------
searchProductInput.addEventListener('input', (e) => {
  const value = e.target.value || '';
  renderProducts(value);
});

// ------------------ Stock overview (live) ------------------
// Overview uses the current products array (which enforces unique names on save).
// If you want aggregation (sum of quantities for same name) change below accordingly.
function renderStockStatus(productsList) {
  const tbody = document.getElementById('stockTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // We'll display each product as-is (products array ensures unique names after save).
  // If there are duplicates you want aggregated instead, we can sum quantities per name here.
  const seen = new Set();
  productsList.forEach(product => {
    const nameKey = product.name.toLowerCase();
    if (seen.has(nameKey)) return; // avoid duplicates (we assume products array unique by name)
    seen.add(nameKey);

    const qty = Number(product.quantity) || 0;
    const statusClass = qty < 5 ? 'status-restock-urgent' : (qty <= 10 ? 'status-restock-soon' : 'status-stock-plenty');
    const statusText = qty < 5 ? 'Restock Urgently' : (qty <= 10 ? 'Restock Soon' : 'Stock in Plenty');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(product.name)}</td>
      <td>${qty}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ------------------ Initial render on load ------------------
document.addEventListener('DOMContentLoaded', () => {
  products = JSON.parse(localStorage.getItem('products')) || [];
  renderProducts('');
  renderStockStatus(products);
});
