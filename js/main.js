var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { safeGetStorage, safeSetStorage } from "./storage.js";
const searchInput = document.querySelector(".search-form input");
const districtSelect = document.querySelector(".search-form select");
const doctorGrid = document.querySelector(".doctor-grid");
function renderFeaturedDoctors(doctorList) {
    if (!doctorGrid)
        return;
    const sortedDoctors = [...doctorList].sort(function (a, b) {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });
    const featuredDoctors = sortedDoctors.slice(0, 3);
    doctorGrid.innerHTML = "";
    featuredDoctors.forEach(function (doctor) {
        var _a, _b, _c, _d;
        doctorGrid.innerHTML += `
      <article class="doctor-card">
        <div class="doctor-card-header">
          <div class="doctor-basic-info">
            <div class="doctor-specialty">${(_a = doctor.specialty) !== null && _a !== void 0 ? _a : "Specialist"}</div>
            <h3 class="doctor-name">${(_b = doctor.name) !== null && _b !== void 0 ? _b : "Doctor"}</h3>
            <div class="doctor-rating">${doctor.rating > 0 ? "⭐ " + doctor.rating : "⭐ Newly Registered"}</div>
          </div>
        </div>
        <div class="doctor-card-body">
          <p>${(_c = doctor.clinic) !== null && _c !== void 0 ? _c : "Clinic"} — ${(_d = doctor.district) !== null && _d !== void 0 ? _d : "Kashmir"}</p>
        </div>
        <div class="doctor-card-footer">
          <a href="doctor-profile.html?id=${doctor.id}" class="btn btn-outline btn-sm">View Profile</a>
        </div>
      </article>
    `;
    });
}
function updateCategoryCounts(doctorList) {
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach(function (card) {
        var _a;
        const categoryName = (_a = card
            .querySelector(".category-name")) === null || _a === void 0 ? void 0 : _a.textContent.trim();
        const count = doctorList.filter(function (doc) {
            var _a;
            const docSpec = ((_a = doc.specialty) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
            const cat = (categoryName === null || categoryName === void 0 ? void 0 : categoryName.toLowerCase()) || "";
            return (docSpec === cat ||
                (docSpec.length >= 4 && docSpec.slice(0, 5) === cat.slice(0, 5)));
        }).length;
        const countSpan = card.querySelector(".category-count");
        if (countSpan) {
            countSpan.textContent = `${count} Clinics Available`;
        }
    });
}
function loadInitialClinics() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("data/doctors.json");
            const data = yield response.json();
            safeSetStorage("clinic_doctors", data);
            renderFeaturedDoctors(data);
            updateCategoryCounts(data);
        }
        catch (error) {
            // Graceful fallback
        }
    });
}
// Initial Page Bootup
const doctors = safeGetStorage("clinic_doctors", []);
if (doctorGrid) {
    if (doctors.length === 0) {
        loadInitialClinics();
    }
    else {
        renderFeaturedDoctors(doctors);
        updateCategoryCounts(doctors);
    }
}
// Navigation Selectors
const navMenu = document.querySelector(".nav-menu");
const navToggle = document.querySelector(".nav-toggle-label");
const brandLogo = document.querySelector(".brand-logo");
const navLinks = document.querySelectorAll(".nav-link");
const navActions = document.querySelector(".nav-actions");
const activeUser = safeGetStorage("current_user", null);
// Brand Logo: Prevent Default Link Navigation
if (brandLogo) {
    brandLogo.addEventListener("click", function (event) {
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
    (_a = document.querySelector("#logout-btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
        localStorage.removeItem("current_user");
        window.location.reload();
    });
}
// Hero Search Selectors
const searchForm = document.querySelector(".search-form");
const searchWrapper = document.querySelector(".search-wrapper");
const searchDropdown = document.querySelector(".search-dropdown");
let debounceTimer;
function performSearch() {
    var _a;
    if (!searchInput || !districtSelect || !searchDropdown)
        return;
    const searchQuery = searchInput.value.trim();
    const district = districtSelect.value;
    if (searchQuery === "") {
        searchInput.placeholder = "Please enter doctor's name, specialty or clinic!";
        (_a = searchInput.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add("error");
        searchInput.focus();
    }
    else {
        const storedDoctors = safeGetStorage("clinic_doctors", []);
        const filteredDoctors = storedDoctors.filter(function (doctor) {
            var _a, _b, _c, _d;
            const query = searchQuery.toLowerCase();
            const matchesText = (((_a = doctor.specialty) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "").includes(query) ||
                (((_b = doctor.name) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || "").includes(query) ||
                (((_c = doctor.clinic) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || "").includes(query);
            const matchesDistrict = district === "" ||
                (((_d = doctor.district) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || "") === district.toLowerCase();
            return matchesText && matchesDistrict;
        });
        searchDropdown.classList.add("show");
        if (filteredDoctors.length === 0) {
            searchDropdown.innerHTML = "No Clinics Found";
        }
        else {
            searchDropdown.innerHTML = "";
            filteredDoctors.forEach(function (doctor) {
                var _a, _b, _c, _d;
                searchDropdown.innerHTML += `
          <a href="doctor-profile.html?id=${doctor.id}" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: inherit;">
            <div>
              <h4 style="margin: 0; font-size: 1rem; font-weight: 600;">${(_a = doctor.name) !== null && _a !== void 0 ? _a : "Doctor"}</h4>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--text-muted);">${(_b = doctor.specialty) !== null && _b !== void 0 ? _b : "Specialist"} • ${(_c = doctor.clinic) !== null && _c !== void 0 ? _c : "Clinic"} (${(_d = doctor.district) !== null && _d !== void 0 ? _d : "Kashmir"})</p>
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
        var _a;
        (_a = searchInput.parentElement) === null || _a === void 0 ? void 0 : _a.classList.remove("error");
        clearTimeout(debounceTimer);
        if (searchInput.value.trim() === "") {
            searchDropdown === null || searchDropdown === void 0 ? void 0 : searchDropdown.classList.remove("show");
            return;
        }
        debounceTimer = window.setTimeout(function () {
            performSearch();
        }, 300);
    });
}
// Search Form Submit
if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearTimeout(debounceTimer);
        performSearch();
    });
}
// Dismiss Dropdown on Outside Click
document.addEventListener("click", function (event) {
    if (searchWrapper && !searchWrapper.contains(event.target)) {
        searchDropdown === null || searchDropdown === void 0 ? void 0 : searchDropdown.classList.remove("show");
    }
});
// Popular Search Pills
const popularTags = document.querySelectorAll(".tag-pill");
popularTags.forEach(function (tag) {
    tag.addEventListener("click", function (event) {
        var _a, _b;
        event.preventDefault();
        if (searchInput) {
            searchInput.value = ((_a = tag.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "";
            (_b = searchInput.parentElement) === null || _b === void 0 ? void 0 : _b.classList.remove("error");
            searchInput.focus();
        }
    });
});
