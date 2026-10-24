import { Doctor } from "./types.js";
import { safeGetStorage, safeSetStorage } from "./storage.js";

const searchInput = document.querySelector(
  ".search-form input",
) as HTMLInputElement | null;
const districtSelect = document.querySelector(
  ".search-form select",
) as HTMLSelectElement | null;
const doctorGrid = document.querySelector(".doctor-grid") as HTMLElement | null;

function renderFeaturedDoctors(doctorList: Doctor[]): void {
  if (!doctorGrid) return;

  const sortedDoctors = [...doctorList].sort(function (a, b) {
    return (Number(b.rating) || 0) - (Number(a.rating) || 0);
  });

  const featuredDoctors = sortedDoctors.slice(0, 3);
  doctorGrid.innerHTML = "";

  featuredDoctors.forEach(function (doctor) {
    doctorGrid.innerHTML += `
      <article class="doctor-card">
        <div class="doctor-card-header">
          <div class="doctor-basic-info">
            <div class="doctor-specialty">${doctor.specialty ?? "Specialist"}</div>
            <h3 class="doctor-name">${doctor.name ?? "Doctor"}</h3>
            <div class="doctor-rating">${doctor.rating > 0 ? "⭐ " + doctor.rating : "⭐ Newly Registered"}</div>
          </div>
        </div>
        <div class="doctor-card-body">
          <p>${doctor.clinic ?? "Clinic"} — ${doctor.district ?? "Kashmir"}</p>
        </div>
        <div class="doctor-card-footer">
          <a href="doctor-profile.html?id=${doctor.id}" class="btn btn-outline btn-sm">View Profile</a>
        </div>
      </article>
    `;
  });
}

function updateCategoryCounts(doctorList: Doctor[]): void {
  const categoryCards = document.querySelectorAll(".category-card");
  categoryCards.forEach(function (card) {
    const categoryName = card
      .querySelector(".category-name")
      ?.textContent.trim();
    const count = doctorList.filter(function (doc) {
      const docSpec = doc.specialty?.toLowerCase() || "";
      const cat = categoryName?.toLowerCase() || "";
      return (
        docSpec === cat ||
        (docSpec.length >= 4 && docSpec.slice(0, 5) === cat.slice(0, 5))
      );
    }).length;
    const countSpan = card.querySelector(".category-count");
    if (countSpan) {
      countSpan.textContent = `${count} Clinics Available`;
    }
  });
}

async function loadInitialClinics(): Promise<void> {
  try {
    const response = await fetch("data/doctors.json");
    const data: Doctor[] = await response.json();
    safeSetStorage("clinic_doctors", data);
    renderFeaturedDoctors(data);
    updateCategoryCounts(data);
  } catch (error) {
    // Graceful fallback
  }
}

// Initial Page Bootup
const doctors: Doctor[] = safeGetStorage("clinic_doctors", []);

if (doctorGrid) {
  if (doctors.length === 0) {
    loadInitialClinics();
  } else {
    renderFeaturedDoctors(doctors);
    updateCategoryCounts(doctors);
  }
}
// Navigation Selectors
const navMenu = document.querySelector(".nav-menu") as HTMLElement | null;
const navToggle = document.querySelector(".nav-toggle-label") as HTMLElement | null;
const brandLogo = document.querySelector(".brand-logo") as HTMLElement | null;
const navLinks = document.querySelectorAll(".nav-link");
const navActions = document.querySelector(".nav-actions") as HTMLElement | null;
const activeUser = safeGetStorage("current_user", null);

// Brand Logo: Prevent Default Link Navigation
if (brandLogo) {
  brandLogo.addEventListener("click", function (event: MouseEvent) {
    event.preventDefault();
  });
}

// Mobile Navigation: Toggle Hamburger Menu
if (navToggle && navMenu) {
  navToggle.addEventListener("click", function () {
    navMenu.classList.toggle("show");
  });
}

