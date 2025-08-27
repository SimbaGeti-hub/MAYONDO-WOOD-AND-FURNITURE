// Prevent back button navigation to login page
history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};






const supplierForm = document.getElementById('supplierForm');
const suppliersTableBody = document.querySelector('#suppliersTable tbody');
const searchSuppliersInput = document.getElementById('searchSuppliers');

let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];

function renderSuppliers(filter = '') {
  suppliersTableBody.innerHTML = '';
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(filter.toLowerCase())
  );

  filteredSuppliers.forEach((sup, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${sup.name}</td>
      <td>${sup.contactPerson}</td>
      <td>${sup.phoneNumber}</td>
      <td>${sup.email}</td>
      <td>${sup.address}</td>
      <td>
        <button onclick="editSupplier(${index})">Edit</button>
        <button onclick="deleteSupplier(${index})">Delete</button>
      </td>
    `;
    suppliersTableBody.appendChild(tr);
  });
}

function clearForm() {
  supplierForm.reset();
  supplierForm.dataset.editIndex = '';
}

supplierForm.addEventListener('submit', e => {
  e.preventDefault();

  const supData = {
    name: supplierForm.supplierName.value.trim(),
    contactPerson: supplierForm.contactPerson.value.trim(),
    phoneNumber: supplierForm.phoneNumber.value.trim(),
    email: supplierForm.email.value.trim(),
    address: supplierForm.address.value.trim()
  };

  const editIndex = supplierForm.dataset.editIndex;
  if (editIndex !== '') {
    suppliers[editIndex] = supData;
  } else {
    suppliers.push(supData);
  }

  localStorage.setItem('suppliers', JSON.stringify(suppliers));
  renderSuppliers(searchSuppliersInput.value);
  clearForm();
});

function editSupplier(index) {
  const sup = suppliers[index];
  supplierForm.supplierName.value = sup.name;
  supplierForm.contactPerson.value = sup.contactPerson;
  supplierForm.phoneNumber.value = sup.phoneNumber;
  supplierForm.email.value = sup.email;
  supplierForm.address.value = sup.address;
  supplierForm.dataset.editIndex = index;
}

function deleteSupplier(index) {
  if (confirm('Are you sure you want to delete this supplier?')) {
    suppliers.splice(index, 1);
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    renderSuppliers(searchSuppliersInput.value);
  }
}

searchSuppliersInput.addEventListener('input', e => {
  renderSuppliers(e.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
  renderSuppliers();
});
