(() => {
  const body = document.body;
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const backdrop = document.querySelector("[data-nav-backdrop]");

  const setMenuOpen = (open) => {
    if (!menuToggle || !nav || !backdrop) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    body.classList.toggle("nav-open", open);
  };

  menuToggle?.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  backdrop?.addEventListener("click", () => setMenuOpen(false));

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  const accordion = document.querySelector("[data-accordion]");

  accordion?.querySelectorAll("details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      accordion.querySelectorAll("details").forEach((otherItem) => {
        if (otherItem !== item) otherItem.open = false;
      });
    });
  });

  const teamGrid = document.querySelector(".team-grid");
  const teamToggle = document.querySelector("[data-team-toggle]");

  teamToggle?.addEventListener("click", () => {
    const expanded = teamGrid?.classList.toggle("is-expanded") ?? false;
    teamToggle.textContent = expanded ? "Show less" : "See all team";
    teamToggle.setAttribute("aria-expanded", String(expanded));
  });

  const carousel = document.querySelector("[data-carousel]");

  if (carousel) {
    const track = carousel.querySelector("[data-carousel-track]");
    const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
    const previousButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const dotsContainer = carousel.querySelector("[data-carousel-dots]");
    let index = 0;
    let pointerStart = null;

    const dots = slides.map((_, dotIndex) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Show testimonial ${dotIndex + 1}`);
      dot.addEventListener("click", () => setIndex(dotIndex));
      dotsContainer?.append(dot);
      return dot;
    });

    const slideStep = () => {
      if (!slides[0] || !track) return 0;
      const trackStyles = window.getComputedStyle(track);
      return slides[0].getBoundingClientRect().width + (Number.parseFloat(trackStyles.gap) || 0);
    };

    const setIndex = (nextIndex) => {
      index = Math.max(0, Math.min(slides.length - 1, nextIndex));
      track.style.transform = `translate3d(${-index * slideStep()}px, 0, 0)`;

      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", String(active));
        dot.tabIndex = active ? 0 : -1;
      });

      previousButton.disabled = index === 0;
      nextButton.disabled = index === slides.length - 1;
    };

    previousButton?.addEventListener("click", () => setIndex(index - 1));
    nextButton?.addEventListener("click", () => setIndex(index + 1));

    carousel.addEventListener("pointerdown", (event) => {
      pointerStart = event.clientX;
    });

    carousel.addEventListener("pointerup", (event) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      if (Math.abs(distance) > 50) setIndex(index + (distance < 0 ? 1 : -1));
      pointerStart = null;
    });

    carousel.addEventListener("pointercancel", () => {
      pointerStart = null;
    });

    window.addEventListener("resize", () => setIndex(index));
    setIndex(0);
  }

  const contactForm = document.querySelector("[data-contact-form]");

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = contactForm.querySelector("[data-form-status]");
    const fields = [
      { name: "email", message: "Enter a valid email address." },
      { name: "message", message: "Tell us a little about what you need." },
    ];
    let firstInvalid = null;

    fields.forEach(({ name, message }) => {
      const input = contactForm.elements[name];
      const field = input.closest(".field");
      const error = contactForm.querySelector(`[data-error-for="${name}"]`);
      const isEmpty = !input.value.trim();
      const invalidEmail = name === "email" && input.value && !input.validity.valid;
      const invalid = isEmpty || invalidEmail;

      field.classList.toggle("is-invalid", invalid);
      input.setAttribute("aria-invalid", String(invalid));
      if (error) error.textContent = invalid ? message : "";
      if (invalid && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      status.textContent = "Please complete the highlighted fields.";
      status.classList.remove("is-success");
      firstInvalid.focus();
      return;
    }

    status.textContent = "Thanks — your message is ready for our team. We’ll be in touch shortly.";
    status.classList.add("is-success");
    contactForm.reset();
  });

  const newsletter = document.querySelector("[data-newsletter-form]");

  newsletter?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = newsletter.elements.email;
    const status = newsletter.querySelector("[data-newsletter-status]");

    if (!input.validity.valid) {
      status.textContent = "Enter a valid email.";
      input.focus();
      return;
    }

    status.textContent = "You’re subscribed.";
    newsletter.reset();
  });
})();
