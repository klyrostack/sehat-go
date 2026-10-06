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

// Active User Session: Read once safely
const activeUser = safeGetStorage("current_user", null);

// URL Query Parameters: Extract Doctor ID from Address Bar
const queryParams = new URLSearchParams(window.location.search);
const doctorId = queryParams.get("id");

// Doctor Record Lookup: Retrieve Matching Doctor from LocalStorage
const currentDoctors = safeGetStorage("clinic_doctors", []);

const matchedDoctor = currentDoctors.find(function (doctor) {
  return doctor.id === Number(doctorId);
});

if (!matchedDoctor) {
  window.location.href = "category.html";
}

// Profile Hero & Header: Batch DOM Injection for Doctor Details
const doctorData = {
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

Object.entries(doctorData).forEach(function ([selector, value]) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
});

// Appointment Booking Widget: Calendar State & Container Selector
const today = new Date();
const datesContainer = document.querySelector("#dates-container");

let selectedTime = null;
let selectedDate = "Today";

// Calendar Date Card Selector: Switch Active Date & Sync Summary
if (datesContainer) {
  datesContainer.addEventListener("click", function (event) {
    const clickedCard = event.target.closest(".date-card");

    if (!clickedCard) return;
    const allCards = datesContainer.querySelectorAll(".date-card");

    allCards.forEach(function (card) {
      card.classList.remove("active");
    });

    clickedCard.classList.add("active");

    selectedDate = clickedCard.dataset.fullDate;
    renderSlots();

    if (selectedTime) {
      const summaryDateTime = document.querySelector("#summary-datetime");
      if (summaryDateTime) {
        summaryDateTime.textContent = `${selectedDate} ${selectedTime}`;
      }
    }
  });
}

// Date Slider Engine: Generate 4-Day Calendar Date Cards
let dateOffset = 0;

function renderDates() {
  if (!datesContainer) return;
  datesContainer.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const cardDate = new Date();
    cardDate.setDate(cardDate.getDate() + dateOffset + i);

    const dayNum = cardDate.getDate();
    const monthName = cardDate.toLocaleDateString("en-US", { month: "short" });
    const dayName =
      dateOffset === 0 && i === 0
        ? "Today"
        : dateOffset === 0 && i === 1
          ? "Tomorrow"
          : cardDate.toLocaleDateString("en-US", { weekday: "short" });

    datesContainer.innerHTML += `
    <div class="date-card ${i === 0 ? "active" : ""}"
    data-full-date = "${dayName}, ${dayNum}, ${monthName}">
      <span class="day-name">${dayName}</span>
      <span class="day-num">${dayNum}</span>
      <span style="font-size: 0.65rem;">${monthName}</span>
    </div>
  `;
  }
}
renderDates();

const activeElement = datesContainer?.querySelector(".date-card.active");
if (activeElement) {
  selectedDate = activeElement.dataset.fullDate;
}

// Date Slider Navigation: Previous & Next Date Offset Buttons
const nextDateBtn = document.querySelector("#next-date-btn");
const previousDateBtn = document.querySelector("#prev-date-btn");

