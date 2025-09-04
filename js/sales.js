// ------------------ Prevent back button ------------------
history.pushState(null, null, location.href);
window.onpopstate = () => history.go(1);

// ------------------ DOM Elements ------------------
const salesForm = document.getElementById('salesForm');
const salesTableBody = document.querySelector('#salesTable tbody');
const searchSalesInput = document.getElementById('searchSales');
const cancelBtn = document.getElementById('cancelBtn');
const dailySalesTableBody = document.querySelector('#dailySalesTable tbody');
const dailyTotalEl = document.getElementById('dailyTotal');
const dailyItemsEl = document.getElementById('dailyItems');

let sales = JSON.parse(localStorage.getItem('sales')) || [];

// ------------------ Sidebar toggle ------------------
const sidebar = document.querySelector(".sidebar");
const hamburger = document.querySelector(".hamburger");
if (hamburger && sidebar) {
  hamburger.addEventListener("click", () => sidebar.classList.toggle("active"));
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove("active");
    }
  });
}

// ------------------ Form Helpers ------------------
function clearForm() {
  salesForm.reset();
  delete salesForm.dataset.editIndex;
  renderSales(searchSalesInput.value);
  renderDailySummary();
}

if (cancelBtn) cancelBtn.addEventListener('click', clearForm);

// ------------------ Add / Update Sale ------------------
salesForm.addEventListener('submit', e => {
  e.preventDefault();

  const newSale = {
    customerName: salesForm.customerName.value.trim(),
    productType: salesForm.productType.value.trim(),
    productName: salesForm.productName.value.trim(),
    quantity: parseInt(salesForm.quantity.value, 10),
    saleDate: salesForm.saleDate.value,
    paymentType: salesForm.paymentType.value,
    salesAgent: salesForm.salesAgent.value.trim(),
    transportProvided: salesForm.provideTransport.checked,
    totalPrice: parseFloat(salesForm.totalPrice.value),
    time: new Date().toLocaleTimeString()
  };

  if (salesForm.dataset.editIndex) {
    const idx = Number(salesForm.dataset.editIndex);
    sales[idx] = newSale;
  } else {
    sales.push(newSale);
  }

  localStorage.setItem('sales', JSON.stringify(sales));
  clearForm();
});

// ------------------ Render Sales Table ------------------
function renderSales(filter = '') {
  salesTableBody.innerHTML = '';
  const normalizedFilter = filter.toLowerCase().trim();
  const filteredSales = sales.filter(s =>
    s.customerName.toLowerCase().includes(normalizedFilter) ||
    s.productName.toLowerCase().includes(normalizedFilter)
  );

  filteredSales.forEach((sale, index) => {
    const transportFee = sale.transportProvided ? sale.totalPrice * 0.05 : 0;
    const priceWithTransport = sale.totalPrice + transportFee;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${sale.customerName}</td>
      <td>${sale.productType}</td>
      <td>${sale.productName}</td>
      <td>${sale.quantity}</td>
      <td>${sale.saleDate}</td>
      <td>${sale.paymentType}</td>
      <td>${sale.salesAgent}</td>
      <td>${sale.transportProvided ? '5%' : '0'}</td>
      <td>${sale.totalPrice.toFixed(2)}</td>
      <td>${priceWithTransport.toFixed(2)}</td>
      <td class="actions-td">
        <button class="btn btn-edit" data-index="${index}"><i class="fa fa-edit"></i> Edit</button>
        <button class="btn btn-delete" data-index="${index}"><i class="fa fa-trash"></i> Delete</button>
        <button class="btn btn-print" data-index="${index}"><i class="fa fa-print"></i> Print</button>
      </td>
    `;
    salesTableBody.appendChild(tr);
  });

  attachActionListeners();
  renderDailySummary();
}

// ------------------ Action Listeners ------------------
function attachActionListeners() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      editSale(idx);
    });
  });
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      deleteSale(idx);
    });
  });
  document.querySelectorAll('.btn-print').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      printReceipt(idx);
    });
  });
}

// ------------------ Edit / Delete ------------------
function editSale(index) {
  const sale = sales[index];
  if (!sale) return;

  salesForm.customerName.value = sale.customerName;
  salesForm.productType.value = sale.productType;
  salesForm.productName.value = sale.productName;
  salesForm.quantity.value = sale.quantity;
  salesForm.saleDate.value = sale.saleDate;
  salesForm.paymentType.value = sale.paymentType;
  salesForm.salesAgent.value = sale.salesAgent;
  salesForm.provideTransport.checked = sale.transportProvided;
  salesForm.totalPrice.value = sale.totalPrice;

  salesForm.dataset.editIndex = String(index);
}

function deleteSale(index) {
  if (!confirm('Delete this sale?')) return;
  sales.splice(index, 1);
  localStorage.setItem('sales', JSON.stringify(sales));
  renderSales(searchSalesInput.value);
}

// ------------------ Search ------------------
searchSalesInput.addEventListener('input', e => renderSales(e.target.value));

// ------------------ Print Receipt ------------------
function printReceipt(index) {
  const sale = sales[index];
  if (!sale) return;

  const transportFee = sale.transportProvided ? sale.totalPrice * 0.05 : 0;
  const priceWithTransport = sale.totalPrice + transportFee;

  const receiptWindow = window.open('', 'Print Receipt', 'width=600,height=700');
  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          table, th, td { border: 1px solid #333; }
          th, td { padding: 10px; text-align: left; }
          .total { font-weight: bold; text-align: center; margin-top: 20px; }
          button { padding: 5px 10px; margin-top: 10px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h2>MWF Sales Receipt</h2>
        <p><strong>Customer:</strong> ${sale.customerName}</p>
        <p><strong>Sales Agent:</strong> ${sale.salesAgent}</p>
        <p><strong>Date:</strong> ${sale.saleDate} ${sale.time}</p>
        <table>
          <tr><th>Product</th><th>Type</th><th>Quantity</th><th>Unit Price ($)</th><th>Total ($)</th></tr>
          <tr>
            <td>${sale.productName}</td>
            <td>${sale.productType}</td>
            <td>${sale.quantity}</td>
            <td>${sale.totalPrice.toFixed(2)}</td>
            <td>${priceWithTransport.toFixed(2)}</td>
          </tr>
        </table>
        <p class="total">Grand Total: $${priceWithTransport.toFixed(2)}</p>
        <div class="center">
          <button onclick="window.print();">Print</button>
        </div>
      </body>
    </html>
  `);
  receiptWindow.document.close();
}

// ------------------ Daily Summary ------------------
function renderDailySummary() {
  if (!dailySalesTableBody || !dailyTotalEl || !dailyItemsEl) return;

  dailySalesTableBody.innerHTML = '';
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.saleDate === today);

  let dailyTotal = 0;
  let dailyItems = 0;

  todaySales.forEach(s => {
    const transportFee = s.transportProvided ? s.totalPrice * 0.05 : 0;
    const priceWithTransport = s.totalPrice + transportFee;

    dailyTotal += priceWithTransport;
    dailyItems += s.quantity;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.time}</td>
      <td>${s.productName}</td>
      <td>${s.quantity}</td>
      <td>${priceWithTransport.toFixed(2)}</td>
    `;
    dailySalesTableBody.appendChild(tr);
  });

  dailyTotalEl.textContent = dailyTotal.toFixed(2);
  dailyItemsEl.textContent = dailyItems;
}

// ------------------ Initial Render ------------------
document.addEventListener('DOMContentLoaded', () => {
  renderSales();
});
