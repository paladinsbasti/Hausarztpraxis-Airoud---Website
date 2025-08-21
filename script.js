// DOM Elements
const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');
const doctorImage = document.getElementById('doctor-image');
const contactForm = document.getElementById('contact-form');

// Language Management
let currentLanguage = 'de';

// Custom Scroll Behavior Setup
let isScrollbarDragging = false;
let isMouseWheelScrolling = false;
let scrollTimeout;
let lastScrollTime = 0;
let currentSectionIndex = 0;

// Define sections for snapping
const sections = [
    { id: 'intro', element: null },
    { id: 'services', element: null },
    { id: 'about', element: null },
    { id: 'contact', element: null }
];

// Check if we're on the main page
const isMainPage = document.getElementById('intro') !== null;

// Initialize language buttons
function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const newLang = this.getAttribute('data-lang');
            changeLanguage(newLang);
        });
    });
}

// Change language function
function changeLanguage(lang) {
    console.log('🌍 Changing language to:', lang);
    
    // Check if language exists
    if (!translations[lang]) {
        console.error('❌ Language not found:', lang);
        return;
    }
    
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
            console.log('✅ Active button updated for:', lang);
        }
    });
    
    // Count translatable elements
    const translatableElements = document.querySelectorAll('[data-translate]');
    console.log('📄 Found', translatableElements.length, 'translatable elements');
    
    let translated = 0;
    let missing = 0;
    
    // Update all translatable elements
    translatableElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
            translated++;
        } else {
            console.warn('⚠️ Missing translation for key:', key, 'in language:', lang);
            missing++;
        }
    });
    
    console.log('✅ Translated:', translated, 'elements');
    console.log('⚠️ Missing:', missing, 'translations');
    
    // Update HTML direction for Arabic
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    
    // Store preference
    localStorage.setItem('preferredLanguage', lang);
    
    console.log('🎉 Language change completed for:', lang);
}

// Load saved language preference
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        changeLanguage(savedLang);
    }
}

// Mobile Menu Toggle
hamburgerMenu.addEventListener('click', function() {
    hamburgerMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    // Scrollbar bleibt sichtbar - kein overflow hidden
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', function() {
        hamburgerMenu.classList.remove('active');
        mobileMenu.classList.remove('active');
        // Kein overflow reset nötig - Scrollbar bleibt immer sichtbar
    });
});

