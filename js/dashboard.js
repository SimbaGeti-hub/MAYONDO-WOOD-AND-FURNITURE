// Prevent back button navigation to login page
history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};




document.addEventListener('DOMContentLoaded', () => {
  const dailySales = 2150;
  const totalProducts = 135;
  const totalCustomers = 52;
  const suppliedGoods = 79;

  document.getElementById('dailySales').textContent = `$${dailySales.toFixed(2)}`;
  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('totalCustomers').textContent = totalCustomers;
  document.getElementById('suppliedGoods').textContent = suppliedGoods;

  const salesCtx = document.getElementById('salesChart').getContext('2d');
  new Chart(salesCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [{
        label: 'Sales ($)',
        data: [1200, 1700, 1850, 2400, 2650, 2850, 3200],
        backgroundColor: '#6c5ce7',
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  const itemsCtx = document.getElementById('itemsPie').getContext('2d');
  new Chart(itemsCtx, {
    type: 'pie',
    data: {
      labels: ['Timber', 'Poles', 'Beds', 'Sofas', 'Tables'],
      datasets: [{
        data: [45, 20, 18, 10, 7],
        backgroundColor: [
          '#6c5ce7',
          '#a29bfe',
          '#74b9ff',
          '#55efc4',
          '#ffeaa7'
        ],
        hoverOffset: 25
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
});

//product notification
function renderStockStatus(products) {
  const tbody = document.getElementById('stockTableBody');
  tbody.innerHTML = '';

  products.forEach(product => {
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

// Call this after loading or updating products list
document.addEventListener('DOMContentLoaded', () => {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  renderStockStatus(products);
});
