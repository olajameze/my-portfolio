document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    const closeMobileMenu = () => {
      mobileMenu.classList.add("hidden");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    };

    mobileMenuBtn.addEventListener("click", () => {
      const isHidden = mobileMenu.classList.toggle("hidden");
      mobileMenuBtn.setAttribute("aria-expanded", String(!isHidden));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) closeMobileMenu();
    });
  }

  const modal = document.getElementById("terms-modal");
  const openBtn = document.getElementById("open-terms");
  const closeBtn = document.getElementById("close-terms");
  const closeBtnSecondary = document.getElementById("close-terms-btn");

  function openModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  if (openBtn) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }

  [closeBtn, closeBtnSecondary].forEach((btn) => {
    if (btn) btn.addEventListener("click", closeModal);
  });

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  const form = document.querySelector("form");
  if (!form) return;

  const button = form.querySelector("button");
  const btnSpinner = document.getElementById("submit-spinner");
  const btnText = document.getElementById("submit-text");
  const successMessage = document.getElementById("form-success");
  const progressBar = document.getElementById("progress-bar");

  const tierSelect = document.getElementById("serviceTier");
  const honeypot = document.querySelector("#website");
  const defaultButtonText = button ? button.innerText : "Send Project Request";
  let isProcessing = false;

// Map tiers to Stripe payment links
const depositLinks = {
    "Starter Website": "https://buy.stripe.com/28E4gy42Sgtp4Pi8vK5Vu00",
    "Web App": "https://buy.stripe.com/00w28q1UK0urgy0bHW5Vu01",
    "Advanced Systems": "https://buy.stripe.com/bJedR8gPE0ur81u8vK5Vu02"
};

