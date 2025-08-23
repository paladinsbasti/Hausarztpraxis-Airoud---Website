// Enhanced content injection for real-time updates
document.addEventListener('DOMContentLoaded', function() {
    // Function to load content from CMS
    async function loadCMSContent() {
        try {
            const response = await fetch('/api/content');
            const content = await response.json();
            updatePageContent(content);
        } catch (error) {
            console.log('CMS content not available, using static content');
        }
    }
    
    // Function to update page content
    function updatePageContent(content) {
        // Update intro section
        updateElement('[data-translate="intro.title"]', content.intro.title);
        updateElement('[data-translate="intro.subtitle"]', content.intro.subtitle);
        updateElement('[data-translate="intro.feature1"]', content.intro.feature1);
        updateElement('[data-translate="intro.feature2"]', content.intro.feature2);
        updateElement('[data-translate="intro.feature3"]', content.intro.feature3);
        updateElement('[data-translate="intro.description"]', content.intro.description);
        updateElement('[data-translate="intro.cta"]', content.intro.cta);
        
        // Update services section
        updateElement('[data-translate="services.title"]', content.services.title);
        updateElement('[data-translate="services.subtitle"]', content.services.subtitle);
        
        // Update about section
        updateElement('[data-translate="about.title"]', content.about.title);
        updateElement('[data-translate="about.doctor"]', content.about.doctorName);
        updateElement('[data-translate="about.qualification"]', content.about.qualification);
        updateElement('[data-translate="about.welcome"]', content.about.welcome);
        updateElement('[data-translate="about.languages.title"]', content.about.languagesTitle);
        updateElement('[data-translate="about.languages.desc"]', content.about.languagesDesc);
        updateElement('[data-translate="about.team.title"]', content.about.teamTitle);
        updateElement('[data-translate="about.team.desc"]', content.about.teamDesc);
        
        // Update contact section
        updateElement('[data-translate="contact.title"]', content.contact.title);
        updateElement('[data-translate="contact.subtitle"]', content.contact.subtitle);
        updateElement('[data-translate="contact.hours"]', content.contact.hoursTitle);
        
        // Update contact details (these don't use data-translate)
        const addressElement = document.querySelector('[data-translate="contact.address"]')?.nextElementSibling?.querySelector('p');
        if (addressElement) {
            addressElement.innerHTML = content.contact.address;
        }
        
        const phoneElement = document.querySelector('[data-translate="contact.phone"]')?.nextElementSibling?.querySelector('a');
        if (phoneElement) {
            phoneElement.textContent = content.contact.phone;
            phoneElement.href = `tel:+49${content.contact.phone.replace(/\s/g, '')}`;
        }
        
        const emailElement = document.querySelector('[data-translate="contact.email"]')?.nextElementSibling?.querySelector('a');
        if (emailElement) {
            emailElement.textContent = content.contact.email;
            emailElement.href = `mailto:${content.contact.email}`;
        }
    }
    
    // Helper function to update element content
    function updateElement(selector, content) {
        const element = document.querySelector(selector);
        if (element && content) {
            element.textContent = content;
        }
    }
    
    // Load CMS content on page load
    loadCMSContent();
    
    // Optional: Auto-refresh content every 30 seconds in admin mode
    if (window.location.search.includes('admin-preview')) {
        setInterval(loadCMSContent, 30000);
    }
});

// Function to preview changes in real-time (for admin panel)
function previewChanges() {
    const content = {
        intro: {
            title: document.getElementById('intro_title')?.value,
            subtitle: document.getElementById('intro_subtitle')?.value,
            feature1: document.getElementById('intro_feature1')?.value,
            feature2: document.getElementById('intro_feature2')?.value,
            feature3: document.getElementById('intro_feature3')?.value,
            description: document.getElementById('intro_description')?.value,
            cta: document.getElementById('intro_cta')?.value
        },
        services: {
            title: document.getElementById('services_title')?.value,
            subtitle: document.getElementById('services_subtitle')?.value
        },
        about: {
            title: document.getElementById('about_title')?.value,
            doctorName: document.getElementById('about_doctorName')?.value,
            qualification: document.getElementById('about_qualification')?.value,
            welcome: document.getElementById('about_welcome')?.value,
            languagesTitle: document.getElementById('about_languagesTitle')?.value,
            languagesDesc: document.getElementById('about_languagesDesc')?.value,
            teamTitle: document.getElementById('about_teamTitle')?.value,
            teamDesc: document.getElementById('about_teamDesc')?.value
        },
        contact: {
            title: document.getElementById('contact_title')?.value,
            subtitle: document.getElementById('contact_subtitle')?.value,
            address: document.getElementById('contact_address')?.value,
            phone: document.getElementById('contact_phone')?.value,
            email: document.getElementById('contact_email')?.value,
            hoursTitle: document.getElementById('contact_hoursTitle')?.value
        }
    };
    
    // Open preview in new window
    const previewWindow = window.open('/?admin-preview=true', 'preview', 'width=1200,height=800');
    
    // Send content to preview window after it loads
    previewWindow.onload = function() {
        setTimeout(() => {
            previewWindow.postMessage({ type: 'cms-preview', content: content }, '*');
        }, 1000);
    };
}
