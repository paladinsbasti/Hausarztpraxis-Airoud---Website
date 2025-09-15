document.addEventListener('DOMContentLoaded',()=>{
  const hamburgerMenu=document.getElementById('hamburger-menu');
  const mobileMenu=document.getElementById('mobile-menu');
  window.scrollToSection=function(id){const el=document.getElementById(id);if(!el)return;const offsetTop=el.offsetTop-80;window.scrollTo({top:offsetTop,behavior:'smooth'});if(mobileMenu.classList.contains('active'))toggleMobileMenu();};
  function toggleMobileMenu(){mobileMenu.classList.toggle('active');hamburgerMenu.classList.toggle('active');}
  hamburgerMenu&&hamburgerMenu.addEventListener('click',toggleMobileMenu);
  window.addEventListener('scroll',()=>{const navbar=document.getElementById('navbar');if(window.scrollY>50)navbar.classList.add('scrolled');else navbar.classList.remove('scrolled');});
  window.addEventListener('resize',()=>{if(window.innerWidth>768&&mobileMenu.classList.contains('active'))toggleMobileMenu();});
  const services=[
    {icon:'fas fa-shield-alt',title:'Vorsorgeuntersuchungen',desc:'Check-ups, Hautkrebsscreening, Impfberatung',modal:'modal-vorsorge'},
    {icon:'fas fa-flask',title:'Blutuntersuchungen & Labor',desc:'Moderne Labordiagnostik',modal:'modal-labor'},
    {icon:'fas fa-heartbeat',title:'EKG (Elektrokardiogramm)',desc:'Herzrhythmusdiagnostik',modal:'modal-ekg'},
    {icon:'fas fa-clock',title:'Langzeit-EKG',desc:'24-Stunden Herzrhythmus',modal:'modal-langzeit-ekg'},
    {icon:'fas fa-running',title:'Belastungs-EKG',desc:'Herz unter Belastung',modal:'modal-belastungs-ekg'},
    {icon:'fas fa-chart-line',title:'Langzeit-Blutdruckmessung',desc:'24-Stunden Blutdruck',modal:'modal-blutdruck'},
    {icon:'fas fa-lungs',title:'Lungenfunktionstest',desc:'Atemwegsdiagnostik',modal:'modal-lungenfunktion'},
    {icon:'fas fa-search-plus',title:'Ultraschalldiagnostik',desc:'Bildgebende Untersuchung',modal:'modal-ultraschall'},
    {icon:'fas fa-clipboard-list',title:'Disease-Management-Programme',desc:'Chronische Erkrankungen begleiten',modal:'modal-dmp'},
    {icon:'fas fa-home',title:'Hausbesuche',desc:'Betreuung zu Hause',modal:'modal-hausbesuche'},
    {icon:'fas fa-sun',title:'Hautkrebsscreening',desc:'Früherkennung Hautveränderungen',modal:'modal-hautkrebsscreening'},
    {icon:'fas fa-brain',title:'Psychosomatische Grundversorgung',desc:'Ganzheitliche Einschätzung',modal:'modal-psychosomatik'}
  ];
  const grid=document.querySelector('.services-grid');
  if(grid){services.forEach(s=>{const card=document.createElement('div');card.className='service-card';card.innerHTML=`<div class="service-icon"><i class="${s.icon}"></i></div><h3>${s.title}</h3><p>${s.desc}</p>`;card.addEventListener('click',()=>openModal(s.modal));grid.appendChild(card);});}
  window.openModal=function(id){const m=document.getElementById(id);if(!m)return;m.classList.add('active');document.body.style.overflow='hidden';};
  window.closeModal=function(id){const m=document.getElementById(id);if(!m)return;m.classList.remove('active');document.body.style.overflow='auto';setTimeout(()=>{if(!m.classList.contains('active'))m.style.display='none';},150);};
  document.addEventListener('click',e=>{if(e.target.classList.contains('modal'))closeModal(e.target.id);if(e.target.classList.contains('close')){const parent=e.target.closest('.modal');if(parent)closeModal(parent.id);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const active=document.querySelectorAll('.modal.active');if(active.length){closeModal(active[active.length-1].id);return;}const vac=document.getElementById('vacation-modal');if(vac&&vac.classList.contains('active'))closeVacationModal();}});
  (function(){const vacationData={title:'Praxisurlaub',message:'Unsere Praxis ist vom 15.09.2025 bis 19.09.2025 geschlossen. Vertretung während dieser Zeit:\n\nFrau Dr. med. Roth\nCarnaperstraße 73\n42283 Wuppertal\nTel: 0202 501060\n\nHerr Dr. med. Chereath\nWinklerstraße 15\n42283 Wuppertal\nTel: 0202 593035',emergencyTitle:'Im Notfall wenden Sie sich bitte an:',emergencyInfo:'Ärztlicher Bereitschaftsdienst: 116 117\nNotfallambulanz: Ihr nächstes Krankenhaus',buttonText:'Verstanden'};const modal=document.createElement('div');modal.id='vacation-modal';modal.className='vacation-modal';modal.innerHTML=`<div class="vacation-modal-content"><div class="vacation-modal-header"><div class="vacation-icon"><i class="fas fa-umbrella-beach"></i></div><h2>${vacationData.title}</h2><button type="button" class="vacation-close-x" aria-label="Fenster schließen">&times;</button></div><div class="vacation-modal-body"><p class="vacation-message" style="white-space:pre-line;">${vacationData.message}</p><div class="vacation-emergency"><h3>${vacationData.emergencyTitle}</h3><p style="white-space:pre-line;">${vacationData.emergencyInfo}</p></div></div><div class="vacation-modal-footer"><button type="button" class="vacation-close">${vacationData.buttonText}</button></div></div>`;document.body.appendChild(modal);requestAnimationFrame(()=>modal.classList.add('active'));modal.addEventListener('click',e=>{if(e.target.classList.contains('vacation-close')||e.target.classList.contains('vacation-close-x'))closeVacationModal();});function closeVacationModal(){modal.classList.remove('active');setTimeout(()=>{if(!modal.classList.contains('active'))modal.remove();},200);}window.closeVacationModal=closeVacationModal;})();
});
