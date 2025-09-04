history.pushState(null, null, location.href);
window.onpopstate = () => history.go(1);

const taskForm = document.getElementById('taskForm');
const tasksTableBody = document.querySelector('#tasksTable tbody');
const searchTasksInput = document.getElementById('searchTasks');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];

// ------------------ Helpers ------------------
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function clearTaskForm() {
  taskForm.reset();
  delete taskForm.dataset.editIndex;
}

// ------------------ Add/Edit Task ------------------
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const taskData = {
    name: taskForm.taskName.value.trim(),
    dueTime: taskForm.taskDueTime.value || null,
    type: taskForm.taskType.value,
    status: 'Pending'
  };

  if (taskForm.dataset.editIndex) {
    const idx = Number(taskForm.dataset.editIndex);
    tasks[idx] = taskData;
  } else {
    tasks.push(taskData);
  }

  saveTasks();
  renderTasks(searchTasksInput.value);
  clearTaskForm();
});

cancelTaskBtn.addEventListener('click', clearTaskForm);

// ------------------ Render Tasks ------------------
function renderTasks(filter = '') {
  tasksTableBody.innerHTML = '';
  const normalizedFilter = filter.toLowerCase().trim();
  const filtered = tasks.filter(t =>
    t.name.toLowerCase().includes(normalizedFilter) ||
    t.type.toLowerCase().includes(normalizedFilter)
  );

  if (!filtered.length) {
    tasksTableBody.innerHTML = '<tr><td colspan="5">No tasks found.</td></tr>';
    return;
  }

  filtered.forEach((t, i) => {
    let notify = '';
    if (t.dueTime) {
      const diffMins = (new Date(t.dueTime) - new Date()) / 60000;
      if (diffMins <= 30 && diffMins > 0) notify = '⚠️ Due soon!';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.name} ${notify}</td>
      <td>${t.type}</td>
      <td>${t.dueTime ? new Date(t.dueTime).toLocaleString() : '-'}</td>
      <td>${t.status}</td>
      <td>
        <button onclick="editTask(${i})">Edit</button>
        <button onclick="deleteTask(${i})">Delete</button>
      </td>
    `;
    tasksTableBody.appendChild(tr);
  });
}

// ------------------ Edit/Delete Task ------------------
function editTask(index) {
  const t = tasks[index];
  taskForm.taskName.value = t.name;
  taskForm.taskDueTime.value = t.dueTime || '';
  taskForm.taskType.value = t.type;
  taskForm.dataset.editIndex = index;
}

function deleteTask(index) {
  if (!confirm('Delete this task?')) return;
  tasks.splice(index, 1);
  saveTasks();
  renderTasks(searchTasksInput.value);
}

// ------------------ Search ------------------
searchTasksInput.addEventListener('input', e => renderTasks(e.target.value));

// ------------------ Sync Delivery Tasks ------------------
function syncDeliveryTasks() {
  deliveries.forEach(del => {
    const exists = tasks.find(t => t.name.includes(del.orderNumber));
    if (!exists) {
      tasks.push({
        type: 'Delivery',
        orderNumber: del.orderNumber,
        name: `Deliver ${del.product} (Order #${del.orderNumber})`,
        dueTime: del.deliveryTime,
        status: 'Pending'
      });
    }
  });
  saveTasks();
}

document.addEventListener('DOMContentLoaded', () => {
  deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
  syncDeliveryTasks();
  renderTasks();
  setInterval(() => renderTasks(searchTasksInput.value), 60000); // Refresh notifications
});
