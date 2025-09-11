// Front-end logic (multilingual removed, cleaned & unified)

// DOM references
const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');
const doctorImage = document.getElementById('doctor-image');
const contactForm = document.getElementById('contact-form');

let cmsContent = null;

// ---------------- CMS CONTENT ----------------
async function loadCMSContent() {
    try {
        const res = await fetch('/api/content');
        if (!res.ok) return false;
        cmsContent = await res.json();
        return true;
    } catch { return false; }
}

function text(id, value) { const el = document.getElementById(id); if (el && value) el.textContent = value; }

function applyCMSContent() {
    if (!cmsContent) return;
    applyIntro();
    applyAbout();
    applyContact();
    applyServices();
    applyVacationModal();
}

function applyIntro() {
    const c = cmsContent.intro; if (!c) return;
    text('intro-title', c.title);
    text('intro-subtitle', c.subtitle);
    text('intro-feature1', c.feature1);
    text('intro-feature2', c.feature2);
    text('intro-feature3', c.feature3);
    text('intro-description', c.description);
    text('intro-cta', c.cta);
    if (doctorImage && c.doctorImage) doctorImage.src = c.doctorImage;
}

function applyAbout() {
    const c = cmsContent.about; if (!c) return;
    text('about-title', c.title);
    text('about-doctor', c.doctorName);
    text('about-qualification', c.qualification);
    text('about-welcome', c.welcome);
    text('about-languages-title', c.languagesTitle);
    text('about-languages-desc', c.languagesDesc);
    text('about-team-title', c.teamTitle);
    text('about-team-desc', c.teamDesc);
}

function applyContact() {
    const c = cmsContent.contact; if (!c) return;
    text('contact-title', c.title);
    text('contact-subtitle', c.subtitle);
}

function applyServices() {
    const c = cmsContent.services; if (!c) return;
    text('services-title', c.title);
    text('services-subtitle', c.subtitle);
    if (!Array.isArray(c.items)) return;
    const cards = document.querySelectorAll('#services .service-card');
    cards.forEach((card, i) => {
        const item = c.items[i]; if (!item) return;
        const h3 = card.querySelector('h3');
        const p = card.querySelector('p');
        if (h3 && item.title) h3.textContent = item.title;
        if (p && item.description) p.textContent = item.description;
        const icon = card.querySelector('.service-icon i');
        if (icon && item.icon) icon.className = item.icon;
    });
}

// ---------------- NAV & MENU ----------------
if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        mobileMenu && mobileMenu.classList.toggle('active');
    });
}

document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
    hamburgerMenu && hamburgerMenu.classList.remove('active');
    mobileMenu && mobileMenu.classList.remove('active');
}));

window.addEventListener('scroll', () => {
    if (!navbar) return;
    const y = window.scrollY;
    navbar.style.background = y > 100 ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)';
    navbar.style.boxShadow = y > 100 ? '0 2px 20px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.1)';
});

// ---------------- IMAGE HOVER ----------------
if (doctorImage) {
    const introBackground = document.querySelector('.intro-background');
    doctorImage.addEventListener('mouseenter', () => { if (introBackground) introBackground.style.filter = 'brightness(0.6)'; });
    doctorImage.addEventListener('mouseleave', () => { if (introBackground) introBackground.style.filter = 'brightness(1)'; });
}

// ---------------- SCROLL LOCK & MODALS ----------------
class ScrollLock {
    constructor() { this.scrollPosition = 0; this.isLocked = false; this.handlers = new Map(); }
    preventScrollEvent(e) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); return false; }
    preventKeyboardScroll(e) {
        const keys = {32:1,33:1,34:1,35:1,36:1,37:1,38:1,39:1,40:1};
        if (keys[e.keyCode]) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }
    }
    lock() {
        if (this.isLocked) return;
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        document.body.style.top = `-${this.scrollPosition}px`;
        document.body.classList.add('modal-open');
        const wheel = this.preventScrollEvent.bind(this);
        const touch = this.preventScrollEvent.bind(this);
        const key = this.preventKeyboardScroll.bind(this);
        this.handlers.set('wheel', wheel).set('touchmove', touch).set('touchstart', touch).set('keydown', key).set('DOMMouseScroll', wheel);
        const opts = { passive:false, capture:true };
        document.addEventListener('wheel', wheel, opts);
        document.addEventListener('touchmove', touch, opts);
        document.addEventListener('touchstart', touch, opts);
        document.addEventListener('keydown', key, opts);
        document.addEventListener('DOMMouseScroll', wheel, opts);
        window.addEventListener('scroll', this.preventScrollEvent, opts);
        this.isLocked = true;
    }
    unlock() {
        if (!this.isLocked) return;
        const opts = { passive:false, capture:true };
        this.handlers.forEach((h, ev) => document.removeEventListener(ev, h, opts));
        window.removeEventListener('scroll', this.preventScrollEvent, opts);
        this.handlers.clear();
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window.scrollTo(0, this.scrollPosition);
        this.isLocked = false;
    }
}
const scrollLock = new ScrollLock();

