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
     const docSpec = doctor.specialty?.toLowerCase() || "";
     const cat = selectedCategory.toLowerCase();
     return (
       docSpec === cat ||
       (docSpec.length >= 4 && docSpec.slice(0, 5) === cat.slice(0, 5))
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
  const breadcrumbCategory = document.querySelector(
    ".breadcrumb span:last-child",
  );
  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = selectedCategory || "All Doctors";
  }
  categoryTitle.textContent = `${selectedCategory || "All Doctors"} in Kashmir `;
  document.title = `${selectedCategory || "All Doctors"} in Kashmir — Sehat Go`;
}

const countAll = document.querySelector("#count-all");
if (countAll) {
  countAll.textContent = filteredDoctors.length;
}

// Sidebar Procedures Filter: Complete 8-Specialty Clinical Services
const proceduresMap = {
  dentist: {
    title: "Dental Procedures",
    items: ["Orthodontics (Braces)", "Root Canal (Endodontics)", "Dental Implants", "Teeth Cleaning & Whitening"],
  },
  cardiologist: {
    title: "Cardiac Services",
    items: ["12-Lead ECG", "Echocardiogram (Echo)", "Hypertension & BP Care", "Preventive Heart Checkup"],
  },
  dermatologist: {
    title: "Skin & Hair Care",
    items: ["Acne & Scar Therapy", "Laser Skin Treatment", "Hair Fall & PRP Therapy", "Skin Allergy Diagnostics"],
  },
  pediatrician: {
    title: "Child Care Services",
    items: ["Pediatric Vaccination", "Newborn Wellness Checkup", "Growth & Milestone Assessment", "Child Nutrition Consultation"],
  },
  orthopedic: {
    title: "Bone & Joint Care",
    items: ["Joint Pain & Arthritis Care", "Fracture & Trauma Management", "Spine & Back Pain Clinic", "Sports Injury Rehabilitation"],
  },
  "general physician": {
    title: "Primary Health Services",
    items: ["Fever & Infection Care", "Diabetes & Lifestyle Management", "Comprehensive Health Checkup", "Hypertension & Chronic Care"],
  },
  "general-physician": {
    title: "Primary Health Services",
    items: ["Fever & Infection Care", "Diabetes & Lifestyle Management", "Comprehensive Health Checkup", "Hypertension & Chronic Care"],
  },
  "ent specialist": {
    title: "Ear, Nose & Throat Services",
    items: ["Hearing Assessment & Audiometry", "Chronic Sinusitis Treatment", "Ear Infection & Microsuction", "Throat & Tonsil Care"],
  },
  ent: {
    title: "Ear, Nose & Throat Services",
    items: ["Hearing Assessment & Audiometry", "Chronic Sinusitis Treatment", "Ear Infection & Microsuction", "Throat & Tonsil Care"],
  },
  neurologist: {
    title: "Neurological Care",
    items: ["Migraine & Chronic Headache Care", "Nerve Conduction & EMG", "Epilepsy & Seizure Management", "Stroke Recovery Consultation"],
  },
};

const proceduresGroup = document.querySelector("#procedures-filter-group");
const currentKey = selectedCategory?.toLowerCase().trim();
const matchedConfig = proceduresMap[currentKey];

if (proceduresGroup) {
  if (matchedConfig) {
    proceduresGroup.style.display = "block";
    let html = `<h4 class="filter-title">${matchedConfig.title}</h4>`;
    matchedConfig.items.forEach(function (item) {
      html += `
        <label class="filter-option">
          <input type="checkbox">
          <span>${item}</span>
          <span class="count">0</span>
        </label>
      `;
    });
    proceduresGroup.innerHTML = html;
  } else {
    // Hides cleanly when browsing "All Doctors"
    proceduresGroup.style.display = "none";
  }
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