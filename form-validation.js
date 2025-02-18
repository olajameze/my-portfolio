document.addEventListener('DOMContentLoaded', function() {
    // Form validation
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            // Show success message
            contactForm.classList.add('hidden');
            successMessage.classList.remove('hidden');
            
            // Reset form after 5 seconds
            setTimeout(() => {
                contactForm.reset();
                contactForm.classList.remove('hidden');
                successMessage.classList.add('hidden');
            }, 5000);
        }
    });

    function validateForm() {
        let isValid = true;
        
        // Name validation
        const name = document.querySelector('.name').value;
        if (!name.trim()) {
            showError('nameError', 'Name is required');
            isValid = false;
        }

        // Email validation
        const email = document.querySelector('.email').value;
        if (!isValidEmail(email)) {
            showError('emailError', 'Please enter a valid email');
            isValid = false;
        }

        // Message validation
        const message = document.querySelector('.message').value;
        if (!message.trim()) {
            showError('messageError', 'Message is required');
            isValid = false;
        }

        // Terms validation
        const terms = document.querySelector('.termsConditions').checked;
        if (!terms) {
            showError('termsError', 'Please accept the terms');
            isValid = false;
        }

        return isValid;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}); 