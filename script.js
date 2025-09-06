// DOM Elements
const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');
const doctorImage = document.getElementById('doctor-image');
const contactForm = document.getElementById('contact-form');

// Language Management
let currentLanguage = 'de';

// CMS Content Management
let cmsContent = null;

// Load CMS content from server
async function loadCMSContent() {
    try {
        const response = await fetch('/api/content');
        if (response.ok) {
            cmsContent = await response.json();
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

// Apply CMS content to the page
function applyCMSContent() {
    if (!cmsContent) return;
    
    applyIntroContent();
    applyServicesContent();
    applyAboutContent();
    applyContactContent();
    applyNavigationContent();
    applyModalContent();
    applyVacationModal();
}

// Apply intro section content
function applyIntroContent() {
    if (!cmsContent.intro) return;
    const introSection = document.getElementById('intro');
    if (!introSection) return;
    const mapping = [
        ['h1[data-translate="intro.title"]', 'title'],
        ['.intro-subtitle[data-translate="intro.subtitle"]', 'subtitle'],
        ['[data-translate="intro.feature1"]', 'feature1'],
        ['[data-translate="intro.feature2"]', 'feature2'],
        ['[data-translate="intro.feature3"]', 'feature3'],
        ['.intro-description[data-translate="intro.description"]', 'description'],
        ['.cta-button[data-translate="intro.cta"]', 'cta']
    ];
    mapping.forEach(([selector, key]) => {
        const el = introSection.querySelector(selector);
        if (el && cmsContent.intro[key]) el.textContent = cmsContent.intro[key];
    });
    const doctorImg = introSection.querySelector('#doctor-image');
    if (doctorImg && cmsContent.intro.doctorImage) doctorImg.src = cmsContent.intro.doctorImage;
}

// Apply services section content
function applyServicesContent() {
    if (!cmsContent.services) return;
    
    const servicesSection = document.getElementById('services');
    if (!servicesSection) return;
    
    // Update services title
    const title = servicesSection.querySelector('h2[data-translate="services.title"]');
    if (title && cmsContent.services.title) {
        title.textContent = cmsContent.services.title;
    }
    
    // Update services subtitle
    const subtitle = servicesSection.querySelector('p[data-translate="services.subtitle"]');
    if (subtitle && cmsContent.services.subtitle) {
        subtitle.textContent = cmsContent.services.subtitle;
    }
    
    // Update individual service cards if available
    if (cmsContent.services.items && Array.isArray(cmsContent.services.items)) {
        const serviceCards = servicesSection.querySelectorAll('.service-card');
        
        serviceCards.forEach((card, index) => {
            if (cmsContent.services.items[index]) {
                const serviceData = cmsContent.services.items[index];
                
                // Update service icon
                const icon = card.querySelector('.service-icon i');
                if (icon && serviceData.icon) {
                    icon.className = serviceData.icon;
                }
                
                // Update service title
                const serviceTitle = card.querySelector('h3');
                if (serviceTitle && serviceData.title) {
                    serviceTitle.textContent = serviceData.title;
                }
                
                // Update service description
                const serviceDesc = card.querySelector('p');
                if (serviceDesc && serviceData.description) {
                    serviceDesc.textContent = serviceData.description;
                }
            }
        });
    }
}

// Apply about section content
function applyAboutContent() {
    if (!cmsContent.about) return;
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;
    const mapping = [
        ['h2[data-translate="about.title"]', 'title'],
        ['h3[data-translate="about.doctor"]', 'doctorName'],
        ['p[data-translate="about.qualification"]', 'qualification'],
        ['p[data-translate="about.welcome"]', 'welcome'],
        ['h4[data-translate="about.languages.title"]', 'languagesTitle'],
        ['p[data-translate="about.languages.desc"]', 'languagesDesc'],
        ['h4[data-translate="about.team.title"]', 'teamTitle'],
        ['p[data-translate="about.team.desc"]', 'teamDesc']
    ];
    mapping.forEach(([selector, key]) => {
        const el = aboutSection.querySelector(selector);
        if (el && cmsContent.about[key]) el.textContent = cmsContent.about[key];
    });
    const teamImg = aboutSection.querySelector('.team-image');
    if (teamImg && cmsContent.about.teamImage) teamImg.src = cmsContent.about.teamImage;
}

// Apply contact section content
function applyContactContent() {
    if (!cmsContent.contact) return;
    
    const contactSection = document.getElementById('contact');
    if (!contactSection) return;
    
    // Update contact title
    const title = contactSection.querySelector('h2[data-translate="contact.title"]');
    if (title && cmsContent.contact.title) {
        title.textContent = cmsContent.contact.title;
    }
    
    // Update contact subtitle
    const subtitle = contactSection.querySelector('p[data-translate="contact.subtitle"]');
    if (subtitle && cmsContent.contact.subtitle) {
        subtitle.textContent = cmsContent.contact.subtitle;
    }
    
    // Update address - more robust approach
    const infoItems = contactSection.querySelectorAll('.info-item');
    infoItems.forEach(item => {
        const icon = item.querySelector('i');
        if (icon && icon.classList.contains('fa-map-marker-alt')) {
            const addressP = item.querySelector('p');
            const addressValue = cmsContent.contact.addressValue || cmsContent.contact.address;
            if (addressP && addressValue) {
                const addressWithBreaks = addressValue
                    .replace(/\r\n/g, '<br>')
                    .replace(/\n/g, '<br>')
                    .replace(/\r/g, '<br>');
                addressP.innerHTML = addressWithBreaks;
            }
        }
        
        // Update phone
        if (icon && icon.classList.contains('fa-phone')) {
            const phoneLink = item.querySelector('a[href^="tel:"]');
            const phoneValue = cmsContent.contact.phoneValue || cmsContent.contact.phone;
            if (phoneLink && phoneValue) {
                phoneLink.textContent = phoneValue;
                phoneLink.href = `tel:${phoneValue.replace(/\s/g, '')}`;
            }
        }
        
        // Update email
        if (icon && icon.classList.contains('fa-envelope')) {
            const emailLink = item.querySelector('a[href^="mailto:"]');
            const emailValue = cmsContent.contact.emailValue || cmsContent.contact.email;
            if (emailLink && emailValue) {
                emailLink.textContent = emailValue;
                emailLink.href = `mailto:${emailValue}`;
            }
        }
    });
    
    // Update opening hours
    if (cmsContent.contact.hours && Array.isArray(cmsContent.contact.hours)) {
        const hoursItems = contactSection.querySelectorAll('.hours-item');
        
        hoursItems.forEach((item, index) => {
            if (cmsContent.contact.hours[index]) {
                const hourData = cmsContent.contact.hours[index];
                const spans = item.querySelectorAll('span');
                
                if (spans.length >= 2) {
                    if (hourData.days) {
                        spans[0].textContent = hourData.days;
                    }
                    if (hourData.time) {
                        spans[1].textContent = hourData.time;
                    }
                }
            }
        });
    }
}

// Apply navigation content
function applyNavigationContent() {
    if (!cmsContent.navigation) return;
    
    // Update logo
    const logo = document.querySelector('.logo span');
    if (logo && cmsContent.navigation.logo) {
        logo.textContent = cmsContent.navigation.logo;
    }
}

// Apply modal content
function applyModalContent() {
    if (!cmsContent.modals) return;
    
    // Update each modal
    Object.keys(cmsContent.modals).forEach(modalKey => {
        const modalData = cmsContent.modals[modalKey];
        const modal = document.getElementById(`modal-${modalKey}`);
        
        if (modal && modalData) {
            // Update modal title
            const title = modal.querySelector('h3');
            if (title && modalData.title) {
                title.textContent = modalData.title;
            }
            
            // Update modal intro
            const intro = modal.querySelector('.modal-body p:first-child');
            if (intro && modalData.intro) {
                intro.textContent = modalData.intro;
            }
            
            // Update list title
            const listTitle = modal.querySelector('.modal-body h4');
            if (listTitle && modalData.listTitle) {
                listTitle.textContent = modalData.listTitle;
            }
            
            // Update list items
            const list = modal.querySelector('.modal-body ul');
            if (list && modalData.items && Array.isArray(modalData.items)) {
                list.innerHTML = '';
                modalData.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.replace(/\r/g, '');
                    list.appendChild(li);
                });
            }
            
            // Update note if exists (for hausbesuche modal)
            if (modalData.note) {
                const noteP = modal.querySelector('.modal-body p:last-child strong');
                if (noteP) {
                    noteP.textContent = modalData.note;
                }
            }
            
            // Update outro if exists (for dmp modal)
            if (modalData.outro) {
                const lastP = modal.querySelector('.modal-body p:last-child');
                if (lastP && !lastP.querySelector('strong')) {
                    lastP.textContent = modalData.outro;
                }
            }
        }
    });
}

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
    if (lang in translations) {
        currentLanguage = lang;
        // HTML Attribut anpassen
        const htmlEl = document.documentElement;
        htmlEl.setAttribute('lang', lang);
        if (lang === 'ar') {
            htmlEl.setAttribute('dir', 'rtl');
        } else {
            htmlEl.setAttribute('dir', 'ltr');
        }
        
        // Update active button state
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
        
        // Find all elements with data-translate attribute
    const translatableElements = document.querySelectorAll('[data-translate]');
        
        let translated = 0;
        let missing = 0;
        
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const keys = key.split('.');
            let translation = translations[lang];
            
            // Navigate through nested object
            for (let i = 0; i < keys.length; i++) {
                if (translation && translation[keys[i]]) {
                    translation = translation[keys[i]];
                } else {
                    translation = null;
                    break;
                }
            }
            
            if (translation) {
                element.textContent = translation;
                translated++;
            } else {
                missing++;
            }
        });
        
        // Re-apply CMS content after language change ONLY if CMS content is loaded
        if (cmsContent) {
            setTimeout(() => {
                applyCMSContent();
            }, 100);
        }
        
        // Save language preference
        localStorage.setItem('preferredLanguage', lang);
    }
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
    // Kein overflow reset nötig - Scrollbar bleibt immer sichtbar
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
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
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
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
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
        // Kein overflow reset nötig - Scrollbar bleibt immer sichtbar
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
    // Load CMS content first, then initialize everything else
    loadCMSContent().then(loaded => {
        // Initialize language switcher
        initializeLanguageSwitcher();
        
        // Load language preference - this might trigger changeLanguage
        loadLanguagePreference();
        
        // Apply CMS content after language setup with multiple delays to ensure success
        if (loaded) {
            // Try immediately
            setTimeout(() => {
                applyCMSContent();
            }, 100);
            
            // Try again after 500ms
            setTimeout(() => {
                applyCMSContent();
            }, 500);
            
            // Try once more after 1 second
            setTimeout(() => {
                applyCMSContent();
            }, 1000);
        }
        
        // Initialize sections and custom scrolling (nur Desktop > 1024px)
        if (isMainPage && window.innerWidth > 1024) {
            initializeCustomScrolling();
        }
    });
    
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
    sections.forEach(section => { section.element = document.getElementById(section.id); });
    document.body.classList.add('smooth-scroll', 'snap-scroll');
    // Nur Keyboard Unterstützung lassen – Wheel bleibt nativ
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); scrollToNext(); }
        else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); scrollToPrevious(); }
        else if (e.key === 'Home') { e.preventDefault(); scrollToSection(0); }
        else if (e.key === 'End') { e.preventDefault(); scrollToSection(sections.length - 1); }
    });
    window.addEventListener('scroll', updateCurrentSection, { passive: true });
    updateCurrentSection();
}

