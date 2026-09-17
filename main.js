const myHeader = document.querySelector(".site-header");
const navMenu = document.querySelector(".nav-menu");

const navToggle = document.querySelector(".nav-toggle-label");

const brandLogo = document.querySelector(".brand-logo");

const navLinks = document.querySelectorAll(".nav-link");

const searchForm = document.querySelector(".search-form");

const searchInput = document.querySelector(".search-form input");

const districtSelect = document.querySelector(".search-form select");

brandLogo.addEventListener("click", function (event) {
  event.preventDefault();
  console.log("Brand Logo was clicked");
});

navToggle.addEventListener("click", function () {
  navMenu.classList.toggle("show");
});

navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.forEach(function (navLinks) {
      navLinks.classList.remove("active");
    });

    link.classList.add("active");

    console.log("Clicked:", link.textContent);
  });
});
// Listener 1: Handles Form Submit.

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  let searchQuery = searchInput.value.trim();
  let district = districtSelect.value;

  if (searchQuery === "") {
    searchInput.placeholder =
      "Please enter doctor's name, specialty or clinic!";
    searchInput.parentElement.classList.add("error");
    searchInput.focus();
  } else {
    console.log(searchQuery);
    console.log(district);
  }
});

// Listener 2: Stands independently outside, listening for typing.

searchInput.addEventListener("input", function () {
  searchInput.parentElement.classList.remove("error");
});
