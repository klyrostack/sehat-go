// Login Form: DOM Selector
const form = document.querySelector("form");

// Dual-Role Authentication Engine: Form Submission Handler
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Credentials & Role Extraction: Inspect Doctor Radio Toggle
  const isDoctor = document.querySelector("#role-doctor").checked;

  const userName = document.querySelector("#login-identifier").value.trim();

  const userPassword = document.querySelector("#login-password").value.trim();

  const loginError = document.querySelector("#login-error-msg");

  // Doctor Authentication: Verify Against LocalStorage & Redirect to Dashboard
  if (isDoctor) {
    const doctorList = JSON.parse(localStorage.getItem("clinic_doctors")) || [];

    const matchedDoctor = doctorList.find(function (doctor) {
      return doctor.name.toLowerCase() === userName.toLowerCase();
    });

    if (matchedDoctor) {
      const sessionUser = {
        role: "doctor",
        id: matchedDoctor.id,
        name: matchedDoctor.name,
        clinic: matchedDoctor.clinic,
      };
      localStorage.setItem("current_user", JSON.stringify(sessionUser));
      window.location.href = "dashboard.html";
    } else {
      loginError.textContent =
        "Doctor account not found! Check your name or register first.";
      loginError.style.display = "block";
    }
  } else {
    // Patient Authentication: Instant Verified Session & Redirect to Home
    const patientlist =
      JSON.parse(localStorage.getItem("registered_patients")) || [];

    const matchedPatient = patientlist.find(function (p) {
      return (
        p.identifier.toLowerCase() === userName.toLowerCase() &&
        p.password === userPassword
      );
    });

  
    if (matchedPatient) {
      const sessionUser = {
        role: "patient",
        id: matchedPatient.id,
        name: matchedPatient.name,
        identifier: matchedPatient.identifier,
      };
      localStorage.setItem("current_user", JSON.stringify(sessionUser));
      window.location.href = "dashboard.html";
    } else {
      loginError.textContent =
        "Invalid mobile/email or password. Please check your credentials or create an account.";
      loginError.style.display = "block";
    }
  }
});

const loginForm = document.querySelector("#login-form");
const patientRegisterForm = document.querySelector("#patient-register-form");
const registerBtn = document.querySelector("#to-register-btn");
const loginBtn = document.querySelector("#to-login-btn");

registerBtn.addEventListener("click", function (event) {
  event.preventDefault();
  loginForm.style.display = "none";
  patientRegisterForm.style.display = "block";
});
loginBtn.addEventListener("click", function (event) {
  event.preventDefault();
  patientRegisterForm.style.display = "none";
  loginForm.style.display = "block";
});

patientRegisterForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const errorBox = document.querySelector("#reg-error-msg");

  const patientPassword = document.querySelector("#reg-patient-password").value;
  const patientConfirm = document.querySelector("#reg-patient-confirm").value;

  if (patientPassword !== patientConfirm) {
    errorBox.textContent = "Password do not match!";
    errorBox.style.display = "block";
    return;
  }
  errorBox.style.display = "none";

  const patientRegName = document
    .querySelector("#reg-patient-name")
    .value.trim();
  const patientIdentifier = document
    .querySelector("#reg-patient-identifier")
    .value.trim();

  const allPatients =
    JSON.parse(localStorage.getItem("registered_patients")) || [];

  const isDuplicate = allPatients.some(function (p) {
    return p.identifier.toLowerCase() === patientIdentifier.toLowerCase();
  });

  if (isDuplicate) {
    errorBox.textContent = "This email is already registered!";
    errorBox.style.display = "block";
    return;
  }
  const newPatient = {
    id: Date.now(),
    name: patientRegName,
    identifier: patientIdentifier,
    password: patientPassword,
  };

  allPatients.push(newPatient);
  localStorage.setItem("registered_patients", JSON.stringify(allPatients));

  const activeSession = {
    role: "patient",
    id: newPatient.id,
    name: newPatient.name,
    identifier: newPatient.identifier,
  };
  localStorage.setItem("current_user", JSON.stringify(activeSession));
  window.location.href = "dashboard.html";
});
