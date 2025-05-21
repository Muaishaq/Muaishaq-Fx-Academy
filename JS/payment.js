// JS/payment.js

document.addEventListener("DOMContentLoaded", function () {
  const registrationForm = document.getElementById("registrationForm");
  const courseSelect = document.getElementById("course");
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const discountBanner = document.getElementById("discountBanner"); // Assuming this exists for checking discount status

  // --- Configuration ---
  const FLUTTERWAVE_PUBLIC_KEY = "FLWPUBK-9f15aa6a4faa5443499383fe1d6ca2f8-X";
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
        if (response.status === "successful") {
          // Prepare the data to send to Google Apps Script
          const postData = {
            fullName: fullNameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            state: document.getElementById("state").value,
            town: document.getElementById("town").value,
            course: courseSelect.value,
            amount: amount, // This was calculated earlier
            tx_ref: tx_ref, // Already generated before payment
            transaction_id: response.transaction_id, // Returned from Flutterwave
          };

          // Send data to Google Apps Script
          fetch(
            "https://script.google.com/macros/s/AKfycbzRiQUGIlKRDPrzGxqfG54LMfVnIRD2YVOFXvkKiINpd1SdA--1bv7tBmTQnj7RiWxF6Q/exec",
            {
              method: "POST",
              body: JSON.stringify(postData),
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Server returned status ${res.status}`);
              }
              return res.json();
            })
            .then((data) => {
              if (data.status === "success") {
                alert("✅ Payment verified! You’re successfully registered.");
                registrationForm.reset();
              } else {
                alert(
                  "❌ Payment could not be verified. Please contact support."
                );
              }
            })
            .catch((err) => {
              console.error("Fetch error:", err);
              alert("An error occurred while processing your registration.");
            });
        } else {
          alert("Payment Failed! Please try again or contact support.");
        }

        console.log(response); // Log response for debugging
      },
    });
  });
});
