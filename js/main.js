/**
 * Initializes the landing page interactions after the document is ready.
 * @returns {void}
 */
const init = () => {
  initMobileMenu();
  initAccordion();
  initPricingToggle();
  initHeaderShadow();
  initSignupForm();
  initPlanSelection();
  setFooterYear();
};

/**
 * Adds accessible open, close, link-click, and Escape behavior to mobile navigation.
 * @returns {void}
 */
const initMobileMenu = () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector("#primary-nav");

  if (!menuToggle || !primaryNav) {
    return;
  }

  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    primaryNav.classList.toggle("is-open", !isOpen);
  });

  const siteHeader = menuToggle.closest(".site-header");
  siteHeader?.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
};

/**
 * Sets up a single-open FAQ accordion with animated panel heights.
 * @returns {void}
 */
const initAccordion = () => {
  const questions = document.querySelectorAll(".faq-question");

  const setPanelExpanded = (question, panel, expanded) => {
    question.setAttribute("aria-expanded", String(expanded));

    if (expanded) {
      panel.hidden = false;
      panel.style.height = "0px";
      requestAnimationFrame(() => {
        panel.style.height = `${panel.scrollHeight}px`;
      });
      return;
    }

    panel.style.height = `${panel.scrollHeight}px`;
    requestAnimationFrame(() => {
      panel.style.height = "0px";
    });
  };

  questions.forEach((question) => {
    const panelId = question.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;

    if (!panel) {
      return;
    }

    const isExpanded = question.getAttribute("aria-expanded") === "true";
    panel.hidden = !isExpanded;
    panel.style.height = isExpanded ? "auto" : "0px";

    panel.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "height") {
        return;
      }

      const expanded = question.getAttribute("aria-expanded") === "true";
      if (expanded) {
        panel.style.height = "auto";
      } else {
        panel.hidden = true;
      }
    });

    question.addEventListener("click", () => {
      const shouldExpand = question.getAttribute("aria-expanded") !== "true";

      questions.forEach((otherQuestion) => {
        if (otherQuestion === question) {
          return;
        }

        const otherPanelId = otherQuestion.getAttribute("aria-controls");
        const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
        if (otherPanel && otherQuestion.getAttribute("aria-expanded") === "true") {
          setPanelExpanded(otherQuestion, otherPanel, false);
        }
      });

      setPanelExpanded(question, panel, shouldExpand);
    });
  });
};

/**
 * Updates plan prices and billing period for the selected pricing option.
 * @returns {void}
 */
const initPricingToggle = () => {
  const options = document.querySelectorAll(".billing-option");
  const prices = document.querySelectorAll(".price[data-monthly][data-yearly]");
  const savingsNote = document.querySelector("[data-yearly-saving]");

  const setBillingPeriod = (period) => {
    options.forEach((option) => {
      const isActive = option.dataset.billing === period;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-pressed", String(isActive));
    });

    prices.forEach((price) => {
      const amount = price.querySelector(".price__amount");
      const periodLabel = price.querySelector(".price__period");
      const value = period === "yearly" ? price.dataset.yearly : price.dataset.monthly;

      if (amount && value) {
        amount.textContent = value;
      }
      if (periodLabel) {
        periodLabel.textContent = period === "yearly" ? " / year" : " / month";
      }
    });

    if (savingsNote) {
      savingsNote.hidden = period !== "yearly";
    }
  };

  options.forEach((option) => {
    option.addEventListener("click", () => {
      setBillingPeriod(option.dataset.billing === "yearly" ? "yearly" : "monthly");
    });
  });

  setBillingPeriod("monthly");
};

/**
 * Adds a shadow treatment to the sticky header after scrolling beyond 10 pixels.
 * @returns {void}
 */