// Smooth scrolling function (legacy for navigation links)
function scrollToSection(sectionId) {
    // If it's a string (section ID), handle legacy navigation
    if (typeof sectionId === 'string') {
        const element = document.getElementById(sectionId);
        if (element) {
            // Find the section index for the new scrolling system
            const sectionIndex = sections.findIndex(section => section.id === sectionId);
            if (sectionIndex !== -1 && isMainPage) {
                currentSectionIndex = sectionIndex;
                scrollToSectionSmooth(element);
            } else {
                // Fallback for non-main pages
                const offsetTop = element.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    } 
    // If it's a number (index), use new scrolling system
    else if (typeof sectionId === 'number') {
        if (sectionId >= 0 && sectionId < sections.length && sections[sectionId].element) {
            currentSectionIndex = sectionId;
            scrollToSectionSmooth(sections[sectionId].element);
        }
    }
    
    // Close mobile menu if open
    hamburgerMenu.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Navbar scroll effect
let lastScrollY = window.scrollY;
window.addEventListener('scroll', function() {
    const currentScrollY = window.scrollY;
    
    // Add/remove navbar background on scroll
    if (currentScrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
    
    lastScrollY = currentScrollY;
});

// Doctor image hover effect
if (doctorImage) {
    const introBackground = document.querySelector('.intro-background');
    const imageOverlay = document.querySelector('.image-overlay');
    
    doctorImage.addEventListener('mouseenter', function() {
        if (introBackground) {
            introBackground.style.filter = 'brightness(0.6)';
            introBackground.style.transition = 'all 0.3s ease';
        }
    });
    
    doctorImage.addEventListener('mouseleave', function() {
        if (introBackground) {
            introBackground.style.filter = 'brightness(1)';
        }
    });
}

// Modal functionality - Immervue-style scroll lock system
class ScrollLock {
    constructor() {
        this.scrollPosition = 0;
        this.isLocked = false;
        this.handlers = new Map();
    }

    // Verhindert alle Scroll-Events (Immervue-Ansatz)
    preventScrollEvent(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }

    // Verhindert Tastatur-Navigation
    preventKeyboardScroll(e) {
        // Alle Scroll-relevanten Tasten
        const scrollKeys = {
            32: 'Space',
            33: 'PageUp', 
            34: 'PageDown',
            35: 'End',
            36: 'Home',
            37: 'ArrowLeft',
            38: 'ArrowUp',
            39: 'ArrowRight',
            40: 'ArrowDown'
        };
        
        if (scrollKeys[e.keyCode] || scrollKeys[e.key]) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }

    lock() {
        if (this.isLocked) return;

        // Speichere aktuelle Scroll-Position
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Setze Body-Position für Immervue-Style Fixierung
        document.body.style.top = `-${this.scrollPosition}px`;
        document.body.classList.add('modal-open');

        // Erstelle Event-Handler
        const wheelHandler = this.preventScrollEvent.bind(this);
        const touchHandler = this.preventScrollEvent.bind(this);
        const keyHandler = this.preventKeyboardScroll.bind(this);

        // Speichere Handler-Referenzen
        this.handlers.set('wheel', wheelHandler);
        this.handlers.set('touchmove', touchHandler);
        this.handlers.set('touchstart', touchHandler);
        this.handlers.set('keydown', keyHandler);
        this.handlers.set('DOMMouseScroll', wheelHandler);

        // Füge alle Event-Listener hinzu (Immervue-Methode)
        const options = { passive: false, capture: true };
        document.addEventListener('wheel', wheelHandler, options);
        document.addEventListener('touchmove', touchHandler, options);
        document.addEventListener('touchstart', touchHandler, options);
        document.addEventListener('keydown', keyHandler, options);
        document.addEventListener('DOMMouseScroll', wheelHandler, options);

        // Zusätzliche Sicherheitsmaßnahmen
        window.addEventListener('scroll', this.preventScrollEvent, options);
        
        this.isLocked = true;
    }

    unlock() {
        if (!this.isLocked) return;

        // Entferne alle Event-Listener
        const options = { passive: false, capture: true };
        this.handlers.forEach((handler, event) => {
            document.removeEventListener(event, handler, options);
        });
        window.removeEventListener('scroll', this.preventScrollEvent, options);

        // Lösche Handler-Map
        this.handlers.clear();

        // Entferne CSS-Klasse und Styles
        document.body.classList.remove('modal-open');
        document.body.style.top = '';

        // Stelle Scroll-Position wieder her
        window.scrollTo(0, this.scrollPosition);
        
        this.isLocked = false;
    }
}

// Globale ScrollLock-Instanz
const scrollLock = new ScrollLock();

function disableScroll() {
    scrollLock.lock();
}

function enableScroll() {
    scrollLock.unlock();
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Verhindere Scrollen aber behalte Scrollbar
        disableScroll();
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        // Add fade in animation
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }
}

function closeModal(modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.classList.remove('active');
        modal.style.display = 'none';
        
        // Erlaube Scrollen wieder
        enableScroll();
    }, 300);
}

// Add click events to modal close buttons and overlay
document.querySelectorAll('.modal').forEach(modal => {
    const closeButton = modal.querySelector('.close');
    
    // Close on X button click
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeModal(modal);
        });
    }
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal);
        }
    }
});

// Form submission
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const formValues = Object.fromEntries(formData.entries());
        
        // Basic validation
        const requiredFields = ['firstname', 'lastname', 'email', 'privacy'];
        let isValid = true;
        let missingFields = [];
        
        requiredFields.forEach(field => {
            const input = contactForm.querySelector(`[name="${field}"]`);
            if (!formValues[field] || formValues[field].trim() === '') {
                isValid = false;
                missingFields.push(field);
                input.style.borderColor = 'var(--danger)';
            } else {
                input.style.borderColor = 'var(--gray-light)';
            }
        });
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailInput = contactForm.querySelector('[name="email"]');
        if (formValues.email && !emailRegex.test(formValues.email)) {
            isValid = false;
            emailInput.style.borderColor = 'var(--danger)';
            showNotification('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
            return;
        }
        
        if (!isValid) {
            showNotification('Bitte füllen Sie alle Pflichtfelder aus.', 'error');
            return;
        }
        
        // Simulate form submission
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showNotification('Vielen Dank! Ihre Terminanfrage wurde erfolgreich gesendet. Wir melden uns bald bei Ihnen.', 'success');
            contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 3000;
        max-width: 400px;
        transform: translateX(100%);
        transition: all 0.3s ease;
        font-family: 'Inter', sans-serif;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.8');
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Close button functionality
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            removeNotification(notification);
        }
    }, 5000);
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 300);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        default: return '#4a90a4';
    }
}

// Form input animations
document.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Add scroll animation to service cards
document.querySelectorAll('.service-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Add scroll animation to other elements
document.querySelectorAll('.info-card, .team-image, .about-text').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.6s ease';
    observer.observe(element);
});

// Set current date as minimum for date input
const dateInput = document.querySelector('input[type="date"]');
if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    
    dateInput.min = `${year}-${month}-${day}`;
}

