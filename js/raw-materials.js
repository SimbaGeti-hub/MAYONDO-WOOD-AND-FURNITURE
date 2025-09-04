// ------------------ Prevent back button ------------------
history.pushState(null, null, location.href);
window.onpopstate = () => history.go(1);

// ------------------ DOM Elements ------------------
const rawMaterialForm = document.getElementById('rawMaterialForm');
const rawMaterialsTableBody = document.querySelector('#rawMaterialsTable tbody');
const cancelBtn = document.getElementById('cancelBtn');
const rawMaterialsSummaryBody = document.getElementById('rawMaterialsSummaryBody');

let rawMaterials = JSON.parse(localStorage.getItem('rawMaterials')) || [];

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

// ------------------ Clear form ------------------
function clearForm() {
  rawMaterialForm.reset();
  delete rawMaterialForm.dataset.editIndex;
  renderRawMaterials();
  renderRawMaterialsSummary();
}

// Cancel button
if (cancelBtn) cancelBtn.addEventListener('click', clearForm);

// ------------------ Add / Update Raw Material ------------------
rawMaterialForm.addEventListener('submit', e => {
  e.preventDefault();

  const rawData = {
    name: rawMaterialForm.rawName.value.trim(),
    type: rawMaterialForm.rawType.value.trim(),
    costPrice: parseFloat(rawMaterialForm.costPrice.value),
    quantity: parseInt(rawMaterialForm.quantityBought.value, 10),
    supplier: rawMaterialForm.supplierName.value.trim(),
    date: rawMaterialForm.purchaseDate.value,
    quality: rawMaterialForm.quality.value.trim(),
    color: rawMaterialForm.color.value.trim(),
    measurements: rawMaterialForm.measurements.value.trim()
  };

  if (rawMaterialForm.dataset.editIndex !== undefined) {
    const idx = Number(rawMaterialForm.dataset.editIndex);
    rawMaterials[idx] = rawData;
  } else {
    rawMaterials.push(rawData);
  }

  localStorage.setItem('rawMaterials', JSON.stringify(rawMaterials));
  clearForm();
});

// ------------------ Render Raw Materials Table ------------------
function renderRawMaterials() {
  rawMaterialsTableBody.innerHTML = '';

  rawMaterials.forEach((raw, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${raw.name}</td>
      <td>${raw.type}</td>
      <td>${raw.costPrice.toFixed(2)}</td>
      <td>${raw.quantity}</td>
      <td>${raw.supplier}</td>
      <td>${raw.date}</td>
      <td>${raw.quality}</td>
      <td>${raw.color}</td>
      <td>${raw.measurements}</td>
      <td class="actions-td">
        <button class="btn btn-edit" data-index="${index}"><i class="fa fa-edit"></i> Edit</button>
        <button class="btn btn-delete" data-index="${index}"><i class="fa fa-trash"></i> Delete</button>
      </td>
    `;
    rawMaterialsTableBody.appendChild(tr);
  });

  attachActionListeners();
  renderRawMaterialsSummary();
}

// ------------------ Raw Materials Summary ------------------
function renderRawMaterialsSummary() {
  rawMaterialsSummaryBody.innerHTML = '';

  // Aggregate total quantity per raw material name
  const summary = {};
  rawMaterials.forEach(raw => {
    if (summary[raw.name]) {
      summary[raw.name] += raw.quantity;
    } else {
      summary[raw.name] = raw.quantity;
    }
  });

  for (const [name, quantity] of Object.entries(summary)) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${name}</td>
      <td>${quantity}</td>
    `;
    rawMaterialsSummaryBody.appendChild(tr);
  }
}

// ------------------ Edit / Delete Functions ------------------
function attachActionListeners() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      editRawMaterial(idx);
    });
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      deleteRawMaterial(idx);
    });
  });
}

function editRawMaterial(index) {
  const raw = rawMaterials[index];
  rawMaterialForm.rawName.value = raw.name;
  rawMaterialForm.rawType.value = raw.type;
  rawMaterialForm.costPrice.value = raw.costPrice;
  rawMaterialForm.quantityBought.value = raw.quantity;
  rawMaterialForm.supplierName.value = raw.supplier;
  rawMaterialForm.purchaseDate.value = raw.date;
  rawMaterialForm.quality.value = raw.quality;
  rawMaterialForm.color.value = raw.color;
  rawMaterialForm.measurements.value = raw.measurements;

  rawMaterialForm.dataset.editIndex = index;
}

function deleteRawMaterial(index) {
  if (!confirm('Are you sure you want to delete this raw material?')) return;
  rawMaterials.splice(index, 1);
  localStorage.setItem('rawMaterials', JSON.stringify(rawMaterials));
  renderRawMaterials();
}

// ------------------ Initial Render ------------------
document.addEventListener('DOMContentLoaded', () => {
  renderRawMaterials();
});
