// Prevent back button navigation to login page
history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};






const employeeForm = document.getElementById('employeeForm');
const employeesTableBody = document.querySelector('#employeesTable tbody');
const searchEmployeesInput = document.getElementById('searchEmployees');

let employees = JSON.parse(localStorage.getItem('employees')) || [];

function renderEmployees(filter = '') {
  employeesTableBody.innerHTML = '';
  const filteredEmployees = employees.filter(emp =>
    emp.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(filter.toLowerCase()) ||
    emp.position.toLowerCase().includes(filter.toLowerCase())
  );

  filteredEmployees.forEach((emp, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${emp.firstName}</td>
      <td>${emp.lastName}</td>
      <td>${emp.email}</td>
      <td>${emp.contactNumber}</td>
      <td>${emp.dob}</td>
      <td>${emp.position}</td>
      <td>${emp.salary.toFixed(2)}</td>
      <td>
        <button onclick="editEmployee(${index})">Edit</button>
        <button onclick="deleteEmployee(${index})">Delete</button>
      </td>
    `;
    employeesTableBody.appendChild(tr);
  });
}

function clearForm() {
  employeeForm.reset();
  employeeForm.dataset.editIndex = '';
}

employeeForm.addEventListener('submit', e => {
  e.preventDefault();

  const empData = {
    firstName: employeeForm.firstName.value.trim(),
    lastName: employeeForm.lastName.value.trim(),
    email: employeeForm.email.value.trim(),
    contactNumber: employeeForm.contactNumber.value.trim(),
    dob: employeeForm.dob.value,
    position: employeeForm.position.value.trim(),
    salary: parseFloat(employeeForm.salary.value),
  };

  const editIndex = employeeForm.dataset.editIndex;

  if (editIndex !== '') {
    employees[editIndex] = empData;
  } else {
    employees.push(empData);
  }

  localStorage.setItem('employees', JSON.stringify(employees));
  renderEmployees(searchEmployeesInput.value);
  clearForm();
});

function editEmployee(index) {
  const emp = employees[index];
  employeeForm.firstName.value = emp.firstName;
  employeeForm.lastName.value = emp.lastName;
  employeeForm.email.value = emp.email;
  employeeForm.contactNumber.value = emp.contactNumber;
  employeeForm.dob.value = emp.dob;
  employeeForm.position.value = emp.position;
  employeeForm.salary.value = emp.salary;
  employeeForm.dataset.editIndex = index;
}

function deleteEmployee(index) {
  if (confirm('Are you sure you want to delete this employee?')) {
    employees.splice(index, 1);
    localStorage.setItem('employees', JSON.stringify(employees));
    renderEmployees(searchEmployeesInput.value);
  }
}

searchEmployeesInput.addEventListener('input', e => {
  renderEmployees(e.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
  renderEmployees();
});
