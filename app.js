/* =========================================================
   IPL 2026 Ticket Booking - app.js
   Activity 5: JavaScript Basics and User Interaction
   Activity 7: Form Selectors and Live Booking Summary
   Activity 8: Hamburger Menu, Team Filter, Grid/List View
   ========================================================= */


/* ---------------------------------------------------------
   1. SELECT ELEMENTS (DOM)
   --------------------------------------------------------- */
const bookingForm = document.getElementById("booking-form");
const matchSelect = document.getElementById("match");
const bookButtons = document.querySelectorAll(".btn-book");

// Booking form controls (Activity 7)
const standSelect = document.getElementById("stand");
const ticketsInput = document.getElementById("tickets");

// Booking Summary Card fields
const summaryMatch = document.getElementById("summary-match");
const summaryDateTime = document.getElementById("summary-datetime");
const summaryVenue = document.getElementById("summary-venue");
const summaryStand = document.getElementById("summary-stand");
const summaryPrice = document.getElementById("summary-price");
const summaryQty = document.getElementById("summary-qty");
const summaryTotal = document.querySelector("#summary-total strong");

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
  toastContainer.replaceChildren(); // show only the latest message

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
    const teams = button.closest(".match-card").dataset.teams; // from data-teams="CSK MI"
    matchSelect.value = matchNumber;
    updateSummary(); // setting a value in code does not fire "change"

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
    // "reset" fires BEFORE the fields are cleared, so update just after it
    setTimeout(updateSummary, 0);
    showToast("Booking form cleared.", "info");
  });
}


/* ---------------------------------------------------------
   5. LIVE BOOKING SUMMARY (Activity 7)
   --------------------------------------------------------- */
// 1500 -> "₹1,500"
function formatRupees(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// Reads the form, calculates the total and fills the summary card
function updateSummary() {
  const matchNumber = matchSelect.value; // "" until a match is chosen
  const stand = standSelect.value;       // "" until a stand is chosen

  // Valid means a whole number within the input's min (1) and max (10)
  const isValidQty = ticketsInput.validity.valid;
  const quantity = isValidQty ? Number(ticketsInput.value) : 0;

  // Match details and prices come from the match card
  let card = null;
  if (matchNumber) {
    card = document.querySelector(`.match-card[data-match="${matchNumber}"]`);
  }

  let price = 0;
  if (card && stand) {
    const priceText = card.querySelector(`[data-stand="${stand}"]`).textContent; // "₹1,500"
    price = Number(priceText.replace(/[^0-9]/g, ""));                           // 1500
  }

  const total = price * quantity;

  // textContent updates the page without reloading it
  summaryMatch.textContent = card ? card.querySelector(".match-teams").textContent.trim() : "Not selected";
  summaryDateTime.textContent = card ? card.querySelector(".match-date").textContent.trim() : "-";
  summaryVenue.textContent = card ? card.querySelector(".match-venue").textContent.trim() : "-";
  summaryStand.textContent = stand || "Not selected";
  summaryPrice.textContent = formatRupees(price);
  summaryQty.textContent = quantity;
  summaryTotal.textContent = formatRupees(total);

  // Send the results back so the caller can choose a toast message
  return { isValidQty, isComplete: Boolean(card && stand && isValidQty), total };
}

// Runs when the user changes the match, stand or quantity
function handleSelectionChange() {
  const result = updateSummary();

  if (!result.isValidQty) {
    showToast("Enter a whole number of tickets from 1 to 10.", "error");
  } else if (result.isComplete) {
    showToast(`Summary updated. Total: ${formatRupees(result.total)}`);
  } else {
    showToast("Summary updated. Select a match and stand to see the total.", "info");
  }
}

if (bookingForm) {
  [matchSelect, standSelect, ticketsInput].forEach((control) => {
    control.addEventListener("change", handleSelectionChange);
  });

  // "input" fires on every keystroke, so the total changes while typing.
  // No toast here, to avoid a popup for each key.
  ticketsInput.addEventListener("input", updateSummary);

  // Show the form's starting values when the page loads
  updateSummary();
}


/* ---------------------------------------------------------
   6. HAMBURGER MENU (Activity 8)
   --------------------------------------------------------- */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("nav-links");

// Opens or closes the menu by adding or removing the "open" class
function setMenu(isOpen) {
  navLinks.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

navToggle.addEventListener("click", () => {
  setMenu(!navLinks.classList.contains("open"));
});

// Close the menu after a link is chosen
navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

// Close the menu with the Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navLinks.classList.contains("open")) {
    setMenu(false);
    navToggle.focus();
  }
});

// Reset the menu if the window is widened to desktop size
window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});


/* ---------------------------------------------------------
   7. FILTER MATCH CARDS BY TEAM (Activity 8)
   --------------------------------------------------------- */
const teamFilter = document.getElementById("team-filter");
const matchCards = document.querySelectorAll(".match-card");
const matchCount = document.getElementById("match-count");

function filterMatches() {
  const selectedTeam = teamFilter.value; // "all", "CSK", "MI", ...
  let visibleCount = 0;

  matchCards.forEach((card) => {
    const teams = card.dataset.teams.split(" "); // "CSK MI" -> ["CSK", "MI"]
    const isMatch = selectedTeam === "all" || teams.includes(selectedTeam);

    card.hidden = !isMatch;
    if (isMatch) visibleCount++;
  });

  matchCount.textContent = `Showing ${visibleCount} of ${matchCards.length} matches`;
}

teamFilter.addEventListener("change", filterMatches);
filterMatches(); // the browser may remember the dropdown value after a reload


/* ---------------------------------------------------------
   8. GRID / LIST VIEW TOGGLE (Activity 8)
   --------------------------------------------------------- */
const matchGrid = document.getElementById("match-grid");
const viewToggle = document.getElementById("view-toggle");

viewToggle.addEventListener("click", () => {
  // toggle() returns true when the class has just been added
  const isListView = matchGrid.classList.toggle("list-view");
  viewToggle.textContent = isListView ? "Switch to Grid View" : "Switch to List View";
});
