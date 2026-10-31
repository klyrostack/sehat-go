import { Doctor, UserSession } from "./types.js";
import { safeGetStorage, safeSetStorage } from "./storage.js";

// Registration Form: DOM Selector
const formSubmit = document.querySelector("form") as HTMLFormElement | null;

const activeSession: UserSession | null = safeGetStorage("current_user", null);

if (activeSession && activeSession.role === "doctor") {
  const allRecords: Doctor[] = safeGetStorage("clinic_doctors", []);

  const currentRecord: Doctor | undefined = allRecords.find(function (
    doc: Doctor,
  ) {
    return doc.id === activeSession.id;
  });

  if (currentRecord) {
    const docName = document.querySelector(
      "#doctor-name",
    ) as HTMLInputElement | null;
    if (docName) docName.value = currentRecord.name ?? "";

    const spec = document.querySelector(
      "#specialization",
    ) as HTMLInputElement | null;
    if (spec) spec.value = currentRecord.specialty ?? "";

    const clinic = document.querySelector(
      "#clinic-name",
    ) as HTMLInputElement | null;
    if (clinic) clinic.value = currentRecord.clinic ?? "";

    const district = document.querySelector(
      "#district",
    ) as HTMLInputElement | null;
    if (district) district.value = currentRecord.district ?? "";

    const fee = document.querySelector(
      "#consultation-fee",
    ) as HTMLInputElement | null;
    if (fee)
      fee.value =
        currentRecord.fee !== undefined ? String(currentRecord.fee) : "";

    const sTime = document.querySelector(
      "#start-time",
    ) as HTMLInputElement | null;
    if (sTime) sTime.value = currentRecord.startTime ?? "";

    const eTime = document.querySelector(
      "#end-time",
    ) as HTMLInputElement | null;
    if (eTime) eTime.value = currentRecord.endTime ?? "";

    const dur = document.querySelector(
      "#slot-duration",
    ) as HTMLInputElement | null;
    if (dur)
      dur.value =
        currentRecord.slotDuration !== undefined
          ? String(currentRecord.slotDuration)
          : "30";

    const qual = document.querySelector(
      "#qualifications",
    ) as HTMLInputElement | null;
    if (qual) qual.value = currentRecord.qualifications ?? "";

    const reg = document.querySelector(
      "#council-reg",
    ) as HTMLInputElement | null;
    if (reg) reg.value = currentRecord.councilReg ?? "";

    const phone = document.querySelector("#phone") as HTMLInputElement | null;
    if (phone) phone.value = currentRecord.phone ?? "";

    const mail = document.querySelector("#email") as HTMLInputElement | null;
    if (mail) mail.value = currentRecord.email ?? "";

    const addr = document.querySelector(
      "#clinic-address",
    ) as HTMLTextAreaElement | null;
    if (addr) addr.value = currentRecord.address ?? "";

    const submitBtn = document.querySelector(
      "button[type='submit']",
    ) as HTMLButtonElement | null;
    if (submitBtn) {
      submitBtn.textContent = "Save Clinic Changes";
    }
  }
}