const initHeaderShadow = () => {
  const header = document.querySelector(".site-header");
  if (!header) {
    return;
  }

  const updateHeaderShadow = () => {
    header.classList.toggle("site-header--scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", updateHeaderShadow, { passive: true });
  updateHeaderShadow();
};

/**
 * Validates sign-up details and saves unique sign-ups in local storage.
 * @returns {void}
 */
const initSignupForm = () => {
  const orderForm = document.querySelector("#order-form");
  const formMessage = document.querySelector("#form-message");
  const nameInput = document.querySelector("#full-name");
  const emailInput = document.querySelector("#email");
  const planInput = document.querySelector("#plan");
  const termsInput = document.querySelector("#terms");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (
    !(orderForm instanceof HTMLFormElement) ||
    !formMessage ||
    !(nameInput instanceof HTMLInputElement) ||
    !(emailInput instanceof HTMLInputElement) ||
    !(planInput instanceof HTMLSelectElement) ||
    !(termsInput instanceof HTMLInputElement)
  ) {
    return;
  }

  const fields = [
    {
      input: nameInput,
      error: document.querySelector("#name-error"),
      getMessage: () => nameInput.value.trim().length >= 2 ? "" : "Enter a name with at least 2 characters."
    },
    {
      input: emailInput,
      error: document.querySelector("#email-error"),
      getMessage: () => emailPattern.test(emailInput.value.trim()) ? "" : "Enter a valid email address."
    },
    {
      input: planInput,
      error: document.querySelector("#plan-error"),
      getMessage: () => planInput.value ? "" : "Select a package."
    },
    {
      input: termsInput,
      error: document.querySelector("#terms-error"),
      getMessage: () => termsInput.checked ? "" : "Please accept the terms to continue."
    }
  ];

  const showFieldError = (field, message) => {
    if (!(field.error instanceof HTMLElement)) {
      return;
    }

    field.error.textContent = message;
    field.error.hidden = !message;
    field.input.setAttribute("aria-invalid", String(Boolean(message)));
  };

  const validateField = (field) => {
    const message = field.getMessage();
    showFieldError(field, message);
    return !message;
  };

  fields.forEach((field) => {
    const eventName = field.input === termsInput || field.input === planInput ? "change" : "input";
    field.input.addEventListener(eventName, () => {
      validateField(field);
      formMessage.textContent = "";
    });
  });

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formMessage.textContent = "";

    const formIsValid = fields.map(validateField).every(Boolean);
    if (!formIsValid) {
      const firstInvalidField = fields.find((field) => field.input.getAttribute("aria-invalid") === "true");
      firstInvalidField?.input.focus();
      return;
    }

    let signups;
    try {
      const storedSignups = localStorage.getItem("signups");
      signups = storedSignups ? JSON.parse(storedSignups) : [];
      if (!Array.isArray(signups)) {
        throw new TypeError("Saved signups must be an array.");
      }
    } catch (error) {
      console.error("Unable to read sign-ups from localStorage.", error);
      formMessage.textContent = "We couldn’t access saved sign-ups. Please check your browser storage settings and try again.";
      return;
    }

    const email = emailInput.value.trim();
    const hasSignedUp = signups.some((signup) =>
      signup && typeof signup.email === "string" && signup.email.toLowerCase() === email.toLowerCase()
    );

    if (hasSignedUp) {
      formMessage.textContent = "You've already signed up";
      return;
    }

    signups.push({
      name: nameInput.value.trim(),
      email,
      plan: planInput.value,
      createdAt: new Date().toISOString()
    });

    try {
      localStorage.setItem("signups", JSON.stringify(signups));
    } catch (error) {
      console.error("Unable to save sign-up to localStorage.", error);
      formMessage.textContent = "We couldn’t save your sign-up. Please check your browser storage settings and try again.";
      return;
    }

    orderForm.reset();
    fields.forEach((field) => showFieldError(field, ""));
    formMessage.textContent = "Thanks for signing up! Your details have been saved.";
  });
};

/**
 * Carries a selected pricing package into the order enquiry form.
 * @returns {void}
 */
const initPlanSelection = () => {
  const planInput = document.querySelector("#plan");
  const planLinks = document.querySelectorAll(".price-card a[data-plan]");

  if (!(planInput instanceof HTMLSelectElement)) {
    return;
  }

  planLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const plan = link.dataset.plan;
      const hasMatchingOption = Array.from(planInput.options).some((option) => option.value === plan);

      if (!plan || !hasMatchingOption) {
        return;
      }

      planInput.value = plan;
      planInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
};

/**
 * Writes the current year into the footer.
 * @returns {void}
 */
const setFooterYear = () => {
  const currentYear = document.querySelector("#current-year");
  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }
};

document.addEventListener("DOMContentLoaded", init, { once: true });
