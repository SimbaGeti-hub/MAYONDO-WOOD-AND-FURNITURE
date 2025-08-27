// Prevent back button navigation to login page
history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};




const deliveryForm = document.getElementById('deliveryForm');
const deliveriesContainer = document.getElementById('deliveriesContainer');
const searchDeliveriesInput = document.getElementById('searchDeliveries');

let deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];

function renderDeliveries(filter = '') {
  deliveriesContainer.innerHTML = '';

  const filteredDeliveries = deliveries.filter(del =>
    del.orderNumber.toLowerCase().includes(filter.toLowerCase()) ||
    del.driver.toLowerCase().includes(filter.toLowerCase()) ||
    del.status.toLowerCase().includes(filter.toLowerCase())
  );

  if (filteredDeliveries.length === 0) {
    deliveriesContainer.innerHTML = '<p>No deliveries found.</p>';
    return;
  }

  filteredDeliveries.forEach((d, i) => {
    const card = document.createElement('div');
    card.className = 'delivery-card';
    card.innerHTML = `
      <h4>Order #${d.orderNumber}</h4>
      <p><strong>Product:</strong> ${d.product}</p>
      <p><strong>Vehicle:</strong> ${d.vehicle}</p>
      <p><strong>Driver:</strong> ${d.driver}</p>
      <p><strong>Customer:</strong> ${d.customer}</p>
      <p><strong>Route Distance:</strong> ${d.distance} km</p>
      <p><strong>Est. Time:</strong> ${d.estimatedTime} hrs</p>
      <p><strong>Current Location:</strong> ${d.location}</p>
      <p><strong>Time Left:</strong> ${d.timeLeft} mins</p>
      <p><strong>Status:</strong> <span class="status ${d.status.toLowerCase().replace(' ', '-')}">${d.status}</span></p>
      <button onclick="deleteDelivery(${i})">Delete</button>
    `;
    deliveriesContainer.appendChild(card);
  });
}

function clearForm() {
  deliveryForm.reset();
}

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
    location: deliveryForm.location.value.trim(),
    timeLeft: parseInt(deliveryForm.timeLeft.value),
    status: deliveryForm.status.value
  };

  deliveries.push(deliveryData);
  localStorage.setItem('deliveries', JSON.stringify(deliveries));
  renderDeliveries(searchDeliveriesInput.value);
  clearForm();
});

function deleteDelivery(index) {
  if (confirm('Delete this delivery record?')) {
    deliveries.splice(index, 1);
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
    renderDeliveries(searchDeliveriesInput.value);
  }
}

searchDeliveriesInput.addEventListener('input', e => {
  renderDeliveries(e.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
  renderDeliveries();
});
