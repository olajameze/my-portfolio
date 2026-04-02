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
  const honeypot = document.querySelector("#website");
  const defaultButtonText = button ? button.innerText : "Send Message";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (honeypot && honeypot.value) return;
    if (!button) return;

    button.disabled = true;
    button.innerText = "Sending...";

    const name = document.querySelector("#name")?.value.trim() || "";
    const email = document.querySelector("#email")?.value.trim() || "";
    const message = document.querySelector("#message")?.value.trim() || "";
    // ✅ NEW: Get selected service tier
    const serviceTier = document.querySelector("#serviceTier")?.value || "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ NEW: Include serviceTier in the payload
        body: JSON.stringify({ name, email, message, serviceTier, website: honeypot?.value || "" }),
      });

      const data = await res.json();

      if (data.success) {
        form.reset();
        button.innerText = "Sent ✔";

        setTimeout(() => {
          button.innerText = defaultButtonText;
          button.disabled = false;
        }, 2000);
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      button.innerText = "Error ❌";
      setTimeout(() => {
        button.innerText = defaultButtonText;
        button.disabled = false;
      }, 2000);
    }
  });
});