// Doctor Registration Engine: Form Submission Handler
if (formSubmit) {
  formSubmit.addEventListener("submit", function (event: SubmitEvent) {
    event.preventDefault();

    // Form Input Extraction: Doctor Details & Clinic Working Hours
    const doctorNameInput = document.querySelector(
      "#doctor-name",
    ) as HTMLInputElement | null;
    const doctorName: string = doctorNameInput?.value.trim() || "";

    const doctorSpecialtyInput = document.querySelector(
      "#specialization",
    ) as HTMLInputElement | null;
    const doctorSpecialty: string = doctorSpecialtyInput?.value.trim() || "";

    const doctorClinicNameInput = document.querySelector(
      "#clinic-name",
    ) as HTMLInputElement | null;
    const doctorClinicName: string = doctorClinicNameInput?.value.trim() || "";

    const doctorDistrictInput = document.querySelector(
      "#district",
    ) as HTMLInputElement | null;
    const doctorDistrict: string = doctorDistrictInput?.value.trim() || "";

    const doctorFeeInput = document.querySelector(
      "#consultation-fee",
    ) as HTMLInputElement | null;
    const doctorFee: string = doctorFeeInput?.value.trim() || "0";

    const doctorQualificationsInput = document.querySelector(
      "#qualifications",
    ) as HTMLInputElement | null;
    const doctorQualifications: string =
      doctorQualificationsInput?.value.trim() || "";

    const doctorCouncilRegInput = document.querySelector(
      "#council-reg",
    ) as HTMLInputElement | null;
    const doctorCouncilReg: string =
      doctorCouncilRegInput?.value.trim() || "";

    const doctorPhoneInput = document.querySelector(
      "#phone",
    ) as HTMLInputElement | null;
    const doctorPhone: string = doctorPhoneInput?.value.trim() || "";

    const doctorEmailInput = document.querySelector(
      "#email",
    ) as HTMLInputElement | null;
    const doctorEmail: string = doctorEmailInput?.value.trim() || "";

    const doctorAddressInput = document.querySelector(
      "#clinic-address",
    ) as HTMLTextAreaElement | null;
    const doctorAddress: string = doctorAddressInput?.value.trim() || "";

    const startTimeInput = document.querySelector(
      "#start-time",
    ) as HTMLInputElement | null;
    const startTime: string = startTimeInput?.value || "";

    const endTimeInput = document.querySelector(
      "#end-time",
    ) as HTMLInputElement | null;
    const endTime: string = endTimeInput?.value || "";

    const slotDurationInput = document.querySelector(
      "#slot-duration",
    ) as HTMLInputElement | null;
    const slotDuration: number = Number(slotDurationInput?.value || 30);

    const passwordInput = document.querySelector(
      "#password",
    ) as HTMLInputElement | null;
    const confirmPasswordInput = document.querySelector(
      "#confirm-password",
    ) as HTMLInputElement | null;
    const doctorPassword: string = passwordInput?.value || "";
    const doctorConfirmPassword: string = confirmPasswordInput?.value || "";

    const errorBox = document.querySelector(
      "#doctor-reg-error",
    ) as HTMLElement | null;

    if (startTime >= endTime) {
      if (errorBox) {
        errorBox.textContent = "Closing time must be after opening time!";
        errorBox.style.display = "block";
      }
      return;
    }

    // Password validation for new registrations
    const isEditing = activeSession && activeSession.role === "doctor";
    if (!isEditing) {
      if (!doctorPassword || doctorPassword.length < 6) {
        if (errorBox) {
          errorBox.textContent = "Password must be at least 6 characters!";
          errorBox.style.display = "block";
        }
        return;
      }
      if (doctorPassword !== doctorConfirmPassword) {
        if (errorBox) {
          errorBox.textContent = "Passwords do not match!";
          errorBox.style.display = "block";
        }
        return;
      }
    } else {
      if (doctorPassword && doctorPassword !== doctorConfirmPassword) {
        if (errorBox) {
          errorBox.textContent = "Passwords do not match!";
          errorBox.style.display = "block";
        }
        return;
      }
    }

    if (errorBox) {
      errorBox.style.display = "none";
    }

    // Doctor Data Modeling: Construct Structured Doctor Object
    const allRecords: Doctor[] = safeGetStorage("clinic_doctors", []);

    if (isEditing) {
      const targetIndex: number = allRecords.findIndex(function (
        record: Doctor,
      ) {
        return record.id === activeSession.id;
      });

      if (targetIndex !== -1 && allRecords[targetIndex]) {
        const existingPassword = allRecords[targetIndex]?.password;
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
          qualifications: doctorQualifications,
          councilReg: doctorCouncilReg,
          phone: doctorPhone,
          email: doctorEmail,
          address: doctorAddress,
          password: doctorPassword || existingPassword,
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
      const newDoctor: Doctor = {
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
        qualifications: doctorQualifications,
        councilReg: doctorCouncilReg,
        phone: doctorPhone,
        email: doctorEmail,
        address: doctorAddress,
        password: doctorPassword,
      };

      // LocalStorage Persistence: Save Doctor Record & Auto-Login
      const doctors: Doctor[] = safeGetStorage("clinic_doctors", []);
      doctors.push(newDoctor);
      safeSetStorage("clinic_doctors", doctors);

      safeSetStorage("current_user", {
        role: "doctor",
        id: newDoctor.id,
        name: newDoctor.name,
        clinic: newDoctor.clinic,
      });

      window.location.href = "dashboard.html";
    }
  });
}