// Deposit amounts for display
const depositAmounts = {
    "Starter Website": "£200",
    "Web App": "£340",
    "Advanced Systems": "£500"
};

  if (tierSelect && button) {
    tierSelect.addEventListener("change", function() {
        if (successMessage) successMessage.classList.add("hidden");
        const selected = this.value;
        const newText = selected && depositLinks[selected] 
            ? `Send Request & Pay Deposit (${depositAmounts[selected]})`
            : defaultButtonText;
        
        if (btnText) btnText.innerText = newText;
        else button.innerText = newText;
    });
  }

  // Navigation Guard: Warn user before leaving if processing
  window.addEventListener("beforeunload", (e) => {
    if (isProcessing) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (honeypot && honeypot.value) return;
    if (!button) return;

    button.disabled = true;
    isProcessing = true;
    if (progressBar) progressBar.style.width = "30%";

    if (btnSpinner) btnSpinner.classList.remove("hidden");
    if (btnText) btnText.innerText = "Sending...";
    if (successMessage) successMessage.classList.add("hidden");

    const name = document.querySelector("#name")?.value.trim() || "";
    const email = document.querySelector("#email")?.value.trim() || "";
    const message = document.querySelector("#message")?.value.trim() || "";
    const serviceTier = tierSelect?.value || "";

    try {
      if (progressBar) progressBar.style.width = "60%";

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ NEW: Include serviceTier in the payload
        body: JSON.stringify({ name, email, message, serviceTier, website: honeypot?.value || "" }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        if (progressBar) progressBar.style.width = "100%";
        form.reset();
        
        if (btnSpinner) btnSpinner.classList.add("hidden");
        if (btnText) btnText.innerText = "Sent ✔";
        
        if (successMessage) successMessage.classList.remove("hidden");

        if (serviceTier && depositLinks[serviceTier]) {
            // Redirect to Stripe checkout after a successful form submission
            setTimeout(() => {
                isProcessing = false; // Release guard before redirect
                window.location.href = depositLinks[serviceTier];
            }, 1500);
        } else {
            setTimeout(() => {
              if (btnText) btnText.innerText = defaultButtonText;
              button.disabled = false;
              isProcessing = false;
              if (progressBar) progressBar.style.width = "0%";
            }, 2000);
        }
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      isProcessing = false;
      if (progressBar) progressBar.style.width = "0%";
      if (btnSpinner) btnSpinner.classList.add("hidden");
      if (btnText) btnText.innerText = "Error ❌";

      setTimeout(() => {
        if (btnText) btnText.innerText = defaultButtonText;
        button.disabled = false;
      }, 2000);
    }
  });

  // Project Carousel Navigation
  const carousel = document.getElementById("project-carousel");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const dotContainer = document.getElementById("carousel-dots");
  const dots = dotContainer?.querySelectorAll("button");

  if (carousel && prevBtn && nextBtn) {
    let autoPlayInterval;

    const getScrollStep = () => {
      const item = carousel.querySelector("article");
      return item ? item.offsetWidth + 24 : carousel.offsetWidth; // 24px matches gap-6
    };

    const startAutoPlay = () => {
      autoPlayInterval = setInterval(() => {
        const isAtEnd = carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 10);
        if (isAtEnd) {
          carousel.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carousel.scrollBy({ left: getScrollStep(), behavior: "smooth" });
        }
      }, 4000);
    };

    const stopAutoPlay = () => clearInterval(autoPlayInterval);

    // Auto-play control: Pause on hover
    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);

    startAutoPlay();

    nextBtn.addEventListener("click", () => {
      stopAutoPlay();
      carousel.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    });

    prevBtn.addEventListener("click", () => {
      stopAutoPlay();
      carousel.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    });

    const updateNavigationUI = () => {
      const scrollLeft = carousel.scrollLeft;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;

      // Disable arrows at ends
      prevBtn.disabled = scrollLeft <= 5;
      nextBtn.disabled = scrollLeft >= maxScroll - 5;

      // Update Dots
      if (dots) {
        const activeIndex = Math.round(scrollLeft / getScrollStep());
        dots.forEach((dot, i) => {
          const isActive = i === activeIndex;
          dot.classList.toggle("bg-primary", isActive);
          dot.classList.toggle("w-6", isActive);
          dot.classList.toggle("bg-slate-200", !isActive);
          dot.classList.toggle("w-2.5", !isActive);
        });
      }
    };

    carousel.addEventListener("scroll", updateNavigationUI);
    window.addEventListener("resize", updateNavigationUI);
    updateNavigationUI();

    dots?.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        stopAutoPlay();
        carousel.scrollTo({ left: i * getScrollStep(), behavior: "smooth" });
      });
    });
  }

  // Testimonial slideshow
  const testimonialContainer = document.getElementById('testimonial-slider');
  const testimonialSlides = testimonialContainer ? testimonialContainer.querySelectorAll('.testimonial-slide') : null;
  const testimonialDotsContainer = document.getElementById('testimonial-dots');
  const tPrev = document.getElementById('testimonial-prev');
  const tNext = document.getElementById('testimonial-next');

  if (testimonialContainer && testimonialSlides && testimonialSlides.length) {
    let tIndex = 0;
    const tCount = testimonialSlides.length;
    const tDots = [];
    let tInterval = null;

    const showTestimonial = (idx) => {
      testimonialSlides.forEach((s, i) => {
        const isActive = i === idx;
        s.classList.toggle('opacity-0', !isActive);
        s.classList.toggle('opacity-100', isActive);
        s.classList.toggle('pointer-events-none', !isActive);
        s.setAttribute('aria-hidden', String(!isActive));
        s.setAttribute('aria-label', `${i + 1} of ${tCount}`);
      });

      tDots.forEach((d, i) => {
        d.classList.toggle('bg-primary', i === idx);
        d.classList.toggle('bg-slate-200', i !== idx);
        d.classList.toggle('w-6', i === idx);
        d.classList.toggle('w-2.5', i !== idx);
      });
    };

    if (testimonialDotsContainer) {
      testimonialSlides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = i === 0 ? 'w-6 h-2.5 rounded-full bg-primary transition-all duration-300' : 'w-2.5 h-2.5 rounded-full bg-slate-200 transition-all duration-300';
        btn.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        btn.addEventListener('click', () => {
          stopT();
          tIndex = i;
          showTestimonial(tIndex);
          startT();
        });
        testimonialDotsContainer.appendChild(btn);
        tDots.push(btn);
      });
    }

    const startT = () => {
      stopT();
      tInterval = setInterval(() => {
        tIndex = (tIndex + 1) % tCount;
        showTestimonial(tIndex);
      }, 6000);
    };

    const stopT = () => {
      if (tInterval) {
        clearInterval(tInterval);
        tInterval = null;
      }
    };

    showTestimonial(0);

    // Make testimonial region keyboard-focusable and support arrow navigation
    try {
      testimonialContainer.tabIndex = 0;
      testimonialContainer.setAttribute('role', 'region');
      testimonialContainer.setAttribute('aria-roledescription', 'carousel');
      testimonialContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          tPrev?.click();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          tNext?.click();
        }
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          if (tInterval) stopT(); else startT();
        }
      });
    } catch (err) {
      // ignore if setting attributes fails in some environments
    }

    testimonialContainer.addEventListener('mouseenter', stopT);
    testimonialContainer.addEventListener('mouseleave', startT);

    tNext?.addEventListener('click', () => {
      stopT();
      tIndex = (tIndex + 1) % tCount;
      showTestimonial(tIndex);
    });

    tPrev?.addEventListener('click', () => {
      stopT();
      tIndex = (tIndex - 1 + tCount) % tCount;
      showTestimonial(tIndex);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopT(); else startT();
    });

    startT();
  }

});