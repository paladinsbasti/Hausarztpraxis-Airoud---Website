// DOM Elements
const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');
const doctorImage = document.getElementById('doctor-image');
const contactForm = document.getElementById('contact-form');

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
    applyVacationModal();
}

// Apply intro section content
function applyIntroContent() {
    if (!cmsContent.intro) return;
    const introSection = document.getElementById('intro');
    if (!introSection) return;

    // Update text content directly
    const title = introSection.querySelector('h1');
    if (title && cmsContent.intro.title) title.textContent = cmsContent.intro.title;
    
    const subtitle = introSection.querySelector('.intro-subtitle');
    if (subtitle && cmsContent.intro.subtitle) subtitle.textContent = cmsContent.intro.subtitle;
    
    const description = introSection.querySelector('.intro-description');
    if (description && cmsContent.intro.description) description.textContent = cmsContent.intro.description;
    
    const ctaButton = introSection.querySelector('.cta-button');
    if (ctaButton && cmsContent.intro.cta) ctaButton.textContent = cmsContent.intro.cta;
    
    // Update features
    const features = introSection.querySelectorAll('.feature span');
    if (features.length >= 3) {
        if (cmsContent.intro.feature1) features[0].textContent = cmsContent.intro.feature1;
        if (cmsContent.intro.feature2) features[1].textContent = cmsContent.intro.feature2;
        if (cmsContent.intro.feature3) features[2].textContent = cmsContent.intro.feature3;
    }
    
    // Update doctor image
    if (cmsContent.intro.doctorImage) {
        const img = introSection.querySelector('.doctor-image');
        if (img) img.src = cmsContent.intro.doctorImage;
    }
}

// Apply services section content
function applyServicesContent() {
    if (!cmsContent.services) return;
    const servicesSection = document.getElementById('services');
    if (!servicesSection) return;

    const title = servicesSection.querySelector('h2');
    if (title && cmsContent.services.title) title.textContent = cmsContent.services.title;

    const subtitle = servicesSection.querySelector('.section-subtitle');
    if (subtitle && cmsContent.services.subtitle) subtitle.textContent = cmsContent.services.subtitle;

    // Update service items if they exist in CMS
    if (cmsContent.services.items && Array.isArray(cmsContent.services.items)) {
        const serviceGrid = servicesSection.querySelector('.services-grid');
        if (serviceGrid) {
            serviceGrid.innerHTML = '';
            cmsContent.services.items.forEach(service => {
                const serviceElement = document.createElement('div');
                serviceElement.className = 'service-card';
                serviceElement.innerHTML = `
                    <div class="service-icon">
                        <i class="${service.icon || 'fas fa-heartbeat'}"></i>
                    </div>
                    <h3>${service.title || ''}</h3>
                    <p>${service.description || ''}</p>
                `;
                serviceGrid.appendChild(serviceElement);
            });
        }
    }
}

// Apply about section content
function applyAboutContent() {
    if (!cmsContent.about) return;
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    // Update text content directly
    const title = aboutSection.querySelector('h2');
    if (title && cmsContent.about.title) title.textContent = cmsContent.about.title;
    
    const doctorName = aboutSection.querySelector('h3');
    if (doctorName && cmsContent.about.doctorName) doctorName.textContent = cmsContent.about.doctorName;
    
    const qualification = aboutSection.querySelector('.qualification');
    if (qualification && cmsContent.about.qualification) qualification.textContent = cmsContent.about.qualification;
    
    const welcome = aboutSection.querySelector('.welcome-text');
    if (welcome && cmsContent.about.welcome) welcome.textContent = cmsContent.about.welcome;
    
    const languagesTitle = aboutSection.querySelector('.languages h4');
    if (languagesTitle && cmsContent.about.languagesTitle) languagesTitle.textContent = cmsContent.about.languagesTitle;
    
    const languagesDesc = aboutSection.querySelector('.languages p');
    if (languagesDesc && cmsContent.about.languagesDesc) languagesDesc.textContent = cmsContent.about.languagesDesc;
    
    const teamTitle = aboutSection.querySelector('.team-info h4');
    if (teamTitle && cmsContent.about.teamTitle) teamTitle.textContent = cmsContent.about.teamTitle;
    
    const teamDesc = aboutSection.querySelector('.team-info p');
    if (teamDesc && cmsContent.about.teamDesc) teamDesc.textContent = cmsContent.about.teamDesc;
    
    // Update team image
    if (cmsContent.about.teamImage) {
        const img = aboutSection.querySelector('.team-image');
        if (img) img.src = cmsContent.about.teamImage;
    }
}