// handleWheelScroll entfernt – natives Scrolling wird genutzt

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
}

// Scroll boundary enforcement - prevents scrolling beyond legal references
function enforceScrollBoundary() {
    const contactSection = document.getElementById('contact');
    const legalReferences = document.querySelector('.legal-references');
    
    if (!contactSection || !legalReferences) return;
    
    const contactSectionBottom = contactSection.offsetTop + contactSection.offsetHeight;
    const maxScrollPosition = contactSectionBottom - window.innerHeight;
    
    // Prevent scrolling beyond the legal references
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > maxScrollPosition) {
            window.scrollTo(0, maxScrollPosition);
        }
    }, { passive: false });
    
    // Also prevent wheel scrolling beyond boundary
    window.addEventListener('wheel', function(e) {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const scrollingDown = e.deltaY > 0;
        
        if (scrollingDown && currentScroll >= maxScrollPosition) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, { passive: false });
}

// Initialize scroll boundary when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.classList.contains('legal-page')) {
        // Legal pages - prevent infinite scrolling
        initializeLegalPageScrolling();
    } else if (isMainPage) {
        // Main page - enforce scroll boundary for 4 sections
        setTimeout(enforceScrollBoundary, 100);
    }
});

// Function to handle scrolling on legal pages
function initializeLegalPageScrolling() {
    let maxScrollReached = false;
    
    function preventInfiniteScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const maxScroll = documentHeight - windowHeight;
        
        // If we've scrolled past the content, fix the height
        if (scrollTop >= maxScroll && !maxScrollReached) {
            maxScrollReached = true;
            document.documentElement.style.height = documentHeight + 'px';
            document.body.style.height = documentHeight + 'px';
        }
        
        // Prevent over-scrolling
        if (scrollTop > maxScroll) {
            window.scrollTo(0, maxScroll);
        }
    }
    
    // Monitor scrolling
    window.addEventListener('scroll', preventInfiniteScroll, { passive: false });
    
    // Prevent wheel scrolling beyond content
    window.addEventListener('wheel', function(e) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const maxScroll = documentHeight - windowHeight;
        
        if (e.deltaY > 0 && scrollTop >= maxScroll) {
            e.preventDefault();
            return false;
        }
    }, { passive: false });
}

