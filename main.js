const myHeader = document.querySelector(".site-header");
const navMenu = document.querySelector(".nav-menu");

const navToggle = document.querySelector(".nav-toggle-label");

const brandLogo = document.querySelector(".brand-logo");

const navLinks = document.querySelectorAll(".nav-link");

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
