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
      
 
  
