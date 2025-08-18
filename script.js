// DOM Elements
const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');
const doctorImage = document.getElementById('doctor-image');
const contactForm = document.getElementById('contact-form');

// Mobile Menu Toggle
hamburgerMenu.addEventListener('click', function() {
    hamburgerMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', function() {
        hamburgerMenu.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Smooth scrolling function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
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

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
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
        document.body.style.overflow = 'auto';
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