// Apply contact section content
function applyContactContent() {
    if (!cmsContent.contact) return;
    const contactSection = document.getElementById('contact');
    if (!contactSection) return;

    // Update text content directly
    const title = contactSection.querySelector('h2');
    if (title && cmsContent.contact.title) title.textContent = cmsContent.contact.title;
    
    const subtitle = contactSection.querySelector('.section-subtitle');
    if (subtitle && cmsContent.contact.subtitle) subtitle.textContent = cmsContent.contact.subtitle;
    
    const address = contactSection.querySelector('.address');
    if (address && cmsContent.contact.address) address.innerHTML = cmsContent.contact.address;
    
    const phone = contactSection.querySelector('.phone');
    if (phone && cmsContent.contact.phone) phone.textContent = cmsContent.contact.phone;
    
    const email = contactSection.querySelector('.email');
    if (email && cmsContent.contact.email) email.textContent = cmsContent.contact.email;
    
    const hoursTitle = contactSection.querySelector('.hours h4');
    if (hoursTitle && cmsContent.contact.hoursTitle) hoursTitle.textContent = cmsContent.contact.hoursTitle;

    // Update opening hours
    if (cmsContent.contact.hours && Array.isArray(cmsContent.contact.hours)) {
        const hoursList = contactSection.querySelector('.hours-list');
        if (hoursList) {
            hoursList.innerHTML = '';
            cmsContent.contact.hours.forEach(hour => {
                const hourElement = document.createElement('div');
                hourElement.className = 'hour-item';
                hourElement.innerHTML = `
                    <span class="day">${hour.day || ''}</span>
                    <span class="time">${hour.time || ''}</span>
                `;
                hoursList.appendChild(hourElement);
            });
        }
    }
}

// Vacation Modal
function applyVacationModal() {
    if (!cmsContent.vacation || !cmsContent.vacation.enabled) return;

    const modal = document.createElement('div');
    modal.id = 'vacation-modal';
    modal.className = 'vacation-modal';
    modal.innerHTML = `
        <div class="vacation-content">
            <div class="vacation-header">
                <i class="fas fa-umbrella-beach"></i>
                <h2>${cmsContent.vacation.title || 'Praxisurlaub'}</h2>
            </div>
            <div class="vacation-body">
                <p class="vacation-message">${formatVacationMessage(cmsContent.vacation.message, cmsContent.vacation.startDate, cmsContent.vacation.endDate)}</p>
                <div class="vacation-emergency">
                    <h3>${cmsContent.vacation.emergencyTitle || 'Im Notfall:'}</h3>
                    <p>${cmsContent.vacation.emergencyInfo || 'Ärztlicher Bereitschaftsdienst: 116 117'}</p>
                </div>
            </div>
            <div class="vacation-footer">
                <button class="vacation-close" onclick="closeVacationModal()">${cmsContent.vacation.buttonText || 'Verstanden'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 100);
}

function formatVacationMessage(message, startDate, endDate) {
    if (!message) return '';
    let formatted = message;
    if (startDate) {
        const start = new Date(startDate).toLocaleDateString('de-DE');
        formatted = formatted.replace(/\[STARTDATUM\]/g, start);
    }
    if (endDate) {
        const end = new Date(endDate).toLocaleDateString('de-DE');
        formatted = formatted.replace(/\[ENDDATUM\]/g, end);
    }
    return formatted;
}

function closeVacationModal() {
    const modal = document.getElementById('vacation-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    hamburgerMenu.classList.toggle('active');
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
    // Close mobile menu if open
    if (mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
}

// Navbar scroll effect
function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Contact form submission
function handleContactSubmission(event) {
    event.preventDefault();
    
    const name = document.getElementById('contact-name')?.value;
    const email = document.getElementById('contact-email')?.value;
    const message = document.getElementById('contact-message')?.value;
    
    if (!name || !email || !message) {
        alert('Bitte füllen Sie alle Felder aus.');
        return;
    }
    
    // Create mailto link
    const subject = `Anfrage von ${name}`;
    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0ANachricht: ${message}`;
    const mailtoLink = `mailto:info@hausarztpraxis-airoud.de?subject=${encodeURIComponent(subject)}&body=${body}`;
    
    window.location.href = mailtoLink;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Load CMS content
    const cmsLoaded = await loadCMSContent();
    if (cmsLoaded) {
        applyCMSContent();
    }
    
    // Mobile menu
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', toggleMobileMenu);
    }
    
    // Scroll effects
    window.addEventListener('scroll', handleScroll);
    
    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
    
    // Modal close functionality
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        if (event.target.classList.contains('close')) {
            const modal = event.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburgerMenu.contains(event.target) && !mobileMenu.contains(event.target)) {
            if (mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
});

// Close mobile menu when window is resized
window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
});