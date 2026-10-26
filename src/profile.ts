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

// Time Formatting Utility: Convert Total Minutes to 12-Hour AM/PM String
function formatTime(totalMinutes: number): string {
  const hours: number = Math.floor(totalMinutes / 60);
  const minutes: number = totalMinutes % 60;
  const period: string = hours >= 12 ? "PM" : "AM";
  const displayHours: number = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes: string = minutes < 10 ? "0" + minutes : String(minutes);
  return `${displayHours}:${displayMinutes} ${period}`;
}

// Working Hours Parser: Compute Schedule Start & End Minutes
const startTime: string = matchedDoctor?.startTime || "10:00";
const endTime: string = matchedDoctor?.endTime || "14:00";
const slotDuration: number = matchedDoctor?.slotDuration || 30;

const startParts: string[] = startTime.split(":");
const startHours: number = Number(startParts[0]) || 0;
const startMinutes: number = Number(startParts[1]) || 0;

const startTotalMinutes: number = startHours * 60 + startMinutes;

const endParts: string[] = endTime.split(":");
const endHours: number = Number(endParts[0]) || 0;
const endMinutes: number = Number(endParts[1]) || 0;

const endTotalMinutes: number = endHours * 60 + endMinutes;

// Time Slot Engine: Render Available & Booked Morning/Evening Slots
const morningSlots = document.querySelector("#morning-slots") as HTMLElement | null;
const eveningSlots = document.querySelector("#evening-slots") as HTMLElement | null;

interface SavedBooking {
  id: number;
  name: string;
  patientName: string;
  clinic: string;
  fee: number;
  date: string;
  time: string;
  status: string;
}

function renderSlots(): void {
  if (!morningSlots || !eveningSlots) return;
  morningSlots.innerHTML = "";
  eveningSlots.innerHTML = "";
  const savedBookings: SavedBooking[] = safeGetStorage("patient_booking", []);
  for (let i = startTotalMinutes; i < endTotalMinutes; i += slotDuration) {
    const slotTime: string = formatTime(i);
    const isBooked: boolean = savedBookings.some(function (booking: SavedBooking) {
      return (
        booking.name === matchedDoctor?.name &&
        booking.date === selectedDate &&
        booking.time === slotTime
      );
    });
    if (i < 720) {
      morningSlots.innerHTML += `<span class="time-slot ${isBooked ? "booked" : "available"}">${slotTime}</span>`;
    } else {
      eveningSlots.innerHTML += `<span class="time-slot ${isBooked ? "booked" : "available"}">${slotTime}</span>`;
    }
  }
}
renderSlots();

// Slot Selection Handler: Select Time Slot & Update Booking Summary
function handleSlotClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  const clickedSlot = target?.closest(".time-slot.available") as HTMLElement | null;
  if (!clickedSlot) return;
  const allTimes = document.querySelectorAll(".time-slot");

  allTimes.forEach(function (time) {
    time.classList.remove("selected");
  });
  clickedSlot.classList.add("selected");

  selectedTime = clickedSlot.textContent?.trim() || null;

  const summaryDateTime = document.querySelector("#summary-datetime") as HTMLElement | null;
  if (summaryDateTime) {
    summaryDateTime.textContent = `${selectedDate} ${selectedTime}`;
  }
}
if (morningSlots) morningSlots.addEventListener("click", handleSlotClick);
if (eveningSlots) eveningSlots.addEventListener("click", handleSlotClick);

// Appointment Booking Action: Persist Booking to LocalStorage & Mark Slot Booked
const bookingMsg = document.querySelector("#booking-msg") as HTMLElement | null;
const appointmentBtn = document.querySelector("#btn-book-appointment") as HTMLElement | null;

