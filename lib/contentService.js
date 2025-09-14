const fs = require('fs');
const path = require('path');
const { deepSanitize } = require('./sanitize');

const dataDir = path.join(__dirname, '..', 'cms-data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const contentFile = path.join(dataDir, 'content.json');

const defaultContent = {
  intro: {
    title: 'Willkommen in der Hausarztpraxis Airoud',
    subtitle: 'Ihre Gesundheit liegt uns am Herzen',
    feature1: 'Flexible Sprechzeiten',
    feature2: 'Erfahrenes Team',
    feature3: 'Persönliche Betreuung',
    description: 'Seit über 15 Jahren stehen wir Ihnen als kompetenter Partner zur Seite.',
    cta: 'Termin vereinbaren',
    doctorImage: 'images/Portrait_Export.jpg'
  },
  services: { title: 'Unsere Leistungen', subtitle: 'Umfassende Versorgung', items: [] },
  about: {
    title: 'Über uns', 
    doctorName: 'Abdullah Airoud', 
    qualification: 'Facharzt für Innere Medizin-Notfallmedizin',
    welcome: 'Herzlich willkommen.', 
    languagesTitle: 'Sprachkenntnisse:', 
    languagesDesc: 'Deutsch, Englisch, Arabisch, Italienisch.',
    teamTitle: 'Unser Team', 
    teamDesc: 'Engagiert für Ihre Gesundheit.',
    teamImage: 'images/Team_Export.jpg'
  },
  contact: {
    title: 'Kontakt', 
    subtitle: 'Wir sind für Sie da', 
    address: 'Eschenstr. 138<br>42283 Wuppertal',
    phone: '0202 25 350 880', 
    email: 'info@hausarztpraxis-airoud.de', 
    hoursTitle: 'Sprechzeiten',
    hours: []
  }
};

if (!fs.existsSync(contentFile)) {
  fs.writeFileSync(contentFile, JSON.stringify(defaultContent, null, 2));
}

function loadContent() {
  try {
    const raw = fs.readFileSync(contentFile, 'utf8');
    return deepSanitize(JSON.parse(raw));
  } catch {
    return defaultContent;
  }
}

function saveContent(content) {
  try {
    fs.writeFileSync(contentFile, JSON.stringify(deepSanitize(content), null, 2));
    return true;
  } catch (e) {
    console.error('Save content failed:', e.message);
    return false;
  }
}

module.exports = { loadContent, saveContent, defaultContent, contentFile };
