// Route Guard: Protect Dashboard & Redirect Unauthenticated Visitors
const activeSession = JSON.parse(localStorage.getItem("current_user"));

if (!activeSession) {
  window.location.href = "login.html";
}

// Shared Profile Card: Display User Info, Avatar Initial & Role Badge
const dashUserName = document.querySelector("#dashboard-user-name");
dashUserName.textContent = activeSession.name;

const userAvatar = document.querySelector("#user-avatar");

userAvatar.textContent = activeSession.name.charAt(0).toUpperCase();

const userBadge = document.querySelector("#user-role-badge");

userBadge.textContent = activeSession.role;
userBadge.classList.add(activeSession.role);

const dashUserSubtext = document.querySelector("#dashboard-user-subtext");

dashUserSubtext.textContent =
  activeSession.clinic || "Verified Patient Account";

// Doctor Portal View: Practice Details, Operational Meta & Patient Queue
if (activeSession.role === "doctor") {
  dashUserName.textContent = activeSession.name;
  userAvatar.textContent = activeSession.name.charAt(0).toUpperCase();
  dashUserSubtext.textContent = activeSession.clinic;

  const allDoctors = JSON.parse(localStorage.getItem("clinic_doctors")) || [];
  const currentDoctor = allDoctors.find(function (doc) {
    return doc.name.toLowerCase() === activeSession.name.toLowerCase();
  });
  if (!currentDoctor) {
    window.location.href = "login.html";
  }

  document.querySelector("#doctor-pill-specialty").textContent =
    currentDoctor.specialty;
  document.querySelector("#doctor-pill-district").textContent =
    currentDoctor.district;
  document.querySelector("#doctor-pill-hours").textContent =
    currentDoctor.startTime
      ? `${currentDoctor.startTime} - ${currentDoctor.endTime}`
      : "Hours not set";
  document.querySelector("#doctor-pill-fee").textContent =
    `${currentDoctor.fee}`;
  document.querySelector("#doctor-stat-rating").textContent =
    `${currentDoctor.rating}`;

  const allBookings = JSON.parse(localStorage.getItem("patient_booking")) || [];

  const doctorBookings = allBookings.filter(function (booking) {
    return booking.name.toLowerCase() === activeSession.name.toLowerCase();
  });

  document.querySelector("#doctor-stat-count").textContent =
    doctorBookings.length;

  const totalRevenue = doctorBookings.reduce(function (
    accumulator,
    currentItem,
  ) {
    if (currentItem.status === "cancelled") {
      return accumulator;
    }
    return accumulator + (Number(currentItem.fee) || 0);
  }, 0);

  document.querySelector("#doctor-stat-revenue").textContent =
    `₹ ${totalRevenue}`;

  const list = document.querySelector("#doctor-patients-list");

  if (doctorBookings.length === 0) {
    list.innerHTML = `
     <div class="empty-dashboard-card">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
      <h3>No Patients Scheduled Yet</h3>
      <p style="color: var(--text-muted);">When patients book slots, they will appear here live.</p>
    </div>
    `;
  } else {
    list.innerHTML = "";
    doctorBookings.forEach(function (app) {
      list.innerHTML += `
       <div class="appointment-item">
        <div>
          <span class="status-pill ${app.status || "confirmed"}">${app.status || "Confirmed"}</span>
         <h3 style="margin-top: 0.25rem;">Patient: ${app.patientName || "Verified Patient"}</h3>
          <div class="appointment-meta">
            <span>📅 ${app.date}</span>
            <span>⏰ ${app.time}</span>
            <span>💰 ₹${app.fee} (Payable at clinic)</span>
          </div>
        </div>
          <button class="btn btn-outline btn-sm btn-queue-action" data-id="${app.id}" data-status="completed">Done</button>
      <button class="btn btn-outline btn-sm btn-queue-action" data-id="${app.id}" data-status="cancelled" style="color: #ef4444; border-color: #fca5a5;">No-Show</button>
      </div>
      `;
    });
  }

  list.addEventListener("click", function (event) {
    const actionBtn = event.target.closest(".btn-queue-action");
    if (!actionBtn) return;

    const targetId = Number(actionBtn.dataset.id);
    const newStatus = actionBtn.dataset.status;

    const allBookings =
      JSON.parse(localStorage.getItem("patient_booking")) || [];

    const updatedBookings = allBookings.map(function (booking) {
      if (booking.id === targetId) {
        return { ...booking, status: newStatus };
      }
      return booking;
    });
    localStorage.setItem("patient_booking", JSON.stringify(updatedBookings));

    window.location.reload();
  });

  document.querySelector("#doctor-view").style.display = "block";
} else {
  // Patient Portal View: Booked Appointments & Real-Time Cancellation Engine
  dashUserName.textContent = "Patient Portal";
  userAvatar.textContent = "P";
  dashUserSubtext.textContent = `${activeSession.name} • Verified Patient Account`;
  document.querySelector("#patient-view").style.display = "block";

  const patientBooking =
    JSON.parse(localStorage.getItem("patient_booking")) || [];

  const myBookings = patientBooking.filter(function (entry) {
    return (
      entry.patientName &&
      entry.patientName.toLowerCase() === activeSession.name.toLowerCase()
    );
  });

  document.querySelector("#patient-stat-count").textContent = myBookings.length;

  const patientList = document.querySelector("#patient-appointments-list");

  if (myBookings.length === 0) {
    patientList.innerHTML = `<div class="empty-dashboard-card"><p>No appointments booked yet.</p></div>`;
  } else {
    patientList.innerHTML = "";
    myBookings.forEach(function (entry) {
      patientList.innerHTML += ` <div class="appointment-item">
    <div>
      <span class="status-pill confirmed">Confirmed</span>
      <h3 style="margin-top: 0.25rem;">${entry.name} — ${entry.clinic}</h3>
      <div class="appointment-meta">
        <span>📅 ${entry.date}</span>
        <span>⏰ ${entry.time}</span>
        <span>💰 ₹${entry.fee}</span>
      </div>
    </div>
    <button class="btn btn-outline btn-sm btn-cancel-booking" data-id="${entry.id}">Cancel</button>
  </div>`;
    });

    patientList.addEventListener("click", function (event) {
      const cancelBTn = event.target.closest(".btn-cancel-booking");

      if (!cancelBTn) return;

      const targetId = Number(cancelBTn.dataset.id);

      const remaining = patientBooking.filter(function (entry) {
        return entry.id !== targetId;
      });
      localStorage.setItem("patient_booking", JSON.stringify(remaining));
      window.location.reload();
    });
  }
}

// Dashboard Logout: Clear Session from LocalStorage & Redirect to Login
const logoutBtn = document.querySelector("#dashboard-logout-btn");

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("current_user");
  window.location.href = "login.html";
});