if (appointmentBtn) {
  appointmentBtn.addEventListener("click", function () {
    if (!activeUser) {
      if (bookingMsg) {
        bookingMsg.style.color = "#ef4444";
        bookingMsg.textContent = "Please log in to book an appointment!";
      }
      window.location.href = "login.html";
      return;
    }
    if (!selectedTime) {
      if (bookingMsg) {
        bookingMsg.style.color = "#ef4444";
        bookingMsg.textContent = "Please select a time slot first!";
      }
      return;
    } else {
      if (bookingMsg) {
        bookingMsg.style.color = "#10b981";
        bookingMsg.textContent = "Appointment Confirmed";
      }

      const clinicAppointments: SavedBooking[] = safeGetStorage("patient_booking", []);

      const newAppointment: SavedBooking = {
        id: Date.now(),
        name: matchedDoctor?.name ?? "Doctor",
        patientName: activeUser?.name ?? "Patient",
        clinic: matchedDoctor?.clinic ?? "Clinic",
        fee: matchedDoctor?.fee ?? 0,
        date: selectedDate,
        time: selectedTime,
        status: "confirmed",
      };
      clinicAppointments.push(newAppointment);
      safeSetStorage("patient_booking", clinicAppointments);

      const tokenId: string = "SG-" + String(newAppointment.id).slice(-5);

      const passTokenId = document.querySelector("#pass-token-id") as HTMLElement | null;
      if (passTokenId) passTokenId.textContent = tokenId;
      const passDocName = document.querySelector("#pass-doctor-name") as HTMLElement | null;
      if (passDocName) passDocName.textContent = newAppointment.name;

      const passDocSpec = document.querySelector("#pass-doctor-specialty") as HTMLElement | null;
      if (passDocSpec) passDocSpec.textContent = matchedDoctor?.specialty ?? "";
      const passPatientName = document.querySelector("#pass-patient-name") as HTMLElement | null;
      if (passPatientName) passPatientName.textContent = newAppointment.patientName;

      const passDateTime = document.querySelector("#pass-datetime") as HTMLElement | null;
      if (passDateTime) passDateTime.textContent = ` ${newAppointment.date}  ${newAppointment.time}`;

      const passClinicName = document.querySelector("#pass-clinic-name") as HTMLElement | null;
      if (passClinicName) passClinicName.textContent = newAppointment.clinic;

      const passClinicDistrict = document.querySelector("#pass-clinic-district") as HTMLElement | null;
      if (passClinicDistrict) passClinicDistrict.textContent = matchedDoctor?.district ?? "";

      const passFee = document.querySelector("#pass-consultation-fee") as HTMLElement | null;
      if (passFee) passFee.textContent = `₹${newAppointment.fee}`;

      const modal = document.querySelector("#booking-confirmation-modal") as HTMLElement | null;
      if (modal) modal.style.display = "flex";
    }

    const activeSlot = document.querySelector(".time-slot.selected") as HTMLElement | null;

    if (activeSlot) {
      activeSlot.classList.remove("selected", "available");
      activeSlot.classList.add("booked");
    }

    selectedTime = null;
  });
}

// Modal Close Button & Print API Handlers
document
  .querySelector("#modal-close-btn")
  ?.addEventListener("click", function () {
    const modal = document.querySelector("#booking-confirmation-modal") as HTMLElement | null;
    if (modal) modal.style.display = "none";
  });

document
  .querySelector("#btn-print-pass")
  ?.addEventListener("click", function () {
    window.print();
  });

// Site Header Navigation: Dynamic Session Controls & Global Logout
const navActions = document.querySelector(".nav-actions") as HTMLElement | null;

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

