/* =========================================================
   IPL 2026 Ticket Booking - app.js
   Activity 5: JavaScript Basics and User Interaction
   ========================================================= */


/* ---------------------------------------------------------
   1. SELECT ELEMENTS (DOM)
   --------------------------------------------------------- */
const bookingForm = document.getElementById("booking-form");
const matchSelect = document.getElementById("match");
const bookButtons = document.querySelectorAll(".btn-book");

// One container holds all toasts. It is created once, when the page loads.
const toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
toastContainer.setAttribute("role", "status"); // screen readers announce new messages
document.body.appendChild(toastContainer);


/* ---------------------------------------------------------
   2. REUSABLE TOAST NOTIFICATION
   message  : text to display
   type     : "success", "info" or "error"
   duration : time on screen in milliseconds
   --------------------------------------------------------- */
function showToast(message, type = "success", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Wait, play the fade-out effect, then remove the toast from the page
  setTimeout(() => {
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 300); // 300ms matches the CSS transition
  }, duration);
}


/* ---------------------------------------------------------
   3. SMOOTH SCROLL: "Book" button -> booking form
   --------------------------------------------------------- */
bookButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    // If this page has no booking form, let the link work normally
    if (!bookingForm) return;

    event.preventDefault(); // stop the instant default link action
    bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });

    // Pre-select the clicked match in the dropdown
    const matchNumber = button.dataset.match;              // from data-match="1"
    const teams = button.closest("tr").dataset.teams;      // from data-teams="CSK MI"
    matchSelect.value = matchNumber;

    // Move keyboard focus to the form without interrupting the scroll
    matchSelect.focus({ preventScroll: true });

    showToast(`Match ${matchNumber} (${teams.replace(" ", " vs ")}) selected. Complete the form to book.`);
  });
});


/* ---------------------------------------------------------
   4. REUSING THE TOAST: "Clear Form" button
   --------------------------------------------------------- */
if (bookingForm) {
  bookingForm.addEventListener("reset", () => {
    showToast("Booking form cleared.", "info");
  });
}
