const queryParams = new URLSearchParams(window.location.search)

const doctorId = queryParams.get("id")

console.log("Doctor ID from URL:", doctorId)