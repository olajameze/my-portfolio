/*jshint esversion: 6 */

document.addEventListener('DOMContentLoaded', function() {
        const header = document.getElementById('header');
        const toggle = document.getElementById('toggle');
        const navbar = document.getElementById('navbar');
      
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
      
        // Initialize AOS
        AOS.init();
      
        // Trigger AOS after dynamic content is loaded
        window.addEventListener('load', function() {
          AOS.refresh();
        });
      });
      
 
  
