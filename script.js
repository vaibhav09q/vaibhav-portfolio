/* =========================================
   VAIBHAV SHARMA — PORTFOLIO INTERACTIONS
   Plain vanilla JavaScript. No dependencies.
========================================= */

(() => {
  "use strict";

  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const revealElements = document.querySelectorAll(".reveal");

  // Enable animation styles only when JavaScript is available.
  document.documentElement.classList.add("js-enabled");

  // Respect the visitor's reduced-motion preference.
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Smoothly navigate to sections, accounting for the sticky navigation.
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });

      // Update the URL hash without jumping to the page's top.
      if (window.location.hash !== link.getAttribute("href")) {
        history.pushState(null, "", link.getAttribute("href"));
      }
    });
  });

  // Keep the active navigation link visible in the horizontal mobile bar.
  function activateNavLink(id) {
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;

      if (active) {
        link.classList.add("active");
        link.setAttribute("aria-current", "location");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });

    const activeLink = navLinks.find(
      (link) => link.getAttribute("href") === `#${id}`
    );

    if (activeLink && window.innerWidth <= 900) {
      activeLink.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "nearest"
      });
    }
  }

  // Highlight the section currently being viewed.
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (visibleEntries.length > 0) {
          activateNavLink(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0, 0.1, 0.25, 0.5]
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

    // Reveal sections gently as they enter the viewport.
    if (!reduceMotion) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -35px 0px"
        }
      );

      revealElements.forEach((element) => {
        revealObserver.observe(element);
      });
    } else {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });
    }
  } else {
    // Fallback for browsers without IntersectionObserver.
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

    // Determine the current section using its position on screen.
    function updateActiveSection() {
      const marker = window.scrollY + window.innerHeight * 0.3;
      let currentId = sections[0]?.id;

      sections.forEach((section) => {
        if (section.offsetTop <= marker) {
          currentId = section.id;
        }
      });

      if (currentId) activateNavLink(currentId);
    }

    window.addEventListener("scroll", updateActiveSection, {
      passive: true
    });

    updateActiveSection();
  }

  // Set the correct active link when a page opens with a hash.
  const initialHash = window.location.hash.slice(1);

  if (initialHash && sections.some((section) => section.id === initialHash)) {
    activateNavLink(initialHash);
  } else if (sections.length > 0) {
    activateNavLink(sections[0].id);
  }
})();