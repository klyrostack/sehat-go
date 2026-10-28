import { Doctor, UserSession, PatientRecord } from "./types.js";
import { safeGetStorage, safeSetStorage } from "./storage.js";

// Login Form: DOM Selector
const form = (document.querySelector("#login-form") ||
  document.querySelector("form")) as HTMLFormElement | null;

// Dual-Role Authentication Engine: Form Submission Handler
if (form) {
  form.addEventListener("submit", function (event: SubmitEvent) {
    event.preventDefault();

    // Credentials & Role Extraction: Inspect Doctor Radio Toggle
    const roleDoctorInput = document.querySelector(
      "#role-doctor",
    ) as HTMLInputElement | null;
    const isDoctor: boolean = roleDoctorInput?.checked || false;

    const identifierInput = document.querySelector(
      "#login-identifier",
    ) as HTMLInputElement | null;
    const userName: string = identifierInput?.value.trim() || "";

    const passwordInput = document.querySelector(
      "#login-password",
    ) as HTMLInputElement | null;
    const userPassword: string = passwordInput?.value.trim() || "";

    const loginError = document.querySelector(
      "#login-error-msg",
    ) as HTMLElement | null;

    // Doctor Authentication: Verify Against LocalStorage & Redirect to Dashboard
    if (isDoctor) {
      const doctorList: Doctor[] = safeGetStorage("clinic_doctors", []);

      const matchedDoctor: Doctor | undefined = doctorList.find(function (
        doctor: Doctor,
      ) {
        return (doctor.name?.toLowerCase() || "") === userName.toLowerCase();
      });

      if (matchedDoctor) {
        const sessionUser: UserSession = {
          role: "doctor",
          id: matchedDoctor.id,
          name: matchedDoctor.name,
          clinic: matchedDoctor.clinic,
        };
        safeSetStorage("current_user", sessionUser);
        window.location.href = "dashboard.html";
      } else {
        if (loginError) {
          loginError.textContent =
            "Doctor account not found! Check your name or register first.";
          loginError.style.display = "block";
        }
      }
    } else {
      // Patient Authentication: Instant Verified Session & Redirect to Home
      const patientList: PatientRecord[] = safeGetStorage(
        "registered_patients",
        [],
      );

      const matchedPatient: PatientRecord | undefined = patientList.find(
        function (p: PatientRecord) {
          return (
            (p.identifier?.toLowerCase() || "") === userName.toLowerCase() &&
            p.password === userPassword
          );
        },
      );

      if (matchedPatient) {
        const sessionUser: UserSession = {
          role: "patient",
          id: matchedPatient.id,
          name: matchedPatient.name,
          identifier: matchedPatient.identifier,
        };
        safeSetStorage("current_user", sessionUser);
        window.location.href = "dashboard.html";
      } else {
        if (loginError) {
          loginError.textContent =
            "Invalid mobile/email or password. Please check your credentials or create an account.";
          loginError.style.display = "block";
        }
      }
    }
  });
}

const loginForm = document.querySelector("#login-form") as HTMLElement | null;
const patientRegisterForm = document.querySelector(
  "#patient-register-form",
) as HTMLFormElement | null;
const registerBtn = document.querySelector(
  "#to-register-btn",
) as HTMLElement | null;
const loginBtn = document.querySelector("#to-login-btn") as HTMLElement | null;

if (registerBtn && loginForm && patientRegisterForm) {
  registerBtn.addEventListener("click", function (event: MouseEvent) {
    event.preventDefault();
    loginForm.style.display = "none";
    patientRegisterForm.style.display = "block";
  });
}

if (loginBtn && loginForm && patientRegisterForm) {
  loginBtn.addEventListener("click", function (event: MouseEvent) {
    event.preventDefault();
    patientRegisterForm.style.display = "none";
    loginForm.style.display = "block";
  });
}

if (patientRegisterForm) {
  patientRegisterForm.addEventListener("submit", function (event: SubmitEvent) {
    event.preventDefault();

    const errorBox = document.querySelector(
      "#reg-error-msg",
    ) as HTMLElement | null;

    const patientPasswordInput = document.querySelector(
      "#reg-patient-password",
    ) as HTMLInputElement | null;
    const patientConfirmInput = document.querySelector(
      "#reg-patient-confirm",
    ) as HTMLInputElement | null;

    const patientPassword: string = patientPasswordInput?.value || "";
    const patientConfirm: string = patientConfirmInput?.value || "";

    if (patientPassword !== patientConfirm) {
      if (errorBox) {
        errorBox.textContent = "Password do not match!";
        errorBox.style.display = "block";
      }
      return;
    }
    if (errorBox) {
      errorBox.style.display = "none";
    }

    const regNameInput = document.querySelector(
      "#reg-patient-name",
    ) as HTMLInputElement | null;
    const regIdentifierInput = document.querySelector(
      "#reg-patient-identifier",
    ) as HTMLInputElement | null;

    const patientRegName: string = regNameInput?.value.trim() || "";
    const patientIdentifier: string = regIdentifierInput?.value.trim() || "";

    const allPatients: PatientRecord[] = safeGetStorage(
      "registered_patients",
      [],
    );

    const isDuplicate: boolean = allPatients.some(function (p: PatientRecord) {
      return (
        (p.identifier?.toLowerCase() || "") === patientIdentifier.toLowerCase()
      );
    });

    if (isDuplicate) {
      if (errorBox) {
        errorBox.textContent = "This email is already registered!";
        errorBox.style.display = "block";
      }
      return;
    }

    const newPatient: PatientRecord = {
      id: Date.now(),
      name: patientRegName,
      identifier: patientIdentifier,
      password: patientPassword,
    };

    allPatients.push(newPatient);
    safeSetStorage("registered_patients", allPatients);

    const activeSession: UserSession = {
      role: "patient",
      id: newPatient.id,
      name: newPatient.name,
      identifier: newPatient.identifier,
    };
    safeSetStorage("current_user", activeSession);
    window.location.href = "dashboard.html";
  });
}
