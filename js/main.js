document.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    // Redirect to login if no user session
    window.location.href = 'login.html';
    return;
  }

  const userRole = loggedInUser.role;
  const menuItems = document.querySelectorAll('.menu li[data-roles]');

  menuItems.forEach((item) => {
    const rolesAllowed = item.getAttribute('data-roles').split(' ');
    if (!rolesAllowed.includes(userRole)) {
      item.style.display = 'none'; // Hide forbidden links
    } else {
      item.style.display = 'block'; // Show allowed links
    }
  });
});