// Navigation Links: Active State Highlighter
navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.forEach(function (navItem) {
      navItem.classList.remove("active");
    });
    link.classList.add("active");
  });
});

// Site Header Navigation: Dynamic Session Controls & Global Logout
if (activeUser && navActions) {
  navActions.innerHTML = `
    <a href="dashboard.html" class="btn btn-ghost btn-sm">Dashboard</a>
    <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
  `;

  document.querySelector("#logout-btn")?.addEventListener("click", function () {
    localStorage.removeItem("current_user");
    window.location.reload();
  });
}

// Hero Search Selectors
const searchForm = document.querySelector(".search-form") as HTMLFormElement | null;
const searchWrapper = document.querySelector(".search-wrapper") as HTMLElement | null;
const searchDropdown = document.querySelector(".search-dropdown") as HTMLElement | null;

let debounceTimer: number | undefined;

function performSearch(): void {
  if (!searchInput || !districtSelect || !searchDropdown) return;

  const searchQuery = searchInput.value.trim();
  const district = districtSelect.value;

  if (searchQuery === "") {
    searchInput.placeholder = "Please enter doctor's name, specialty or clinic!";
    searchInput.parentElement?.classList.add("error");
    searchInput.focus();
  } else {
    const storedDoctors: Doctor[] = safeGetStorage("clinic_doctors", []);
    const filteredDoctors = storedDoctors.filter(function (doctor: Doctor) {
      const query = searchQuery.toLowerCase();
      const matchesText =
        (doctor.specialty?.toLowerCase() || "").includes(query) ||
        (doctor.name?.toLowerCase() || "").includes(query) ||
        (doctor.clinic?.toLowerCase() || "").includes(query);

      const matchesDistrict =
        district === "" ||
        (doctor.district?.toLowerCase() || "") === district.toLowerCase();
      return matchesText && matchesDistrict;
    });

    searchDropdown.classList.add("show");
    if (filteredDoctors.length === 0) {
      searchDropdown.innerHTML = "No Clinics Found";
    } else {
      searchDropdown.innerHTML = "";
      filteredDoctors.forEach(function (doctor: Doctor) {
        searchDropdown.innerHTML += `
          <a href="doctor-profile.html?id=${doctor.id}" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: inherit;">
            <div>
              <h4 style="margin: 0; font-size: 1rem; font-weight: 600;">${doctor.name ?? "Doctor"}</h4>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--text-muted);">${doctor.specialty ?? "Specialist"} • ${doctor.clinic ?? "Clinic"} (${doctor.district ?? "Kashmir"})</p>
            </div>
            <span style="font-weight: 600; color: var(--accent);"> ${doctor.rating > 0 ? "⭐ " + doctor.rating : "⭐ Newly Registered"}</span>
          </a>
        `;
      });
    }
  }
}

// Search Input Listener with Debounce
if (searchInput) {
  searchInput.addEventListener("input", function () {
    searchInput.parentElement?.classList.remove("error");
    clearTimeout(debounceTimer);

    if (searchInput.value.trim() === "") {
      searchDropdown?.classList.remove("show");
      return;
    }
    debounceTimer = window.setTimeout(function () {
      performSearch();
    }, 300);
  });
}

// Search Form Submit
if (searchForm) {
  searchForm.addEventListener("submit", function (event: SubmitEvent) {
    event.preventDefault();
    clearTimeout(debounceTimer);
    performSearch();
  });
}

// Dismiss Dropdown on Outside Click
document.addEventListener("click", function (event: MouseEvent) {
  if (searchWrapper && !searchWrapper.contains(event.target as Node)) {
    searchDropdown?.classList.remove("show");
  }
});

// Popular Search Pills
const popularTags = document.querySelectorAll(".tag-pill");

popularTags.forEach(function (tag) {
  tag.addEventListener("click", function (event: Event) {
    event.preventDefault();
    if (searchInput) {
      searchInput.value = tag.textContent?.trim() || "";
      searchInput.parentElement?.classList.remove("error");
      searchInput.focus();
    }
  });
});