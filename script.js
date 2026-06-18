const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

if (header && !header.classList.contains("site-header--solid")) {
  window.addEventListener(
    "scroll",
    () => header.classList.toggle("is-fixed", window.scrollY > 500),
    { passive: true },
  );
}

if (menuToggle && mobileMenu) {
  const closeMenu = () => {
    menuToggle.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.inert = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("is-open");
    mobileMenu.classList.toggle("is-open", isOpen);
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    mobileMenu.inert = !isOpen;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", isOpen);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const bookingForm = document.querySelector("[data-booking-form]");
const bookingModal = document.querySelector("[data-booking-modal]");

if (bookingForm && bookingModal) {
  let bookingTrigger = null;
  const pageRegions = [
    document.querySelector(".site-header"),
    document.querySelector("main"),
    document.querySelector(".site-footer"),
    document.querySelector(".demo-badge"),
  ].filter(Boolean);

  const today = new Date();
  const tomorrow = new Date(today);
  const nextWeek = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  nextWeek.setDate(today.getDate() + 5);

  const formatValue = (date) => {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
  };

  const checkin = bookingForm.elements.checkin;
  const checkout = bookingForm.elements.checkout;
  checkin.min = formatValue(today);
  checkin.value = formatValue(tomorrow);
  checkout.min = formatValue(tomorrow);
  checkout.value = formatValue(nextWeek);

  checkin.addEventListener("change", () => {
    const nextDay = new Date(`${checkin.value}T12:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    checkout.min = formatValue(nextDay);
    if (!checkout.value || checkout.value <= checkin.value) checkout.value = formatValue(nextDay);
  });

  const openBooking = (cabin, trigger) => {
    bookingTrigger = trigger;
    bookingModal.querySelector("[data-booking-cabin]").textContent = cabin;
    const submitButton = bookingModal.querySelector("[data-external-booking]");
    submitButton.innerHTML = "Preview external handoff <span>↗</span>";
    submitButton.disabled = false;
    bookingModal.querySelector("[data-booking-status]").textContent = "";
    bookingModal.inert = false;
    bookingModal.classList.add("is-open");
    bookingModal.setAttribute("aria-hidden", "false");
    pageRegions.forEach((region) => { region.inert = true; });
    document.body.classList.add("modal-open");
    bookingModal.querySelector("[data-close-booking]").focus();
  };

  const closeBooking = () => {
    bookingModal.classList.remove("is-open");
    bookingModal.setAttribute("aria-hidden", "true");
    bookingModal.inert = true;
    pageRegions.forEach((region) => { region.inert = false; });
    document.body.classList.remove("modal-open");
    bookingTrigger?.focus();
  };

  document.querySelectorAll("[data-book]").forEach((button) => {
    button.addEventListener("click", () => openBooking(button.dataset.book, button));
  });

  bookingModal.querySelectorAll("[data-close-booking]").forEach((button) => {
    button.addEventListener("click", closeBooking);
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = bookingModal.querySelector("[data-external-booking]");
    button.innerHTML = "Demo complete — no booking created";
    button.disabled = true;
    bookingModal.querySelector("[data-booking-status]").textContent =
      "Demo complete. No booking was created.";
    bookingModal.querySelector("[data-close-booking]").focus();
  });

  document.addEventListener("keydown", (event) => {
    if (!bookingModal.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeBooking();
      return;
    }

    if (event.key === "Tab") {
      const focusable = [...bookingModal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hidden);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}
