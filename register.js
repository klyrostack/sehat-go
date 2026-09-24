const formSubmit = document.querySelector("form");

formSubmit.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log("Form Submitted Successfully");

  const doctorName = document.querySelector("#doctor-name").value.trim();

  const doctorSpecialty = document
    .querySelector("#specialization")
    .value.trim();

  const doctorClinicName = document.querySelector("#clinic-name").value.trim();

  const doctorDistrict = document.querySelector("#district").value.trim();

  const doctorFee = document.querySelector("#consultation-fee").value.trim();

  const newDoctor = {
    id: Date.now(),
    name: doctorName,
    specialty: doctorSpecialty,
    clinic: doctorClinicName,
    district: doctorDistrict,
    fee: Number(doctorFee),
    rating: 0,
    reviews: [],
    reviewCount: 0,
  };

  const doctors = JSON.parse(localStorage.getItem("clinic_doctors")) || [];
  doctors.push(newDoctor);
  localStorage.setItem("clinic_doctors", JSON.stringify(doctors));
  window.location.href = "index.html";
});

