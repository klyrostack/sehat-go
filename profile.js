const queryParams = new URLSearchParams(window.location.search);

const doctorId = queryParams.get("id");

const currentDoctor = JSON.parse(localStorage.getItem("clinic_doctors")) || [];

const matchedDoctor = currentDoctor.find(function (doctor) {
  return doctor.id === Number(doctorId);
});

const doctorData = {
  "#doctor-name": matchedDoctor.name,
  "#doctor-specialty": matchedDoctor.specialty,
  "#doctor-clinic": matchedDoctor.clinic,
  "#doctor-district": matchedDoctor.district,
  "#hero-fee": `₹${matchedDoctor.fee}`,
  "#clinic-address": `${matchedDoctor.clinic}, ${matchedDoctor.district}`,
  "#widget-fee": `₹${matchedDoctor.fee}`,
  "#summary-doctor": matchedDoctor.name,
  "#summary-clinic": matchedDoctor.clinic,
  "#summary-fee": `₹${matchedDoctor.fee}`,
};

Object.entries(doctorData).forEach(function ([selector, value]) {
  document.querySelector(selector).textContent = value;
});

const today = new Date();
const datesContainer = document.querySelector("#dates-container");


let selectedTime = null;
let selectedDate = "Today";

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
    summaryDateTime.textContent = `${selectedDate} ${selectedTime}`;
  }
});

let dateOffset = 0;

function renderDates() {
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

const nextDateBtn = document.querySelector("#next-date-btn");
const previousDateBtn = document.querySelector("#prev-date-btn");

nextDateBtn.addEventListener("click", function () {
  dateOffset += 4;
  renderDates();
});

previousDateBtn.addEventListener("click", function () {
  if (dateOffset > 0) {
    dateOffset -= 4;
    renderDates();
  }
});

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? "0" + minutes : minutes;
  return `${displayHours}:${displayMinutes} ${period}`;
}

const startTime = matchedDoctor.startTime || "10:00";

const endTime = matchedDoctor.endTime || "14:00";

const slotDuration = matchedDoctor.slotDuration || 30;

const startParts = startTime.split(":");
const startHours = Number(startParts[0]);
const startMinutes = Number(startParts[1]);

const startTotalMinutes = startHours * 60 + startMinutes;

const endParts = endTime.split(":");
const endHours = Number(endParts[0]);
const endMinutes = Number(endParts[1]);

const endTotalMinutes = endHours * 60 + endMinutes;

const morningSlots = document.querySelector("#morning-slots");
const eveningSlots = document.querySelector("#evening-slots");

function renderSlots() {
  morningSlots.innerHTML = "";
  eveningSlots.innerHTML = "";
  const savedBookings =
    JSON.parse(localStorage.getItem("patient_booking")) || [];
  for (let i = startTotalMinutes; i < endTotalMinutes; i += slotDuration) {
    const slotTime = formatTime(i);
    const isBooked = savedBookings.some(function (booking) {
      return booking.name === matchedDoctor.name && booking.date === selectedDate && booking.time === slotTime
    });
    if (i < 720) {
      morningSlots.innerHTML += `<span class="time-slot ${isBooked ? "booked" : "available"}">${slotTime}</span>`;
    } else {
      eveningSlots.innerHTML += `<span class="time-slot ${isBooked ? "booked" : "available"}">${slotTime}</span>`;
    }
  }
}
renderSlots();

//   Dry Code   //

// morningSlots.addEventListener("click", function (event) {
//   const clickedSlot = event.target.closest(".time-slot.available");
//   if (!clickedSlot) return;
//   const allTimes = document.querySelectorAll(".time-slot");

//   allTimes.forEach(function (time) {
//     time.classList.remove("selected");
//   });
//   clickedSlot.classList.add("selected");

//   selectedTime = clickedSlot.textContent.trim();
// });

// eveningSlots.addEventListener("click", function (event) {
//   const clickedSlot = event.target.closest(".time-slot.available");
//   if (!clickedSlot) return;
//   const allTimes = document.querySelectorAll(".time-slot");

//   allTimes.forEach(function (time) {
//     time.classList.remove("selected");
//   });
//   clickedSlot.classList.add("selected");

//   selectedTime = clickedSlot.textContent.trim();
// });


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
  summaryDateTime.textContent = `${selectedDate} ${selectedTime}`;
}
morningSlots.addEventListener("click", handleSlotClick);
eveningSlots.addEventListener("click", handleSlotClick);

const bookingMsg = document.querySelector("#booking-msg");
const appointmentBtn = document.querySelector("#btn-book-appointment");

appointmentBtn.addEventListener("click", function (event) {
  if (!selectedTime) {
    bookingMsg.style.color = "#ef4444";
    bookingMsg.textContent = "Please select a time slot first!";
    return;
  } else {
    bookingMsg.style.color = "#10b981";
    bookingMsg.textContent = "Appointment Confirmed";

    const clinicAppointments =
      JSON.parse(localStorage.getItem("patient_booking")) || [];

    const newAppointment = {
      id: Date.now(),
      name: matchedDoctor.name,
      clinic: matchedDoctor.clinic,
      fee: matchedDoctor.fee,
      date: selectedDate,
      time: selectedTime,
      status: "confirmed",
    };
    clinicAppointments.push(newAppointment);
    localStorage.setItem("patient_booking", JSON.stringify(clinicAppointments));
  }

  const activeElement = document.querySelector(".time-slot.selected");

  if (activeElement) {
    activeElement.classList.remove("selected", "available");
    activeElement.classList.add("booked");
  }

  selectedTime = null;
});
