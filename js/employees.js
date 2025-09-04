history.pushState(null, null, location.href);
window.onpopstate = () => history.go(1);

const employeeForm = document.getElementById('employeeForm');
const employeesTableBody = document.querySelector('#employeesTable tbody');
const searchEmployeesInput = document.getElementById('searchEmployees');
const cancelEditBtn = document.getElementById('cancelEdit');

let employees = JSON.parse(localStorage.getItem('employees')) || [];

// Render employees table
function renderEmployees(filter = '') {
  employeesTableBody.innerHTML = '';
  const normalizedFilter = filter.toLowerCase().trim();

  const filteredEmployees = employees.filter(emp =>
    emp.firstName.toLowerCase().includes(normalizedFilter) ||
    emp.lastName.toLowerCase().includes(normalizedFilter) ||
    emp.position.toLowerCase().includes(normalizedFilter)
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
        <button class="btn btn-edit" data-index="${index}"><i class="fa fa-edit"></i> Edit</button>
        <button class="btn btn-delete" data-index="${index}"><i class="fa fa-trash"></i> Delete</button>
      </td>
    `;
    employeesTableBody.appendChild(tr);
  });
}

// Clear form
function clearForm() {
  employeeForm.reset();
  employeeForm.dataset.editIndex = '';
}

// Save / update employee
employeeForm.addEventListener('submit', e => {
  e.preventDefault();

  const empData = {
    firstName: employeeForm.firstName.value.trim(),
    lastName: employeeForm.lastName.value.trim(),
    email: employeeForm.email.value.trim(),
    contactNumber: employeeForm.contactNumber.value.trim(),
    dob: employeeForm.dob.value,
    position: employeeForm.position.value.trim(),
    salary: parseFloat(employeeForm.salary.value)
  };

  const editIndex = employeeForm.dataset.editIndex;
  if (editIndex !== '' && editIndex != null) {
    employees[editIndex] = empData; // update
  } else {
    employees.push(empData); // add new
  }

  localStorage.setItem('employees', JSON.stringify(employees));
  renderEmployees(searchEmployeesInput.value);
  clearForm();
});

// Cancel button
cancelEditBtn.addEventListener('click', () => {
  clearForm();
});

// Edit / Delete functionality (using event delegation)
employeesTableBody.addEventListener('click', e => {
  const index = e.target.closest('button')?.dataset.index;
  if (e.target.closest('.btn-edit')) {
    const emp = employees[index];
    employeeForm.firstName.value = emp.firstName;
    employeeForm.lastName.value = emp.lastName;
    employeeForm.email.value = emp.email;
    employeeForm.contactNumber.value = emp.contactNumber;
    employeeForm.dob.value = emp.dob;
    employeeForm.position.value = emp.position;
    employeeForm.salary.value = emp.salary;
    employeeForm.dataset.editIndex = index;
  } else if (e.target.closest('.btn-delete')) {
    if (confirm('Are you sure you want to delete this employee?')) {
      employees.splice(index, 1);
      localStorage.setItem('employees', JSON.stringify(employees));
      renderEmployees(searchEmployeesInput.value);
      clearForm();
    }
  }
});

// Search/filter employees
searchEmployeesInput.addEventListener('input', e => renderEmployees(e.target.value));

// Initial render
document.addEventListener('DOMContentLoaded', () => renderEmployees());
