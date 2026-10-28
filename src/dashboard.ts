import { Doctor, UserSession, Booking } from "./types.js";
import { safeGetStorage, safeSetStorage } from "./storage.js";

// Route Guard: Protect Dashboard & Redirect Unauthenticated Visitors
const activeSession: UserSession | null = safeGetStorage("current_user", null);
if (!activeSession) {
  window.location.href = "login.html";
}

const dashUserName = document.querySelector(
  "#dashboard-user-name",
) as HTMLElement | null;
if (dashUserName && activeSession) {
  dashUserName.textContent = activeSession.name;
}

// Shared Profile Card: Display User Info, Avatar Initial & Role Badge
const userAvatar = document.querySelector("#user-avatar") as HTMLElement | null;
if (userAvatar && activeSession) {
  userAvatar.textContent = activeSession.name
    ? activeSession.name.charAt(0).toUpperCase()
    : "";
}

const userBadge = document.querySelector(
  "#user-role-badge",
) as HTMLElement | null;
if (userBadge && activeSession) {
  userBadge.textContent = activeSession.role;
  if (activeSession.role) {
    userBadge.classList.add(activeSession.role);
  }
}

const dashUserSubtext = document.querySelector(
  "#dashboard-user-subtext",
) as HTMLElement | null;
if (dashUserSubtext && activeSession) {
  dashUserSubtext.textContent =
    activeSession.clinic || "Verified Patient Account";
}

// Doctor Portal View: Practice Details, Operational Meta & Patient Queue
if (activeSession && activeSession.role === "doctor") {
  if (dashUserName) dashUserName.textContent = activeSession.name;
  if (userAvatar)
    userAvatar.textContent = activeSession.name.charAt(0).toUpperCase();
  if (dashUserSubtext && activeSession.clinic)
    dashUserSubtext.textContent = activeSession.clinic;

  const allDoctors: Doctor[] = safeGetStorage("clinic_doctors", []);
  const currentDoctor: Doctor | undefined = allDoctors.find(function (
    doc: Doctor,
  ) {
    return doc.name.toLowerCase() === activeSession.name.toLowerCase();
  });

  if (!currentDoctor) {
    window.location.href = "login.html";
  }

  const specialtyPill = document.querySelector(
    "#doctor-pill-specialty",
  ) as HTMLElement | null;
  if (specialtyPill)
    specialtyPill.textContent = currentDoctor?.specialty ?? "General Practice";

  const districtPill = document.querySelector(
    "#doctor-pill-district",
  ) as HTMLElement | null;
  if (districtPill)
    districtPill.textContent = currentDoctor?.district ?? "District is not set";

  const hoursPill = document.querySelector(
    "#doctor-pill-hours",
  ) as HTMLElement | null;
  if (hoursPill) {
    hoursPill.textContent = currentDoctor?.startTime
      ? `${currentDoctor.startTime} - ${currentDoctor.endTime}`
      : "Hours not set";
  }

  const feePill = document.querySelector(
    "#doctor-pill-fee",
  ) as HTMLElement | null;
  if (feePill) {
    feePill.textContent =
      currentDoctor?.fee !== undefined
        ? "₹" + currentDoctor.fee
        : "Fee not set";
  }

  const ratingStat = document.querySelector(
    "#doctor-stat-rating",
  ) as HTMLElement | null;
  if (ratingStat) {
    ratingStat.textContent = currentDoctor?.rating
      ? `⭐ ${currentDoctor.rating}`
      : "⭐ Newly Registered";
  }

  const allBookings: Booking[] = safeGetStorage("patient_booking", []);
  const doctorBookings: Booking[] = allBookings.filter(function (
    booking: Booking,
  ) {
    return booking.name.toLowerCase() === activeSession.name.toLowerCase();
  });

  const countStat = document.querySelector(
    "#doctor-stat-count",
  ) as HTMLElement | null;
  if (countStat) countStat.textContent = String(doctorBookings.length);

  const totalRevenue: number = doctorBookings.reduce(function (
    accumulator: number,
    currentItem: Booking,
  ) {
    if (currentItem.status === "cancelled") {
      return accumulator;
    }
    return accumulator + (Number(currentItem.fee) || 0);
  }, 0);

  const revenueStat = document.querySelector(
    "#doctor-stat-revenue",
  ) as HTMLElement | null;
  if (revenueStat) revenueStat.textContent = `₹ ${totalRevenue}`;

  const list = document.querySelector(
    "#doctor-patients-list",
  ) as HTMLElement | null;

  if (list) {
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
      doctorBookings.forEach(function (app: Booking) {
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

    list.addEventListener("click", function (event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const actionBtn = target?.closest(
        ".btn-queue-action",
      ) as HTMLElement | null;
      if (!actionBtn) return;

      const targetId: number = Number(actionBtn.dataset.id);
      const newStatus: string = actionBtn.dataset.status || "confirmed";

      const currentBookings: Booking[] = safeGetStorage("patient_booking", []);

      const updatedBookings: Booking[] = currentBookings.map(function (
        booking: Booking,
      ) {
        if (booking.id === targetId) {
          return { ...booking, status: newStatus };
        }
        return booking;
      });

      safeSetStorage("patient_booking", updatedBookings);
      window.location.reload();
    });
  }

  const doctorView = document.querySelector(
    "#doctor-view",
  ) as HTMLElement | null;
  if (doctorView) doctorView.style.display = "block";
} else {
  // Patient Portal View: Booked Appointments & Real-Time Cancellation Engine
  if (dashUserName) dashUserName.textContent = "Patient Portal";
  if (userAvatar) userAvatar.textContent = "P";
  if (dashUserSubtext && activeSession) {
    dashUserSubtext.textContent = `${activeSession.name} • Verified Patient Account`;
  }

  const patientView = document.querySelector(
    "#patient-view",
  ) as HTMLElement | null;
  if (patientView) patientView.style.display = "block";

  const patientBooking: Booking[] = safeGetStorage("patient_booking", []);

  const myBookings: Booking[] = patientBooking.filter(function (
    entry: Booking,
  ) {
    return (
      entry.patientName &&
      entry.patientName.toLowerCase() === activeSession?.name?.toLowerCase()
    );
  });

  const patientStatCount = document.querySelector(
    "#patient-stat-count",
  ) as HTMLElement | null;
  if (patientStatCount)
    patientStatCount.textContent = String(myBookings.length);

  const patientList = document.querySelector(
    "#patient-appointments-list",
  ) as HTMLElement | null;

  if (patientList) {
    if (myBookings.length === 0) {
      patientList.innerHTML = `<div class="empty-dashboard-card"><p>No appointments booked yet.</p></div>`;
    } else {
      patientList.innerHTML = "";
      myBookings.forEach(function (entry: Booking) {
        patientList.innerHTML += `
          <div class="appointment-item">
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
          </div>
        `;
      });

      patientList.addEventListener("click", function (event: MouseEvent) {
        const target = event.target as HTMLElement | null;
        const cancelBtn = target?.closest(
          ".btn-cancel-booking",
        ) as HTMLElement | null;

        if (!cancelBtn) return;

        const targetId: number = Number(cancelBtn.dataset.id);

        const remaining: Booking[] = patientBooking.filter(function (
          entry: Booking,
        ) {
          return entry.id !== targetId;
        });

        safeSetStorage("patient_booking", remaining);
        window.location.reload();
      });
    }
  }
}

// Dashboard Logout: Clear Session from LocalStorage & Redirect to Login
const logoutBtn = document.querySelector(
  "#dashboard-logout-btn",
) as HTMLElement | null;

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("current_user");
    window.location.href = "login.html";
  });
}