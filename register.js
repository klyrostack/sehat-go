// Registration Form: DOM Selector
const formSubmit = document.querySelector("form");

// Doctor Registration Engine: Form Submission Handler
formSubmit.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log("Form Submitted Successfully");

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

  // Doctor Data Modeling: Construct Structured Doctor Object
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
});

