history.pushState(null, null, location.href);
window.onpopstate = () => history.go(1);

const deliveryForm = document.getElementById('deliveryForm');
const deliveriesContainer = document.getElementById('deliveriesContainer');
const searchDeliveriesInput = document.getElementById('searchDeliveries');
const cancelBtn = document.getElementById('cancelBtn');

let deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// ------------------ Helpers ------------------
function saveDeliveries() {
  localStorage.setItem('deliveries', JSON.stringify(deliveries));
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ------------------ Render Deliveries ------------------
function renderDeliveries(filter = '') {
  deliveriesContainer.innerHTML = '';
  const normalizedFilter = filter.toLowerCase().trim();
  const filtered = deliveries.filter(d =>
    d.orderNumber.toLowerCase().includes(normalizedFilter) ||
    d.driver.toLowerCase().includes(normalizedFilter) ||
    d.status.toLowerCase().includes(normalizedFilter)
  );

  if (!filtered.length) {
    deliveriesContainer.innerHTML = '<p>No deliveries found.</p>';
    return;
  }

  filtered.forEach((d, i) => {
    const deliveryTime = new Date(d.deliveryTime);
    const now = new Date();
    const diffMins = (deliveryTime - now) / 60000;
    const notifyInline = diffMins <= 30 && diffMins > 0 ? '⚠️ Delivery approaching!' : '';

    const card = document.createElement('div');
    card.className = 'delivery-card';
    card.innerHTML = `
      <h4>Order #${d.orderNumber} ${notifyInline}</h4>
      <p><strong>Product:</strong> ${d.product}</p>
      <p><strong>Vehicle:</strong> ${d.vehicle}</p>
      <p><strong>Driver:</strong> ${d.driver}</p>
      <p><strong>Customer:</strong> ${d.customer}</p>
      <p><strong>Route Distance:</strong> ${d.distance} km</p>
      <p><strong>Est. Time:</strong> ${d.estimatedTime} hrs</p>
      <p><strong>Delivery Date & Time:</strong> ${deliveryTime.toLocaleString()}</p>
      <p><strong>Status:</strong> <span class="status ${d.status.toLowerCase().replace(' ', '-')}">${d.status}</span></p>
      <button onclick="editDelivery(${i})">Edit</button>
      <button onclick="deleteDelivery(${i})">Delete</button>
    `;
    deliveriesContainer.appendChild(card);
  });
}

// ------------------ Form Handling ------------------
function clearForm() {
  deliveryForm.reset();
  delete deliveryForm.dataset.editIndex;
}

cancelBtn.addEventListener('click', clearForm);

deliveryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const deliveryData = {
    orderNumber: deliveryForm.orderNumber.value.trim(),
    product: deliveryForm.product.value.trim(),
    vehicle: deliveryForm.vehicle.value.trim(),
    driver: deliveryForm.driver.value.trim(),
    customer: deliveryForm.customer.value.trim(),
    distance: parseFloat(deliveryForm.distance.value),
    estimatedTime: parseFloat(deliveryForm.estimatedTime.value),
    deliveryTime: deliveryForm.deliveryTime.value,
    status: deliveryForm.status.value
  };

  if (deliveryForm.dataset.editIndex) {
    const idx = Number(deliveryForm.dataset.editIndex);
    deliveries[idx] = deliveryData;
    updateDeliveryTask(deliveryData);
  } else {
    deliveries.push(deliveryData);
    addDeliveryTask(deliveryData);
  }

  saveDeliveries();
  saveTasks();
  renderDeliveries(searchDeliveriesInput.value);
  clearForm();
});

// ------------------ Edit/Delete ------------------
function editDelivery(index) {
  const d = deliveries[index];
  deliveryForm.orderNumber.value = d.orderNumber;
  deliveryForm.product.value = d.product;
  deliveryForm.vehicle.value = d.vehicle;
  deliveryForm.driver.value = d.driver;
  deliveryForm.customer.value = d.customer;
  deliveryForm.distance.value = d.distance;
  deliveryForm.estimatedTime.value = d.estimatedTime;
  deliveryForm.deliveryTime.value = d.deliveryTime;
  deliveryForm.status.value = d.status;
  deliveryForm.dataset.editIndex = index;
}

function deleteDelivery(index) {
  if (!confirm('Delete this delivery?')) return;
  const del = deliveries[index];
  deliveries.splice(index, 1);
  saveDeliveries();
  deleteDeliveryTask(del.orderNumber);
  renderDeliveries(searchDeliveriesInput.value);
}

// ------------------ Search ------------------
searchDeliveriesInput.addEventListener('input', e => renderDeliveries(e.target.value));

// ------------------ To-Do Integration ------------------
function addDeliveryTask(delivery) {
  tasks.push({
    type: 'Delivery',
    orderNumber: delivery.orderNumber,
    name: `Deliver ${delivery.product} (Order #${delivery.orderNumber})`,
    dueTime: delivery.deliveryTime,
    status: 'Pending'
  });
}

function updateDeliveryTask(delivery) {
  const task = tasks.find(t => t.orderNumber === delivery.orderNumber);
  if (task) {
    task.name = `Deliver ${delivery.product} (Order #${delivery.orderNumber})`;
    task.dueTime = delivery.deliveryTime;
    task.status = 'Pending';
  }
}

function deleteDeliveryTask(orderNumber) {
  const idx = tasks.findIndex(t => t.orderNumber === orderNumber);
  if (idx > -1) tasks.splice(idx, 1);
}

// ------------------ Initial Render ------------------
document.addEventListener('DOMContentLoaded', () => {
  renderDeliveries();
  setInterval(() => renderDeliveries(searchDeliveriesInput.value), 60000); // Update notifications
});
