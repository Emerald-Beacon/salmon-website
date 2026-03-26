/* ============================================
   SALMON HVAC - Main JavaScript
============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initMobileMenu();
    initMobileDropdowns();
    initContactForm();
    initAnimations();
    initSmoothScroll();
    setActiveNavLink();
});

/* ============================================
   HEADER SCROLL EFFECT
============================================ */
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.scrollY > 100);
    }, { passive: true });
}

/* ============================================
   MOBILE MENU TOGGLE
============================================ */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    if (!menuBtn || !navMenu) return;

    menuBtn.addEventListener('click', function() {
        const isOpen = navMenu.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', isOpen);

        const spans = menuBtn.querySelectorAll('span');
        if (isOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-btn')) {
            navMenu.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ============================================
   MOBILE DROPDOWN TOGGLES
============================================ */
function initMobileDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('open');
            }
        });
    });
}

/* ============================================
   CONTACT FORM HANDLING
============================================ */
function initContactForm() {
    const forms = document.querySelectorAll('.contact-form, form[data-netlify]');

    forms.forEach(form => {
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', function() {
                this.classList.remove('error');
            });
        });
    });
}

/* ============================================
   SCROLL ANIMATIONS
============================================ */
function initAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
}

/* ============================================
   SMOOTH SCROLL FOR ANCHOR LINKS
============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

/* ============================================
   ACTIVE NAV LINK HIGHLIGHTING
============================================ */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
            link.classList.add('active');
        }
    });
}

/* Error styles */
const style = document.createElement('style');
style.textContent = `
  .form-group input.error,
  .form-group select.error,
  .form-group textarea.error {
    border-color: #dc3545 !important;
    background-color: #fff5f5 !important;
  }
`;
document.head.appendChild(style);
