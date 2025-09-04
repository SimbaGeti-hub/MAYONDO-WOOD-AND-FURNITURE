// ------------------ Prevent back button ------------------
history.pushState(null, null, location.href);
window.onpopstate = () => history.go(1);

// ------------------ DOM Elements ------------------
const supplierForm = document.getElementById('supplierForm');
const suppliersTableBody = document.querySelector('#suppliersTable tbody');
const searchSuppliersInput = document.getElementById('searchSuppliers');
const cancelBtn = document.getElementById('cancelBtn');
const totalSuppliersEl = document.getElementById('totalSuppliers');

let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];

// ------------------ Clear form ------------------
function clearForm() {
  supplierForm.reset();
  delete supplierForm.dataset.editIndex;
  renderSuppliers();
}

// Cancel button
if (cancelBtn) cancelBtn.addEventListener('click', clearForm);

// ------------------ Add / Update Supplier ------------------
supplierForm.addEventListener('submit', e => {
  e.preventDefault();

  const supData = {
    name: supplierForm.supplierName.value.trim(),
    contactPerson: supplierForm.contactPerson.value.trim(),
    phoneNumber: supplierForm.phoneNumber.value.trim(),
    email: supplierForm.email.value.trim(),
    address: supplierForm.address.value.trim(),
    productSupplied: supplierForm.productSupplied.value.trim()
  };

  const editIndex = supplierForm.dataset.editIndex;
  if (editIndex !== undefined) {
    suppliers[editIndex] = supData;
  } else {
    suppliers.push(supData);
  }

  localStorage.setItem('suppliers', JSON.stringify(suppliers));
  clearForm();
});

// ------------------ Render Suppliers Table ------------------
function renderSuppliers(filter = '') {
  suppliersTableBody.innerHTML = '';
  const normalizedFilter = filter.toLowerCase().trim();

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(normalizedFilter) ||
    s.contactPerson.toLowerCase().includes(normalizedFilter)
  );

  filteredSuppliers.forEach((sup, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${sup.name}</td>
      <td>${sup.contactPerson}</td>
      <td>${sup.phoneNumber}</td>
      <td>${sup.email}</td>
      <td>${sup.address}</td>
      <td>${sup.productSupplied}</td>
      <td class="actions-td">
        <button class="btn btn-edit" data-index="${index}"><i class="fa fa-edit"></i> Edit</button>
        <button class="btn btn-delete" data-index="${index}"><i class="fa fa-trash"></i> Delete</button>
      </td>
    `;
    suppliersTableBody.appendChild(tr);
  });

  attachActionListeners();
  updateTotalSuppliers();
}

// ------------------ Edit / Delete Functions ------------------
function attachActionListeners() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      editSupplier(idx);
    });
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      deleteSupplier(idx);
    });
  });
}

function editSupplier(index) {
  const sup = suppliers[index];
  supplierForm.supplierName.value = sup.name;
  supplierForm.contactPerson.value = sup.contactPerson;
  supplierForm.phoneNumber.value = sup.phoneNumber;
  supplierForm.email.value = sup.email;
  supplierForm.address.value = sup.address;
  supplierForm.productSupplied.value = sup.productSupplied;

  supplierForm.dataset.editIndex = index;
}

function deleteSupplier(index) {
  if (!confirm('Are you sure you want to delete this supplier?')) return;
  suppliers.splice(index, 1);
  localStorage.setItem('suppliers', JSON.stringify(suppliers));
  renderSuppliers(searchSuppliersInput.value);
}

// ------------------ Search ------------------
searchSuppliersInput.addEventListener('input', e => renderSuppliers(e.target.value));

// ------------------ Update Total Suppliers ------------------
function updateTotalSuppliers() {
  totalSuppliersEl.textContent = suppliers.length;
}

// ------------------ Initial Render ------------------
document.addEventListener('DOMContentLoaded', () => {
  renderSuppliers();
});