function openModal(id) {
    const m = document.getElementById(id); if (!m) return;
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    m.classList.add('active');
    m.style.display = 'flex';
    setTimeout(()=> m.style.opacity='1', 10);
    scrollLock.lock();
}
function closeModal(modal) {
    modal.style.opacity='0';
    setTimeout(()=>{ modal.classList.remove('active'); modal.style.display='none'; document.documentElement.classList.remove('no-scroll'); document.body.classList.remove('no-scroll'); scrollLock.unlock(); },300);
}

document.querySelectorAll('.modal').forEach(modal => {
    const closeBtn = modal.querySelector('.close');
    closeBtn && closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
});

document.addEventListener('keydown', e => { if (e.key==='Escape'){ const a=document.querySelector('.modal.active'); a && closeModal(a);} });

window.openModal = openModal;

// ---------------- CONTACT FORM ----------------
if (contactForm) {
    let isSubmitting = false;
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        if (isSubmitting) return;
        const fd = new FormData(contactForm);
        const values = Object.fromEntries(fd.entries());
        const required = ['firstname','lastname','email','privacy'];
        let ok = true;
        required.forEach(name => {
            const input = contactForm.querySelector(`[name="${name}"]`);
            if (!values[name] || !values[name].trim()) { ok = false; if (input) input.style.borderColor='var(--danger)'; }
            else if (input) input.style.borderColor='var(--gray-light)';
        });
        const emailInput = contactForm.querySelector('[name="email"]');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (values.email && !emailRegex.test(values.email)) { ok=false; if(emailInput) emailInput.style.borderColor='var(--danger)'; showNotification('Bitte gültige E-Mail-Adresse eingeben.','error'); return; }
        if (!ok) { showNotification('Bitte füllen Sie alle Pflichtfelder aus.','error'); return; }
        const btn = contactForm.querySelector('.submit-btn');
        if (btn){ var original = btn.innerHTML; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Wird gesendet...'; btn.disabled=true; }
        isSubmitting = true;
        setTimeout(()=>{ showNotification('Vielen Dank! Ihre Terminanfrage wurde gesendet.','success'); contactForm.reset(); if(btn){ btn.innerHTML=original; btn.disabled=false;} isSubmitting=false; },2000);
    });
}

// ---------------- NOTIFICATIONS ----------------
function showNotification(message,type='info'){ document.querySelectorAll('.notification').forEach(n=>n.remove()); const n=document.createElement('div'); n.className=`notification notification-${type}`; n.innerHTML=`<div class="notification-content"><i class="fas ${getNotificationIcon(type)}"></i><span>${message}</span><button class="notification-close"><i class="fas fa-times"></i></button></div>`; Object.assign(n.style,{position:'fixed',top:'100px',right:'20px',background:getNotificationColor(type),color:'#fff',padding:'16px 20px',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.15)',zIndex:3000,maxWidth:'400px',transform:'translateX(100%)',transition:'all .3s ease',fontFamily:'Inter,sans-serif'}); document.body.appendChild(n); setTimeout(()=> n.style.transform='translateX(0)',10); const close=n.querySelector('.notification-close'); close.addEventListener('click',()=>removeNotification(n)); setTimeout(()=>{ if(document.body.contains(n)) removeNotification(n); },5000);} 
function removeNotification(n){ n.style.transform='translateX(100%)'; n.style.opacity='0'; setTimeout(()=>{ if(document.body.contains(n)) n.remove(); },300);} 
function getNotificationIcon(t){ return t==='success'?'fa-check-circle':t==='error'?'fa-exclamation-circle':t==='warning'?'fa-exclamation-triangle':'fa-info-circle'; }
function getNotificationColor(t){ return t==='success'?'#28a745':t==='error'?'#dc3545':t==='warning'?'#ffc107':'#4a90a4'; }

// ---------------- FORM UI ENHANCEMENTS ----------------
document.querySelectorAll('input, textarea, select').forEach(el=>{ el.addEventListener('focus',()=> el.parentElement && el.parentElement.classList.add('focused')); el.addEventListener('blur',()=>{ if(!el.value && el.parentElement) el.parentElement.classList.remove('focused'); }); });

// ---------------- SCROLL ANIMATIONS ----------------
const observer = new IntersectionObserver(entries => { entries.forEach(e=>{ if(e.isIntersecting){ e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }}); }, {threshold:0.1, rootMargin:'0px 0px -50px 0px'});
['.service-card','.info-card','.team-image','.about-text'].forEach(sel=> document.querySelectorAll(sel).forEach((el,i)=>{ el.style.opacity='0'; el.style.transform='translateY(30px)'; el.style.transition=`all .6s ease ${sel==='.service-card'? i*0.1:0}s`; observer.observe(el);}));

// ---------------- DATE/TIME RESTRICTIONS ----------------
const dateInput = document.querySelector('input[type="date"]');
const timeSelect = document.querySelector('select[name="time"]');
if (dateInput){ const t=new Date(); const tm=new Date(t); tm.setDate(tm.getDate()+1); const y=tm.getFullYear(); const m=String(tm.getMonth()+1).padStart(2,'0'); const d=String(tm.getDate()).padStart(2,'0'); dateInput.min=`${y}-${m}-${d}`; if(timeSelect){ dateInput.addEventListener('change',function(){ const sel=new Date(this.value); const today=new Date(); const hour=today.getHours(); Array.from(timeSelect.options).forEach(o=> o.disabled=false); if(sel.toDateString()===today.toDateString()){ Array.from(timeSelect.options).forEach(o=>{ if(o.value){ const h=parseInt(o.value.split(':')[0]); if(h<=hour) o.disabled=true; }}); } }); } }

// ---------------- BUTTON CLICK FEEDBACK ----------------
document.querySelectorAll('button').forEach(btn=> btn.addEventListener('click',function(){ if(this.type!=='submit' && !this.classList.contains('contact-btn')){ this.style.transform='scale(0.95)'; setTimeout(()=> this.style.transform='scale(1)',150); }}));

// ---------------- ACCESSIBILITY ----------------
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && mobileMenu && mobileMenu.classList.contains('active')){ hamburgerMenu && hamburgerMenu.classList.remove('active'); mobileMenu.classList.remove('active'); } });

