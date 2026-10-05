function safeGetStorage(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (err) {
    return fallback;
  }
}

function safeSetStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}

// URL Query Routing: Extract Specialty Parameter & Filter Doctors
const urlParams = new URLSearchParams(window.location.search);

const selectedCategory = urlParams.get("specialty");

const doctors = safeGetStorage("clinic_doctors", []);

const filteredDoctors = selectedCategory
  ? doctors.filter(function (doctor) {
      return (
        (doctor.specialty?.toLowerCase() || "") ===
        selectedCategory.toLowerCase()
      );
    })
  : doctors;

// Doctor Listings Section: DOM Container Selectors
const listingContainer = document.querySelector("#doctor-listings-container");

const categorySubtitle = document.querySelector("#category-subtitle");

// Doctor Cards Renderer: Dynamic Card Grid & Empty State Box
function renderDoctors(doctorList) {
  if (categorySubtitle) {
    categorySubtitle.textContent = `${doctorList.length} Verified specialist(s) available for appointments`;
  }

  if (!listingContainer) return;

  if (doctorList.length === 0) {
    listingContainer.innerHTML = ` <div class="empty-box">
      <h3>No category Found</h3>
      <p>Try adjusting your search criteria.</p>
    </div>
    `;
  } else {
    listingContainer.innerHTML = "";
    doctorList.forEach(function (doctor) {
      listingContainer.innerHTML += `
   <article class="doctor-card" data-doctor-id="${doctor.id}" style="cursor: pointer;">
  <!-- The Header Wrapper gives it the proper padding & breathing room! -->
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
    <a href="doctor-profile.html?id=${doctor.id}" class="btn btn-primary btn-sm">Book Appointment</a>
  </div>
</article>
    `;
    });
  }
}
renderDoctors(filteredDoctors);

// Category Header: Dynamic Specialty Title & Total Count Sync
const categoryTitle = document.querySelector("#category-title");

if (categoryTitle) {
  categoryTitle.textContent = `${selectedCategory || "All Doctors"} in Kashmir `;
}

const countAll = document.querySelector("#count-all");
if (countAll) {
  countAll.textContent = filteredDoctors.length;
}

// District Filter Pipeline: Extract Unique Districts using Set
const allDistricts = filteredDoctors
  .map(function (doctor) {
    return doctor.district?.toLowerCase() || "";
  })
  .filter(Boolean);
const uniqueDistricts = [...new Set(allDistricts)];

// Sidebar Filter UI: Generate District Radio Buttons & Badges
const filterGroup = document.querySelector("#district-filter-group");

if (filterGroup) {
  uniqueDistricts.forEach(function (district) {
    const total = filteredDoctors.filter(function (doc) {
      return (doc.district?.toLowerCase() || "") === district;
    }).length;

    filterGroup.innerHTML += `
  <label class="filter-option">
    <input type="radio" name="district-fiter" value="${district}">
    <span style="text-transform: capitalize;">${district}</span>
    <span class="count">${total}</span>
  </label>
`;
  });

  // District Filter Event: Filter Doctor Listings by Selected District
  filterGroup.addEventListener("change", function (event) {
    const selectedDistrict = event.target.value;

    const matchingDoctors =
      selectedDistrict === "all"
        ? filteredDoctors
        : filteredDoctors.filter(function (doctor) {
            return (
              (doctor.district?.toLowerCase() || "") ===
              selectedDistrict.toLowerCase()
            );
          });
    renderDoctors(matchingDoctors);
  });
}

// Sorting Engine: Sort Listings by Rating or Earliest Slot
const sortDropdown = document.querySelector("#sort-select");

if (sortDropdown) {
  sortDropdown.addEventListener("change", function (event) {
    const sortVal = event.target.value;
    const sortedDoctors = [...filteredDoctors];

    if (sortVal === "rating") {
      sortedDoctors.sort(function (a, b) {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      });
    } else if (sortVal === "earliest-slot") {
      sortedDoctors.sort(function (a, b) {
        return (a.startTime || "").localeCompare(b.startTime || "");
      });
    }
    renderDoctors(sortedDoctors);
  });
}

// Card Navigation: Event Delegation to Open Doctor Profile
if (listingContainer) {
  listingContainer.addEventListener("click", function (event) {
    const clickedCard = event.target.closest(".doctor-card");
    if (!clickedCard) return;
    window.location.href = `doctor-profile.html?id=${clickedCard.dataset.doctorId}`;
  });
}

// Site Header Navigation: Dynamic Session Controls & Global Logout
const activeUser = safeGetStorage("current_user", null);

const navActions = document.querySelector(".nav-actions");

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