/*jshint esversion: 6 */

document.addEventListener('DOMContentLoaded', function() {
        const header = document.getElementById('header');
        const toggle = document.getElementById('toggle');
        const navbar = document.getElementById('navbar');
        const navLinks = navbar.querySelectorAll('a');
      
        toggle.addEventListener('click', function() {
          toggle.classList.toggle('active');
          navbar.classList.toggle('active');
        });
      
        document.onclick = function(e) {
          if (e.target.id !== 'toggle' && !navbar.contains(e.target)) {
            toggle.classList.remove('active');
            navbar.classList.remove('active');
          }
        };
      
        // Close menu when clicking on a link (mobile)
        navLinks.forEach(link => {
          link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
              toggle.classList.remove('active');
              navbar.classList.remove('active');

         // In form-validation.js
         contactForm.addEventListener('submit', function(e) {
             if (!validateForm()) {
                 e.preventDefault(); // Only prevent submission if validation Fails
             } else {
                 // If validation passes, the form will submit using its HTML action (mailto)
                 // You might still want to show a generic "Your email client should open..." message
                 // The current success message logic might be misleading as it implies direct sending.
                 contactForm.classList.add('hidden'); // Hide form
                 successMessage.textContent = "Your email client should open shortly to send your message."; // Adjust message
                 successMessage.classList.remove('hidden'); // Show message
         
                 // Optional: Reset form after a delay, but be mindful that the user is now interacting with their email client
                 setTimeout(() => {
                     contactForm.reset();
                     clearErrors(); // Add a function to clear previous error messages
                     contactForm.classList.remove('hidden');
                     successMessage.classList.add('hidden');
                 }, 7000); // Longer delay
             }
         });
         // In form-validation.js, inside the submit event listener, if validateForm() is true:
         // e.preventDefault(); // Keep this to handle submission with fetch
         
         const formData = new FormData(contactForm);
         fetch(contactForm.action, { // contactForm.action would be your Formspree URL
             method: 'POST',
             body: formData,
             headers: {
                 'Accept': 'application/json'
             }
         }).then(response => {
             if (response.ok) {
                 contactForm.classList.add('hidden');
                 successMessage.textContent = "Thank you for your message! I'll get back to you soon.";
                 successMessage.classList.remove('hidden');
                 contactForm.reset();
                 clearErrors();
                 setTimeout(() => {
                     contactForm.classList.remove('hidden');
                     successMessage.classList.add('hidden');
                 }, 5000);
             } else {
                 response.json().then(data => {
                     // Handle errors from Formspree, e.g., display data.error
                     showError('termsError', data.error || 'Oops! There was a problem submitting your form.');
                 });
             }
         }).catch(error => {
             showError('termsError', 'Oops! There was a problem submitting your form.');
         });
         
         
         function clearErrors() {
             const elements = ['nameError', 'emailError', 'messageError', 'termsError'];
             elements.forEach(id => {
                 const element = document.getElementById(id);
                 if (element) {
                     element.style.display = 'none';
                 }
             });
         }
            }
          });
        });
      
        // Handle resize events
        window.addEventListener('resize', function() {
          if (window.innerWidth > 768) {
            navbar.classList.remove('active');
            toggle.classList.remove('active');
          }
        });
      
        // Initialize AOS with responsive settings
        AOS.init({
          disable: 'mobile', // Disable animations on mobile
          once: true, // Only animate once
          duration: 800,
          offset: 100
        });
      
        // Trigger AOS after dynamic content is loaded
        window.addEventListener('load', function() {
          AOS.refresh();
        });
      });
      
 
  
