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

datesContainer.addEventListener("click", function (event) {
  const clickedCard = event.target.closest(".date-card");

  if (!clickedCard) return;
  const allCards = datesContainer.querySelectorAll(".date-card");

  allCards.forEach(function (card) {
    card.classList.remove("active");
  });

  clickedCard.classList.add("active");

  selectedDate = clickedCard.querySelector(".day-name").textContent.trim();
});


for (let i = 0; i < 4; i++) {
  const cardDate = new Date();
  cardDate.setDate(cardDate.getDate() + i);

  const dayNum = cardDate.getDate();
  const monthName = cardDate.toLocaleDateString("en-US", { month: "short" });
  const dayName =
    i === 0
      ? "Today"
      : i === 1
        ? "Tomorrow"
        : cardDate.toLocaleDateString("en-US", { weekday: "short" });

  datesContainer.innerHTML += `
    <div class="date-card ${i === 0 ? "active" : ""}">
      <span class="day-name">${dayName}</span>
      <span class="day-num">${dayNum}</span>
      <span style="font-size: 0.65rem;">${monthName}</span>
    </div>
  `;
}

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

for (let i = startTotalMinutes; i < endTotalMinutes; i += slotDuration) {
  const slotTime = formatTime(i);
  if (i < 720) {
    morningSlots.innerHTML += `<span class="time-slot available">${slotTime}</span>`;
  } else {
    eveningSlots.innerHTML += `<span class="time-slot available">${slotTime}</span>`;
  }
}

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

let selectedTime = null;
let selectedDate = "Today"

function handleSlotClick(event) {
  const clickedSlot = event.target.closest(".time-slot.available");
  if (!clickedSlot) return;
  const allTimes = document.querySelectorAll(".time-slot");

  allTimes.forEach(function (time) {
    time.classList.remove("selected");
  });
  clickedSlot.classList.add("selected");

  selectedTime = clickedSlot.textContent.trim();

  const summaryDateTime = document.querySelector("#summary-datetime")
  summaryDateTime.textContent = 
  `${selectedDate} ${selectedTime}`
}
morningSlots.addEventListener("click", handleSlotClick);
eveningSlots.addEventListener("click", handleSlotClick);


const bookingMsg = document.querySelector("#booking-msg")
const appointmentBtn = document.querySelector("#btn-book-appointment")

appointmentBtn.addEventListener("click", function(event){
    if(!selectedTime) {
       bookingMsg.style.color = "#ef4444"
       bookingMsg.textContent = "Please select a time slot first!"
         return;
    
    }else {
        bookingMsg.style.color = "#10b981"
        bookingMsg.textContent = "Appointment Confirmed"
    }
})