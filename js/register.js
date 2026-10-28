var _a, _b, _c, _d, _e, _f;
import { safeGetStorage, safeSetStorage } from "./storage.js";
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
        if (docName)
            docName.value = (_a = currentRecord.name) !== null && _a !== void 0 ? _a : "";
        const spec = document.querySelector("#specialization");
        if (spec)
            spec.value = (_b = currentRecord.specialty) !== null && _b !== void 0 ? _b : "";
        const clinic = document.querySelector("#clinic-name");
        if (clinic)
            clinic.value = (_c = currentRecord.clinic) !== null && _c !== void 0 ? _c : "";
        const district = document.querySelector("#district");
        if (district)
            district.value = (_d = currentRecord.district) !== null && _d !== void 0 ? _d : "";
        const fee = document.querySelector("#consultation-fee");
        if (fee)
            fee.value =
                currentRecord.fee !== undefined ? String(currentRecord.fee) : "";
        const sTime = document.querySelector("#start-time");
        if (sTime)
            sTime.value = (_e = currentRecord.startTime) !== null && _e !== void 0 ? _e : "";
        const eTime = document.querySelector("#end-time");
        if (eTime)
            eTime.value = (_f = currentRecord.endTime) !== null && _f !== void 0 ? _f : "";
        const dur = document.querySelector("#slot-duration");
        if (dur)
            dur.value =
                currentRecord.slotDuration !== undefined
                    ? String(currentRecord.slotDuration)
                    : "30";
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
        const doctorNameInput = document.querySelector("#doctor-name");
        const doctorName = (doctorNameInput === null || doctorNameInput === void 0 ? void 0 : doctorNameInput.value.trim()) || "";
        const doctorSpecialtyInput = document.querySelector("#specialization");
        const doctorSpecialty = (doctorSpecialtyInput === null || doctorSpecialtyInput === void 0 ? void 0 : doctorSpecialtyInput.value.trim()) || "";
        const doctorClinicNameInput = document.querySelector("#clinic-name");
        const doctorClinicName = (doctorClinicNameInput === null || doctorClinicNameInput === void 0 ? void 0 : doctorClinicNameInput.value.trim()) || "";
        const doctorDistrictInput = document.querySelector("#district");
        const doctorDistrict = (doctorDistrictInput === null || doctorDistrictInput === void 0 ? void 0 : doctorDistrictInput.value.trim()) || "";
        const doctorFeeInput = document.querySelector("#consultation-fee");
        const doctorFee = (doctorFeeInput === null || doctorFeeInput === void 0 ? void 0 : doctorFeeInput.value.trim()) || "0";
        const startTimeInput = document.querySelector("#start-time");
        const startTime = (startTimeInput === null || startTimeInput === void 0 ? void 0 : startTimeInput.value) || "";
        const endTimeInput = document.querySelector("#end-time");
        const endTime = (endTimeInput === null || endTimeInput === void 0 ? void 0 : endTimeInput.value) || "";
        const slotDurationInput = document.querySelector("#slot-duration");
        const slotDuration = Number((slotDurationInput === null || slotDurationInput === void 0 ? void 0 : slotDurationInput.value) || 30);
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
            if (targetIndex !== -1 && allRecords[targetIndex]) {
                allRecords[targetIndex] = Object.assign(Object.assign({}, allRecords[targetIndex]), { name: doctorName, specialty: doctorSpecialty, clinic: doctorClinicName, district: doctorDistrict, fee: Number(doctorFee), startTime: startTime, endTime: endTime, slotDuration: slotDuration });
            }
            safeSetStorage("current_user", Object.assign(Object.assign({}, activeSession), { name: doctorName, clinic: doctorClinicName }));
            safeSetStorage("clinic_doctors", allRecords);
            window.location.href = "dashboard.html";
        }
        else {
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