// ---------------- VACATION MODAL ----------------
function applyVacationModal(){ if(!cmsContent || !cmsContent.vacation || !cmsContent.vacation.enabled){ const existing=document.getElementById('vacation-modal'); existing && existing.remove(); return; } let modal=document.getElementById('vacation-modal'); if(!modal){ modal=createVacationModal(); document.body.appendChild(modal);} updateVacationModalContent(modal); setTimeout(()=> showVacationModal(),1000); }
function createVacationModal(){ const m=document.createElement('div'); m.id='vacation-modal'; m.className='vacation-modal'; m.innerHTML=`<div class="vacation-modal-content"><div class="vacation-modal-header"><i class="fas fa-umbrella-beach vacation-icon"></i><h2 id="vacation-title">Praxisurlaub</h2></div><div class="vacation-modal-body"><p id="vacation-message" class="vacation-message"></p><div id="vacation-dates-container" style="display:none" class="vacation-dates"></div><div id="vacation-emergency-container" style="display:none" class="vacation-emergency"><div class="vacation-emergency-title"><i class="fas fa-exclamation-triangle"></i><span id="vacation-emergency-title">Im Notfall</span></div><div id="vacation-emergency-info" class="vacation-emergency-info"></div></div></div><div class="vacation-modal-footer"><button class="vacation-close-btn" onclick="closeVacationModal()"><i class="fas fa-check"></i><span id="vacation-button-text">Verstanden</span></button></div></div>`; m.addEventListener('click',e=>{ if(e.target===m) closeVacationModal(); }); return m; }
function updateVacationModalContent(m){ const v=cmsContent.vacation; const title=m.querySelector('#vacation-title'); if(title && v.title) title.textContent=v.title; const msg=m.querySelector('#vacation-message'); if(msg && v.message){ let message=v.message; if(v.startDate && v.endDate){ message=message.replace('[STARTDATUM]', formatDate(v.startDate)).replace('[ENDDATUM]', formatDate(v.endDate)); } msg.textContent=message; } const emerg=m.querySelector('#vacation-emergency-container'); if(v.emergencyTitle || v.emergencyInfo){ emerg && (emerg.style.display='block'); const et=m.querySelector('#vacation-emergency-title'); const ei=m.querySelector('#vacation-emergency-info'); et && v.emergencyTitle && (et.textContent=v.emergencyTitle); ei && v.emergencyInfo && (ei.textContent=v.emergencyInfo); } else { emerg && (emerg.style.display='none'); } const btn=m.querySelector('#vacation-button-text'); btn && v.buttonText && (btn.textContent=v.buttonText); }
function formatDate(str){ if(!str) return ''; const d=new Date(str+'T00:00:00'); return d.toLocaleDateString('de-DE',{weekday:'long',year:'numeric',month:'long',day:'numeric'}); }
function showVacationModal(){ const m=document.getElementById('vacation-modal'); if(m){ m.classList.add('active'); document.documentElement.classList.add('no-scroll'); document.body.classList.add('no-scroll'); } }
function closeVacationModal(){ const m=document.getElementById('vacation-modal'); if(m){ m.classList.remove('active'); document.documentElement.classList.remove('no-scroll'); document.body.classList.remove('no-scroll'); } }
window.closeVacationModal = closeVacationModal;

// ---------------- INIT ----------------
document.addEventListener('DOMContentLoaded', async () => { const loaded = await loadCMSContent(); if (loaded){ applyCMSContent(); // retry timers (defensive for async image loads etc.)
    setTimeout(applyCMSContent,400); setTimeout(applyCMSContent,1200); }
});
