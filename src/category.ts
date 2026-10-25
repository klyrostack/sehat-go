import { Doctor } from "./types.js";
import { safeGetStorage } from "./storage.js";

// URL Query Routing: Extract Specialty Parameter & Filter Doctors
const urlParams = new URLSearchParams(window.location.search);
const selectedCategory: string | null = urlParams.get("specialty");

const doctors: Doctor[] = safeGetStorage("clinic_doctors", []);

const filteredDoctors: Doctor[] = selectedCategory
  ? doctors.filter(function (doctor: Doctor) {
      const docSpec = doctor.specialty?.toLowerCase() || "";
      const cat = selectedCategory.toLowerCase();
      return (
        docSpec === cat ||
        (docSpec.length >= 4 && docSpec.slice(0, 5) === cat.slice(0, 5))
      );
    })
  : doctors;

// Doctor Listings Section: DOM Container Selectors
const listingContainer = document.querySelector(
  "#doctor-listings-container",
) as HTMLElement | null;

const categorySubtitle = document.querySelector(
  "#category-subtitle",
) as HTMLElement | null;

// Doctor Cards Renderer: Dynamic Card Grid & Empty State Box
function renderDoctors(doctorList: Doctor[]): void {
  if (categorySubtitle) {
    categorySubtitle.textContent = `${doctorList.length} Verified specialist(s) available for appointments`;
  }

  if (!listingContainer) return;

  if (doctorList.length === 0) {
    listingContainer.innerHTML = `
      <div class="empty-box">
        <h3>No category Found</h3>
        <p>Try adjusting your search criteria.</p>
      </div>
    `;
  } else {
    listingContainer.innerHTML = "";
    doctorList.forEach(function (doctor: Doctor) {
      listingContainer.innerHTML += `
        <article class="doctor-card" data-doctor-id="${doctor.id}" style="cursor: pointer;">
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
const categoryTitle = document.querySelector(
  "#category-title",
) as HTMLElement | null;

if (categoryTitle) {
  const breadcrumbCategory = document.querySelector(
    ".breadcrumb span:last-child",
  ) as HTMLElement | null;

  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = selectedCategory || "All Doctors";
  }
  categoryTitle.textContent = `${selectedCategory || "All Doctors"} in Kashmir `;
  document.title = `${selectedCategory || "All Doctors"} in Kashmir — Sehat Go`;
}

const countAll = document.querySelector("#count-all") as HTMLElement | null;
if (countAll) {
  countAll.textContent = String(filteredDoctors.length);
}

// Sidebar Procedures Filter: Complete 8-Specialty Clinical Services
interface ProcedureConfig {
  title: string;
  items: string[];
}

const proceduresMap: Record<string, ProcedureConfig> = {
  dentist: {
    title: "Dental Procedures",
    items: [
      "Orthodontics (Braces)",
      "Root Canal (Endodontics)",
      "Dental Implants",
      "Teeth Cleaning & Whitening",
    ],
  },
  cardiologist: {
    title: "Cardiac Services",
    items: [
      "12-Lead ECG",
      "Echocardiogram (Echo)",
      "Hypertension & BP Care",
      "Preventive Heart Checkup",
    ],
  },
  dermatologist: {
    title: "Skin & Hair Care",
    items: [
      "Acne & Scar Therapy",
      "Laser Skin Treatment",
      "Hair Fall & PRP Therapy",
      "Skin Allergy Diagnostics",
    ],
  },
  pediatrician: {
    title: "Child Care Services",
    items: [
      "Pediatric Vaccination",
      "Newborn Wellness Checkup",
      "Growth & Milestone Assessment",
      "Child Nutrition Consultation",
    ],
  },
  orthopedic: {
    title: "Bone & Joint Care",
    items: [
      "Joint Pain & Arthritis Care",
      "Fracture & Trauma Management",
      "Spine & Back Pain Clinic",
      "Sports Injury Rehabilitation",
    ],
  },
  "general physician": {
    title: "Primary Health Services",
    items: [
      "Fever & Infection Care",
      "Diabetes & Lifestyle Management",
      "Comprehensive Health Checkup",
      "Hypertension & Chronic Care",
    ],
  },
  "general-physician": {
    title: "Primary Health Services",
    items: [
      "Fever & Infection Care",
      "Diabetes & Lifestyle Management",
      "Comprehensive Health Checkup",
      "Hypertension & Chronic Care",
    ],
  },
  "ent specialist": {
    title: "Ear, Nose & Throat Services",
    items: [
      "Hearing Assessment & Audiometry",
      "Chronic Sinusitis Treatment",
      "Ear Infection & Microsuction",
      "Throat & Tonsil Care",
    ],
  },
  ent: {
    title: "Ear, Nose & Throat Services",
    items: [
      "Hearing Assessment & Audiometry",
      "Chronic Sinusitis Treatment",
      "Ear Infection & Microsuction",
      "Throat & Tonsil Care",
    ],
  },
  neurologist: {
    title: "Neurological Care",
    items: [
      "Migraine & Chronic Headache Care",
      "Nerve Conduction & EMG",
      "Epilepsy & Seizure Management",
      "Stroke Recovery Consultation",
    ],
  },
};

const proceduresGroup = document.querySelector(
  "#procedures-filter-group",
) as HTMLElement | null;
const currentKey: string = selectedCategory?.toLowerCase().trim() || "";
const matchedConfig: ProcedureConfig | undefined = proceduresMap[currentKey];

if (proceduresGroup) {
  if (matchedConfig) {
    proceduresGroup.style.display = "block";
    let html = `<h4 class="filter-title">${matchedConfig.title}</h4>`;
    matchedConfig.items.forEach(function (item: string) {
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
const allDistricts: string[] = filteredDoctors
  .map(function (doctor: Doctor) {
    return doctor.district?.toLowerCase() || "";
  })
  .filter(Boolean);
const uniqueDistricts: string[] = [...new Set(allDistricts)];

// Sidebar Filter UI: Generate District Radio Buttons & Badges
const filterGroup = document.querySelector(
  "#district-filter-group",
) as HTMLElement | null;

if (filterGroup) {
  uniqueDistricts.forEach(function (district: string) {
    const total: number = filteredDoctors.filter(function (doc: Doctor) {
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
  filterGroup.addEventListener("change", function (event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    const selectedDistrict = target.value;

    const matchingDoctors: Doctor[] =
      selectedDistrict === "all"
        ? filteredDoctors
        : filteredDoctors.filter(function (doctor: Doctor) {
            return (
              (doctor.district?.toLowerCase() || "") ===
              selectedDistrict.toLowerCase()
            );
          });
    renderDoctors(matchingDoctors);
  });
}

// Sorting Engine: Sort Listings by Rating or Earliest Slot
const sortDropdown = document.querySelector(
  "#sort-select",
) as HTMLSelectElement | null;

if (sortDropdown) {
  sortDropdown.addEventListener("change", function (event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (!target) return;
    const sortVal = target.value;
    const sortedDoctors: Doctor[] = [...filteredDoctors];

    if (sortVal === "rating") {
      sortedDoctors.sort(function (a: Doctor, b: Doctor) {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      });
    } else if (sortVal === "earliest-slot") {
      sortedDoctors.sort(function (a: Doctor, b: Doctor) {
        return (a.startTime || "").localeCompare(b.startTime || "");
      });
    }
    renderDoctors(sortedDoctors);
  });
}

// Card Navigation: Event Delegation to Open Doctor Profile
if (listingContainer) {
  listingContainer.addEventListener("click", function (event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const clickedCard = target?.closest(".doctor-card") as HTMLElement | null;
    if (!clickedCard) return;
    window.location.href = `doctor-profile.html?id=${clickedCard.dataset.doctorId}`;
  });
}

// Site Header Navigation: Dynamic Session Controls & Global Logout
const activeUser = safeGetStorage("current_user", null);

const navActions = document.querySelector(".nav-actions") as HTMLElement | null;

if (activeUser && navActions) {
  navActions.innerHTML = `
    <a href="dashboard.html" class="btn btn-ghost btn-sm">Dashboard</a>
    <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
  `;

  document
    .querySelector("#logout-btn")
    ?.addEventListener("click", function () {
      localStorage.removeItem("current_user");
      window.location.reload();
    });
}
