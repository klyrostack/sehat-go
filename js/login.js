import { safeGetStorage, safeSetStorage } from "./storage.js";
// Login Form: DOM Selector
const form = (document.querySelector("#login-form") ||
    document.querySelector("form"));
// Dual-Role Authentication Engine: Form Submission Handler
if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        // Credentials & Role Extraction: Inspect Doctor Radio Toggle
        const roleDoctorInput = document.querySelector("#role-doctor");
        const isDoctor = (roleDoctorInput === null || roleDoctorInput === void 0 ? void 0 : roleDoctorInput.checked) || false;
        const identifierInput = document.querySelector("#login-identifier");
        const userName = (identifierInput === null || identifierInput === void 0 ? void 0 : identifierInput.value.trim()) || "";
        const passwordInput = document.querySelector("#login-password");
        const userPassword = (passwordInput === null || passwordInput === void 0 ? void 0 : passwordInput.value.trim()) || "";
        const loginError = document.querySelector("#login-error-msg");
        // Doctor Authentication: Verify Against LocalStorage & Redirect to Dashboard
        if (isDoctor) {
            const doctorList = safeGetStorage("clinic_doctors", []);
            const matchedDoctor = doctorList.find(function (doctor) {
                var _a;
                return (((_a = doctor.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "") === userName.toLowerCase();
            });
            if (matchedDoctor) {
                const sessionUser = {
                    role: "doctor",
                    id: matchedDoctor.id,
                    name: matchedDoctor.name,
                    clinic: matchedDoctor.clinic,
                };
                safeSetStorage("current_user", sessionUser);
                window.location.href = "dashboard.html";
            }
            else {
                if (loginError) {
                    loginError.textContent =
                        "Doctor account not found! Check your name or register first.";
                    loginError.style.display = "block";
                }
            }
        }
        else {
            // Patient Authentication: Instant Verified Session & Redirect to Home
            const patientList = safeGetStorage("registered_patients", []);
            const matchedPatient = patientList.find(function (p) {
                var _a;
                return ((((_a = p.identifier) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "") === userName.toLowerCase() &&
                    p.password === userPassword);
            });
            if (matchedPatient) {
                const sessionUser = {
                    role: "patient",
                    id: matchedPatient.id,
                    name: matchedPatient.name,
                    identifier: matchedPatient.identifier,
                };
                safeSetStorage("current_user", sessionUser);
                window.location.href = "dashboard.html";
            }
            else {
                if (loginError) {
                    loginError.textContent =
                        "Invalid mobile/email or password. Please check your credentials or create an account.";
                    loginError.style.display = "block";
                }
            }
        }
    });
}
const loginForm = document.querySelector("#login-form");
const patientRegisterForm = document.querySelector("#patient-register-form");
const registerBtn = document.querySelector("#to-register-btn");
const loginBtn = document.querySelector("#to-login-btn");
if (registerBtn && loginForm && patientRegisterForm) {
    registerBtn.addEventListener("click", function (event) {
        event.preventDefault();
        loginForm.style.display = "none";
        patientRegisterForm.style.display = "block";
    });
}
if (loginBtn && loginForm && patientRegisterForm) {
    loginBtn.addEventListener("click", function (event) {
        event.preventDefault();
        patientRegisterForm.style.display = "none";
        loginForm.style.display = "block";
    });
}
if (patientRegisterForm) {
    patientRegisterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const errorBox = document.querySelector("#reg-error-msg");
        const patientPasswordInput = document.querySelector("#reg-patient-password");
        const patientConfirmInput = document.querySelector("#reg-patient-confirm");
        const patientPassword = (patientPasswordInput === null || patientPasswordInput === void 0 ? void 0 : patientPasswordInput.value) || "";
        const patientConfirm = (patientConfirmInput === null || patientConfirmInput === void 0 ? void 0 : patientConfirmInput.value) || "";
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
        const regNameInput = document.querySelector("#reg-patient-name");
        const regIdentifierInput = document.querySelector("#reg-patient-identifier");
        const patientRegName = (regNameInput === null || regNameInput === void 0 ? void 0 : regNameInput.value.trim()) || "";
        const patientIdentifier = (regIdentifierInput === null || regIdentifierInput === void 0 ? void 0 : regIdentifierInput.value.trim()) || "";
        const allPatients = safeGetStorage("registered_patients", []);
        const isDuplicate = allPatients.some(function (p) {
            var _a;
            return ((((_a = p.identifier) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "") === patientIdentifier.toLowerCase());
        });
        if (isDuplicate) {
            if (errorBox) {
                errorBox.textContent = "This email is already registered!";
                errorBox.style.display = "block";
            }
            return;
        }
        const newPatient = {
            id: Date.now(),
            name: patientRegName,
            identifier: patientIdentifier,
            password: patientPassword,
        };
        allPatients.push(newPatient);
        safeSetStorage("registered_patients", allPatients);
        const activeSession = {
            role: "patient",
            id: newPatient.id,
            name: newPatient.name,
            identifier: newPatient.identifier,
        };
        safeSetStorage("current_user", activeSession);
        window.location.href = "dashboard.html";
    });
}
