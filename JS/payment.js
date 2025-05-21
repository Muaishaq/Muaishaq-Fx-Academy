// JS/payment.js

document.addEventListener("DOMContentLoaded", function () {
  const registrationForm = document.getElementById("registrationForm");
  const courseSelect = document.getElementById("course");
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const discountBanner = document.getElementById("discountBanner"); // Assuming this exists for checking discount status

  // --- Configuration ---
  const FLUTTERWAVE_PUBLIC_KEY =
    "FLWPUBK_TEST-048e59700701a459a784e8eca4658065-X";
  const DISCOUNT_AMOUNT = 1500; // The discount value in NGN

  // Function to check if the discount is currently active
  // This assumes your countdown logic correctly hides/shows the banner or a flag
  // For simplicity, we'll check if the banner is visible (you might have a more robust JS way)
  function isDiscountActive() {
    // You might have a global JS variable set by your countdown script
    // For now, let's assume the banner's display style indicates activity
    const countdownTimerSpan = document.getElementById("countdownTimer");
    return countdownTimerSpan && countdownTimerSpan.textContent !== "Expired!"; // Or however your countdown indicates expiry
  }

  // Function to get course price
  function getCoursePrice(courseValue) {
    switch (courseValue) {
      case "Beginner":
        return 10000;
      case "Intermediate":
        return 15000;
      case "Advanced":
        return 25000;
      case "Full Course":
        return 50000;
      default:
        return 0;
    }
  }

  registrationForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Basic client-side validation (HTML5 'required' helps a lot)
    if (!registrationForm.checkValidity()) {
      // If the browser's built-in validation fails, show a message
      alert("Please fill out all required fields correctly.");
      return;
    }

    // Gather form data
    const fullName = fullNameInput.value;
    const email = emailInput.value;
    const phone = phoneInput.value;
    const selectedCourse = courseSelect.value;
    const state = document.getElementById("state").value;
    const town = document.getElementById("town").value;

    // Calculate actual amount
    let amount = getCoursePrice(selectedCourse);
    if (amount > 0 && isDiscountActive()) {
      amount -= DISCOUNT_AMOUNT; // Apply discount
      if (amount < 0) amount = 0; // Ensure amount doesn't go negative
    }

    if (amount <= 0) {
      alert("Please select a valid course or the calculated amount is zero.");
      return;
    }

    // Generate a unique transaction reference
    // In a real application, this should be generated on the server to ensure uniqueness
    const tx_ref =
      "Muaishaq_" + Date.now() + Math.random().toString(36).substring(2, 15);

    // Initiate Flutterwave Payment

    FlutterwaveCheckout({
      public_key: FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: tx_ref,
      amount: amount,
      currency: "NGN",
      payment_options: "card,mobilemoney,ussd",
      customer: {
        email: email,
        phone_number: phone,
        name: fullName,
      },

      customizations: {
        title: "Muaishaq Forex Academy Registration",
        description: `Payment for ${selectedCourse} Course`,
        logo: "https://www.google.com/s2/favicons?domain=flutterwave.com", // You can put your own logo URL here
      },
      callback: function (response) {
        // This function is called after a payment is completed or failed
        if (response.status === "successful") {
          alert(
            "Payment Successful! Your transaction reference is: " +
              response.transaction_id
          );
          // TODO: Here, you would typically send the payment details to your backend
          // to verify the payment and complete the registration process.
          // Since no backend, we'll just display a success message for now.
          registrationForm.reset(); // Clear the form
        } else {
          alert("Payment Failed! Please try again or contact support.");
          // TODO: Handle failed payment (e.g., log error, prompt user to retry)
        }
        console.log(response); // Log the full response for debugging
      },
      onclose: function () {
        // User closed the modal without completing payment
        console.log("Payment modal closed");
        // You might want to display a message or log this event
      },
    });
  });
});
