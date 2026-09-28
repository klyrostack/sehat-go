const form = document.querySelector("form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const isDoctor = document.querySelector("#role-doctor").checked;

  const userName = document.querySelector("#login-identifier").value.trim();

  const userPassword = document.querySelector("#login-password").value.trim();

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
        
      alert("Doctor account not found! Check your name or register first.");
    }
  } else {
    const sessionUser = { role: "patient", name: userName };

    localStorage.setItem("current_user", JSON.stringify(sessionUser));
    window.location.href = "index.html";
  }
});