// Vacation Modal Functions
function applyVacationModal() {
    if (!cmsContent.vacation || !cmsContent.vacation.enabled) {
        // Remove existing modal if vacation is disabled
        const existingModal = document.getElementById('vacation-modal');
        if (existingModal) {
            existingModal.remove();
        }
        return;
    }
    
    // Check if modal already exists
    let modal = document.getElementById('vacation-modal');
    if (!modal) {
        // Create modal if it doesn't exist
        modal = createVacationModal();
        document.body.appendChild(modal);
    }
    
    // Update modal content
    updateVacationModalContent(modal);
    
    // Always show modal on every page load/refresh
    setTimeout(() => {
        showVacationModal();
    }, 1000); // Show after 1 second delay
}

function createVacationModal() {
    const modal = document.createElement('div');
    modal.id = 'vacation-modal';
    modal.className = 'vacation-modal';
    modal.innerHTML = `
        <div class="vacation-modal-content">
            <div class="vacation-modal-header">
                <i class="fas fa-umbrella-beach vacation-icon"></i>
                <h2 id="vacation-title">Praxisurlaub</h2>
            </div>
            <div class="vacation-modal-body">
                <p class="vacation-message" id="vacation-message"></p>
                <div class="vacation-dates" id="vacation-dates-container" style="display: none;">
                    <div class="date-range">
                        <div class="date-item">
                            <span id="vacation-start-date"></span>
                        </div>
                        <div>
                            <i class="fas fa-arrow-right" style="color: #ff6b6b;"></i>
                        </div>
                        <div class="date-item">
                            <span id="vacation-end-date"></span>
                        </div>
                    </div>
                </div>
                <div class="vacation-emergency" id="vacation-emergency-container" style="display: none;">
                    <div class="vacation-emergency-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span id="vacation-emergency-title">Im Notfall</span>
                    </div>
                    <div class="vacation-emergency-info" id="vacation-emergency-info"></div>
                </div>
            </div>
            <div class="vacation-modal-footer">
                <button class="vacation-close-btn" onclick="closeVacationModal()">
                    <i class="fas fa-check"></i>
                    <span id="vacation-button-text">Verstanden</span>
                </button>
            </div>
        </div>
    `;
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeVacationModal();
        }
    });
    
    return modal;
}

