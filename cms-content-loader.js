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
        
        // Update doctor image
        const doctorImage = document.getElementById('doctor-image');
        if (doctorImage && content.intro.doctorImage) {
            doctorImage.src = content.intro.doctorImage;
        }
        
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
        
        // Update team image
        const teamImage = document.querySelector('.team-image');
        if (teamImage && content.about.teamImage) {
            teamImage.src = content.about.teamImage;
        }
        
        // Update contact section
        updateElement('[data-translate="contact.title"]', content.contact.title);
        updateElement('[data-translate="contact.subtitle"]', content.contact.subtitle);
        updateElement('[data-translate="contact.info"]', content.contact.info);
        updateElement('[data-translate="contact.address"]', content.contact.address);
        updateElement('[data-translate="contact.phone"]', content.contact.phone);
        updateElement('[data-translate="contact.email"]', content.contact.email);
        updateElement('[data-translate="contact.hours"]', content.contact.hoursTitle);
        
        // Update contact details (these don't use data-translate)
        const addressElement = document.querySelector('[data-translate="contact.address"]')?.nextElementSibling?.querySelector('p');
        if (addressElement) {
            addressElement.innerHTML = content.contact.addressValue;
        }
        
        const phoneElement = document.querySelector('[data-translate="contact.phone"]')?.nextElementSibling?.querySelector('a');
        if (phoneElement) {
            phoneElement.textContent = content.contact.phoneValue;
            phoneElement.href = `tel:+49${content.contact.phoneValue.replace(/\s/g, '')}`;
        }
        
        const emailElement = document.querySelector('[data-translate="contact.email"]')?.nextElementSibling?.querySelector('a');
        if (emailElement) {
            emailElement.textContent = content.contact.emailValue;
            emailElement.href = `mailto:${content.contact.emailValue}`;
        }
        
        // Update modal content
        if (content.modals) {
            updateModalContent(content.modals);
        }
        
        // Update navigation
        if (content.navigation) {
            updateElement('[data-translate="nav.contact"]', content.navigation.contact);
            updateElement('[data-translate="nav.home"]', content.navigation.home);
            updateElement('[data-translate="nav.services"]', content.navigation.services);
            updateElement('[data-translate="nav.about"]', content.navigation.about);
            updateElement('[data-translate="nav.imprint"]', content.navigation.imprint);
            updateElement('[data-translate="nav.privacy"]', content.navigation.privacy);
        }
    }
    
    // Function to update modal content
    function updateModalContent(modals) {
        Object.keys(modals).forEach(modalKey => {
            const modal = modals[modalKey];
            const modalElement = document.getElementById(`modal-${modalKey}`);
            
            if (modalElement) {
                // Update title
                const titleElement = modalElement.querySelector('h3');
                if (titleElement && modal.title) {
                    titleElement.textContent = modal.title;
                }
                
                // Update intro
                const modalBody = modalElement.querySelector('.modal-body');
                if (modalBody) {
                    const paragraphs = modalBody.querySelectorAll('p');
                    if (paragraphs[0] && modal.intro) {
                        paragraphs[0].textContent = modal.intro;
                    }
                    
                    // Update list title
                    const listTitle = modalBody.querySelector('h4');
                    if (listTitle && modal.listTitle) {
                        listTitle.textContent = modal.listTitle;
                    }
                    
                    // Update list items
                    const listElement = modalBody.querySelector('ul');
                    if (listElement && modal.items) {
                        listElement.innerHTML = '';
                        modal.items.forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = item;
                            listElement.appendChild(li);
                        });
                    }
                    
                    // Update note (for hausbesuche modal)
                    if (modal.note) {
                        let noteElement = modalBody.querySelector('p strong');
                        if (noteElement) {
                            noteElement.textContent = modal.note;
                        } else {
                            const noteParagraph = document.createElement('p');
                            const strongElement = document.createElement('strong');
                            strongElement.textContent = modal.note;
                            noteParagraph.appendChild(strongElement);
                            modalBody.appendChild(noteParagraph);
                        }
                    }
                    
                    // Update outro (for dmp modal)
                    if (modal.outro) {
                        const lastParagraph = modalBody.querySelector('p:last-of-type');
                        if (lastParagraph && !lastParagraph.querySelector('strong')) {
                            lastParagraph.textContent = modal.outro;
                        } else {
                            const outroParagraph = document.createElement('p');
                            outroParagraph.textContent = modal.outro;
                            modalBody.appendChild(outroParagraph);
                        }
                    }
                }
            }
        });
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
