// Prevent back button navigation to login page
history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};




const salesForm = document.getElementById('salesForm');
const salesTableBody = document.querySelector('#salesTable tbody');
const searchSalesInput = document.getElementById('searchSales');

let sales = JSON.parse(localStorage.getItem('sales')) || [];

function calculateTransportFee(totalPrice, transportProvided) {
  return transportProvided ? totalPrice * 0.05 : 0;
}

function renderSales(filter = '') {
  salesTableBody.innerHTML = '';
  const filteredSales = sales.filter(s =>
    s.customerName.toLowerCase().includes(filter.toLowerCase()) ||
    s.productName.toLowerCase().includes(filter.toLowerCase())
  );
  filteredSales.forEach((sale, index) => {
    const transportFee = calculateTransportFee(sale.totalPrice, sale.transportProvided);
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
      <td>
        <button onclick="deleteSale(${index})">Delete</button>
      </td>
    `;
    salesTableBody.appendChild(tr);
  });
}

function clearForm() {
  salesForm.reset();
}

salesForm.addEventListener('submit', e => {
  e.preventDefault();

  const saleData = {
    customerName: salesForm.customerName.value.trim(),
    productType: salesForm.productType.value.trim(),
    productName: salesForm.productName.value.trim(),
    quantity: parseInt(salesForm.quantity.value),
    saleDate: salesForm.saleDate.value,
    paymentType: salesForm.paymentType.value,
    salesAgent: salesForm.salesAgent.value.trim(),
    transportProvided: salesForm.provideTransport.checked,
    totalPrice: parseFloat(salesForm.totalPrice.value),
  };

  sales.push(saleData);
  localStorage.setItem('sales', JSON.stringify(sales));
  renderSales(searchSalesInput.value);
  clearForm();
});

function deleteSale(index) {
  if (confirm('Are you sure you want to delete this sale?')) {
    sales.splice(index, 1);
    localStorage.setItem('sales', JSON.stringify(sales));
    renderSales(searchSalesInput.value);
  }
}

searchSalesInput.addEventListener('input', (e) => {
  renderSales(e.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
  renderSales();
});