function updateVacationModalContent(modal) {
    const vacation = cmsContent.vacation;
    
    // Update title
    const titleElement = modal.querySelector('#vacation-title');
    if (titleElement && vacation.title) {
        titleElement.textContent = vacation.title;
    }
    
    // Update message
    const messageElement = modal.querySelector('#vacation-message');
    if (messageElement && vacation.message) {
        let message = vacation.message;
        
        // Replace date placeholders if dates are provided
        if (vacation.startDate && vacation.endDate) {
            const startDate = formatDate(vacation.startDate);
            const endDate = formatDate(vacation.endDate);
            message = message.replace('[STARTDATUM]', startDate).replace('[ENDDATUM]', endDate);
        }
        
        // Always hide the dates container (remove screenshot content)
        const datesContainer = modal.querySelector('#vacation-dates-container');
        if (datesContainer) {
            datesContainer.style.display = 'none';
        }
        
        messageElement.textContent = message;
    }
    
    // Update emergency information
    if (vacation.emergencyTitle || vacation.emergencyInfo) {
        const emergencyContainer = modal.querySelector('#vacation-emergency-container');
        const emergencyTitle = modal.querySelector('#vacation-emergency-title');
        const emergencyInfo = modal.querySelector('#vacation-emergency-info');
        
        if (emergencyContainer) {
            emergencyContainer.style.display = 'block';
        }
        if (emergencyTitle && vacation.emergencyTitle) {
            emergencyTitle.textContent = vacation.emergencyTitle;
        }
        if (emergencyInfo && vacation.emergencyInfo) {
            emergencyInfo.textContent = vacation.emergencyInfo;
        }
    } else {
        const emergencyContainer = modal.querySelector('#vacation-emergency-container');
        if (emergencyContainer) {
            emergencyContainer.style.display = 'none';
        }
    }
    
    // Update button text
    const buttonTextElement = modal.querySelector('#vacation-button-text');
    if (buttonTextElement && vacation.buttonText) {
        buttonTextElement.textContent = vacation.buttonText;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showVacationModal() {
    const modal = document.getElementById('vacation-modal');
    if (modal) {
        modal.classList.add('active');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    }
}

function closeVacationModal() {
    const modal = document.getElementById('vacation-modal');
    if (modal) {
        modal.classList.remove('active');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
        // Modal will show again on next page refresh
    }
}

// Make closeVacationModal globally available for onclick handler
window.closeVacationModal = closeVacationModal;
