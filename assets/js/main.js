/* ============================================
   SALMON HVAC - Main JavaScript
============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initMobileMenu();
    initNavDropdowns();
    initResponsiveAreaList();
    initAttributionFields();
    initContactForm();
    initConversionClickTracking();
    initQuoteFormTracking();
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
   RESPONSIVE HOMEPAGE AREA LIST
============================================ */
function initResponsiveAreaList() {
    const areaList = document.querySelector('.areas-more');
    if (!areaList) return;

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    let wasMobile = null;

    function syncAreaList() {
        if (mobileQuery.matches && wasMobile !== true) {
            areaList.open = false;
        } else if (!mobileQuery.matches) {
            areaList.open = true;
        }
        wasMobile = mobileQuery.matches;
    }

    syncAreaList();
    mobileQuery.addEventListener?.('change', syncAreaList);
}

/* ============================================
   MOBILE MENU TOGGLE
============================================ */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    if (!menuBtn || !navMenu) return;

    function setMenuOpen(isOpen) {
        navMenu.classList.toggle('active', isOpen);
        menuBtn.setAttribute('aria-expanded', isOpen);
        document.body.classList.toggle('menu-open', isOpen);

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
    }

    menuBtn.addEventListener('click', function() {
        setMenuOpen(!navMenu.classList.contains('active'));
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-btn')) {
            setMenuOpen(false);
        }
    });
}

/* ============================================
   NAV DROPDOWN TOGGLES
============================================ */
function initNavDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 1100) {
                e.preventDefault();
                const willOpen = !dropdown.classList.contains('open');
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('open');
                        otherDropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
                    }
                });
                dropdown.classList.toggle('open', willOpen);
                toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (e.target.closest('.county-toggle')) return;
        if (!e.target.closest('.nav-dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
                dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
            });
        }
    });

    const countyToggles = document.querySelectorAll('.county-toggle');
    countyToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const countyGroup = toggle.closest('.county-group');
            if (!countyGroup) return;

            const willOpen = !countyGroup.classList.contains('open');
            countyGroup.classList.toggle('open', willOpen);
            toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        });
    });
}

/* ============================================
   FORM ATTRIBUTION FIELDS
============================================ */
function initAttributionFields() {
    const forms = document.querySelectorAll('form[data-netlify]');
    if (!forms.length) return;

    const storageKey = 'salmon_hvac_attribution';
    const trackedParams = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'gclid',
        'fbclid'
    ];

    function readStoredAttribution() {
        try {
            return JSON.parse(window.localStorage.getItem(storageKey)) || {};
        } catch (error) {
            return {};
        }
    }

    function saveStoredAttribution(data) {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (error) {
            // Ignore storage failures; fields will still receive page-level values.
        }
    }

    const params = new URLSearchParams(window.location.search);
    const attribution = readStoredAttribution();

    if (!attribution.landing_page) {
        attribution.landing_page = window.location.href;
    }

    if (!attribution.referrer) {
        attribution.referrer = document.referrer || '';
    }

    trackedParams.forEach(param => {
        const value = params.get(param);
        if (value) {
            attribution[param] = value;
        }
    });

    saveStoredAttribution(attribution);

    forms.forEach(form => {
        Object.entries(attribution).forEach(([name, value]) => {
            const field = form.querySelector(`input[name="${name}"]`);
            if (field) {
                field.value = value;
                field.setAttribute('value', value);
            }
        });

        const currentPageField = form.querySelector('input[name="current_page"]');
        if (currentPageField) {
            currentPageField.value = window.location.href;
            currentPageField.setAttribute('value', window.location.href);
        }
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

/* ============================================
   CONVERSION CLICK TRACKING
============================================ */
function sendAnalyticsEvent(eventName, params) {
    const payload = {
        event_category: 'conversion',
        page_location: window.location.href,
        ...params
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: eventName,
        ...payload
    });

    if (typeof gtag === 'function') {
        gtag('event', eventName, payload);
    }
}

function initConversionClickTracking() {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            sendAnalyticsEvent('phone_call_click', {
                event_label: this.getAttribute('href'),
                link_text: this.textContent.trim()
            });
        });
    });

    document.querySelectorAll('a[href="/get-quote/"], a[href="https://salmonhvac.com/get-quote/"]').forEach(link => {
        link.addEventListener('click', function() {
            sendAnalyticsEvent('quote_cta_click', {
                event_label: this.textContent.trim(),
                link_url: this.href
            });
        });
    });
}

/* ============================================
   GA4 QUOTE FORM TRACKING
============================================ */
function initQuoteFormTracking() {
    const form = document.querySelector('form[name="get-quote"][data-netlify]');
    if (!form) return;

    form.addEventListener('submit', function() {
        sendAnalyticsEvent('generate_lead', {
            event_category: 'form',
            event_label: 'get_quote_submission'
        });
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