function syncCalanderSlots() {
  const activeCard = datesContainer?.querySelector(".date-card.active");
  if (activeCard) {
    selectedDate = activeCard.dataset.fullDate;
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
function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? "0" + minutes : minutes;
  return `${displayHours}:${displayMinutes} ${period}`;
}

// Working Hours Parser: Compute Schedule Start & End Minutes
const startTime = matchedDoctor?.startTime || "10:00";
const endTime = matchedDoctor?.endTime || "14:00";
const slotDuration = matchedDoctor?.slotDuration || 30;

const startParts = startTime.split(":");
const startHours = Number(startParts[0]) || 0;
const startMinutes = Number(startParts[1]) || 0;

const startTotalMinutes = startHours * 60 + startMinutes;

const endParts = endTime.split(":");
const endHours = Number(endParts[0]) || 0;
const endMinutes = Number(endParts[1]) || 0;

const endTotalMinutes = endHours * 60 + endMinutes;

// Time Slot Engine: Render Available & Booked Morning/Evening Slots
const morningSlots = document.querySelector("#morning-slots");
const eveningSlots = document.querySelector("#evening-slots");

function renderSlots() {
  if (!morningSlots || !eveningSlots) return;
  morningSlots.innerHTML = "";
  eveningSlots.innerHTML = "";
  const savedBookings = safeGetStorage("patient_booking", []);
  for (let i = startTotalMinutes; i < endTotalMinutes; i += slotDuration) {
    const slotTime = formatTime(i);
    const isBooked = savedBookings.some(function (booking) {
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
function handleSlotClick(event) {
  const clickedSlot = event.target.closest(".time-slot.available");
  if (!clickedSlot) return;
  const allTimes = document.querySelectorAll(".time-slot");

  allTimes.forEach(function (time) {
    time.classList.remove("selected");
  });
  clickedSlot.classList.add("selected");

  selectedTime = clickedSlot.textContent.trim();

  const summaryDateTime = document.querySelector("#summary-datetime");
  if (summaryDateTime) {
    summaryDateTime.textContent = `${selectedDate} ${selectedTime}`;
  }
}
if (morningSlots) morningSlots.addEventListener("click", handleSlotClick);
if (eveningSlots) eveningSlots.addEventListener("click", handleSlotClick);

// Appointment Booking Action: Persist Booking to LocalStorage & Mark Slot Booked
const bookingMsg = document.querySelector("#booking-msg");
const appointmentBtn = document.querySelector("#btn-book-appointment");

if (appointmentBtn) {
  appointmentBtn.addEventListener("click", function (event) {
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

      const clinicAppointments = safeGetStorage("patient_booking", []);

      const newAppointment = {
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

      const tokenId = "SG-" + String(newAppointment.id).slice(-5);

      const passTokenId = document.querySelector("#pass-token-id");
      if (passTokenId) passTokenId.textContent = tokenId;
      const passDocName = document.querySelector("#pass-doctor-name");
      if (passDocName) passDocName.textContent = newAppointment.name;

      const passDocSpec = document.querySelector("#pass-doctor-specialty");
      if (passDocSpec) passDocSpec.textContent = matchedDoctor?.specialty ?? "";
      const passPatientName = document.querySelector("#pass-patient-name");
      if (passPatientName) passPatientName.textContent = newAppointment.patientName;

      const passDateTime = document.querySelector("#pass-datetime");
      if (passDateTime) passDateTime.textContent = ` ${newAppointment.date}  ${newAppointment.time}`;

      const passClinicName = document.querySelector("#pass-clinic-name");
      if (passClinicName) passClinicName.textContent = newAppointment.clinic;

      const passClinicDistrict = document.querySelector("#pass-clinic-district");
      if (passClinicDistrict) passClinicDistrict.textContent = matchedDoctor?.district ?? "";

      const passFee = document.querySelector("#pass-consultation-fee");
      if (passFee) passFee.textContent = `₹${newAppointment.fee}`;

      const modal = document.querySelector("#booking-confirmation-modal");
      if (modal) modal.style.display = "flex";
    }

    const activeSlot = document.querySelector(".time-slot.selected");

    if (activeSlot) {
      activeSlot.classList.remove("selected", "available");
      activeSlot.classList.add("booked");
    }

    selectedTime = null;
  });
}

document
  .querySelector("#modal-close-btn")
  ?.addEventListener("click", function () {
    const modal = document.querySelector("#booking-confirmation-modal");
    if (modal) modal.style.display = "none";
  });

document
  .querySelector("#btn-print-pass")
  ?.addEventListener("click", function () {
    window.print();
  });

// Site Header Navigation: Dynamic Session Controls & Global Logout
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

function renderDoctorReviews() {
  const allReviews = safeGetStorage("clinic_reviews", []);

  const doctorReviews = allReviews.filter(function (review) {
    return review.doctorId === matchedDoctor?.id;
  });
  const ratingEl = document.querySelector("#doctor-rating");
  const countBadgeEl = document.querySelector("#reviews-count-badge");
  const reviewsContainer = document.querySelector("#reviews-container");

  if (doctorReviews.length > 0) {
    const reviewsSum = doctorReviews.reduce(function (accumulator, current) {
      return accumulator + Number(current.rating || 0);
    }, 0);
    const avgRating = (reviewsSum / doctorReviews.length).toFixed(1);
    if (ratingEl) {
      ratingEl.textContent = `⭐${avgRating} (${doctorReviews.length} Reviews)`;
    }
    if (countBadgeEl) {
      countBadgeEl.textContent = `${doctorReviews.length} Reviews`;
    }

    const allDoctors = safeGetStorage("clinic_doctors", []);

    const docIndex = allDoctors.findIndex(function (doc) {
      return doc.id === matchedDoctor?.id;
    });

    if (docIndex !== -1) {
      allDoctors[docIndex].rating = Number(avgRating);
      safeSetStorage("clinic_doctors", allDoctors);
    }

    if (reviewsContainer) {
      reviewsContainer.innerHTML = "";
      doctorReviews.forEach(function (rev) {
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

const reviewForm = document.querySelector("#patient-review-form");
if (reviewForm) {
  reviewForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const ratingInput = document.querySelector("#review-rating");
    const commentInput = document.querySelector("#review-comment");
    const errorBox = document.querySelector("#review-form-error");

    const rating = Number(ratingInput?.value || 5);
    const comment = commentInput ? commentInput.value.trim() : "";

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

    const reviewerName = activeUser?.name || "Verified Patient";

    const newReview = {
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
    const allReviews = safeGetStorage("clinic_reviews", []);
    allReviews.unshift(newReview);

    safeSetStorage("clinic_reviews", allReviews);

    renderDoctorReviews();
    reviewForm.reset();
  });
}
