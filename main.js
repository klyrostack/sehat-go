const myHeader = document.querySelector(".site-header");
const navMenu = document.querySelector(".nav-menu");

const navToggle = document.querySelector(".nav-toggle-label");

const brandLogo = document.querySelector(".brand-logo");

const navLinks = document.querySelectorAll(".nav-link");

const searchForm = document.querySelector(".search-form");

const searchInput = document.querySelector(".search-form input");

const districtSelect = document.querySelector(".search-form select");

brandLogo.addEventListener("click", function (event) {
  event.preventDefault();
  console.log("Brand Logo was clicked");
});

navToggle.addEventListener("click", function () {
  navMenu.classList.toggle("show");
});

navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.forEach(function (navLinks) {
      navLinks.classList.remove("active");
    });

    link.classList.add("active");

    console.log("Clicked:", link.textContent);
  });
});
// Listener 1: Handles Form Submit.

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let searchQuery = searchInput.value.trim();
  let district = districtSelect.value;

  if (searchQuery === "") {
    searchInput.placeholder =
      "Please enter doctor's name, specialty or clinic!";
    searchInput.parentElement.classList.add("error");
    searchInput.focus();
  } else {
    console.log(searchQuery);
    console.log(district);
  }
});

// Listener 2: Stands independently outside, listening for typing.

searchInput.addEventListener("input", function () {
  searchInput.parentElement.classList.remove("error");
});

// Popular search Pills.

const popularTags = document.querySelectorAll(".tag-pill");

popularTags.forEach(function (tag) {
  tag.addEventListener("click", function (event) {
    event.preventDefault();
    searchInput.value = tag.textContent;
    searchInput.parentElement.classList.remove("error");
    searchInput.focus();
  });
});

// Featured Doctors.

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
            <div class="doctor-rating">⭐ ${doctor.rating}</div>
          </div>
        </div>
        <div class="doctor-card-body">
          <p>${doctor.clinic} — ${doctor.district}</p>
        </div>
      </article>
    `;
  });
}