// Disable past time slots for today's date
const timeSelect = document.querySelector('select[name="time"]');
if (dateInput && timeSelect) {
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const today = new Date();
        const currentHour = today.getHours();
        
        // Reset all options
        Array.from(timeSelect.options).forEach(option => {
            option.disabled = false;
        });
        
        // If selected date is today, disable past time slots
        if (selectedDate.toDateString() === today.toDateString()) {
            Array.from(timeSelect.options).forEach(option => {
                if (option.value) {
                    const optionHour = parseInt(option.value.split(':')[0]);
                    if (optionHour <= currentHour) {
                        option.disabled = true;
                    }
                }
            });
        }
    });
}

// Add loading states to buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
        if (this.type !== 'submit' && !this.classList.contains('contact-btn')) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        }
    });
});

// Prevent double form submission
let isSubmitting = false;
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        if (isSubmitting) {
            e.preventDefault();
            return;
        }
        isSubmitting = true;
        
        setTimeout(() => {
            isSubmitting = false;
        }, 3000);
    });
}

// Add accessibility features
document.addEventListener('keydown', function(e) {
    // Close mobile menu with Escape
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        hamburgerMenu.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Navigate with Tab key
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hausarztpraxis Dr. Airoud - Website geladen');
    
    // Initialize language switcher
    initializeLanguageSwitcher();
    loadLanguagePreference();
    
    // Initialize sections and custom scrolling
    if (isMainPage) {
        initializeCustomScrolling();
    }
    
    // Add active class to navigation based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Add active state logic if needed
            }
        });
    });
});

// Initialize sections after DOM is loaded
function initializeCustomScrolling() {
    // Populate section elements
    sections.forEach(section => {
        section.element = document.getElementById(section.id);
    });
    
    // Initialize scroll behavior
    document.body.classList.add('smooth-scroll', 'snap-scroll');
    
    // Mouse wheel event listener for custom scrolling
    document.addEventListener('wheel', handleWheelScroll, { passive: false });
    
    // Touch events for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;
        
        if (Math.abs(deltaY) > 50) {
            handleTouchScroll(deltaY);
        }
    }, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollToNext();
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToPrevious();
        } else if (e.key === 'Home') {
            e.preventDefault();
            scrollToSection(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            scrollToSection(sections.length - 1);
        }
    });
    
    // Update current section on scroll
    window.addEventListener('scroll', updateCurrentSection, { passive: true });
    
    // Initial section update
    updateCurrentSection();
}

function handleWheelScroll(e) {
    if (isScrollbarDragging) return;
    
    const now = Date.now();
    
    // Detect platform and input device
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isTrackpad = Math.abs(e.deltaX) > 0 || (Math.abs(e.deltaY) < 50 && e.deltaMode === 0);
    
    // On macOS with trackpad, allow natural scrolling
    if (isMac && isTrackpad) {
        // Don't prevent default - let natural macOS scrolling work
        return;
    }
    
    // Different throttling for different platforms/devices
    let throttleTime = 100;
    if (isMac && isTrackpad) {
        throttleTime = 150; // Longer throttle for Mac trackpad
    }
    
    if (now - lastScrollTime < throttleTime) return;
    
    // Only prevent default for non-trackpad or non-Mac
    e.preventDefault();
    
    const delta = e.deltaY;
    
    // Different delta thresholds for different platforms
    let deltaThreshold = 0;
    if (isMac && isTrackpad) {
        deltaThreshold = 30; // Higher threshold for Mac trackpad
    } else {
        deltaThreshold = 0; // Windows mouse or other devices
    }
    
    if (Math.abs(delta) < deltaThreshold) return;
    
    lastScrollTime = now;
    
    clearTimeout(scrollTimeout);
    
    isMouseWheelScrolling = true;
    
    // Different delay for different platforms
    const scrollDelay = isMac && isTrackpad ? 100 : 50;
    
    scrollTimeout = setTimeout(() => {
        if (delta > 0) {
            scrollToNext();
        } else {
            scrollToPrevious();
        }
        
        setTimeout(() => {
            isMouseWheelScrolling = false;
        }, 500);
    }, scrollDelay);
}

function handleTouchScroll(deltaY) {
    if (deltaY > 0) {
        scrollToNext();
    } else {
        scrollToPrevious();
    }
}

function scrollToNext() {
    if (currentSectionIndex < sections.length - 1) {
        scrollToSection(currentSectionIndex + 1);
    }
}

function scrollToPrevious() {
    if (currentSectionIndex > 0) {
        scrollToSection(currentSectionIndex - 1);
    }
}

function scrollToSectionSmooth(sectionElement) {
    sectionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function updateCurrentSection() {
    if (isMouseWheelScrolling) return;
    
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    let newIndex = 0;
    let minDistance = Infinity;
    
    sections.forEach((section, index) => {
        if (section.element) {
            const sectionTop = section.element.offsetTop;
            const distance = Math.abs(scrollY - sectionTop);
            
            if (distance < minDistance) {
                minDistance = distance;
                newIndex = index;
            }
        }
    });
    
    currentSectionIndex = newIndex;
    currentSectionIndex = newIndex;
}
