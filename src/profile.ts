import { Doctor } from "./types.js";
import { safeGetStorage, safeSetStorage } from "./storage.js";

// Active User Session: Read once safely
const activeUser = safeGetStorage("current_user", null);

// URL Query Parameters: Extract Doctor ID from Address Bar
const queryParams = new URLSearchParams(window.location.search);
const doctorId: string | null = queryParams.get("id");

// Doctor Record Lookup: Retrieve Matching Doctor from LocalStorage
const currentDoctors: Doctor[] = safeGetStorage("clinic_doctors", []);

const matchedDoctor: Doctor | undefined = currentDoctors.find(function (doctor: Doctor) {
  return doctor.id === Number(doctorId);
});

if (!matchedDoctor) {
  window.location.href = "category.html";
}

// Profile Hero & Header: Batch DOM Injection for Doctor Details
const doctorData: Record<string, string> = {
  "#doctor-name": matchedDoctor?.name ?? "Doctor Profile",
  "#doctor-specialty": matchedDoctor?.specialty ?? "",
  "#doctor-clinic": matchedDoctor?.clinic ?? "",
  "#doctor-district": matchedDoctor?.district ?? "",
  "#hero-fee": `₹${matchedDoctor?.fee ?? 0}`,
  "#clinic-address": `${matchedDoctor?.clinic ?? ""}, ${matchedDoctor?.district ?? ""}`,
  "#widget-fee": `₹${matchedDoctor?.fee ?? 0}`,
  "#summary-doctor": matchedDoctor?.name ?? "",
  "#summary-clinic": matchedDoctor?.clinic ?? "",
  "#summary-fee": `₹${matchedDoctor?.fee ?? 0}`,
};

Object.entries(doctorData).forEach(function ([selector, value]: [string, string]) {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (el) el.textContent = value;
});
