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

  const form = document.getElementById("contact-form");
  if (!form) return;

  const button = form.querySelector("button");
  const btnSpinner = document.getElementById("submit-spinner");
  const btnText = document.getElementById("submit-text");
  const successMessage = document.getElementById("form-success");
  const formError = document.getElementById("form-error");
  const progressBar = document.getElementById("progress-bar");

  const tierSelect = document.getElementById("serviceTier");
  const honeypot = document.querySelector("#website");
  const imageInput = document.getElementById("referenceImages");
  const imageSelection = document.getElementById("image-selection");
  const imageError = document.getElementById("image-error");
  const maxImageCount = 5;
  const maxImageBytes = 3 * 1024 * 1024;
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

  const validateImages = (files) => {
    if (files.length > maxImageCount) return `Choose no more than ${maxImageCount} images.`;
    if (files.some((file) => !["image/jpeg", "image/png"].includes(file.type))) {
      return "Choose JPEG or PNG images only.";
    }

    const totalBytes = files.reduce((total, file) => total + file.size, 0);
    if (totalBytes > maxImageBytes) return "Your images are over 3 MB combined. Remove some files or email the rest separately.";
    return "";
  };

  if (imageInput) {
    imageInput.addEventListener("change", () => {
      const files = Array.from(imageInput.files || []);
      const error = validateImages(files);

      imageInput.setCustomValidity(error);
      if (imageError) {
        imageError.textContent = error;
        imageError.classList.toggle("hidden", !error);
      }
      if (imageSelection) {
        imageSelection.textContent = files.length
          ? `${files.length} image${files.length === 1 ? "" : "s"} selected: ${files.map((file) => file.name).join(", ")}`
          : "No images selected.";
      }
    });
  }

  const encodeImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const separator = result.indexOf(",");
      if (separator < 0) {
        reject(new Error("The selected image could not be read."));
        return;
      }

      resolve({
        filename: file.name,
        contentType: file.type,
        content: result.slice(separator + 1),
      });
    };
    reader.onerror = () => reject(reader.error || new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });

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

    const imageFiles = Array.from(imageInput?.files || []);
    const imageValidationError = validateImages(imageFiles);
    if (imageValidationError) {
      if (imageInput) {
        imageInput.setCustomValidity(imageValidationError);
        imageInput.reportValidity();
      }
      if (imageError) {
        imageError.textContent = imageValidationError;
        imageError.classList.remove("hidden");
      }
      return;
    }

    button.disabled = true;
    isProcessing = true;
    if (progressBar) progressBar.style.width = "30%";

    if (btnSpinner) btnSpinner.classList.remove("hidden");
    if (btnText) btnText.innerText = "Sending...";
    if (successMessage) successMessage.classList.add("hidden");
    if (formError) formError.classList.add("hidden");

    const name = document.querySelector("#name")?.value.trim() || "";
    const email = document.querySelector("#email")?.value.trim() || "";
    const message = document.querySelector("#message")?.value.trim() || "";
    const serviceTier = tierSelect?.value || "";
    const businessName = document.querySelector("#businessName")?.value.trim() || "";
    const businessInfo = document.querySelector("#businessInfo")?.value.trim() || "";
    const currentWebsite = document.querySelector("#currentWebsite")?.value.trim() || "";
    const brandColors = document.querySelector("#brandColors")?.value.trim() || "";

    try {
      if (progressBar) progressBar.style.width = "60%";
      const attachments = await Promise.all(imageFiles.map(encodeImage));

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          serviceTier,
          businessName,
          businessInfo,
          currentWebsite,
          brandColors,
          attachments,
          website: honeypot?.value || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = res.status === 400 && typeof data.message === "string"
          ? data.message
          : `Server responded with ${res.status}`;
        throw new Error(message);
      }

      if (data.success) {
        if (progressBar) progressBar.style.width = "100%";
        form.reset();
        if (imageInput) imageInput.setCustomValidity("");
        if (imageSelection) imageSelection.textContent = "No images selected.";
        if (imageError) imageError.classList.add("hidden");
        
        if (btnSpinner) btnSpinner.classList.add("hidden");
        if (btnText) btnText.innerText = "Request sent";
        
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
      console.error("Project request could not be sent:", err);
      isProcessing = false;
      if (progressBar) progressBar.style.width = "0%";
      if (btnSpinner) btnSpinner.classList.add("hidden");
      if (btnText) btnText.innerText = "Could not send";
      if (formError) {
        const reason = err instanceof Error ? err.message : "An unexpected error occurred.";
        formError.textContent = `${reason} Please try again or email olajameze.jg@googlemail.com.`;
        formError.classList.remove("hidden");
      }

      setTimeout(() => {
        if (btnText) btnText.innerText = defaultButtonText;
        button.disabled = false;
      }, 2000);
    }
  });

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