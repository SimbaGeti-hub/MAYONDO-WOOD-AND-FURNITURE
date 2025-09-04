document.addEventListener("DOMContentLoaded", () => {
  // ------------------ Role-based access ------------------
  const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    // Redirect to login if no user session
    window.location.href = "login.html";
    return;
  }

  const userRole = loggedInUser.role;
  const menuItems = document.querySelectorAll(".menu li[data-roles]");

  menuItems.forEach((item) => {
    const rolesAllowed = item.getAttribute("data-roles").split(" ");
    if (!rolesAllowed.includes(userRole)) {
      item.style.display = "none"; // Hide forbidden links
    } else {
      item.style.display = "block"; // Show allowed links
    }
  });

  // ------------------ Responsive Sidebar Toggle ------------------
  const sidebar = document.querySelector(".sidebar");
  const hamburger = document.querySelector(".hamburger");
  const menuLinks = document.querySelectorAll(".menu a");

  if (hamburger && sidebar) {
    // Toggle sidebar open/close
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });

    // Close sidebar after clicking a menu link (mobile only)
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
          sidebar.classList.remove("active");
        }
      });
    });

    // Close sidebar if clicking outside of it (mobile only)
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 900) {
        if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
          sidebar.classList.remove("active");
        }
      }
    });
  }
});