// Patient Reviews Engine: Aggregate Rating & Render Reviews
interface DoctorReview {
  id: number;
  doctorId: number | undefined;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

function renderDoctorReviews(): void {
  const allReviews: DoctorReview[] = safeGetStorage("clinic_reviews", []);

  const doctorReviews = allReviews.filter(function (review: DoctorReview) {
    return review.doctorId === matchedDoctor?.id;
  });
  const ratingEl = document.querySelector("#doctor-rating") as HTMLElement | null;
  const countBadgeEl = document.querySelector("#reviews-count-badge") as HTMLElement | null;
  const reviewsContainer = document.querySelector("#reviews-container") as HTMLElement | null;

  if (doctorReviews.length > 0) {
    const reviewsSum: number = doctorReviews.reduce(function (accumulator: number, current: DoctorReview) {
      return accumulator + Number(current.rating || 0);
    }, 0);
    const avgRating: string = (reviewsSum / doctorReviews.length).toFixed(1);
    if (ratingEl) {
      ratingEl.textContent = `⭐${avgRating} (${doctorReviews.length} Reviews)`;
    }
    if (countBadgeEl) {
      countBadgeEl.textContent = `${doctorReviews.length} Reviews`;
    }

    const allDoctors: Doctor[] = safeGetStorage("clinic_doctors", []);

    const docIndex: number = allDoctors.findIndex(function (doc: Doctor) {
      return doc.id === matchedDoctor?.id;
    });

    if (docIndex !== -1 && allDoctors[docIndex]) {
      allDoctors[docIndex].rating = Number(avgRating);
      safeSetStorage("clinic_doctors", allDoctors);
    }

    if (reviewsContainer) {
      reviewsContainer.innerHTML = "";
      doctorReviews.forEach(function (rev: DoctorReview) {
        reviewsContainer.innerHTML += `
          <div style="padding: 1rem; border-bottom: 1px solid var(--border); margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <strong style="color: var(--text-main);">${rev.patientName ?? "Verified Patient"}</strong>
              <span style="color: var(--accent); font-weight: 600;">⭐ ${rev.rating}.0</span>
            </div>
            <p style="margin: 0.25rem 0 0.5rem 0; color: var(--text-body); font-size: 0.95rem;">${rev.comment ?? ""}</p>
            <small style="color: var(--text-muted); font-size: 0.8rem;">📅 ${rev.date ?? ""}</small>
          </div>
        `;
      });
    }
  } else {
    if (ratingEl) ratingEl.textContent = "⭐ Newly Registered";
    if (countBadgeEl) countBadgeEl.textContent = "0 Reviews";
    if (reviewsContainer) {
      reviewsContainer.innerHTML = `
        <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0; padding: 1.5rem; background: var(--bg-subtle); border-radius: var(--radius-md); text-align: center;">
          No patient reviews yet. Verified patient ratings will appear here after consultations.
        </p>
      `;
    }
  }
}
renderDoctorReviews();

// Review Form Submission & LocalStorage Persistence
const reviewForm = document.querySelector("#patient-review-form") as HTMLFormElement | null;
if (reviewForm) {
  reviewForm.addEventListener("submit", function (event: SubmitEvent) {
    event.preventDefault();

    const ratingInput = document.querySelector("#review-rating") as HTMLSelectElement | null;
    const commentInput = document.querySelector("#review-comment") as HTMLTextAreaElement | null;
    const errorBox = document.querySelector("#review-form-error") as HTMLElement | null;

    const rating: number = Number(ratingInput?.value || 5);
    const comment: string = commentInput ? commentInput.value.trim() : "";

    if (comment === "") {
      if (errorBox) {
        errorBox.textContent = "Please write a brief feedback comment!";
        errorBox.style.display = "block";
      }
      return;
    } else {
      if (errorBox) {
        errorBox.style.display = "none";
      }
    }

    const reviewerName: string = activeUser?.name || "Verified Patient";

    const newReview: DoctorReview = {
      id: Date.now(),
      doctorId: matchedDoctor?.id,
      patientName: reviewerName,
      rating: rating,
      comment: comment,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    const allReviews: DoctorReview[] = safeGetStorage("clinic_reviews", []);
    allReviews.unshift(newReview);

    safeSetStorage("clinic_reviews", allReviews);

    renderDoctorReviews();
    reviewForm.reset();
  });
}
