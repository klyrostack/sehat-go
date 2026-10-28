var _a, _b;
import { safeGetStorage, safeSetStorage } from "./storage.js";
// Route Guard: Protect Dashboard & Redirect Unauthenticated Visitors
const activeSession = safeGetStorage("current_user", null);
if (!activeSession) {
    window.location.href = "login.html";
}
const dashUserName = document.querySelector("#dashboard-user-name");
if (dashUserName && activeSession) {
    dashUserName.textContent = activeSession.name;
}
// Shared Profile Card: Display User Info, Avatar Initial & Role Badge
const userAvatar = document.querySelector("#user-avatar");
if (userAvatar && activeSession) {
    userAvatar.textContent = activeSession.name
        ? activeSession.name.charAt(0).toUpperCase()
        : "";
}
const userBadge = document.querySelector("#user-role-badge");
if (userBadge && activeSession) {
    userBadge.textContent = activeSession.role;
    if (activeSession.role) {
        userBadge.classList.add(activeSession.role);
    }
}
const dashUserSubtext = document.querySelector("#dashboard-user-subtext");
if (dashUserSubtext && activeSession) {
    dashUserSubtext.textContent =
        activeSession.clinic || "Verified Patient Account";
}
// Doctor Portal View: Practice Details, Operational Meta & Patient Queue
if (activeSession && activeSession.role === "doctor") {
    if (dashUserName)
        dashUserName.textContent = activeSession.name;
    if (userAvatar)
        userAvatar.textContent = activeSession.name.charAt(0).toUpperCase();
    if (dashUserSubtext && activeSession.clinic)
        dashUserSubtext.textContent = activeSession.clinic;
    const allDoctors = safeGetStorage("clinic_doctors", []);
    const currentDoctor = allDoctors.find(function (doc) {
        return doc.name.toLowerCase() === activeSession.name.toLowerCase();
    });
    if (!currentDoctor) {
        window.location.href = "login.html";
    }
    const specialtyPill = document.querySelector("#doctor-pill-specialty");
    if (specialtyPill)
        specialtyPill.textContent = (_a = currentDoctor === null || currentDoctor === void 0 ? void 0 : currentDoctor.specialty) !== null && _a !== void 0 ? _a : "General Practice";
    const districtPill = document.querySelector("#doctor-pill-district");
    if (districtPill)
        districtPill.textContent = (_b = currentDoctor === null || currentDoctor === void 0 ? void 0 : currentDoctor.district) !== null && _b !== void 0 ? _b : "District is not set";
    const hoursPill = document.querySelector("#doctor-pill-hours");
    if (hoursPill) {
        hoursPill.textContent = (currentDoctor === null || currentDoctor === void 0 ? void 0 : currentDoctor.startTime)
            ? `${currentDoctor.startTime} - ${currentDoctor.endTime}`
            : "Hours not set";
    }
    const feePill = document.querySelector("#doctor-pill-fee");
    if (feePill) {
        feePill.textContent =
            (currentDoctor === null || currentDoctor === void 0 ? void 0 : currentDoctor.fee) !== undefined
                ? "₹" + currentDoctor.fee
                : "Fee not set";
    }
    const ratingStat = document.querySelector("#doctor-stat-rating");
    if (ratingStat) {
        ratingStat.textContent = (currentDoctor === null || currentDoctor === void 0 ? void 0 : currentDoctor.rating)
            ? `⭐ ${currentDoctor.rating}`
            : "⭐ Newly Registered";
    }
    const allBookings = safeGetStorage("patient_booking", []);
    const doctorBookings = allBookings.filter(function (booking) {
        return booking.name.toLowerCase() === activeSession.name.toLowerCase();
    });
    const countStat = document.querySelector("#doctor-stat-count");
    if (countStat)
        countStat.textContent = String(doctorBookings.length);
    const totalRevenue = doctorBookings.reduce(function (accumulator, currentItem) {
        if (currentItem.status === "cancelled") {
            return accumulator;
        }
        return accumulator + (Number(currentItem.fee) || 0);
    }, 0);
    const revenueStat = document.querySelector("#doctor-stat-revenue");
    if (revenueStat)
        revenueStat.textContent = `₹ ${totalRevenue}`;
    const list = document.querySelector("#doctor-patients-list");
    if (list) {
        if (doctorBookings.length === 0) {
            list.innerHTML = `
        <div class="empty-dashboard-card">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
          <h3>No Patients Scheduled Yet</h3>
          <p style="color: var(--text-muted);">When patients book slots, they will appear here live.</p>
        </div>
      `;
        }
        else {
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
            const target = event.target;
            const actionBtn = target === null || target === void 0 ? void 0 : target.closest(".btn-queue-action");
            if (!actionBtn)
                return;
            const targetId = Number(actionBtn.dataset.id);
            const newStatus = actionBtn.dataset.status || "confirmed";
            const currentBookings = safeGetStorage("patient_booking", []);
            const updatedBookings = currentBookings.map(function (booking) {
                if (booking.id === targetId) {
                    return Object.assign(Object.assign({}, booking), { status: newStatus });
                }
                return booking;
            });
            safeSetStorage("patient_booking", updatedBookings);
            window.location.reload();
        });
    }
    const doctorView = document.querySelector("#doctor-view");
    if (doctorView)
        doctorView.style.display = "block";
}
else {
    // Patient Portal View: Booked Appointments & Real-Time Cancellation Engine
    if (dashUserName)
        dashUserName.textContent = "Patient Portal";
    if (userAvatar)
        userAvatar.textContent = "P";
    if (dashUserSubtext && activeSession) {
        dashUserSubtext.textContent = `${activeSession.name} • Verified Patient Account`;
    }
    const patientView = document.querySelector("#patient-view");
    if (patientView)
        patientView.style.display = "block";
    const patientBooking = safeGetStorage("patient_booking", []);
    const myBookings = patientBooking.filter(function (entry) {
        var _a;
        return (entry.patientName &&
            entry.patientName.toLowerCase() === ((_a = activeSession === null || activeSession === void 0 ? void 0 : activeSession.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()));
    });
    const patientStatCount = document.querySelector("#patient-stat-count");
    if (patientStatCount)
        patientStatCount.textContent = String(myBookings.length);
    const patientList = document.querySelector("#patient-appointments-list");
    if (patientList) {
        if (myBookings.length === 0) {
            patientList.innerHTML = `<div class="empty-dashboard-card"><p>No appointments booked yet.</p></div>`;
        }
        else {
            patientList.innerHTML = "";
            myBookings.forEach(function (entry) {
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
            patientList.addEventListener("click", function (event) {
                const target = event.target;
                const cancelBtn = target === null || target === void 0 ? void 0 : target.closest(".btn-cancel-booking");
                if (!cancelBtn)
                    return;
                const targetId = Number(cancelBtn.dataset.id);
                const remaining = patientBooking.filter(function (entry) {
                    return entry.id !== targetId;
                });
                safeSetStorage("patient_booking", remaining);
                window.location.reload();
            });
        }
    }
}
// Dashboard Logout: Clear Session from LocalStorage & Redirect to Login
const logoutBtn = document.querySelector("#dashboard-logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("current_user");
        window.location.href = "login.html";
    });
}
