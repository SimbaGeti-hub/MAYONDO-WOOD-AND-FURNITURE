// Prevent back button navigation to login page
history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};






const reportFilterForm = document.getElementById('reportFilterForm');
const reportResultsSection = document.getElementById('reportResultsSection');
const reportTableHead = document.getElementById('reportTableHead');
const reportTableBody = document.getElementById('reportTableBody');
const exportCSVBtn = document.getElementById('exportCSVBtn');

function loadData(type) {
  if (type === 'sales') return JSON.parse(localStorage.getItem('sales')) || [];
  if (type === 'products') return JSON.parse(localStorage.getItem('products')) || [];
  return [];
}

function filterByDate(data, startDate, endDate, dateField = 'date') {
  return data.filter(entry => {
    const entryDate = new Date(entry[dateField]);
    if (startDate && entryDate < startDate) return false;
    if (endDate && entryDate > endDate) return false;
    return true;
  });
}

function generateTableHeaders(keys) {
  reportTableHead.innerHTML = '';
  keys.forEach(key => {
    const th = document.createElement('th');
    th.textContent = key;
    reportTableHead.appendChild(th);
  });
}

function generateTableRows(data, keys) {
  reportTableBody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    keys.forEach(key => {
      const td = document.createElement('td');
      td.textContent = row[key] !== undefined ? row[key] : '';
      tr.appendChild(td);
    });
    reportTableBody.appendChild(tr);
  });
}

function exportTableToCSV(filename = 'report.csv') {
  let csv = [];
  const rows = document.querySelectorAll('#reportTable tr');
  for (let row of rows) {
    const cols = row.querySelectorAll('th, td');
    let rowData = [];
    for (let col of cols) {
      rowData.push('"' + col.innerText.replace(/"/g, '""') + '"');
    }
    csv.push(rowData.join(','));
  }
  const csvString = csv.join('\n');
  const link = document.createElement('a');
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
  link.download = filename;
  link.click();
}

reportFilterForm.addEventListener('submit', e => {
  e.preventDefault();
  const type = document.getElementById('reportType').value;
  const startDate = document.getElementById('startDate').value ? new Date(document.getElementById('startDate').value) : null;
  const endDate = document.getElementById('endDate').value ? new Date(document.getElementById('endDate').value) : null;
  const data = loadData(type);

  const dateField = type === 'sales' ? 'saleDate' : 'date';
  const filteredData = filterByDate(data, startDate, endDate, dateField);
  if (filteredData.length === 0) {
    alert('No records found for the selected criteria.');
    reportResultsSection.style.display = 'none';
    return;
  }

  // Dynamically get keys for headers, limit columns for readability
  let keys = Object.keys(filteredData[0]);
  if (type === 'sales') {
    // select key fields for sales report display
    keys = ['customerName', 'productType', 'productName', 'quantity', 'saleDate', 'paymentType', 'salesAgent', 'totalPrice'];
  } else if (type === 'products') {
    keys = ['name', 'type', 'costPrice', 'quantity', 'productPrice', 'supplier', 'date', 'quality'];
  }
  generateTableHeaders(keys);
  generateTableRows(filteredData, keys);
  reportResultsSection.style.display = 'block';
});

exportCSVBtn.addEventListener('click', () => {
  exportTableToCSV();
});

