// Navigation & Search: DOM Element Selectors
const myHeader = document.querySelector(".site-header");
const navMenu = document.querySelector(".nav-menu");

const navToggle = document.querySelector(".nav-toggle-label");

const brandLogo = document.querySelector(".brand-logo");

const navLinks = document.querySelectorAll(".nav-link");

const searchForm = document.querySelector(".search-form");

const searchInput = document.querySelector(".search-form input");

const districtSelect = document.querySelector(".search-form select");

const searchWrapper = document.querySelector(".search-wrapper");

const searchDropdown = document.querySelector(".search-dropdown");

// Brand Logo: Prevent Default Link Navigation
brandLogo.addEventListener("click", function (event) {
  event.preventDefault();
});

// Mobile Navigation: Toggle Hamburger Menu
navToggle.addEventListener("click", function () {
  navMenu.classList.toggle("show");
});

// Navigation Links: Active State Highlighter
navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.forEach(function (navLinks) {
      navLinks.classList.remove("active");
    });

    link.classList.add("active");
  });
});
// Hero Search Form: Multi-Condition Filtering & Live Dropdown
let debounceTimer;

function performSearch() {
  let searchQuery = searchInput.value.trim();
  let district = districtSelect.value;

  if (searchQuery === "") {
    searchInput.placeholder =
      "Please enter doctor's name, specialty or clinic!";
    searchInput.parentElement.classList.add("error");
    searchInput.focus();
  } else {
    const filteredDoctors = doctors.filter(function (doctor) {
      const query = searchQuery.toLowerCase();
      const matchesText =
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.clinic.toLowerCase().includes(query);

      const matchesDistrict =
        district === "" ||
        doctor.district.toLowerCase() === district.toLowerCase();
      return matchesText && matchesDistrict;
    });
    searchDropdown.classList.add("show");
    if (filteredDoctors.length === 0) {
      searchDropdown.innerHTML = "No Clinics Found";
    } else {
      searchDropdown.innerHTML = "";
      filteredDoctors.forEach(function (doctor) {
        searchDropdown.innerHTML += `
  <a href="doctor-profile.html?id=${doctor.id}" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: inherit;">
    <div>
      <h4 style="margin: 0; font-size: 1rem; font-weight: 600;">${doctor.name}</h4>
      <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--text-muted);">${doctor.specialty} • ${doctor.clinic} (${doctor.district})</p>
    </div>
    <span style="font-weight: 600; color: var(--accent);"> ${doctor.rating > 0 ? "⭐ " + doctor.rating : "⭐ Newly Registered"}</span>
  </a>
`;
      });
    }
  }
}
searchInput.addEventListener("input", function () {
  searchInput.parentElement.classList.remove("error");
  clearTimeout(debounceTimer);

  if (searchInput.value.trim() === "") {
    searchDropdown.classList.remove("show");
    return;
  }
  debounceTimer = setTimeout(function () {
    performSearch();
  }, 300);
});

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearTimeout(debounceTimer);
  performSearch();
});

// Search Dropdown: Dismiss on Outside Click
document.addEventListener("click", function (event) {
  if (!searchWrapper.contains(event.target)) {
    searchDropdown.classList.remove("show");
  }
});

// Popular Search Pills: Quick-Filter Input Autofill
const popularTags = document.querySelectorAll(".tag-pill");

popularTags.forEach(function (tag) {
  tag.addEventListener("click", function (event) {
    event.preventDefault();
    searchInput.value = tag.textContent;
    searchInput.parentElement.classList.remove("error");
    searchInput.focus();
  });
});

// Featured Doctors Section: Top 3 Rated Clinics & Empty State Banner
const doctorGrid = document.querySelector(".doctor-grid");
const doctors = JSON.parse(localStorage.getItem("clinic_doctors")) || [];

if (doctors.length === 0) {
  doctorGrid.innerHTML = `
  <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 1rem;">
    <div style="font-size: 2.5rem; margin-bottom: 1rem;">🏥</div>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
      No Private Clinics Listed Yet
    </h3>
    <p style="color: #64748b; max-width: 480px; margin: 0 auto 1.5rem auto; font-size: 0.95rem;">
      We are actively onboarding verified doctors across the Valley. Are you a private medical practitioner in Kashmir?
    </p>
    <a href="register.html" class="btn btn-primary btn-md">
      Register Your Clinic Today
    </a>
  </div>`;
} else {
  const sortedDoctors = [...doctors].sort(function (a, b) {
    return b.rating - a.rating;
  });
  const featuredDoctors = sortedDoctors.slice(0, 3);
  featuredDoctors.forEach(function (doctor) {
    doctorGrid.innerHTML += `
      <article class="doctor-card">
        <div class="doctor-card-header">
          <div class="doctor-basic-info">
            <div class="doctor-specialty">${doctor.specialty}</div>
            <h3 class="doctor-name">${doctor.name}</h3>
            <div class="doctor-rating">${doctor.rating > 0 ? "⭐ " + doctor.rating : "⭐ Newly Registered"}</div>
          </div>
        </div>
        <div class="doctor-card-body">
          <p>${doctor.clinic} — ${doctor.district}</p>
        </div>
        <div class="doctor-card-footer">
   <a href = "doctor-profile.html?id=${doctor.id}" class="btn btn-outline btn-sm">View Profile</a>
        </div>
      </article>
    `;
  });
}

// Site Header Navigation: Dynamic Session Controls & Global Logout
const activeUser = JSON.parse(localStorage.getItem("current_user"));

const navActions = document.querySelector(".nav-actions");

if (activeUser) {
  navActions.innerHTML = `
    <a href="dashboard.html" class="btn btn-ghost btn-sm">Dashboard</a>
    <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
   
  `;

  document.querySelector("#logout-btn").addEventListener("click", function () {
    localStorage.removeItem("current_user");
    window.location.reload();
  });
}
