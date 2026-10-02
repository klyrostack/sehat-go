// Registration Form: DOM Selector
const formSubmit = document.querySelector("form");

const activeSession = JSON.parse(localStorage.getItem("current_user"));

if (activeSession && activeSession.role === "doctor") {
  const allRecords = JSON.parse(localStorage.getItem("clinic_doctors")) || [];

  const currentRecord = allRecords.find(function (doc) {
    return doc.id === activeSession.id;
  });

  if (currentRecord) {
    document.querySelector("#doctor-name").value = currentRecord.name;
    document.querySelector("#specialization").value = currentRecord.specialty;
    document.querySelector("#clinic-name").value = currentRecord.clinic;
    document.querySelector("#district").value = currentRecord.district;
    document.querySelector("#consultation-fee").value = currentRecord.fee;
    document.querySelector("#start-time").value = currentRecord.startTime;
    document.querySelector("#end-time").value = currentRecord.endTime;
    document.querySelector("#slot-duration").value = currentRecord.slotDuration;

    document.querySelector("button[type='submit']").textContent =
      "Save Clinic Changes";
  }
}
// Doctor Registration Engine: Form Submission Handler
formSubmit.addEventListener("submit", function (event) {
  event.preventDefault();

  // Form Input Extraction: Doctor Details & Clinic Working Hours
  const doctorName = document.querySelector("#doctor-name").value.trim();

  const doctorSpecialty = document
    .querySelector("#specialization")
    .value.trim();

  const doctorClinicName = document.querySelector("#clinic-name").value.trim();

  const doctorDistrict = document.querySelector("#district").value.trim();

  const doctorFee = document.querySelector("#consultation-fee").value.trim();

  const startTime = document.querySelector("#start-time").value;
  const endTime = document.querySelector("#end-time").value;
  const slotDuration = Number(document.querySelector("#slot-duration").value);

  const errorBox = document.querySelector("#doctor-reg-error");

  if (startTime >= endTime) {
    errorBox.textContent = "Closing time must be after opening time!";
    errorBox.style.display = "block";
    return;
  }
  errorBox.style.display = "none";

  // Doctor Data Modeling: Construct Structured Doctor Object

  const allRecords = JSON.parse(localStorage.getItem("clinic_doctors")) || [];

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

    localStorage.setItem(
      "current_user",
      JSON.stringify({
        ...activeSession,
        name: doctorName,
        clinic: doctorClinicName,
      }),
    );

    localStorage.setItem("clinic_doctors", JSON.stringify(allRecords));
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
    const doctors = JSON.parse(localStorage.getItem("clinic_doctors")) || [];
    doctors.push(newDoctor);
    localStorage.setItem("clinic_doctors", JSON.stringify(doctors));
    window.location.href = "index.html";
  }
});
