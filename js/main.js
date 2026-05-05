/* ============================================================
   main.js — Navigation, Scroll Effects, Form Validation, Reveal
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM Elements ----
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.navbar__link');
  const backToTop = document.getElementById('back-to-top');
  const contactForm = document.getElementById('contact-form');
  const sections = document.querySelectorAll('section[id]');

  // ---- Mobile Nav Toggle ----
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('navbar__menu--open');
      navToggle.classList.toggle('navbar__toggle--open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('navbar__menu--open');
        navToggle.classList.remove('navbar__toggle--open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('navbar__menu--open')) {
        navMenu.classList.remove('navbar__menu--open');
        navToggle.classList.remove('navbar__toggle--open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // ---- Navbar Scroll Effect ----
  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  // ---- Active Nav Link on Scroll ----
  function highlightNavLink() {
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('navbar__link--active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('navbar__link--active');
          }
        });
      }
    });
  }

  // ---- Back to Top Button ----
  function handleBackToTop() {
    if (window.scrollY > 400) {
      backToTop.classList.add('back-to-top--visible');
    } else {
      backToTop.classList.remove('back-to-top--visible');
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Scroll Event (debounced) ----
  var scrollTimeout;
  window.addEventListener('scroll', function () {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(function () {
      handleNavScroll();
      highlightNavLink();
      handleBackToTop();
    });
  }, { passive: true });

  // Run once on load
  handleNavScroll();
  highlightNavLink();

  // ---- Scroll Reveal with IntersectionObserver ----
  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });

    // Expose observer globally so dynamic content loaders can register new elements
    window._revealObserver = revealObserver;
  } else {
    // Fallback: show all immediately
    revealElements.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  // ---- Contact Form Validation ----
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      var isValid = true;
      var fields = [
        { el: document.getElementById('name'), msg: 'Please enter your name.' },
        { el: document.getElementById('email'), msg: 'Please enter a valid email address.' },
        { el: document.getElementById('message'), msg: 'Please enter a message.' }
      ];

      fields.forEach(function (field) {
        var errorEl = field.el.parentElement.querySelector('.form-error');
        var value = field.el.value.trim();

        if (!value) {
          field.el.classList.add('form-input--error');
          if (errorEl) errorEl.textContent = field.msg;
          isValid = false;
        } else if (field.el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          field.el.classList.add('form-input--error');
          if (errorEl) errorEl.textContent = field.msg;
          isValid = false;
        } else {
          field.el.classList.remove('form-input--error');
          if (errorEl) errorEl.textContent = '';
        }
      });

      if (!isValid) {
        e.preventDefault();
      }
    });

    // Clear error on input
    contactForm.querySelectorAll('.form-input').forEach(function (input) {
      input.addEventListener('input', function () {
        this.classList.remove('form-input--error');
        var errorEl = this.parentElement.querySelector('.form-error');
        if (errorEl) errorEl.textContent = '';
      });
    });
  }

})();
