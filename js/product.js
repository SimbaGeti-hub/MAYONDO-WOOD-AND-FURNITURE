// Prevent back button navigation to login page
history.pushState(null, null, location.href);
window.onpopstate = () => {
  history.go(1);
};

const productForm = document.getElementById('productForm');
const productsTableBody = document.querySelector('#productsTable tbody');
const searchProductInput = document.getElementById('searchProduct');
let products = JSON.parse(localStorage.getItem('products')) || [];

// Validate form inputs
function validateForm() {
  let valid = true;
  let messages = [];

  const costPrice = parseFloat(productForm.costPrice.value);
  const quantity = parseInt(productForm.quantity.value);
  const productPrice = parseFloat(productForm.productPrice.value);

  if (!productForm.productName.value.trim()) {
    valid = false;
    messages.push('Product name is required.');
  }
  if (!productForm.productType.value.trim()) {
    valid = false;
    messages.push('Product type is required.');
  }
  if (isNaN(costPrice) || costPrice < 0) {
    valid = false;
    messages.push('Cost price must be a non-negative number.');
  }
  if (isNaN(quantity) || quantity < 0) {
    valid = false;
    messages.push('Quantity must be a non-negative integer.');
  }
  if (isNaN(productPrice) || productPrice < 0) {
    valid = false;
    messages.push('Product price must be a non-negative number.');
  }
  if (!productForm.supplierName.value.trim()) {
    valid = false;
    messages.push('Supplier name is required.');
  }
  if (!productForm.productDate.value) {
    valid = false;
    messages.push('Date purchased is required.');
  }
  if (!productForm.quality.value.trim()) {
    valid = false;
    messages.push('Quality is required.');
  }

  if (!valid) {
    alert('Please fix the following errors:\n' + messages.join('\n'));
  }
  return valid;
}

function renderProducts(filter = '') {
  productsTableBody.innerHTML = '';
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.type.toLowerCase().includes(filter.toLowerCase())
  );

  filteredProducts.forEach((prod, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.name}</td>
      <td>${prod.type}</td>
      <td>${prod.costPrice.toFixed(2)}</td>
      <td>${prod.quantity}</td>
      <td>${prod.productPrice.toFixed(2)}</td>
      <td>${prod.supplier}</td>
      <td>${prod.date}</td>
      <td>${prod.quality}</td>
      <td>${prod.color || ''}</td>
      <td>${prod.measurements || ''}</td>
      <td>${prod.addedBy || 'Unknown'}</td>
      <td>
        <button onclick="editProduct(${index})">Edit</button>
        <button onclick="deleteProduct(${index})">Delete</button>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });
}

function clearForm() {
  productForm.reset();
  delete productForm.dataset.editIndex;
}

productForm.addEventListener('submit', e => {
  e.preventDefault();

  if (!validateForm()) return;

  const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

  const prodData = {
    name: productForm.productName.value.trim(),
    type: productForm.productType.value.trim(),
    costPrice: parseFloat(productForm.costPrice.value),
    quantity: parseInt(productForm.quantity.value),
    productPrice: parseFloat(productForm.productPrice.value),
    supplier: productForm.supplierName.value.trim(),
    date: productForm.productDate.value,
    quality: productForm.quality.value.trim(),
    color: productForm.color.value.trim(),
    measurements: productForm.measurements.value.trim(),
    addedBy: loggedInUser ? loggedInUser.username : 'Unknown'
  };

  if (productForm.dataset.editIndex !== undefined) {
    products[productForm.dataset.editIndex] = prodData;
  } else {
    products.push(prodData);
  }

  localStorage.setItem('products', JSON.stringify(products));
  renderProducts(searchProductInput.value);
  renderStockStatus(products);
  clearForm();
});

function editProduct(index) {
  const prod = products[index];
  productForm.productName.value = prod.name;
  productForm.productType.value = prod.type;
  productForm.costPrice.value = prod.costPrice;
  productForm.quantity.value = prod.quantity;
  productForm.productPrice.value = prod.productPrice;
  productForm.supplierName.value = prod.supplier;
  productForm.productDate.value = prod.date;
  productForm.quality.value = prod.quality;
  productForm.color.value = prod.color;
  productForm.measurements.value = prod.measurements;
  productForm.dataset.editIndex = index;
}

function deleteProduct(index) {
  if (confirm('Are you sure you want to delete this product?')) {
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    renderProducts(searchProductInput.value);
    renderStockStatus(products);
    clearForm();
  }
}

searchProductInput.addEventListener('input', e => {
  renderProducts(e.target.value);
  renderStockStatus(products);
});

function renderStockStatus(productsList) {
  const tbody = document.getElementById('stockTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  productsList.forEach(product => {
    const statusClass = product.quantity < 5
      ? 'status-restock-urgent'
      : (product.quantity <= 10 ? 'status-restock-soon' : 'status-stock-plenty');

    const statusText = product.quantity < 5
      ? 'Restock Urgently'
      : (product.quantity <= 10 ? 'Restock Soon' : 'Stock in Plenty');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.name}</td>
      <td>${product.quantity}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  products = JSON.parse(localStorage.getItem('products')) || [];
  renderProducts('');
  renderStockStatus(products);
});
