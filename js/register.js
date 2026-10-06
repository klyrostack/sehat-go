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

// Registration Form: DOM Selector
const formSubmit = document.querySelector("form");

const activeSession = safeGetStorage("current_user", null);

if (activeSession && activeSession.role === "doctor") {
  const allRecords = safeGetStorage("clinic_doctors", []);

  const currentRecord = allRecords.find(function (doc) {
    return doc.id === activeSession.id;
  });

  if (currentRecord) {
    const docName = document.querySelector("#doctor-name");
    if (docName) docName.value = currentRecord.name ?? "";
    const spec = document.querySelector("#specialization");
    if (spec) spec.value = currentRecord.specialty ?? "";
    const clinic = document.querySelector("#clinic-name");
    if (clinic) clinic.value = currentRecord.clinic ?? "";
    const district = document.querySelector("#district");
    if (district) district.value = currentRecord.district ?? "";
    const fee = document.querySelector("#consultation-fee");
    if (fee) fee.value = currentRecord.fee ?? "";
    const sTime = document.querySelector("#start-time");
    if (sTime) sTime.value = currentRecord.startTime ?? "";
    const eTime = document.querySelector("#end-time");
    if (eTime) eTime.value = currentRecord.endTime ?? "";
    const dur = document.querySelector("#slot-duration");
    if (dur) dur.value = currentRecord.slotDuration ?? 30;

    const submitBtn = document.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.textContent = "Save Clinic Changes";
    }
  }
}

// Doctor Registration Engine: Form Submission Handler
if (formSubmit) {
  formSubmit.addEventListener("submit", function (event) {
    event.preventDefault();

    // Form Input Extraction: Doctor Details & Clinic Working Hours
    const doctorName = document.querySelector("#doctor-name")?.value.trim() || "";

    const doctorSpecialty = document
      .querySelector("#specialization")
      ?.value.trim() || "";

    const doctorClinicName = document.querySelector("#clinic-name")?.value.trim() || "";

    const doctorDistrict = document.querySelector("#district")?.value.trim() || "";

    const doctorFee = document.querySelector("#consultation-fee")?.value.trim() || "0";

    const startTime = document.querySelector("#start-time")?.value || "";
    const endTime = document.querySelector("#end-time")?.value || "";
    const slotDuration = Number(document.querySelector("#slot-duration")?.value || 30);

    const errorBox = document.querySelector("#doctor-reg-error");

    if (startTime >= endTime) {
      if (errorBox) {
        errorBox.textContent = "Closing time must be after opening time!";
        errorBox.style.display = "block";
      }
      return;
    }
    if (errorBox) {
      errorBox.style.display = "none";
    }

    // Doctor Data Modeling: Construct Structured Doctor Object
    const allRecords = safeGetStorage("clinic_doctors", []);

    if (activeSession && activeSession.role === "doctor") {
      const targetIndex = allRecords.findIndex(function (record) {
        return record.id === activeSession.id;
      });

      if (targetIndex !== -1) {
        allRecords[targetIndex] = {
          ...allRecords[targetIndex],
          name: doctorName,
          specialty: doctorSpecialty,
          clinic: doctorClinicName,
          district: doctorDistrict,
          fee: Number(doctorFee),
          startTime: startTime,
          endTime: endTime,
          slotDuration: slotDuration,
        };
      }

      safeSetStorage("current_user", {
        ...activeSession,
        name: doctorName,
        clinic: doctorClinicName,
      });

      safeSetStorage("clinic_doctors", allRecords);
      window.location.href = "dashboard.html";
    } else {
      const newDoctor = {
        id: Date.now(),
        name: doctorName,
        specialty: doctorSpecialty,
        clinic: doctorClinicName,
        district: doctorDistrict,
        fee: Number(doctorFee),
        startTime: startTime,
        endTime: endTime,
        slotDuration: slotDuration,
        rating: 0,
        reviews: [],
        reviewCount: 0,
      };

      // LocalStorage Persistence: Save Doctor Record & Redirect to Home
      const doctors = safeGetStorage("clinic_doctors", []);
      doctors.push(newDoctor);
      safeSetStorage("clinic_doctors", doctors);
      window.location.href = "index.html";
    }
  });
}
