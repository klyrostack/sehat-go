import { Doctor } from "./types.js";
import { safeGetStorage, safeSetStorage } from "./storage.js";

// Active User Session: Read once safely
const activeUser = safeGetStorage("current_user", null);

// URL Query Parameters: Extract Doctor ID from Address Bar
const queryParams = new URLSearchParams(window.location.search);
const doctorId: string | null = queryParams.get("id");

// Doctor Record Lookup: Retrieve Matching Doctor from LocalStorage
const currentDoctors: Doctor[] = safeGetStorage("clinic_doctors", []);

const matchedDoctor: Doctor | undefined = currentDoctors.find(function (doctor: Doctor) {
  return doctor.id === Number(doctorId);
});

if (!matchedDoctor) {
  window.location.href = "category.html";
}

// Profile Hero & Header: Batch DOM Injection for Doctor Details
const doctorData: Record<string, string> = {
  "#doctor-name": matchedDoctor?.name ?? "Doctor Profile",
  "#doctor-specialty": matchedDoctor?.specialty ?? "",
  "#doctor-clinic": matchedDoctor?.clinic ?? "",
  "#doctor-district": matchedDoctor?.district ?? "",
  "#hero-fee": `₹${matchedDoctor?.fee ?? 0}`,
  "#clinic-address": `${matchedDoctor?.clinic ?? ""}, ${matchedDoctor?.district ?? ""}`,
  "#widget-fee": `₹${matchedDoctor?.fee ?? 0}`,
  "#summary-doctor": matchedDoctor?.name ?? "",
  "#summary-clinic": matchedDoctor?.clinic ?? "",
  "#summary-fee": `₹${matchedDoctor?.fee ?? 0}`,
};

Object.entries(doctorData).forEach(function ([selector, value]: [string, string]) {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (el) el.textContent = value;
});

// Appointment Booking Widget: Calendar State & Container Selector
const today: Date = new Date();
const datesContainer = document.querySelector("#dates-container") as HTMLElement | null;

let selectedTime: string | null = null;
let selectedDate: string = "Today";

// Calendar Date Card Selector: Switch Active Date & Sync Summary
if (datesContainer) {
  datesContainer.addEventListener("click", function (event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    const clickedCard = target?.closest(".date-card") as HTMLElement | null;

    if (!clickedCard) return;
    const allCards = datesContainer.querySelectorAll(".date-card");

    allCards.forEach(function (card) {
      card.classList.remove("active");
    });

    clickedCard.classList.add("active");

    selectedDate = clickedCard.dataset.fullDate || "Today";
    renderSlots();

    if (selectedTime) {
      const summaryDateTime = document.querySelector("#summary-datetime") as HTMLElement | null;
      if (summaryDateTime) {
        summaryDateTime.textContent = `${selectedDate} ${selectedTime}`;
      }
    }
  });
}

// Date Slider Engine: Generate 4-Day Calendar Date Cards
let dateOffset: number = 0;

function renderDates(): void {
  if (!datesContainer) return;
  datesContainer.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const cardDate = new Date();
    cardDate.setDate(cardDate.getDate() + dateOffset + i);

    const dayNum: number = cardDate.getDate();
    const monthName: string = cardDate.toLocaleDateString("en-US", { month: "short" });
    const dayName: string =
      dateOffset === 0 && i === 0
        ? "Today"
        : dateOffset === 0 && i === 1
          ? "Tomorrow"
          : cardDate.toLocaleDateString("en-US", { weekday: "short" });

    datesContainer.innerHTML += `
      <div class="date-card ${i === 0 ? "active" : ""}"
      data-full-date="${dayName}, ${dayNum}, ${monthName}">
        <span class="day-name">${dayName}</span>
        <span class="day-num">${dayNum}</span>
        <span style="font-size: 0.65rem;">${monthName}</span>
      </div>
    `;
  }
}
renderDates();

const activeElement = datesContainer?.querySelector(".date-card.active") as HTMLElement | null;
if (activeElement) {
  selectedDate = activeElement.dataset.fullDate || "Today";
}

// Date Slider Navigation: Previous & Next Date Offset Buttons
const nextDateBtn = document.querySelector("#next-date-btn") as HTMLElement | null;
const previousDateBtn = document.querySelector("#prev-date-btn") as HTMLElement | null;

function syncCalanderSlots(): void {
  const activeCard = datesContainer?.querySelector(".date-card.active") as HTMLElement | null;
  if (activeCard) {
    selectedDate = activeCard.dataset.fullDate || "Today";
  }
  selectedTime = null;
  renderSlots();
}

if (nextDateBtn) {
  nextDateBtn.addEventListener("click", function () {
    dateOffset += 4;
    renderDates();
    syncCalanderSlots();
  });
}

if (previousDateBtn) {
  previousDateBtn.addEventListener("click", function () {
    if (dateOffset > 0) {
      dateOffset -= 4;
      renderDates();
      syncCalanderSlots();
    }
  });
}
